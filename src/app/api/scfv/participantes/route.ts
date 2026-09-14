import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const partRes = await db.prepare('SELECT * FROM participantes_scfv ORDER BY criado_em DESC LIMIT 200').all<any>()
        return NextResponse.json({ ok: true, data: partRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_PARTICIPANTES_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('participantes_scfv')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!error && data) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_PART_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json()

    if (!dados || !dados.grupo_id || !dados.nome) {
      return NextResponse.json({ ok: false, error: 'Grupo e Nome do participante são obrigatórios.' }, { status: 400 })
    }

    const partId = dados.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `part_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)
    const safeMembroId = dados.membro_id || '00000000-0000-0000-0000-000000000000'
    const safeFamiliaId = dados.familia_id || null
    const nomeLimpo = dados.nome.trim().toUpperCase()

    const payload = {
      id: partId,
      grupo_id: dados.grupo_id,
      membro_id: safeMembroId,
      nome: nomeLimpo,
      familia_id: safeFamiliaId
    }

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          INSERT INTO participantes_scfv (id, grupo_id, membro_id, nome, familia_id, criado_em)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(payload.id, payload.grupo_id, payload.membro_id, payload.nome, payload.familia_id).run()

        // Gravar no Histórico do Beneficiário
        let targetFamId = payload.familia_id
        if (!targetFamId) {
          const famFound = await db.prepare('SELECT id FROM familias WHERE UPPER(responsavel) = ? LIMIT 1').bind(nomeLimpo).first<any>()
          if (famFound) targetFamId = famFound.id
        }

        const grpRow = await db.prepare('SELECT nome FROM grupos_scfv WHERE id = ?').bind(payload.grupo_id).first<any>()
        const grpNome = grpRow?.nome || 'GRUPO SCFV'

        if (targetFamId) {
          const histId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}`
          await db.prepare(`
            INSERT INTO historico_atendimentos (
              id, familia_id, data, hora, usuario_visitado, local,
              compartilhada, tecnico, relato, providencias, sigilo, tipo, criado_em
            ) VALUES (?, ?, ?, ?, ?, 'CRAS', 'Não', ?, ?, ?, 'publico', 'SCFV / Convivência', datetime('now'))
          `).bind(
            histId,
            targetFamId,
            new Date().toISOString().split('T')[0],
            new Date().toTimeString().split(' ')[0],
            nomeLimpo,
            dados.tecnico || 'TÉCNICO RESPONSÁVEL',
            `INCLUSÃO EM GRUPO SCFV: O(a) beneficiário(a) ${nomeLimpo} foi vinculado(a) e matriculado(a) no grupo "${grpNome}".`,
            'Matrícula efetuada no Serviço de Convivência e Fortalecimento de Vínculos (SCFV).'
          ).run()
        }
      }
    } catch (d1Err) {
      console.warn('[D1_PARTICIPANTE_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    let partInserido: any = payload
    try {
      const supabase = getSupabaseServer()
      const { data: sbPart } = await supabase.from('participantes_scfv').insert(payload).select().single()
      if (sbPart) partInserido = sbPart
    } catch (sbErr) {
      console.warn('[SUPABASE_PART_INSERT_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: partInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do participante é obrigatório.' }, { status: 400 })
    }

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM participantes_scfv WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_PARTICIPANTE_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      await supabase.from('participantes_scfv').delete().eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_PART_DELETE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
