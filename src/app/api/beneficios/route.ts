import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('beneficios_concedidos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const beneficio = await request.json()
    const supabase = getSupabaseServer()

    const { data: benInserido, error: benErr } = await supabase
      .from('beneficios_concedidos')
      .insert(beneficio)
      .select()
      .single()

    if (benErr) {
      return NextResponse.json({ ok: false, error: benErr.message }, { status: 500 })
    }

    // Dar baixa no Almoxarifado
    try {
      const { data: almData } = await supabase.from('almoxarifado').select('*').eq('tipo', beneficio.tipo).single()
      if (almData && almData.saldo > 0) {
        await supabase.from('almoxarifado').update({ saldo: almData.saldo - (beneficio.quantidade || 1) }).eq('id', almData.id)
      }
    } catch (e) {
      console.warn('Não foi possível dar baixa no almoxarifado:', e)
    }

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

    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('beneficios_concedidos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
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

    const supabase = getSupabaseServer()
    const { error } = await supabase
      .from('beneficios_concedidos')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
