import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const encRes = await db.prepare('SELECT * FROM encaminhamentos ORDER BY criado_em DESC LIMIT 200').all<any>()
        return NextResponse.json({ ok: true, data: encRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_ENCAMINHAMENTOS_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('encaminhamentos')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!error && data) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_ENC_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const encaminhamento = await request.json()
    const encId = encaminhamento.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `enc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)

    const payload = {
      id: encId,
      familia_id: encaminhamento.familia_id || null,
      beneficiario: (encaminhamento.beneficiario || 'BENEFICIÁRIO').trim().toUpperCase(),
      destino: encaminhamento.destino || 'REDE SOCIOASSISTENCIAL',
      motivo: encaminhamento.motivo || '',
      data_envio: encaminhamento.data_envio || new Date().toISOString().split('T')[0],
      status: encaminhamento.status || 'Pendente',
      tipo_rma: encaminhamento.tipo_rma || 'outro',
      tecnico: encaminhamento.tecnico || 'TÉCNICO CRAS',
      resposta: encaminhamento.resposta || null
    }

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          INSERT INTO encaminhamentos (
            id, familia_id, beneficiario, destino, motivo,
            data_envio, status, tipo_rma, tecnico, resposta, criado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          payload.id,
          payload.familia_id,
          payload.beneficiario,
          payload.destino,
          payload.motivo,
          payload.data_envio,
          payload.status,
          payload.tipo_rma,
          payload.tecnico,
          payload.resposta
        ).run()

        // Histórico no Prontuário
        let targetFamId = payload.familia_id
        if (!targetFamId && payload.beneficiario) {
          const famFound = await db.prepare('SELECT id FROM familias WHERE UPPER(responsavel) = ? LIMIT 1').bind(payload.beneficiario).first<any>()
          if (famFound) targetFamId = famFound.id
        }

        if (targetFamId) {
          const histId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}`
          await db.prepare(`
            INSERT INTO historico_atendimentos (
              id, familia_id, data, hora, usuario_visitado, local,
              compartilhada, tecnico, relato, providencias, sigilo, tipo, criado_em
            ) VALUES (?, ?, ?, ?, ?, 'CRAS', 'Não', ?, ?, ?, 'publico', 'Encaminhamento Intersetorial', datetime('now'))
          `).bind(
            histId,
            targetFamId,
            payload.data_envio,
            new Date().toTimeString().split(' ')[0],
            payload.beneficiario,
            payload.tecnico,
            `ENCAMINHAMENTO INTERSETORIAL [Destino: ${payload.destino}] — Motivo: ${payload.motivo} (Status: PENDENTE)`,
            `Guia Oficial de Encaminhamento emitida para o serviço/órgão destinatário: ${payload.destino}.`
          ).run()
        }
      }
    } catch (d1Err) {
      console.warn('[D1_ENC_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    let encInserido: any = payload
    try {
      const supabase = getSupabaseServer()
      const { data: sbEnc } = await supabase.from('encaminhamentos').insert(payload).select().single()
      if (sbEnc) encInserido = sbEnc
    } catch (sbErr) {
      console.warn('[SUPABASE_ENC_INSERT_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: encInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID é obrigatório para atualização.' }, { status: 400 })
    }

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          UPDATE encaminhamentos
          SET 
            status = COALESCE(?, status),
            resposta = COALESCE(?, resposta),
            destino = COALESCE(?, destino),
            motivo = COALESCE(?, motivo),
            beneficiario = COALESCE(?, beneficiario),
            tipo_rma = COALESCE(?, tipo_rma),
            data_envio = COALESCE(?, data_envio)
          WHERE id = ?
        `).bind(
          updates.status || null,
          updates.resposta || null,
          updates.destino || null,
          updates.motivo || null,
          updates.beneficiario ? updates.beneficiario.trim().toUpperCase() : null,
          updates.tipo_rma || null,
          updates.data_envio || null,
          id
        ).run()

        if (updates.resposta || updates.status) {
          const encRow = await db.prepare('SELECT * FROM encaminhamentos WHERE id = ?').bind(id).first<any>()
          if (encRow && encRow.familia_id) {
            const histId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}`
            await db.prepare(`
              INSERT INTO historico_atendimentos (
                id, familia_id, data, hora, usuario_visitado, local,
                compartilhada, tecnico, relato, providencias, sigilo, tipo, criado_em
              ) VALUES (?, ?, ?, ?, ?, 'CRAS / Rede', 'Não', ?, ?, 'Devolutiva gravada no prontuário.', 'publico', 'Devolutiva de Encaminhamento', datetime('now'))
            `).bind(
              histId,
              encRow.familia_id,
              new Date().toISOString().split('T')[0],
              new Date().toTimeString().split(' ')[0],
              encRow.beneficiario || 'BENEFICIÁRIO',
              encRow.tecnico || 'TÉCNICO CRAS',
              `DEVOLUTIVA DE ENCAMINHAMENTO [Destino: ${encRow.destino}] — Status: ${(updates.status || encRow.status).toUpperCase()}.\nRetorno/Devolutiva: ${updates.resposta || encRow.resposta || 'Sem detalhamento complementar'}`
            ).run()
          }
        }
      }
    } catch (d1Err) {
      console.warn('[D1_ENC_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      await supabase.from('encaminhamentos').update(updates).eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_ENC_UPDATE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: { id, ...updates } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do encaminhamento é obrigatório.' }, { status: 400 })
    }

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM encaminhamentos WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_ENC_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase
    try {
      const supabase = getSupabaseServer()
      await supabase.from('encaminhamentos').delete().eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_ENC_DELETE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
