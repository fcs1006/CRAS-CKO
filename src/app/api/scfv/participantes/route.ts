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

    // Buscar nome do grupo para registrar no histórico
    const { data: grupoData } = await supabase
      .from('grupos_scfv')
      .select('nome')
      .eq('id', dados.grupo_id)
      .single()

    const grupoNome = grupoData?.nome || 'GRUPO SCFV'

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

    // Registrar Inclusão no Histórico do Beneficiário se houver familia_id
    if (safeFamiliaId) {
      try {
        await supabase.from('historico_atendimentos').insert({
          familia_id: safeFamiliaId,
          usuario_visitado: dados.nome.trim().toUpperCase(),
          tecnico: dados.tecnico || 'TÉCNICO RESPONSÁVEL',
          tipo: 'SCFV / Convivência',
          local: 'CRAS',
          relato: `INCLUSÃO EM GRUPO SCFV: O(a) beneficiário(a) ${dados.nome.trim().toUpperCase()} foi vinculado(a) e matriculado(a) no grupo "${grupoNome}".`,
          providencias: 'Matrícula efetuada no Serviço de Convivência e Fortalecimento de Vínculos (SCFV).',
          sigilo: 'equipe_tecnica'
        })
      } catch (hErr) {
        console.warn('Erro ao inserir histórico de inclusão:', hErr)
      }
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

    // Buscar participante antes de deletar para gravar a exclusão no histórico
    const { data: partExistente } = await supabase
      .from('participantes_scfv')
      .select('*, grupos_scfv(nome)')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('participantes_scfv')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao desvincular participante SCFV:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Registrar Exclusão no Histórico do Beneficiário se houver familia_id
    if (partExistente && partExistente.familia_id) {
      try {
        const grupoNome = (partExistente as any).grupos_scfv?.nome || 'GRUPO SCFV'
        await supabase.from('historico_atendimentos').insert({
          familia_id: partExistente.familia_id,
          usuario_visitado: partExistente.nome,
          tecnico: 'TÉCNICO RESPONSÁVEL',
          tipo: 'SCFV / Convivência',
          local: 'CRAS',
          relato: `DESVINCULAÇÃO DE GRUPO SCFV: O(a) beneficiário(a) ${partExistente.nome} foi desvinculado(a) do grupo "${grupoNome}".`,
          providencias: 'Desvinculação efetuada no módulo SCFV.',
          sigilo: 'equipe_tecnica'
        })
      } catch (hErr) {
        console.warn('Erro ao inserir histórico de exclusão:', hErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
