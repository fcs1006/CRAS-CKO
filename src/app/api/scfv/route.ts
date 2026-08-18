import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('grupos_scfv')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar grupos SCFV:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const grupoData = await request.json()

    if (!grupoData || !grupoData.nome) {
      return NextResponse.json({ ok: false, error: 'Nome do grupo é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    let payload = { ...grupoData }

    // Tenta inserir payload completo
    let { data: grupoInserido, error: grpErr } = await supabase
      .from('grupos_scfv')
      .insert(payload)
      .select()
      .single()

    // Se a tabela no Postgres nao possuir algumas colunas novas (schema cache fallback)
    if (grpErr && (grpErr.message?.includes('column') || grpErr.message?.includes('schema cache'))) {
      console.warn('Coluna ausente no banco Supabase para grupos_scfv, aplicando fallback resiliente:', grpErr.message)

      const infoAdicional = []
      if (payload.tipo_grupo) infoAdicional.push(`TIPO: ${payload.tipo_grupo}`)
      if (payload.faixa_etaria) infoAdicional.push(`FAIXA ETÁRIA: ${payload.faixa_etaria}`)
      if (payload.local_encontro) infoAdicional.push(`LOCAL: ${payload.local_encontro}`)

      let descFinal = payload.descricao || ''
      if (infoAdicional.length > 0) {
        descFinal = `[${infoAdicional.join(' | ')}]\n${descFinal}`.trim()
      }

      const safePayload = {
        nome: payload.nome,
        horario: payload.horario || 'Encontros Periódicos',
        tecnico_responsavel: payload.tecnico_responsavel || 'TÉCNICO RESPONSÁVEL',
        descricao: descFinal
      }

      const retry = await supabase
        .from('grupos_scfv')
        .insert(safePayload)
        .select()
        .single()

      grupoInserido = retry.data
      grpErr = retry.error
    }

    if (grpErr) {
      console.error('Erro ao inserir grupo SCFV:', grpErr)
      return NextResponse.json({ ok: false, error: grpErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: grupoInserido })
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

    const supabase = getSupabaseServer()
    const { error } = await supabase
      .from('grupos_scfv')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir grupo SCFV:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
