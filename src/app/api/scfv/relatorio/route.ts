import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

function parseRelatoAtendimento(relatoTexto: string, providenciasTexto?: string, tecnicoTexto?: string, dataAtendimento?: string) {
  let objetivo = ''
  let atividade = ''
  let detalhamento = ''
  let relato = ''
  let profissionais = ''

  if (!relatoTexto || relatoTexto.startsWith('FREQUÊNCIA SCFV [')) {
    return {
      objetivo_encontro: '',
      atividade_realizada: '',
      detalhamento: '',
      relato: '',
      providencias: '',
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

  if (!objetivo && !atividade && !detalhamento && !relato && !relatoTexto.startsWith('FREQUÊNCIA SCFV [')) {
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

    let atendimentos: any[] = []

    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const atdRes = await db.prepare(`
          SELECT * FROM historico_atendimentos
          WHERE tipo LIKE '%SCFV%' AND relato LIKE '%RELATÓRIO DE ENCONTRO SCFV%'
          ORDER BY criado_em DESC
          LIMIT 100
        `).all<any>()
        atendimentos = atdRes.results || []
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_RELATORIO_ERR]:', d1Err)
    }

    // 2. Consulta de fallback no Supabase
    if (atendimentos.length === 0) {
      try {
        const supabase = getSupabaseServer()
        const resAtd = await supabase
          .from('historico_atendimentos')
          .select('*')
          .ilike('tipo', '%SCFV%')
          .ilike('relato', '%RELATÓRIO DE ENCONTRO SCFV%')
          .order('criado_em', { ascending: false })
        atendimentos = resAtd.data || []
      } catch (e) {}
    }

    const atendimentosMap = new Map<string, any>()
    if (Array.isArray(atendimentos)) {
      atendimentos.forEach(atd => {
        const dataStr = atd.data ? atd.data.split('T')[0] : atd.criado_em?.split('T')[0]
        if (dataStr && !atendimentosMap.has(dataStr)) {
          const parsed = parseRelatoAtendimento(atd.relato || '', atd.providencias, atd.tecnico, dataStr)
          if (parsed.objetivo_encontro || parsed.atividade_realizada || parsed.relato) {
            atendimentosMap.set(dataStr, {
              id: atd.id,
              grupo_id: grupoId || 'geral',
              data_encontro: dataStr,
              ...parsed
            })
          }
        }
      })
    }

    const relatoriosCompletos: any[] = []
    atendimentosMap.forEach((val) => {
      relatoriosCompletos.push(val)
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

    const apenasData = data_encontro.split('T')[0].split(' ')[0].trim()
    const dataPartes = apenasData.split('-')
    const dataBr = dataPartes.length === 3 ? `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}` : apenasData

    const partesRelato = [
      `RELATÓRIO DE ENCONTRO SCFV [${grupo_nome || 'COLETIVO SCFV'}] - DATA: ${dataBr}`,
      objetivo_encontro ? `OBJETIVO: ${objetivo_encontro}` : '',
      atividade_realizada ? `ATIVIDADE REALIZADA: ${atividade_realizada}` : '',
      detalhamento ? `DETALHAMENTO: ${detalhamento}` : '',
      relato ? `RELATO TÉCNICO: ${relato}` : '',
      profissionais_participantes ? `PROFISSIONAIS PARTICIPANTES: ${profissionais_participantes}` : ''
    ].filter(Boolean).join('\n')

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const partList = await db.prepare('SELECT familia_id, nome FROM participantes_scfv WHERE grupo_id = ?').bind(grupo_id).all<any>()
        const list = partList.results || []

        if (list.length > 0) {
          for (const p of list) {
            let famId = p.familia_id
            if (!famId) {
              const famRow = await db.prepare('SELECT id FROM familias WHERE UPPER(responsavel) = ? LIMIT 1').bind((p.nome || '').trim().toUpperCase()).first<any>()
              if (famRow) famId = famRow.id
            }

            if (famId) {
              const histId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
              await db.prepare(`
                INSERT INTO historico_atendimentos (
                  id, familia_id, data, hora, usuario_visitado, local,
                  compartilhada, tecnico, relato, providencias, sigilo, tipo, criado_em
                ) VALUES (?, ?, ?, ?, ?, 'CRAS', 'Não', ?, ?, ?, 'publico', 'SCFV / Convivência', datetime('now'))
              `).bind(
                histId,
                famId,
                apenasData,
                new Date().toTimeString().split(' ')[0],
                (p.nome || 'PARTICIPANTE').toUpperCase(),
                tecnico || 'TÉCNICO RESPONSÁVEL',
                `${partesRelato}\n\n[SIGILO:publico]`,
                providencias || 'Acompanhamento continuado em grupo de convivência.'
              ).run()
            }
          }
        } else {
          // Gravar para primeira família encontrada
          const firstFam = await db.prepare('SELECT id FROM familias LIMIT 1').first<any>()
          if (firstFam) {
            const histId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}`
            await db.prepare(`
              INSERT INTO historico_atendimentos (
                id, familia_id, data, hora, usuario_visitado, local,
                compartilhada, tecnico, relato, providencias, sigilo, tipo, criado_em
              ) VALUES (?, ?, ?, ?, ?, 'CRAS', 'Não', ?, ?, ?, 'publico', 'SCFV / Convivência', datetime('now'))
            `).bind(
              histId,
              firstFam.id,
              apenasData,
              new Date().toTimeString().split(' ')[0],
              `COLETIVO SCFV - ${grupo_nome || 'GRUPO'}`,
              tecnico || 'TÉCNICO RESPONSÁVEL',
              `${partesRelato}\n\n[SIGILO:publico]`,
              providencias || 'Acompanhamento continuado em grupo de convivência.'
            ).run()
          }
        }
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_REL_POST_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      const payload = {
        grupo_id,
        data_encontro: apenasData,
        objetivo_encontro: objetivo_encontro || null,
        atividade_realizada: atividade_realizada || null,
        detalhamento: detalhamento || null,
        relato: relato || null,
        providencias: providencias || null,
        profissionais_participantes: profissionais_participantes || null,
        tecnico: tecnico || 'TÉCNICO RESPONSÁVEL'
      }
      await supabase.from('relatorios_scfv').delete().eq('grupo_id', grupo_id).eq('data_encontro', apenasData)
      await supabase.from('relatorios_scfv').insert(payload)
    } catch (sbErr) {
      console.warn('[SUPABASE_SCFV_REL_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: { grupo_id, data_encontro: apenasData } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataEncontro = searchParams.get('data_encontro')

    if (!dataEncontro) {
      return NextResponse.json({ ok: false, error: 'data_encontro é obrigatório.' }, { status: 400 })
    }

    const apenasData = dataEncontro.split('T')[0].split(' ')[0].trim()

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare("DELETE FROM historico_atendimentos WHERE tipo LIKE '%SCFV%' AND data = ?").bind(apenasData).run()
        await db.prepare("DELETE FROM frequencia_scfv WHERE data = ?").bind(apenasData).run()
      }
    } catch (d1Err) {
      console.warn('[D1_SCFV_REL_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase
    try {
      const supabase = getSupabaseServer()
      await supabase.from('relatorios_scfv').delete().eq('data_encontro', apenasData)
      await supabase.from('frequencia_scfv').delete().eq('data', apenasData)
      await supabase.from('historico_atendimentos').delete().ilike('tipo', '%SCFV%').eq('data', apenasData)
    } catch (sbErr) {
      console.warn('[SUPABASE_SCFV_REL_DELETE_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
