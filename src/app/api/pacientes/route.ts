import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

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

    // Mapear campos reais (cpf_cns -> cpf, dt_nasc -> data_nascimento, endereco -> logradouro)
    const dataMapeada = (rawData || []).map(p => {
      let sexoFormatado = p.sexo
      if (typeof p.sexo === 'string') {
        const s = p.sexo.trim().toUpperCase()
        if (s === 'M' || s.startsWith('MASC')) sexoFormatado = 'Masculino'
        else if (s === 'F' || s.startsWith('FEM')) sexoFormatado = 'Feminino'
        else if (s === 'O' || s.startsWith('OUTR')) sexoFormatado = 'Outro'
      }

      return {
        id: p.id,
        nome: p.nome,
        cpf: p.cpf_cns,
        nis: p.nis || null,
        nome_mae: p.nome_mae || null,
        raca_cor: p.raca_cor || null,
        escolaridade: p.escolaridade || null,
        ocupacao: p.ocupacao || null,
        data_nascimento: p.dt_nasc,
        logradouro: p.endereco,
        numero: 'S/N',
        bairro: p.bairro,
        telefone: p.telefone,
        cep: p.cep,
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
