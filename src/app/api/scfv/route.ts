import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const grpRes = await db.prepare('SELECT * FROM grupos_scfv ORDER BY criado_em DESC LIMIT 200').all<any>()
        return NextResponse.json({ ok: true, data: grpRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('grupos_scfv')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!error && data) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_SCFV_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const grupoData = await request.json()

    if (!grupoData || !grupoData.nome) {
      return NextResponse.json({ ok: false, error: 'Nome do grupo é obrigatório.' }, { status: 400 })
    }

    const grpId = grupoData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `grp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)
    const payload = {
      id: grpId,
      nome: grupoData.nome.trim().toUpperCase(),
      descricao: grupoData.descricao || null,
      tecnico_responsavel: grupoData.tecnico_responsavel || 'TÉCNICO RESPONSÁVEL',
      horario: grupoData.horario || 'Encontros Periódicos',
      tipo_grupo: grupoData.tipo_grupo || 'SCFV',
      faixa_etaria: grupoData.faixa_etaria || '0_a_6'
    }

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          INSERT INTO grupos_scfv (id, nome, descricao, tecnico_responsavel, horario, tipo_grupo, faixa_etaria, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          payload.id,
          payload.nome,
          payload.descricao,
          payload.tecnico_responsavel,
          payload.horario,
          payload.tipo_grupo,
          payload.faixa_etaria
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    let grupoInserido: any = payload
    try {
      const supabase = getSupabaseServer()
      const { data: sbGrp } = await supabase.from('grupos_scfv').insert(payload).select().single()
      if (sbGrp) grupoInserido = sbGrp
    } catch (sbErr) {
      console.warn('[SUPABASE_SCFV_INSERT_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: grupoInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...grupoData } = await request.json()

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do grupo é obrigatório.' }, { status: 400 })
    }

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          UPDATE grupos_scfv
          SET 
            nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            tecnico_responsavel = COALESCE(?, tecnico_responsavel),
            horario = COALESCE(?, horario),
            tipo_grupo = COALESCE(?, tipo_grupo),
            faixa_etaria = COALESCE(?, faixa_etaria)
          WHERE id = ?
        `).bind(
          grupoData.nome ? grupoData.nome.trim().toUpperCase() : null,
          grupoData.descricao || null,
          grupoData.tecnico_responsavel || null,
          grupoData.horario || null,
          grupoData.tipo_grupo || null,
          grupoData.faixa_etaria || null,
          id
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      await supabase.from('grupos_scfv').update(grupoData).eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_SCFV_UPDATE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: { id, ...grupoData } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do grupo é obrigatório.' }, { status: 400 })
    }

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM participantes_scfv WHERE grupo_id = ?').bind(id).run()
        await db.prepare('DELETE FROM frequencia_scfv WHERE grupo_id = ?').bind(id).run()
        await db.prepare('DELETE FROM grupos_scfv WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      await supabase.from('participantes_scfv').delete().eq('grupo_id', id)
      await supabase.from('frequencia_scfv').delete().eq('grupo_id', id)
      await supabase.from('grupos_scfv').delete().eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_SCFV_DELETE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
