import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('historico_atendimentos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar atendimentos:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const atendimento = await request.json()

    if (!atendimento || !atendimento.familia_id) {
      return NextResponse.json({ ok: false, error: 'Dados de atendimento inválidos.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data: atdInserido, error: atdErr } = await supabase
      .from('historico_atendimentos')
      .insert(atendimento)
      .select()
      .single()

    if (atdErr) {
      console.error('Erro ao inserir atendimento:', atdErr)
      return NextResponse.json({ ok: false, error: atdErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: atdInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, atendimento } = await request.json()

    if (!id || !atendimento) {
      return NextResponse.json({ ok: false, error: 'ID e dados de atendimento são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data: atdAtualizado, error: atdErr } = await supabase
      .from('historico_atendimentos')
      .update(atendimento)
      .eq('id', id)
      .select()
      .single()

    if (atdErr) {
      console.error('Erro ao atualizar atendimento:', atdErr)
      return NextResponse.json({ ok: false, error: atdErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: atdAtualizado })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do atendimento é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { error: err } = await supabase
      .from('historico_atendimentos')
      .delete()
      .eq('id', id)

    if (err) {
      console.error('Erro ao excluir atendimento:', err)
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
