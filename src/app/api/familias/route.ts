import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

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

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('familias')
      .select('*, membros:membros_familia(*)')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar famílias:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Mapear rg_responsavel e limpar placeholder SEM_NIS_ do retorno para o frontend
    const formattedData = (data || []).map((f: any) => {
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
    })

    return NextResponse.json({ ok: true, data: formattedData })
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

  // 1. Buscar pelo CPF na base geral de pacientes
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

  // 2. Se não achou por CPF, buscar por Nome
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
}

async function checarDuplicidadePessoaBanco(
  supabase: any,
  pessoa: { nome?: string; cpf?: string },
  excludeFamiliaId?: string
): Promise<{ duplicado: boolean; error?: string }> {
  const cpfClean = (pessoa.cpf || '').replace(/\D/g, '')
  const nomeClean = (pessoa.nome || '').trim().toUpperCase()
  const nomeDisplay = nomeClean || 'Esta pessoa'

  // 1. Checagem por CPF (se preenchido com 11 dígitos)
  if (cpfClean && cpfClean.length === 11) {
    // É Responsável em alguma família?
    let qResp = supabase.from('familias').select('id, cod_familiar, responsavel').eq('cpf_responsavel', cpfClean)
    if (excludeFamiliaId) qResp = qResp.neq('id', excludeFamiliaId)
    const { data: exResp } = await qResp.limit(1)

    if (exResp && exResp.length > 0) {
      return {
        duplicado: true,
        error: `TRAVA DE DUPLICIDADE: A pessoa "${nomeDisplay}" (CPF: ${pessoa.cpf}) já é o(a) RESPONSÁVEL pela família CÓD. ${exResp[0].cod_familiar} (${exResp[0].responsavel}). Cada cidadão só pode pertencer a 1 família no Sistema SUAS.`
      }
    }

    // É Membro em alguma família?
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

  // 2. Checagem por Nome Completo (para membros/dependentes antigos que estavam sem CPF)
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

    // 3. Inserir família usando service_role key no servidor (bypassa RLS)
    const cleanFamilia = sanitizeFamiliaPayload(familia)
    cleanFamilia.criado_em = new Date().toISOString()
    cleanFamilia.atualizado_em = new Date().toISOString()

    const { data: famInserida, error: famErr } = await supabase
      .from('familias')
      .insert(cleanFamilia)
      .select()
      .single()

    if (famErr) {
      console.error('Erro ao inserir família:', famErr)
      return NextResponse.json({ ok: false, error: famErr.message }, { status: 500 })
    }

    // 4. Inserir membros familiares se houver
    if (membros && Array.isArray(membros) && membros.length > 0) {
      const membrosComId = membros.map((m: any) => sanitizeMembroPayload(m, famInserida.id))

      const { error: membrosErr } = await supabase
        .from('membros_familia')
        .insert(membrosComId)

      if (membrosErr) {
        console.error('Erro ao inserir membros da família:', membrosErr)
      }
    }

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

    return NextResponse.json({ ok: true, data: famInserida })
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

    // 3. Atualizar dados da família no Supabase
    const cleanFamilia = sanitizeFamiliaPayload(familia)
    cleanFamilia.atualizado_em = new Date().toISOString()

    const { data: famAtualizada, error: famErr } = await supabase
      .from('familias')
      .update(cleanFamilia)
      .eq('id', id)
      .select()
      .single()

    if (famErr) {
      console.error('Erro ao atualizar família:', famErr)
      return NextResponse.json({ ok: false, error: famErr.message }, { status: 500 })
    }

    // 4. Atualizar lista de membros familiares
    if (membros && Array.isArray(membros)) {
      await supabase.from('membros_familia').delete().eq('familia_id', id)

      if (membros.length > 0) {
        const membrosComId = membros.map((m: any) => sanitizeMembroPayload(m, id))

        const { error: membrosErr } = await supabase
          .from('membros_familia')
          .insert(membrosComId)

        if (membrosErr) {
          console.error('Erro ao atualizar membros da família:', membrosErr)
        }
      }
    }

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

    return NextResponse.json({ ok: true, data: famAtualizada })
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

    const supabase = getSupabaseServer()

    // 1. Excluir dependentes das tabelas relacionadas para evitar erro de Foreign Key
    await supabase.from('membros_familia').delete().eq('familia_id', id)
    await supabase.from('historico_atendimentos').delete().eq('familia_id', id)
    await supabase.from('beneficios_concedidos').delete().eq('familia_id', id)
    await supabase.from('encaminhamentos').delete().eq('familia_id', id)

    // 2. Excluir a família principal usando service_role (bypassa RLS)
    const { error } = await supabase.from('familias').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir família:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
