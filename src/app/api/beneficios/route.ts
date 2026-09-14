import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const benRes = await db.prepare('SELECT * FROM beneficios_concedidos ORDER BY criado_em DESC LIMIT 200').all<any>()
        return NextResponse.json({ ok: true, data: benRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_BENEFICIOS_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      const { data, error } = await supabase
        .from('beneficios_concedidos')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!error && data) {
        return NextResponse.json({ ok: true, data: data || [] })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_BEN_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const beneficio = await request.json()
    const benId = beneficio.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ben_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)
    const qtd = Number(beneficio.quantidade) || 1

    // 1. Salvar no Cloudflare D1 e atualizar saldo de almoxarifado
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          INSERT INTO beneficios_concedidos (
            id, familia_id, data, tipo, categoria_rma, quantidade,
            status, tecnico_responsavel, tecnico_conselho, parecer_social,
            observacao, criado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          benId,
          beneficio.familia_id || null,
          beneficio.data || new Date().toISOString().split('T')[0],
          beneficio.tipo,
          beneficio.categoria_rma || 'outros_eventuais',
          qtd,
          beneficio.status || 'Entregue',
          beneficio.tecnico_responsavel || 'TÉCNICO CRAS',
          beneficio.tecnico_conselho || null,
          beneficio.parecer_social || null,
          beneficio.observacao || null
        ).run()

        // Dar baixa no estoque do almoxarifado no D1
        if (beneficio.tipo) {
          await db.prepare(`
            UPDATE almoxarifado 
            SET saldo = MAX(0, saldo - ?), atualizado_em = datetime('now')
            WHERE UPPER(tipo) = UPPER(?)
          `).bind(qtd, beneficio.tipo.trim()).run()
        }
      }
    } catch (d1Err) {
      console.warn('[D1_BENEFICIO_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente em segundo plano (não-bloqueante)
    const benInserido: any = { ...beneficio, id: benId }
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        await supabase
          .from('beneficios_concedidos')
          .insert({ ...beneficio, id: benId })

        const { data: almData } = await supabase.from('almoxarifado').select('*').eq('tipo', beneficio.tipo).single()
        if (almData && almData.saldo > 0) {
          await supabase.from('almoxarifado').update({ saldo: almData.saldo - qtd }).eq('id', almData.id)
        }
      } catch (sbErr) {
        console.warn('[SUPABASE_BEN_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    return NextResponse.json({ ok: true, data: benInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID é obrigatório.' }, { status: 400 })
    }

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          UPDATE beneficios_concedidos
          SET 
            status = COALESCE(?, status),
            parecer_social = COALESCE(?, parecer_social),
            observacao = COALESCE(?, observacao)
          WHERE id = ?
        `).bind(
          updates.status || null,
          updates.parecer_social || null,
          updates.observacao || null,
          id
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_BEN_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase em segundo plano (não-bloqueante)
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        await supabase.from('beneficios_concedidos').update(updates).eq('id', id)
      } catch (sbErr) {
        console.warn('[SUPABASE_BEN_UPDATE_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

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
        await db.prepare('DELETE FROM beneficios_concedidos WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_BEN_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase em segundo plano (não-bloqueante)
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        await supabase.from('beneficios_concedidos').delete().eq('id', id)
      } catch (sbErr) {
        console.warn('[SUPABASE_BEN_DELETE_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
