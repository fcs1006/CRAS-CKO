import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

function parseRelatoAtendimento(relatoTexto: string, providenciasTexto?: string, tecnicoTexto?: string, dataAtendimento?: string) {
  let objetivo = ''
  let atividade = ''
  let detalhamento = ''
  let relato = ''
  let profissionais = ''

  if (!relatoTexto) {
    return {
      objetivo_encontro: '',
      atividade_realizada: '',
      detalhamento: '',
      relato: '',
      providencias: providenciasTexto || '',
      profissionais_participantes: '',
      tecnico: tecnicoTexto || 'TÉCNICO RESPONSÁVEL'
    }
  }

  const linhas = relatoTexto.split('\n')
  let campoAtual: 'objetivo' | 'atividade' | 'detalhamento' | 'relato' | 'profissionais' | 'outro' = 'outro'
  const buffers: Record<string, string[]> = {
    objetivo: [],
    atividade: [],
    detalhamento: [],
    relato: [],
    profissionais: []
  }

  for (const linha of linhas) {
    const lTrim = linha.trim()
    if (lTrim.startsWith('OBJETIVO:')) {
      campoAtual = 'objetivo'
      const valor = lTrim.replace('OBJETIVO:', '').trim()
      if (valor) buffers.objetivo.push(valor)
    } else if (lTrim.startsWith('ATIVIDADE REALIZADA:')) {
      campoAtual = 'atividade'
      const valor = lTrim.replace('ATIVIDADE REALIZADA:', '').trim()
      if (valor) buffers.atividade.push(valor)
    } else if (lTrim.startsWith('DETALHAMENTO:')) {
      campoAtual = 'detalhamento'
      const valor = lTrim.replace('DETALHAMENTO:', '').trim()
      if (valor) buffers.detalhamento.push(valor)
    } else if (lTrim.startsWith('RELATO TÉCNICO:')) {
      campoAtual = 'relato'
      const valor = lTrim.replace('RELATO TÉCNICO:', '').trim()
      if (valor) buffers.relato.push(valor)
    } else if (lTrim.startsWith('PROFISSIONAIS PARTICIPANTES:')) {
      campoAtual = 'profissionais'
      const valor = lTrim.replace('PROFISSIONAIS PARTICIPANTES:', '').trim()
      if (valor) buffers.profissionais.push(valor)
    } else if (lTrim.startsWith('RELATÓRIO DE ENCONTRO SCFV')) {
      campoAtual = 'outro'
    } else if (campoAtual !== 'outro') {
      buffers[campoAtual].push(linha)
    }
  }

  objetivo = buffers.objetivo.join('\n').trim()
  atividade = buffers.atividade.join('\n').trim()
  detalhamento = buffers.detalhamento.join('\n').trim()
  relato = buffers.relato.join('\n').trim()
  profissionais = buffers.profissionais.join(', ').trim()

  if (!objetivo && !atividade && !detalhamento && !relato) {
    relato = relatoTexto
  }

  return {
    objetivo_encontro: objetivo,
    atividade_realizada: atividade,
    detalhamento: detalhamento,
    relato: relato,
    providencias: providenciasTexto || '',
    profissionais_participantes: profissionais,
    tecnico: tecnicoTexto || 'TÉCNICO RESPONSÁVEL'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupo_id')

    const supabase = getSupabaseServer()
    
    // 1. Buscar na tabela relatorios_scfv
    let query = supabase.from('relatorios_scfv').select('*').order('data_encontro', { ascending: false })
    if (grupoId) {
      query = query.eq('grupo_id', grupoId)
    }

    const { data: relatoriosDirect } = await query

    // 2. Buscar também no historico_atendimentos
    const { data: atendimentos } = await supabase
      .from('historico_atendimentos')
      .select('*')
      .ilike('tipo', '%SCFV%')
      .order('criado_em', { ascending: false })

    const atendimentosMap = new Map<string, any>()
    if (Array.isArray(atendimentos)) {
      atendimentos.forEach(atd => {
        const dataStr = atd.data || atd.criado_em?.split('T')[0]
        if (dataStr && !atendimentosMap.has(dataStr)) {
          const parsed = parseRelatoAtendimento(atd.relato || '', atd.providencias, atd.tecnico, dataStr)
          atendimentosMap.set(dataStr, {
            id: atd.id,
            grupo_id: grupoId || 'geral',
            data_encontro: dataStr,
            ...parsed
          })
        }
      })
    }

    const relatoriosCompletos: any[] = []
    const datasProcessadas = new Set<string>()

    if (Array.isArray(relatoriosDirect)) {
      relatoriosDirect.forEach((r: any) => {
        const d = r.data_encontro?.split('T')[0]?.split(' ')[0]
        if (!d) return
        datasProcessadas.add(d)

        const fallback = atendimentosMap.get(d) || {}
        relatoriosCompletos.push({
          id: r.id || fallback.id,
          grupo_id: r.grupo_id || grupoId || 'geral',
          data_encontro: d,
          objetivo_encontro: r.objetivo_encontro || fallback.objetivo_encontro || '',
          atividade_realizada: r.atividade_realizada || fallback.atividade_realizada || '',
          detalhamento: r.detalhamento || fallback.detalhamento || '',
          relato: r.relato || fallback.relato || '',
          providencias: r.providencias || fallback.providencias || '',
          profissionais_participantes: r.profissionais_participantes || fallback.profissionais_participantes || '',
          tecnico: r.tecnico || fallback.tecnico || 'TÉCNICO RESPONSÁVEL'
        })
      })
    }

    atendimentosMap.forEach((val, key) => {
      if (!datasProcessadas.has(key)) {
        relatoriosCompletos.push(val)
      }
    })

    return NextResponse.json({ ok: true, data: relatoriosCompletos })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      grupo_id,
      grupo_nome,
      data_encontro,
      objetivo_encontro,
      atividade_realizada,
      detalhamento,
      relato,
      providencias,
      profissionais_participantes,
      tecnico
    } = body

    if (!grupo_id || !data_encontro) {
      return NextResponse.json({ ok: false, error: 'Grupo e Data do Encontro são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    const payload = {
      grupo_id,
      data_encontro,
      objetivo_encontro: objetivo_encontro || null,
      atividade_realizada: atividade_realizada || null,
      detalhamento: detalhamento || null,
      relato: relato || null,
      providencias: providencias || null,
      profissionais_participantes: profissionais_participantes || null,
      tecnico: tecnico || 'TÉCNICO RESPONSÁVEL'
    }

    // 1. Tentar upsert por grupo_id e data_encontro
    let { data: relSalvo, error: relErr } = await supabase
      .from('relatorios_scfv')
      .upsert(payload, { onConflict: 'grupo_id,data_encontro' })
      .select()
      .single()

    if (relErr) {
      console.warn('Tentativa de upsert em relatorios_scfv falhou, aplicando fallback de substituição:', relErr.message)
      await supabase.from('relatorios_scfv').delete().eq('grupo_id', grupo_id).eq('data_encontro', data_encontro)
      const retry = await supabase.from('relatorios_scfv').insert(payload).select().single()
      relSalvo = retry.data
    }

    // 2. Gravar no historico_atendimentos como garantia de persistência dupla
    const dataPartes = data_encontro.split('-')
    const dataBr = dataPartes.length === 3 ? `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}` : data_encontro

    const partesRelato = [
      `RELATÓRIO DE ENCONTRO SCFV [${grupo_nome || 'COLETIVO SCFV'}] - DATA: ${dataBr}`,
      objetivo_encontro ? `OBJETIVO: ${objetivo_encontro}` : '',
      atividade_realizada ? `ATIVIDADE REALIZADA: ${atividade_realizada}` : '',
      detalhamento ? `DETALHAMENTO: ${detalhamento}` : '',
      relato ? `RELATO TÉCNICO: ${relato}` : '',
      profissionais_participantes ? `PROFISSIONAIS PARTICIPANTES: ${profissionais_participantes}` : ''
    ].filter(Boolean).join('\n')

    try {
      const { data: fams } = await supabase.from('familias').select('id').limit(1)
      const famId = fams && fams[0] ? fams[0].id : '00000000-0000-0000-0000-000000000000'

      await supabase.from('historico_atendimentos').insert({
        familia_id: famId,
        usuario_visitado: `ENCONTRO SCFV - ${grupo_nome || 'COLETIVO'}`,
        tecnico: tecnico || 'TÉCNICO RESPONSÁVEL',
        tipo: 'SCFV / Convivência',
        local: 'CRAS',
        relato: partesRelato,
        providencias: providencias || 'Acompanhamento continuado em grupo de convivência.',
        sigilo: 'equipe_tecnica',
        data: data_encontro
      })
    } catch (e) {
      console.warn('Aviso ao inserir em historico_atendimentos:', e)
    }

    return NextResponse.json({ ok: true, data: relSalvo || payload })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupo_id')
    const dataEncontro = searchParams.get('data_encontro')

    if (!grupoId || !dataEncontro) {
      return NextResponse.json({ ok: false, error: 'grupo_id e data_encontro são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    
    // Deletar relatório do encontro
    const { error: errRel } = await supabase
      .from('relatorios_scfv')
      .delete()
      .eq('grupo_id', grupoId)
      .eq('data_encontro', dataEncontro)

    if (errRel) {
      console.warn('Erro ao deletar de relatorios_scfv:', errRel.message)
    }

    // Opcional: Deletar registro de frequência da mesma data
    await supabase
      .from('frequencia_scfv')
      .delete()
      .eq('grupo_id', grupoId)
      .eq('data', dataEncontro)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
