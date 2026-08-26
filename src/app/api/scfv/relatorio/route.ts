import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

function parseRelatoAtendimento(relatoTexto: string, providenciasTexto?: string, tecnicoTexto?: string, dataAtendimento?: string) {
  let objetivo = ''
  let atividade = ''
  let detalhamento = ''
  let relato = relatoTexto
  let profissionais = ''

  if (relatoTexto.includes('OBJETIVO:') || relatoTexto.includes('RELATO TÉCNICO:')) {
    const pegarTrecho = (rotulo: string, proximosRotulos: string[]) => {
      const idx = relatoTexto.indexOf(rotulo)
      if (idx === -1) return ''
      const inicio = idx + rotulo.length
      let fim = relatoTexto.length
      for (const prox of proximosRotulos) {
        const pIdx = relatoTexto.indexOf(prox, inicio)
        if (pIdx !== -1 && pIdx < fim) {
          fim = pIdx
        }
      }
      return relatoTexto.substring(inicio, fim).trim()
    }

    const rotulos = ['OBJETIVO:', 'ATIVIDADE REALIZADA:', 'DETALHAMENTO:', 'RELATO TÉCNICO:', 'PROFISSIONAIS PARTICIPANTES:']
    objetivo = pegarTrecho('OBJETIVO:', rotulos.slice(1))
    atividade = pegarTrecho('ATIVIDADE REALIZADA:', rotulos.slice(2))
    detalhamento = pegarTrecho('DETALHAMENTO:', rotulos.slice(3))
    relato = pegarTrecho('RELATO TÉCNICO:', rotulos.slice(4)) || relatoTexto
    profissionais = pegarTrecho('PROFISSIONAIS PARTICIPANTES:', [])
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

    const { data: relatoriosDirect, error: relError } = await query
    const relatoriosSalvos = (relatoriosDirect || []).filter((r: any) => r.objetivo_encontro || r.relato || r.atividade_realizada)

    // 2. Se encontrou relatórios completos em relatorios_scfv, retorna direto
    if (!relError && relatoriosSalvos.length > 0) {
      return NextResponse.json({ ok: true, data: relatoriosSalvos })
    }

    // 3. Fallback inteligente: Reconstruir a partir de historico_atendimentos caso relatorios_scfv esteja vazio
    const { data: atendimentos } = await supabase
      .from('historico_atendimentos')
      .select('*')
      .ilike('tipo', '%SCFV%')
      .order('criado_em', { ascending: false })

    const relatoriosReconstruidos: any[] = []
    const datasJaProcessadas = new Set<string>()

    if (Array.isArray(atendimentos)) {
      atendimentos.forEach(atd => {
        const dataEncontroStr = atd.data || atd.criado_em?.split('T')[0]
        if (!dataEncontroStr || datasJaProcessadas.has(dataEncontroStr)) return

        datasJaProcessadas.add(dataEncontroStr)
        const parsed = parseRelatoAtendimento(atd.relato || '', atd.providencias, atd.tecnico, dataEncontroStr)

        relatoriosReconstruidos.push({
          id: atd.id,
          grupo_id: grupoId || 'geral',
          data_encontro: dataEncontroStr,
          ...parsed
        })
      })
    }

    // Mesclar resultados priorizando os registros diretos de relatorios_scfv
    const relatoriosFinais = [...relatoriosSalvos]
    relatoriosReconstruidos.forEach(rRec => {
      if (!relatoriosFinais.some(rf => rf.data_encontro === rRec.data_encontro)) {
        relatoriosFinais.push(rRec)
      }
    })

    return NextResponse.json({ ok: true, data: relatoriosFinais })
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

    // Tentar upsert por grupo_id e data_encontro
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
