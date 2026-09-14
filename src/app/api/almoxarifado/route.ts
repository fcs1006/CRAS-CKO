import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

const INITIAL_ALMOXARIFADO = [
  { id: 1, tipo: 'Cesta Básica', saldo: 40, unidade: 'Unidades' },
  { id: 2, tipo: 'Enxoval de Bebê / Auxílio Natalidade', saldo: 15, unidade: 'Kits' },
  { id: 3, tipo: 'Auxílio Funeral', saldo: 5, unidade: 'Ordens' },
  { id: 4, tipo: 'Aluguel Social', saldo: 10, unidade: 'Benefícios' }
]

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const almRes = await db.prepare('SELECT * FROM almoxarifado ORDER BY id ASC').all<any>()
        const itens = almRes.results && almRes.results.length > 0 ? almRes.results : INITIAL_ALMOXARIFADO
        return NextResponse.json({ ok: true, data: itens, source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_ALMOXARIFADO_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('almoxarifado')
        .select('*')
        .order('id', { ascending: true })

      if (!error && data && data.length > 0) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_ALM_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: INITIAL_ALMOXARIFADO })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: INITIAL_ALMOXARIFADO })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, saldo, unidade } = body

    if (!tipo || !tipo.trim()) {
      return NextResponse.json({ ok: false, error: 'O nome/tipo do item é obrigatório.' }, { status: 400 })
    }

    const payload = {
      tipo: tipo.trim(),
      saldo: Number(saldo) || 0,
      unidade: (unidade || 'Unidades').trim(),
      atualizado_em: new Date().toISOString()
    }

    // 1. Salvar no Cloudflare D1
    let insertedId: number | null = null
    try {
      const db = await getD1Database()
      if (db) {
        const res = await db.prepare(`
          INSERT INTO almoxarifado (tipo, saldo, unidade, atualizado_em)
          VALUES (?, ?, ?, datetime('now'))
        `).bind(payload.tipo, payload.saldo, payload.unidade).run()
        insertedId = (res as any)?.meta?.last_row_id || Date.now()
      }
    } catch (d1Err) {
      console.warn('[D1_ALMOXARIFADO_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase
    let itemCriado: any = { id: insertedId || Date.now(), ...payload }
    try {
      const supabase = getSupabaseServer()
      const { data: sbData } = await supabase.from('almoxarifado').insert(payload).select().single()
      if (sbData) itemCriado = sbData
    } catch (sbErr) {
      console.warn('[SUPABASE_ALM_INSERT_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: itemCriado })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tipo, saldo, unidade } = body

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do item é obrigatório.' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      atualizado_em: new Date().toISOString()
    }

    if (tipo !== undefined) updates.tipo = tipo.trim()
    if (saldo !== undefined) updates.saldo = Number(saldo)
    if (unidade !== undefined) updates.unidade = unidade.trim()

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          UPDATE almoxarifado
          SET 
            tipo = COALESCE(?, tipo),
            saldo = COALESCE(?, saldo),
            unidade = COALESCE(?, unidade),
            atualizado_em = datetime('now')
          WHERE id = ?
        `).bind(updates.tipo || null, updates.saldo !== undefined ? updates.saldo : null, updates.unidade || null, id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_ALM_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase
    try {
      const supabase = getSupabaseServer()
      await supabase.from('almoxarifado').update(updates).eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_ALM_UPDATE_FALLBACK]:', sbErr)
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
      return NextResponse.json({ ok: false, error: 'ID é obrigatório.' }, { status: 400 })
    }

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM almoxarifado WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_ALM_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase
    try {
      const supabase = getSupabaseServer()
      await supabase.from('almoxarifado').delete().eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_ALM_DELETE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
