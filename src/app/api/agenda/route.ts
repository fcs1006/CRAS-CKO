import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('agenda_tecnica')
      .select('*')
      .order('data', { ascending: true })

    if (error) {
      console.error('Erro ao buscar agenda técnica:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const agendamento = await request.json()

    if (!agendamento || !agendamento.data || !agendamento.hora) {
      return NextResponse.json({ ok: false, error: 'Dados do agendamento inválidos.' }, { status: 400 })
    }

    const payload = {
      familia_id: agendamento.familia_id || null,
      data: agendamento.data,
      hora: agendamento.hora,
      tipo: agendamento.tipo,
      responsavel: agendamento.responsavel,
      tecnico: agendamento.tecnico,
      descricao: agendamento.descricao || null,
      status: agendamento.status || 'Pendente'
    }

    const supabase = getSupabaseServer()
    const { data: itemInserido, error: err } = await supabase
      .from('agenda_tecnica')
      .insert(payload)
      .select()
      .single()

    if (err) {
      console.error('Erro ao agendar visita na agenda técnica:', err)
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
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

    const supabase = getSupabaseServer()
    const updateData: any = { status: status || 'Realizado' }

    if (status === 'Cancelado' && motivoCancelamento) {
      const { data: itemAtual } = await supabase
        .from('agenda_tecnica')
        .select('descricao')
        .eq('id', id)
        .single()

      const descAntiga = itemAtual?.descricao || ''
      const motivoStr = `[CANCELAMENTO: ${motivoCancelamento.trim().toUpperCase()}]`
      updateData.descricao = descAntiga ? `${descAntiga} ${motivoStr}` : motivoStr
    }

    const { data: itemAtualizado, error: err } = await supabase
      .from('agenda_tecnica')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (err) {
      console.error('Erro ao atualizar status do agendamento:', err)
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: itemAtualizado })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
