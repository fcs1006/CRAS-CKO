import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const agRes = await db.prepare('SELECT * FROM agenda_tecnica ORDER BY data ASC, hora ASC LIMIT 200').all<any>()
        return NextResponse.json({ ok: true, data: agRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_AGENDA_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('agenda_tecnica')
        .select('*')
        .order('data', { ascending: true })

      if (!error && data) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_AGENDA_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const agendamento = await request.json()

    if (!agendamento || !agendamento.data || !agendamento.hora) {
      return NextResponse.json({ ok: false, error: 'Dados do agendamento inválidos.' }, { status: 400 })
    }

    const agId = agendamento.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ag_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)
    const payload = {
      id: agId,
      familia_id: agendamento.familia_id || null,
      data: agendamento.data,
      hora: agendamento.hora,
      tipo: agendamento.tipo,
      responsavel: agendamento.responsavel,
      tecnico: agendamento.tecnico,
      descricao: agendamento.descricao || null,
      status: agendamento.status || 'Pendente'
    }

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          INSERT INTO agenda_tecnica (id, familia_id, data, hora, tipo, responsavel, tecnico, descricao, status, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          payload.id,
          payload.familia_id,
          payload.data,
          payload.hora,
          payload.tipo,
          payload.responsavel,
          payload.tecnico,
          payload.descricao,
          payload.status
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_AGENDA_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    let itemInserido: any = payload
    try {
      const supabase = getSupabaseServer()
      const { data: sbData } = await supabase.from('agenda_tecnica').insert(payload).select().single()
      if (sbData) itemInserido = sbData
    } catch (sbErr) {
      console.warn('[SUPABASE_AGENDA_INSERT_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: itemInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, motivoCancelamento } = await request.json()

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do agendamento é obrigatório.' }, { status: 400 })
    }

    const updateData: any = { status: status || 'Realizado' }

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        if (status === 'Cancelado' && motivoCancelamento) {
          const itemAtual = await db.prepare('SELECT descricao FROM agenda_tecnica WHERE id = ?').bind(id).first<any>()
          const descAntiga = itemAtual?.descricao || ''
          const motivoStr = `[CANCELAMENTO: ${motivoCancelamento.trim().toUpperCase()}]`
          updateData.descricao = descAntiga ? `${descAntiga} ${motivoStr}` : motivoStr
        }

        await db.prepare(`
          UPDATE agenda_tecnica 
          SET status = ?, descricao = COALESCE(?, descricao)
          WHERE id = ?
        `).bind(updateData.status, updateData.descricao || null, id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_AGENDA_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      await supabase.from('agenda_tecnica').update(updateData).eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_AGENDA_UPDATE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: { id, ...updateData } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID é obrigatório.' }, { status: 400 })
    }

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM agenda_tecnica WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_AGENDA_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase
    try {
      const supabase = getSupabaseServer()
      await supabase.from('agenda_tecnica').delete().eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_AGENDA_DELETE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
