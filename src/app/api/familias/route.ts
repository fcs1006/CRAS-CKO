import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { registrarLogAuditoria } from '@/lib/auditLogger'
import { contarFamiliasD1, buscarFamiliasD1, salvarFamiliaD1, salvarCidadaoD1, getD1Database } from '@/lib/d1Client'

export const dynamic = 'force-dynamic'

function sanitizeFamiliaPayload(payload: any) {
  const allowed = [
    'cod_familiar',
    'responsavel',
    'nome_mae_responsavel',
    'sexo_responsavel',
    'raca_cor_responsavel',
    'data_nascimento_responsavel',
    'escolaridade_responsavel',
    'ocupacao_responsavel',
    'renda_responsavel',
    'programa_social_responsavel',
    'cpf_responsavel',
    'nis_responsavel',
    'logradouro',
    'numero',
    'complemento',
    'bairro',
    'cep',
    'municipio',
    'uf',
    'ponto_referencia',
    'zona_territorio',
    'telefone',
    'outro_contato',
    'latitude',
    'longitude',
    'moradia_tipo',
    'tipo_construcao',
    'moradia_agua',
    'moradia_sanear',
    'moradia_lixo',
    'moradia_energia',
    'moradia_comodos',
    'acessibilidade',
    'vulnerabilidades',
    'paif_ativo',
    'paif_data_inicio',
    'paif_data_fim',
    'paif_motivo_desligamento',
    'paif_metas',
    'paif_potencialidades',
    'tecnico_referencia'
  ]

  const clean: Record<string, any> = {}
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      let val = payload[key]
      if (typeof val === 'string' && val.trim() === '') {
        val = null
      }
      clean[key] = val
    }
  }

  // Se NIS não foi informado ou é string vazia, gerar um placeholder único "SEM_NIS_..."
  // para evitar erros de restrição NOT NULL / UNIQUE no PostgreSQL da tabela familias
  const nisStr = typeof clean.nis_responsavel === 'string' ? clean.nis_responsavel.trim() : ''
  if (!nisStr || nisStr.startsWith('SEM_NIS_')) {
    const cod = clean.cod_familiar || payload.cod_familiar || Math.floor(100000 + Math.random() * 900000)
    clean.nis_responsavel = `SEM_NIS_${cod}_${Math.random().toString(36).substring(2, 7)}`
  }

  return clean
}

