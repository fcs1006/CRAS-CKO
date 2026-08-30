import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import masterDataJson from '@/lib/master_cidadaos_data.json'

const masterData = masterDataJson as {
  byCpf: Record<string, any>
  byName: Record<string, any>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ ok: true, data: [] })
    }

    const cleanDigits = query.replace(/\D/g, '')
    const supabaseServer = getSupabaseServer()

    // Construir filtro flexível pelas colunas reais da tabela (nome, cpf_cns, endereco, bairro)
    let filterOr = `nome.ilike.%${query}%,cpf_cns.ilike.%${query}%,bairro.ilike.%${query}%`
    if (cleanDigits.length >= 3) {
      filterOr += `,cpf_cns.ilike.%${cleanDigits}%`
    }

    const { data: rawData, error } = await supabaseServer
      .from('pacientes')
      .select('*')
      .or(filterOr)
      .limit(15)

    if (error) {
      console.error('Erro na consulta de pacientes:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Buscar enriquecimento em familias e membros_familia
    const cpfs = (rawData || []).map(p => (p.cpf_cns || '').replace(/\D/g, '')).filter(Boolean)
    const nomes = (rawData || []).map(p => (p.nome || '').trim().toUpperCase()).filter(Boolean)

    let famMap = new Map<string, any>()
    let memMap = new Map<string, any>()

    if (cpfs.length > 0 || nomes.length > 0) {
      const [resFam, resMem] = await Promise.all([
        supabaseServer
          .from('familias')
          .select('responsavel, cpf_responsavel, nome_mae_responsavel, raca_cor_responsavel, escolaridade_responsavel, ocupacao_responsavel, nis_responsavel, zona_territorio, numero, logradouro, bairro, telefone')
          .or(`cpf_responsavel.in.(${cpfs.join(',')}),responsavel.in.(${nomes.map(n => `"${n}"`).join(',')})`),
        supabaseServer
          .from('membros_familia')
          .select('nome, cpf, raca_cor, escolaridade, ocupacao, nis, rg, possui_deficiencia, tipo_deficiencia')
          .or(`cpf.in.(${cpfs.join(',')}),nome.in.(${nomes.map(n => `"${n}"`).join(',')})`)
      ])

      if (resFam.data) {
        for (const f of resFam.data) {
          const cpfClean = (f.cpf_responsavel || '').replace(/\D/g, '')
          const nomeClean = (f.responsavel || '').trim().toUpperCase()
          if (cpfClean) famMap.set(cpfClean, f)
          if (nomeClean) famMap.set(nomeClean, f)
        }
      }

      if (resMem.data) {
        for (const m of resMem.data) {
          const cpfClean = (m.cpf || '').replace(/\D/g, '')
          const nomeClean = (m.nome || '').trim().toUpperCase()
          if (cpfClean) memMap.set(cpfClean, m)
          if (nomeClean) memMap.set(nomeClean, m)
        }
      }
    }

    // Mapear campos reais com enriquecimento completo
    const dataMapeada = (rawData || []).map(p => {
      const pCpf = (p.cpf_cns || '').replace(/\D/g, '')
      const pNome = (p.nome || '').trim().toUpperCase()
      const pNomeNorm = pNome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      const famInfo = (pCpf && famMap.get(pCpf)) || famMap.get(pNome) || {}
      const memInfo = (pCpf && memMap.get(pCpf)) || memMap.get(pNome) || {}
      const masterInfo = (pCpf && masterData.byCpf[pCpf]) || masterData.byName[pNomeNorm] || masterData.byName[pNome] || {}

      let sexoFormatado = p.sexo || masterInfo.sexo
      if (typeof sexoFormatado === 'string') {
        const s = sexoFormatado.trim().toUpperCase()
        if (s === 'M' || s.startsWith('MASC')) sexoFormatado = 'Masculino'
        else if (s === 'F' || s.startsWith('FEM')) sexoFormatado = 'Feminino'
        else if (s === 'O' || s.startsWith('OUTR')) sexoFormatado = 'Outro'
      }

      const rawNis = famInfo.nis_responsavel || memInfo.nis || masterInfo.nis || p.nis || ''
      const nisClean = rawNis.startsWith('SEM_NIS_') ? '' : rawNis

      return {
        id: p.id,
        nome: p.nome,
        cpf: p.cpf_cns,
        nis: nisClean || null,
        nome_mae: masterInfo.nome_mae || famInfo.nome_mae_responsavel || p.nome_mae || null,
        raca_cor: masterInfo.raca_cor || famInfo.raca_cor_responsavel || memInfo.raca_cor || p.raca_cor || 'Parda',
        escolaridade: masterInfo.escolaridade || famInfo.escolaridade_responsavel || memInfo.escolaridade || p.escolaridade || null,
        ocupacao: masterInfo.ocupacao || famInfo.ocupacao_responsavel || memInfo.ocupacao || p.ocupacao || null,
        rg: memInfo.rg || null,
        data_nascimento: p.dt_nasc || masterInfo.data_nascimento,
        logradouro: famInfo.logradouro || masterInfo.logradouro || p.endereco || null,
        numero: famInfo.numero || masterInfo.numero || 'S/N',
        bairro: famInfo.bairro || masterInfo.bairro || p.bairro || 'CENTRO',
        telefone: famInfo.telefone || masterInfo.telefone || p.telefone || null,
        cep: masterInfo.cep || p.cep || '77305-000',
        zona_territorio: famInfo.zona_territorio || masterInfo.zona_territorio || (p.bairro?.toUpperCase().includes('RURAL') ? 'Rural' : 'Urbana'),
        sexo: sexoFormatado
      }
    })

    return NextResponse.json({ ok: true, data: dataMapeada })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nome, cpf, rg, data_nascimento, logradouro, bairro, cep, telefone, sexo } = body

    if (!nome || !nome.trim()) {
      return NextResponse.json({ ok: false, error: 'Nome do paciente é obrigatório.' }, { status: 400 })
    }

    const supabaseServer = getSupabaseServer()
    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : null

    // Buscar por ID, CPF ou Nome exato para saber se é atualização ou novo cadastro
    let existingId: string | null = id || null

    if (!existingId && cleanCpf && cleanCpf.length >= 11) {
      const { data: foundByCpf } = await supabaseServer
        .from('pacientes')
        .select('id')
        .eq('cpf_cns', cleanCpf)
        .maybeSingle()
      if (foundByCpf) existingId = foundByCpf.id
    }

    if (!existingId) {
      const { data: foundByName } = await supabaseServer
        .from('pacientes')
        .select('id')
        .ilike('nome', nome.trim())
        .maybeSingle()
      if (foundByName) existingId = foundByName.id
    }

    const payload: any = {}
    if (nome) payload.nome = nome.trim().toUpperCase()
    if (cleanCpf) payload.cpf_cns = cleanCpf
    if (data_nascimento) payload.dt_nasc = data_nascimento
    if (logradouro) payload.endereco = logradouro.trim().toUpperCase()
    if (bairro) payload.bairro = bairro.trim().toUpperCase()
    if (cep) payload.cep = cep.replace(/\D/g, '')
    if (telefone) payload.telefone = telefone
    if (sexo) payload.sexo = sexo

    if (existingId) {
      const { error } = await supabaseServer
        .from('pacientes')
        .update(payload)
        .eq('id', existingId)

      if (error) {
        console.error('Erro ao atualizar paciente na base:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await supabaseServer
        .from('pacientes')
        .insert([payload])

      if (error) {
        console.error('Erro ao inserir paciente na base:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Erro no POST /api/pacientes:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
