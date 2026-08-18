import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('participantes_scfv')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar participantes SCFV:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json()

    if (!dados || !dados.grupo_id || !dados.nome) {
      return NextResponse.json({ ok: false, error: 'Grupo e Nome do participante são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // UUID zerado para fallback se membro_id não for informado ou for inválido
    const safeMembroId = dados.membro_id && dados.membro_id.length === 36
      ? dados.membro_id 
      : '00000000-0000-0000-0000-000000000000'

    const safeFamiliaId = dados.familia_id && dados.familia_id.length === 36
      ? dados.familia_id
      : null

    const payload = {
      grupo_id: dados.grupo_id,
      membro_id: safeMembroId,
      nome: dados.nome.trim().toUpperCase(),
      familia_id: safeFamiliaId
    }

    const { data: partInserido, error } = await supabase
      .from('participantes_scfv')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Erro ao vincular participante SCFV:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
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

    const supabase = getSupabaseServer()
    const { error } = await supabase
      .from('participantes_scfv')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao desvincular participante SCFV:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
