import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('almoxarifado')
      .select('*')
      .order('id', { ascending: true })

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
    const body = await request.json()
    const { tipo, saldo, unidade } = body

    if (!tipo || !tipo.trim()) {
      return NextResponse.json({ ok: false, error: 'O nome/tipo do item é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const payload = {
      tipo: tipo.trim(),
      saldo: Number(saldo) || 0,
      unidade: (unidade || 'Unidades').trim(),
      atualizado_em: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('almoxarifado')
      .insert(payload)
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tipo, saldo, unidade } = body

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do item é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const updates: Record<string, any> = {
      atualizado_em: new Date().toISOString()
    }

    if (tipo !== undefined) updates.tipo = tipo.trim()
    if (saldo !== undefined) updates.saldo = Number(saldo)
    if (unidade !== undefined) updates.unidade = unidade.trim()

    const { data, error } = await supabase
      .from('almoxarifado')
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
      .from('almoxarifado')
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
