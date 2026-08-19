import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupo_id')

    const supabase = getSupabaseServer()
    let query = supabase.from('frequencia_scfv').select('*').order('data', { ascending: false })

    if (grupoId) {
      query = query.eq('grupo_id', grupoId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar frequências SCFV:', error)
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
    const { grupo_id, grupo_nome, data, tema, tecnico, registros } = body

    if (!grupo_id || !data || !Array.isArray(registros)) {
      return NextResponse.json({ ok: false, error: 'Grupo, Data e lista de registros são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // 1. Tentar salvar na tabela de frequencia_scfv com registros completos
    let payload = {
      grupo_id,
      data,
      tema: tema || null,
      tecnico: tecnico || 'TÉCNICO RESPONSÁVEL',
      registros
    }

    let { data: freqSalva, error: freqErr } = await supabase
      .from('frequencia_scfv')
      .upsert(payload, { onConflict: 'grupo_id,data' })
      .select()
      .single()

    // Fallback resiliente se a tabela no banco não tiver a coluna 'registros' ainda
    if (freqErr && (freqErr.message?.includes('registros') || freqErr.message?.includes('column') || freqErr.message?.includes('schema cache'))) {
      console.warn('Coluna ausente no Supabase para frequencia_scfv, aplicando fallback para array presentes:', freqErr.message)

      const presentesArray = registros
        .filter((r: any) => r.status === 'presente' && r.membro_id && r.membro_id.length === 36)
        .map((r: any) => r.membro_id)

      const safePayload = {
        grupo_id,
        data,
        presentes: presentesArray
      }

      const retry = await supabase
        .from('frequencia_scfv')
        .upsert(safePayload, { onConflict: 'grupo_id,data' })
        .select()
        .single()

      freqSalva = retry.data
      freqErr = retry.error
    }

    // 2. Gravar no Histórico do Beneficiário (historico_atendimentos) para cada participante
    const dataPartes = data.split('-')
    const dataBr = dataPartes.length === 3 ? `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}` : data

    const registrosHistorico: any[] = []

    for (const reg of registros) {
      if (reg.familia_id && reg.nome) {
        let statusTexto = 'PRESENÇA CONFIRMADA'
        let tipoAtendimento = 'SCFV / Convivência'

        if (reg.status === 'falta_justificada') {
          statusTexto = 'FALTA JUSTIFICADA'
          tipoAtendimento = 'Falta / Não Comparecimento'
        } else if (reg.status === 'falta_nao_justificada') {
          statusTexto = 'FALTA NÃO JUSTIFICADA'
          tipoAtendimento = 'Falta / Não Comparecimento'
        }

        const obsTexto = reg.observacao ? ` (Obs: ${reg.observacao})` : ''
        const relato = `FREQUÊNCIA SCFV [${statusTexto}]: Registrado encontro do grupo "${grupo_nome || 'COLETIVO SCFV'}" na data ${dataBr}.${obsTexto}`
        const providencias = tema ? `Pauta/Tema do dia: ${tema}` : `Registro de frequência em encontro de convivência.`

        registrosHistorico.push({
          familia_id: reg.familia_id,
          usuario_visitado: reg.nome.toUpperCase(),
          tecnico: tecnico || 'TÉCNICO RESPONSÁVEL',
          tipo: tipoAtendimento,
          local: 'CRAS',
          relato,
          providencias,
          sigilo: 'equipe_tecnica',
          data
        })
      }
    }

    if (registrosHistorico.length > 0) {
      const { error: histErr } = await supabase
        .from('historico_atendimentos')
        .insert(registrosHistorico)

      if (histErr) {
        console.warn('Aviso ao registrar histórico de frequência:', histErr.message)
      }
    }

    return NextResponse.json({ ok: true, data: freqSalva || { grupo_id, data } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