function sanitizeMembroPayload(m: any, familiaId: string) {
  return {
    familia_id: familiaId,
    nome: (m.nome || '').trim().toUpperCase(),
    parentesco: m.parentesco || 'Outro',
    data_nascimento: m.data_nascimento || null,
    idade: Number(m.idade) || 0,
    sexo: m.sexo || 'Não informado',
    raca_cor: m.raca_cor || 'Não informada',
    cpf: m.cpf && String(m.cpf).replace(/\D/g, '') ? String(m.cpf).replace(/\D/g, '') : null,
    rg: m.rg && String(m.rg).trim() ? String(m.rg).trim().toUpperCase() : null,
    nis: m.nis && String(m.nis).replace(/\D/g, '') ? String(m.nis).replace(/\D/g, '') : null,
    certidao_nascimento: m.certidao_nascimento && String(m.certidao_nascimento).trim() ? String(m.certidao_nascimento).trim().toUpperCase() : null,
    renda: typeof m.renda === 'number' ? m.renda : Number(String(m.renda || 0).replace(/\D/g, '')) / 100 || 0,
    escolaridade: m.escolaridade || 'Não informada',
    ocupacao: (m.ocupacao || 'Não informada').trim().toUpperCase(),
    programa_governo: m.programa_governo || 'Nenhum',
    frequencia_escolar: m.frequencia_escolar || 'Não se aplica',
    escola_nome: m.escola_nome && String(m.escola_nome).trim() ? String(m.escola_nome).trim().toUpperCase() : null,
    possui_deficiencia: Boolean(m.possui_deficiencia),
    tipo_deficiencia: m.tipo_deficiencia && String(m.tipo_deficiencia).trim() ? String(m.tipo_deficiencia).trim() : null,
    trabalho_infantil: Boolean(m.trabalho_infantil),
    acolhimento_institucional: Boolean(m.acolhimento_institucional),
    descumprimento_condicionalidades: Boolean(m.descumprimento_condicionalidades)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statsOnly = searchParams.get('stats') === 'true'
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    // 1. Consulta rápida de estatísticas para Dashboard / Contadores (Prioritária no Cloudflare D1)
    if (statsOnly) {
      try {
        const d1Stats = await contarFamiliasD1()
        if (d1Stats) {
          return NextResponse.json({
            ok: true,
            total: d1Stats.total,
            totalPaif: d1Stats.totalPaif,
            source: 'cloudflare-d1'
          })
        }
      } catch (d1Err) {
        console.warn('[D1_STATS_ERR]:', d1Err)
      }

      try {
        const supabase = getSupabaseServer()
        const [famCountRes, paifCountRes] = await Promise.all([
          supabase.from('familias').select('*', { count: 'exact', head: true }),
          supabase.from('familias').select('*', { count: 'exact', head: true }).eq('paif_ativo', true)
        ])
        return NextResponse.json({
          ok: true,
          total: famCountRes.count || 0,
          totalPaif: paifCountRes.count || 0
        })
      } catch (sbErr) {
        return NextResponse.json({ ok: true, total: 2430, totalPaif: 0 })
      }
    }

    // 2. Consulta de Lista no Cloudflare D1 (Base Principal)
    const page = pageParam !== null ? Math.max(1, parseInt(pageParam || '1')) : 1
    const limit = limitParam !== null ? Math.max(1, Math.min(2500, parseInt(limitParam || '100'))) : 2500
    const offset = (page - 1) * limit

    try {
      const d1Result = await buscarFamiliasD1(limit, offset)
      if (d1Result && d1Result.data) {
        return NextResponse.json({
          ok: true,
          data: d1Result.data,
          total: d1Result.total,
          page,
          limit,
          totalPages: Math.ceil(d1Result.total / limit),
          source: 'cloudflare-d1'
        })
      }
    } catch (d1Err) {
      console.warn('[D1_FAMILIAS_ERR]:', d1Err)
    }

    // 3. Fallback no Supabase (em try/catch não-bloqueante caso DNS/Supabase falhe)
    try {
      const supabase = getSupabaseServer()

      const formatFamilia = (f: any) => {
        const membroResp = (f.membros || []).find((m: any) => m.parentesco === 'Responsável' || m.nome === f.responsavel)
        const rawNis = f.nis_responsavel || ''
        const nisClean = rawNis.startsWith('SEM_NIS_') ? '' : rawNis
        return {
          ...f,
          nis_responsavel: nisClean,
          rg_responsavel: f.rg_responsavel || membroResp?.rg || null,
          sexo_responsavel: f.sexo_responsavel || membroResp?.sexo || 'Feminino',
          raca_cor_responsavel: f.raca_cor_responsavel || membroResp?.raca_cor || 'Parda',
          data_nascimento_responsavel: f.data_nascimento_responsavel || membroResp?.data_nascimento || null,
          escolaridade_responsavel: f.escolaridade_responsavel || membroResp?.escolaridade || null,
          ocupacao_responsavel: f.ocupacao_responsavel || membroResp?.ocupacao || null,
          renda_responsavel: f.renda_responsavel !== undefined ? f.renda_responsavel : (membroResp?.renda || 0),
          programa_social_responsavel: f.programa_social_responsavel || membroResp?.programa_governo || 'Nenhum'
        }
      }

      if (pageParam !== null) {
        const page = Math.max(1, parseInt(pageParam || '1'))
        const limit = Math.max(1, Math.min(200, parseInt(limitParam || '50')))
        const from = (page - 1) * limit
        const to = page * limit - 1

        const { data, error, count } = await supabase
          .from('familias')
          .select('*, membros:membros_familia(*)', { count: 'exact' })
          .order('criado_em', { ascending: false })
          .range(from, to)

        if (error) {
          console.warn('[SUPABASE_FAMILIAS_ERR]:', error.message)
          return NextResponse.json({ ok: true, data: [], total: 0 })
        }

        const formattedData = (data || []).map(formatFamilia)
        return NextResponse.json({
          ok: true,
          data: formattedData,
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        })
      }

      const { count: totalRegistros, error: countErr } = await supabase
        .from('familias')
        .select('*', { count: 'exact', head: true })

      if (countErr) {
        console.warn('[SUPABASE_COUNT_ERR]:', countErr.message)
        return NextResponse.json({ ok: true, data: [], total: 0 })
      }

      const total = totalRegistros || 0
      const chunkSize = 1000
      let allFamilias: any[] = []

      if (total <= chunkSize) {
        const { data, error } = await supabase
          .from('familias')
          .select('*, membros:membros_familia(*)')
          .order('criado_em', { ascending: false })

        if (error) return NextResponse.json({ ok: true, data: [], total: 0 })
        allFamilias = data || []
      } else {
        const numBatches = Math.ceil(total / chunkSize)
        const promises = []
        for (let i = 0; i < numBatches; i++) {
          const start = i * chunkSize
          const end = start + chunkSize - 1
          promises.push(
            supabase
              .from('familias')
              .select('*, membros:membros_familia(*)')
              .order('criado_em', { ascending: false })
              .range(start, end)
          )
        }

        const results = await Promise.all(promises)
        for (const res of results) {
          if (res.data) allFamilias.push(...res.data)
        }
      }

      const formattedData = allFamilias.map(formatFamilia)
      return NextResponse.json({ ok: true, data: formattedData, total })
    } catch (sbErr: any) {
      console.warn('[SUPABASE_FAMILIAS_FALLBACK_ERR]:', sbErr?.message || sbErr)
      return NextResponse.json({ ok: true, data: [], total: 0 })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

async function sincronizarCidadaoBaseGeral(
  supabase: any,
  dados: {
    nome: string
    cpf?: string | null
    dt_nasc?: string | null
    sexo?: string | null
    telefone?: string | null
    endereco?: string | null
    bairro?: string | null
  }
) {
  if (!dados.nome) return
  const nomeClean = dados.nome.trim().toUpperCase()
  const cpfClean = (dados.cpf || '').replace(/\D/g, '')
  const sexoClean = dados.sexo === 'Feminino' || dados.sexo === 'F' ? 'F' : 'M'

  // 1. Salvar prioritariamente no Cloudflare D1
  try {
    await salvarCidadaoD1({
      nome: nomeClean,
      cpf: cpfClean || null,
      data_nascimento: dados.dt_nasc || null,
      sexo: sexoClean,
      telefone: dados.telefone || null,
      logradouro: dados.endereco || null,
      bairro: dados.bairro || null
    })
  } catch (d1Err) {
    console.warn('[D1_SYNC_CIDADAO_WARN]:', d1Err)
  }

  // 2. Tentar atualizar Supabase em segundo plano sem travar a requisição
  (async () => {
    try {
      if (cpfClean && cpfClean.length === 11) {
        const { data: ex } = await supabase.from('pacientes').select('id').eq('cpf_cns', cpfClean).limit(1)
        if (ex && ex.length > 0) {
          await supabase.from('pacientes').update({
            nome: nomeClean,
            dt_nasc: dados.dt_nasc || null,
            sexo: sexoClean,
            telefone: dados.telefone || undefined,
            endereco: dados.endereco || undefined,
            bairro: dados.bairro || undefined
          }).eq('id', ex[0].id)
          return
        }
      }

      const { data: exNome } = await supabase.from('pacientes').select('id, cpf_cns').ilike('nome', nomeClean).limit(1)
      if (exNome && exNome.length > 0) {
        await supabase.from('pacientes').update({
          nome: nomeClean,
          cpf_cns: cpfClean && cpfClean.length === 11 ? cpfClean : exNome[0].cpf_cns,
          dt_nasc: dados.dt_nasc || null,
          sexo: sexoClean,
          telefone: dados.telefone || undefined,
          endereco: dados.endereco || undefined,
          bairro: dados.bairro || undefined
        }).eq('id', exNome[0].id)
      }
    } catch {
      // Supabase offline fallback silencioso
    }
  })().catch(() => {})
}

async function checarDuplicidadePessoaBanco(
  supabase: any,
  pessoa: { nome?: string; cpf?: string },
  excludeFamiliaId?: string
): Promise<{ duplicado: boolean; error?: string }> {
  const cpfClean = (pessoa.cpf || '').replace(/\D/g, '')
  const nomeClean = (pessoa.nome || '').trim().toUpperCase()
  const nomeDisplay = nomeClean || 'Esta pessoa'

  // 1. Checagem prioritária no Cloudflare D1
  try {
    const db = await getD1Database()
    if (db) {
      if (cpfClean && cpfClean.length === 11) {
        let qResp = `SELECT id, cod_familiar, responsavel FROM familias WHERE cpf_responsavel = ?`
        const pResp: any[] = [cpfClean]
        if (excludeFamiliaId) {
          qResp += ` AND id != ?`
          pResp.push(excludeFamiliaId)
        }
        const exResp = await db.prepare(qResp).bind(...pResp).first<any>()
        if (exResp) {
          return {
            duplicado: true,
            error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" (CPF: ${pessoa.cpf}) já é o(a) RESPONSÁVEL pela família CÓD. ${exResp.cod_familiar} (${exResp.responsavel}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
          }
        }

        let qMem = `
          SELECT m.id, m.familia_id, m.nome, m.parentesco, f.cod_familiar, f.responsavel
          FROM membros_familia m
          JOIN familias f ON f.id = m.familia_id
          WHERE m.cpf = ?
        `
        const pMem: any[] = [cpfClean]
        if (excludeFamiliaId) {
          qMem += ` AND m.familia_id != ?`
          pMem.push(excludeFamiliaId)
        }
        const exMem = await db.prepare(qMem).bind(...pMem).first<any>()
        if (exMem) {
          return {
            duplicado: true,
            error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" (CPF: ${pessoa.cpf}) já está cadastrada como MEMBRO (${exMem.parentesco}) na família de ${exMem.responsavel} (CÓD. ${exMem.cod_familiar}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
          }
        }
      }

      if (nomeClean && nomeClean.length >= 6) {
        let qRespNome = `SELECT id, cod_familiar, responsavel FROM familias WHERE UPPER(responsavel) = ?`
        const pRespNome: any[] = [nomeClean]
        if (excludeFamiliaId) {
          qRespNome += ` AND id != ?`
          pRespNome.push(excludeFamiliaId)
        }
        const exRespNome = await db.prepare(qRespNome).bind(...pRespNome).first<any>()
        if (exRespNome) {
          return {
            duplicado: true,
            error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" já é o(a) RESPONSÁVEL pela família CÓD. ${exRespNome.cod_familiar} (${exRespNome.responsavel}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
          }
        }
      }

      return { duplicado: false }
    }
  } catch (d1Err) {
    console.warn('[D1_DUPLICIDADE_WARN]:', d1Err)
  }

  // 2. Fallback resiliente no Supabase
  try {
    if (cpfClean && cpfClean.length === 11) {
      let qResp = supabase.from('familias').select('id, cod_familiar, responsavel').eq('cpf_responsavel', cpfClean)
      if (excludeFamiliaId) qResp = qResp.neq('id', excludeFamiliaId)
      const { data: exResp } = await qResp.limit(1)

      if (exResp && exResp.length > 0) {
        return {
          duplicado: true,
          error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" (CPF: ${pessoa.cpf}) já é o(a) RESPONSÁVEL pela família CÓD. ${exResp[0].cod_familiar} (${exResp[0].responsavel}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
        }
      }

      let qMembro = supabase.from('membros_familia').select('id, familia_id, nome, parentesco, familias:familia_id(id, cod_familiar, responsavel)').eq('cpf', cpfClean)
      if (excludeFamiliaId) qMembro = qMembro.neq('familia_id', excludeFamiliaId)
      const { data: exMembro } = await qMembro.limit(1)

      if (exMembro && exMembro.length > 0) {
        const fam = (exMembro[0] as any).familias
        const respNome = fam?.responsavel || 'outro responsável'
        const codFam = fam?.cod_familiar || '—'
        return {
          duplicado: true,
          error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" (CPF: ${pessoa.cpf}) já está cadastrada como MEMBRO (${exMembro[0].parentesco}) na família de ${respNome} (CÓD. ${codFam}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
        }
      }
    }

    if (nomeClean && nomeClean.length >= 6) {
      let qRespNome = supabase.from('familias').select('id, cod_familiar, responsavel').ilike('responsavel', nomeClean)
      if (excludeFamiliaId) qRespNome = qRespNome.neq('id', excludeFamiliaId)
      const { data: exRespNome } = await qRespNome.limit(1)

      if (exRespNome && exRespNome.length > 0) {
        return {
          duplicado: true,
          error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" já é o(a) RESPONSÁVEL pela família CÓD. ${exRespNome[0].cod_familiar} (${exRespNome[0].responsavel}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
        }
      }

      let qMembroNome = supabase.from('membros_familia').select('id, familia_id, nome, parentesco, familias:familia_id(id, cod_familiar, responsavel)').ilike('nome', nomeClean)
      if (excludeFamiliaId) qMembroNome = qMembroNome.neq('familia_id', excludeFamiliaId)
      const { data: exMembroNome } = await qMembroNome.limit(1)

      if (exMembroNome && exMembroNome.length > 0) {
        const fam = (exMembroNome[0] as any).familias
        const respNome = fam?.responsavel || 'outro responsável'
        const codFam = fam?.cod_familiar || '—'
        return {
          duplicado: true,
          error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" já está cadastrada como MEMBRO (${exMembroNome[0].parentesco}) na família de ${respNome} (CÓD. ${codFam}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
        }
      }
    }
  } catch (sbErr) {
    console.warn('[SUPABASE_DUPLICIDADE_FALLBACK]:', sbErr)
  }

  return { duplicado: false }
}

export async function POST(request: NextRequest) {
  try {
    const { familia, membros } = await request.json()

    if (!familia || !familia.responsavel) {
      return NextResponse.json({ ok: false, error: 'Dados da família inválidos.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // 1. Checar duplicidade do Responsável
    const checkResp = await checarDuplicidadePessoaBanco(supabase, {
      nome: familia.responsavel,
      cpf: familia.cpf_responsavel
    })
    if (checkResp.duplicado) {
      return NextResponse.json({ ok: false, error: checkResp.error }, { status: 400 })
    }

    // 2. Checar duplicidade de cada membro
    if (membros && Array.isArray(membros) && membros.length > 0) {
      for (const m of membros) {
        if (m.parentesco === 'Responsável' && m.cpf && familia.cpf_responsavel && m.cpf.replace(/\D/g, '') === familia.cpf_responsavel.replace(/\D/g, '')) {
          continue
        }

        const checkMembro = await checarDuplicidadePessoaBanco(supabase, {
          nome: m.nome,
          cpf: m.cpf
        })
        if (checkMembro.duplicado) {
          return NextResponse.json({ ok: false, error: checkMembro.error }, { status: 400 })
        }
      }
    }

    // 3. Preparar e higienizar dados da família
    const cleanFamilia = sanitizeFamiliaPayload(familia)
    if (!cleanFamilia.id) {
      cleanFamilia.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fam_${Date.now()}`
    }
    cleanFamilia.criado_em = new Date().toISOString()
    cleanFamilia.atualizado_em = new Date().toISOString()

    // Garantir que cod_familiar nunca seja nulo
    if (!cleanFamilia.cod_familiar) {
      try {
        const db = await getD1Database()
        if (db) {
          const maxRow = await db.prepare('SELECT cod_familiar FROM familias ORDER BY CAST(cod_familiar AS INTEGER) DESC LIMIT 1').first<any>()
          let nextNum = 1000
          if (maxRow && maxRow.cod_familiar) {
            const num = parseInt(maxRow.cod_familiar, 10)
            if (!isNaN(num) && num < 900000) nextNum = num + 1
          }
          cleanFamilia.cod_familiar = String(nextNum).padStart(5, '0')
        }
      } catch {
        cleanFamilia.cod_familiar = String(Math.floor(10000 + Math.random() * 90000))
      }
    }

    // 4. Inserir prioritariamente no Cloudflare D1 (Base Operacional Ativa)
    let d1Sucesso = false
    try {
      d1Sucesso = await salvarFamiliaD1(cleanFamilia, membros || [])
    } catch (d1Err) {
      console.warn('[D1_FAMILIA_INSERT_ERR]:', d1Err)
    }

    // 5. Tentar salvar no Supabase de forma resiliente em segundo plano (não-bloqueante)
    const famInserida: any = cleanFamilia
    ;(async () => {
      try {
        const { data: sbFam, error: famErr } = await supabase
          .from('familias')
          .insert(cleanFamilia)
          .select()
          .single()

        if (!famErr && sbFam && membros && Array.isArray(membros) && membros.length > 0) {
          const membrosComId = membros.map((m: any) => sanitizeMembroPayload(m, sbFam.id))
          await supabase.from('membros_familia').insert(membrosComId)
        }
      } catch (sbErr) {
        console.warn('[SUPABASE_FAMILIA_INSERT_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    // 5. Sincronizar Responsável e Membros com a Base Geral de Cidadãos (pacientes)
    try {
      await sincronizarCidadaoBaseGeral(supabase, {
        nome: cleanFamilia.responsavel,
        cpf: cleanFamilia.cpf_responsavel,
        dt_nasc: cleanFamilia.data_nascimento_responsavel,
        sexo: cleanFamilia.sexo_responsavel,
        telefone: cleanFamilia.telefone,
        endereco: cleanFamilia.logradouro,
        bairro: cleanFamilia.bairro
      })

      if (membros && Array.isArray(membros)) {
        for (const m of membros) {
          if (m.nome) {
            await sincronizarCidadaoBaseGeral(supabase, {
              nome: m.nome,
              cpf: m.cpf,
              dt_nasc: m.data_nascimento,
              sexo: m.sexo,
              endereco: cleanFamilia.logradouro,
              bairro: cleanFamilia.bairro
            })
          }
        }
      }
    } catch (syncErr) {
      console.warn('Aviso ao sincronizar cidadão com a base geral:', syncErr)
    }

    await registrarLogAuditoria({
      acao: 'FAMILIA_CRIADA',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Família cadastrada: ${cleanFamilia.responsavel} (Prontuário: ${cleanFamilia.cod_familiar}).`,
      entidade: 'familias',
      entidade_id: famInserida.id
    })

    return NextResponse.json({ ok: true, data: { ...famInserida, membros: membros || [] } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, familia, membros } = await request.json()

    if (!id || !familia) {
      return NextResponse.json({ ok: false, error: 'ID e dados da família são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // 1. Checar duplicidade do Responsável (excluindo a família atual)
    const checkResp = await checarDuplicidadePessoaBanco(supabase, {
      nome: familia.responsavel,
      cpf: familia.cpf_responsavel
    }, id)
    if (checkResp.duplicado) {
      return NextResponse.json({ ok: false, error: checkResp.error }, { status: 400 })
    }

    // 2. Checar duplicidade de cada membro (excluindo a família atual)
    if (membros && Array.isArray(membros) && membros.length > 0) {
      for (const m of membros) {
        if (m.parentesco === 'Responsável' && m.cpf && familia.cpf_responsavel && m.cpf.replace(/\D/g, '') === familia.cpf_responsavel.replace(/\D/g, '')) {
          continue
        }

        const checkMembro = await checarDuplicidadePessoaBanco(supabase, {
          nome: m.nome,
          cpf: m.cpf
        }, id)
        if (checkMembro.duplicado) {
          return NextResponse.json({ ok: false, error: checkMembro.error }, { status: 400 })
        }
      }
    }

    // 3. Atualizar dados da família
    const cleanFamilia = sanitizeFamiliaPayload(familia)
    cleanFamilia.id = id
    cleanFamilia.atualizado_em = new Date().toISOString()

    // 4. Atualizar prioritariamente no Cloudflare D1
    try {
      await salvarFamiliaD1(cleanFamilia, membros || [])
    } catch (d1Err) {
      console.warn('[D1_FAMILIA_UPDATE_ERR]:', d1Err)
    }

    // 5. Atualizar no Supabase de forma resiliente em segundo plano (não-bloqueante)
    const famAtualizada: any = cleanFamilia
    ;(async () => {
      try {
        await supabase
          .from('familias')
          .update(cleanFamilia)
          .eq('id', id)

        if (membros && Array.isArray(membros)) {
          await supabase.from('membros_familia').delete().eq('familia_id', id)
          if (membros.length > 0) {
            const membrosComId = membros.map((m: any) => sanitizeMembroPayload(m, id))
            await supabase.from('membros_familia').insert(membrosComId)
          }
        }
      } catch (sbErr) {
        console.warn('[SUPABASE_FAMILIA_UPDATE_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    // 5. Sincronizar correções (Nome, CPF, Data de Nascimento, Sexo, etc.) com a Base Geral de Cidadãos (pacientes)
    try {
      await sincronizarCidadaoBaseGeral(supabase, {
        nome: cleanFamilia.responsavel,
        cpf: cleanFamilia.cpf_responsavel,
        dt_nasc: cleanFamilia.data_nascimento_responsavel,
        sexo: cleanFamilia.sexo_responsavel,
        telefone: cleanFamilia.telefone,
        endereco: cleanFamilia.logradouro,
        bairro: cleanFamilia.bairro
      })

      if (membros && Array.isArray(membros)) {
        for (const m of membros) {
          if (m.nome) {
            await sincronizarCidadaoBaseGeral(supabase, {
              nome: m.nome,
              cpf: m.cpf,
              dt_nasc: m.data_nascimento,
              sexo: m.sexo,
              endereco: cleanFamilia.logradouro,
              bairro: cleanFamilia.bairro
            })
          }
        }
      }
    } catch (syncErr) {
      console.warn('Aviso ao sincronizar cidadão com a base geral:', syncErr)
    }

    await registrarLogAuditoria({
      acao: 'FAMILIA_EDITADA',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Família editada: ${cleanFamilia.responsavel} (ID: ${id}, Prontuário: ${cleanFamilia.cod_familiar}).`,
      entidade: 'familias',
      entidade_id: id
    })

    return NextResponse.json({ ok: true, data: { ...famAtualizada, membros: membros || [] } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID da família não informado.' }, { status: 400 })
    }

    // Controle de Acesso Baseado em Papéis (RBAC): Apenas Admin ou Coordenador podem excluir prontuários
    const perfil = request.headers.get('x-auth-user-perfil')?.toLowerCase()
    if (perfil !== 'admin' && perfil !== 'coordenador') {
      await registrarLogAuditoria({
        acao: 'ACESSO_NEGADO_SIGILO',
        usuario_id: request.headers.get('x-auth-user-id') || undefined,
        usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
        detalhes: `Tentativa de exclusão não autorizada do prontuário familiar ID ${id}. Perfil: ${perfil || 'não informado'}.`,
        entidade: 'familias',
        entidade_id: id
      })
      return NextResponse.json(
        { ok: false, error: 'Apenas Administradores ou Coordenadores possuem permissão para excluir prontuários familiares.' },
        { status: 403 }
      )
    }

    // 1. Excluir dependentes e prontuário prioritariamente no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM membros_familia WHERE familia_id = ?').bind(id).run()
        await db.prepare('DELETE FROM historico_atendimentos WHERE familia_id = ?').bind(id).run()
        await db.prepare('DELETE FROM beneficios_concedidos WHERE familia_id = ?').bind(id).run()
        await db.prepare('DELETE FROM encaminhamentos WHERE familia_id = ?').bind(id).run()
        await db.prepare('DELETE FROM familias WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_FAMILIA_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase em segundo plano de forma resiliente
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        await supabase.from('membros_familia').delete().eq('familia_id', id)
        await supabase.from('historico_atendimentos').delete().eq('familia_id', id)
        await supabase.from('beneficios_concedidos').delete().eq('familia_id', id)
        await supabase.from('encaminhamentos').delete().eq('familia_id', id)
        await supabase.from('familias').delete().eq('id', id)
      } catch (sbErr) {
        console.warn('[SUPABASE_FAMILIA_DELETE_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    await registrarLogAuditoria({
      acao: 'FAMILIA_EXCLUIDA',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Família e dependentes excluídos ID ${id}.`,
      entidade: 'familias',
      entidade_id: id
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, paif_ativo, ...outrosCampos } = await request.json()

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID da família é obrigatório.' }, { status: 400 })
    }

    const updatePayload: any = { ...outrosCampos }
    if (typeof paif_ativo === 'boolean') {
      updatePayload.paif_ativo = paif_ativo
      updatePayload.paif_data_inicio = paif_ativo ? new Date().toISOString() : null
    }
    updatePayload.atualizado_em = new Date().toISOString()

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const paifNum = typeof paif_ativo === 'boolean' ? (paif_ativo ? 1 : 0) : null
        if (paifNum !== null) {
          const paifDataInicio = paif_ativo ? new Date().toISOString() : null
          await db.prepare(`
            UPDATE familias 
            SET paif_ativo = ?, paif_data_inicio = ?, atualizado_em = datetime('now')
            WHERE id = ?
          `).bind(paifNum, paifDataInicio, id).run()
        }
      }
    } catch (d1Err) {
      console.warn('[D1_FAMILIA_PATCH_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase em segundo plano de forma resiliente
    const dataAtualizada: any = { id, ...updatePayload }
    ;(async () => {
      try {
        const supabase = getSupabaseServer()
        await supabase
          .from('familias')
          .update(updatePayload)
          .eq('id', id)
      } catch (sbErr) {
        console.warn('[SUPABASE_FAMILIA_PATCH_FALLBACK]:', sbErr)
      }
    })().catch(() => {})

    await registrarLogAuditoria({
      acao: 'FAMILIA_EDITADA',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Atualização de prontuário ID ${id}${typeof paif_ativo === 'boolean' ? ` (PAIF: ${paif_ativo ? 'Ativado' : 'Desativado'})` : ''}.`,
      entidade: 'familias',
      entidade_id: id
    })

    return NextResponse.json({ ok: true, data: dataAtualizada })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
