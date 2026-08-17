'use client'

import { useState, useEffect, useRef } from 'react'
import { Familia, MembroFamilia, Usuario } from '@/types'
import { maskCPF, maskNIS, maskPhone, maskCEP, calculateAge, maskCurrency, parseCurrencyToFloat } from '@/utils/masks'
import { buscarCBO, CBO } from '@/data/cboList'
import { verificarDuplicidadePessoa } from '@/utils/duplicidade'
import { syncPacienteComBase } from '@/utils/syncPaciente'

interface ModalEditarFamiliaProps {
  familia: Familia
  familiasExistentes?: Familia[]
  usuarios?: Usuario[]
  onClose: () => void
  onSalvar: (id: string, familia: Partial<Familia>, membros: MembroFamilia[]) => Promise<void>
}

export function ModalEditarFamilia({ familia, familiasExistentes, usuarios = [], onClose, onSalvar }: ModalEditarFamiliaProps) {
  const [salvando, setSalvando] = useState(false)

  // Encontrar o membro responsável e os dependentes
  const membroResp = (familia.membros || []).find(m => m.parentesco === 'Responsável' || m.nome === familia.responsavel)
  const dependentesIniciais = (familia.membros || []).filter(m => m !== membroResp && m.parentesco !== 'Responsável')

  // 1. Dados do Responsável
  const [responsavel, setResponsavel] = useState(familia.responsavel ? familia.responsavel.toUpperCase() : '')
  const initialResponsavelRef = useRef(familia.responsavel ? familia.responsavel.toUpperCase() : '')
  const [nomeMae, setNomeMae] = useState(familia.nome_mae_responsavel ? familia.nome_mae_responsavel.toUpperCase() : '')
  const [sexoResp, setSexoResp] = useState<'Feminino' | 'Masculino' | 'Outro'>((familia.sexo_responsavel as any) || (membroResp?.sexo as any) || 'Feminino')
  const [racaCorResp, setRacaCorResp] = useState<'Parda' | 'Branca' | 'Preta' | 'Amarela' | 'Indígena' | 'Não declarada'>((familia.raca_cor_responsavel as any) || (membroResp?.raca_cor as any) || 'Parda')

  const [cpf, setCpf] = useState(maskCPF(familia.cpf_responsavel || ''))
  const [rg, setRg] = useState(familia.rg_responsavel || membroResp?.rg || '')
  const [nis, setNis] = useState(maskNIS(familia.nis_responsavel || ''))
  const [responsavelNasc, setResponsavelNasc] = useState(familia.data_nascimento_responsavel || membroResp?.data_nascimento || '')
  const [responsavelEscolaridade, setResponsavelEscolaridade] = useState(familia.escolaridade_responsavel || membroResp?.escolaridade || '')
  const [responsavelOcupacao, setResponsavelOcupacao] = useState(familia.ocupacao_responsavel ? familia.ocupacao_responsavel.toUpperCase() : (membroResp?.ocupacao ? membroResp.ocupacao.toUpperCase() : ''))
  const [responsavelRenda, setResponsavelRenda] = useState(
    familia.renda_responsavel !== undefined ? maskCurrency(familia.renda_responsavel * 100) : (membroResp?.renda !== undefined ? maskCurrency(membroResp.renda * 100) : '')
  )
  const [telefone, setTelefone] = useState(maskPhone(familia.telefone || ''))
  const [outroContato, setOutroContato] = useState(familia.outro_contato ? familia.outro_contato.toUpperCase() : '')
  const [responsavelProgSocial, setResponsavelProgSocial] = useState(familia.programa_social_responsavel || membroResp?.programa_governo || 'Nenhum')
  const [outroProgSocialText, setOutroProgSocialText] = useState('')

  // CBO Autocomplete para Responsável
  const [sugestoesCboResp, setSugestoesCboResp] = useState<CBO[]>([])
  const [mostrarCboResp, setMostrarCboResp] = useState(false)

  // 2. Endereço e Território
  const [logradouro, setLogradouro] = useState(familia.logradouro ? familia.logradouro.toUpperCase() : '')
  const [numero, setNumero] = useState(familia.numero ? familia.numero.toUpperCase() : '')
  const [complemento, setComplemento] = useState(familia.complemento ? familia.complemento.toUpperCase() : '')
  const [bairro, setBairro] = useState(familia.bairro ? familia.bairro.toUpperCase() : '')
  const [cep, setCep] = useState(familia.cep || '')
  const [pontoReferencia, setPontoReferencia] = useState(familia.ponto_referencia ? familia.ponto_referencia.toUpperCase() : '')
  const [zonaTerritorio, setZonaTerritorio] = useState<'Urbana' | 'Rural' | 'Área de Risco' | 'Quilombola' | 'Indígena' | 'Ribeirinha' | 'Assentamento'>((familia.zona_territorio as any) || 'Urbana')

  // 3. Condições Habitacionais
  const [moradiaTipo, setMoradiaTipo] = useState(familia.moradia_tipo || 'Própria')
  const [tipoConstrucao, setTipoConstrucao] = useState(familia.tipo_construcao || 'Alvenaria com Revestimento')
  const [moradiaAgua, setMoradiaAgua] = useState(familia.moradia_agua || 'Rede Geral')
  const [moradiaSanear, setMoradiaSanear] = useState(familia.moradia_sanear || 'Rede Geral')
  const [moradiaLixo, setMoradiaLixo] = useState(familia.moradia_lixo || 'Coletado')
  const [moradiaEnergia, setMoradiaEnergia] = useState(familia.moradia_energia || 'Rede Elétrica com Medidor Próprio')
  const [moradiaComodos, setMoradiaComodos] = useState(familia.moradia_comodos || 4)
  const [acessibilidade, setAcessibilidade] = useState(familia.acessibilidade !== undefined ? familia.acessibilidade : true)

  // 4. Vulnerabilidades e PAIF (PAF)
  const [paifAtivo, setPaifAtivo] = useState(familia.paif_ativo || false)
  const [paifDataInicio, setPaifDataInicio] = useState(familia.paif_data_inicio || new Date().toISOString().split('T')[0])
  const [paifDataFim, setPaifDataFim] = useState(familia.paif_data_fim || '')
  const [paifMotivoDesligamento, setPaifMotivoDesligamento] = useState(familia.paif_motivo_desligamento || '')
  const [tecnicoReferencia, setTecnicoReferencia] = useState(familia.tecnico_referencia ? familia.tecnico_referencia.toUpperCase() : '')
  const [paifPotencialidades, setPaifPotencialidades] = useState(familia.paif_potencialidades ? familia.paif_potencialidades.toUpperCase() : '')
  const [paifMetas, setPaifMetas] = useState(familia.paif_metas ? familia.paif_metas.toUpperCase() : '')
  const [vulnerabilidades, setVulnerabilidades] = useState<string[]>(familia.vulnerabilidades || [])
  const [outraVulnerabilidadeTexto, setOutraVulnerabilidadeTexto] = useState('')

  // Autocomplete da base de Pacientes para Responsável
  const [sugestoesPacientes, setSugestoesPacientes] = useState<any[]>([])
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false)
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const pacienteJaSelecionadoRef = useRef(false)

  // Autocomplete da base de Pacientes para Nome da Mãe do Responsável
  const [sugestoesMae, setSugestoesMae] = useState<any[]>([])
  const [buscandoMae, setBuscandoMae] = useState(false)
  const [mostrarSugestoesMae, setMostrarSugestoesMae] = useState(false)
  const maeJaSelecionadaRef = useRef(false)

  useEffect(() => {
    if (maeJaSelecionadaRef.current) {
      maeJaSelecionadaRef.current = false
      setMostrarSugestoesMae(false)
      return
    }

    if (!nomeMae || nomeMae.trim().length < 3) {
      setSugestoesMae([])
      setMostrarSugestoesMae(false)
      return
    }

    const timer = setTimeout(async () => {
      setBuscandoMae(true)
      try {
        const res = await fetch(`/api/pacientes?q=${encodeURIComponent(nomeMae.trim())}`)
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          setSugestoesMae([])
          setMostrarSugestoesMae(false)
          return
        }
        const json = await res.json()
        if (json.ok && json.data && json.data.length > 0) {
          setSugestoesMae(json.data)
          setMostrarSugestoesMae(true)
        } else {
          setSugestoesMae([])
          setMostrarSugestoesMae(false)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setBuscandoMae(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [nomeMae])

  function selecionarSugestaoMae(p: any) {
    maeJaSelecionadaRef.current = true
    setNomeMae(p.nome ? p.nome.toUpperCase() : '')
    setMostrarSugestoesMae(false)
  }

  // 5. Lista de dependentes e controle de edição
  const [membros, setMembros] = useState<MembroFamilia[]>(dependentesIniciais)
  const [membroEditandoIndex, setMembroEditandoIndex] = useState<number | null>(null)

  const [novoMembroNome, setNovoMembroNome] = useState('')
  const [novoMembroParentesco, setNovoMembroParentesco] = useState('')
  const [novoMembroNasc, setNovoMembroNasc] = useState('')
  const [novoMembroSexo, setNovoMembroSexo] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino')
  const [novoMembroRacaCor, setNovoMembroRacaCor] = useState<'Parda' | 'Branca' | 'Preta' | 'Amarela' | 'Indígena' | 'Não declarada'>('Parda')
  const [novoMembroCpf, setNovoMembroCpf] = useState('')
  const [novoMembroRg, setNovoMembroRg] = useState('')
  const [novoMembroNis, setNovoMembroNis] = useState('')
  const [novoMembroCertidao, setNovoMembroCertidao] = useState('')
  const [novoMembroEscolaridade, setNovoMembroEscolaridade] = useState('')
  const [novoMembroOcupacao, setNovoMembroOcupacao] = useState('')
  const [novoMembroRenda, setNovoMembroRenda] = useState('')
  const [novoMembroProgSocial, setNovoMembroProgSocial] = useState('Nenhum')

  // Indicadores Específicos do Membro (RMA & Prontuário)
  const [novoMembroFreqEscolar, setNovoMembroFreqEscolar] = useState<'Sim' | 'Não' | 'Não se aplica'>('Não se aplica')
  const [novoMembroEscolaNome, setNovoMembroEscolaNome] = useState('')
  const [novoMembroPossuiDeficiencia, setNovoMembroPossuiDeficiencia] = useState(false)
  const [novoMembroTipoDeficiencia, setNovoMembroTipoDeficiencia] = useState('')
  const [novoMembroTrabalhoInfantil, setNovoMembroTrabalhoInfantil] = useState(false)
  const [novoMembroAcolhimento, setNovoMembroAcolhimento] = useState(false)
  const [novoMembroDescumprimento, setNovoMembroDescumprimento] = useState(false)

  // CBO Autocomplete para Dependente
  const [sugestoesCboMembro, setSugestoesCboMembro] = useState<CBO[]>([])
  const [mostrarCboMembro, setMostrarCboMembro] = useState(false)

  // Autocomplete da base de Pacientes para os Membros / Dependentes
  const [sugestoesMembros, setSugestoesMembros] = useState<any[]>([])
  const [buscandoMembros, setBuscandoMembros] = useState(false)
  const [mostrarSugestoesMembros, setMostrarSugestoesMembros] = useState(false)
  const membroJaSelecionadoRef = useRef(false)

  useEffect(() => {
    if (pacienteJaSelecionadoRef.current) {
      pacienteJaSelecionadoRef.current = false
      setMostrarSugestoes(false)
      return
    }

    if (!responsavel || responsavel === initialResponsavelRef.current || responsavel.trim().length < 3) {
      setSugestoesPacientes([])
      setMostrarSugestoes(false)
      return
    }

    const timer = setTimeout(async () => {
      setBuscandoSugestoes(true)
      try {
        const res = await fetch(`/api/pacientes?q=${encodeURIComponent(responsavel.trim())}`)
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          setSugestoesPacientes([])
          setMostrarSugestoes(false)
          return
        }
        const json = await res.json()
        if (json.ok && json.data && json.data.length > 0) {
          setSugestoesPacientes(json.data)
          setMostrarSugestoes(true)
        } else {
          setSugestoesPacientes([])
          setMostrarSugestoes(false)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setBuscandoSugestoes(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [responsavel])

  useEffect(() => {
    if (membroJaSelecionadoRef.current) {
      membroJaSelecionadoRef.current = false
      setMostrarSugestoesMembros(false)
      return
    }

    if (!novoMembroNome || novoMembroNome.trim().length < 3) {
      setSugestoesMembros([])
      setMostrarSugestoesMembros(false)
      return
    }

    const timer = setTimeout(async () => {
      setBuscandoMembros(true)
      try {
        const res = await fetch(`/api/pacientes?q=${encodeURIComponent(novoMembroNome.trim())}`)
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          setSugestoesMembros([])
          setMostrarSugestoesMembros(false)
          return
        }
        const json = await res.json()
        if (json.ok && json.data && json.data.length > 0) {
          setSugestoesMembros(json.data)
          setMostrarSugestoesMembros(true)
        } else {
          setSugestoesMembros([])
          setMostrarSugestoesMembros(false)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setBuscandoMembros(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [novoMembroNome])

  function handleOcupacaoRespChange(val: string) {
    const txt = val.toUpperCase()
    setResponsavelOcupacao(txt)
    const res = buscarCBO(txt)
    setSugestoesCboResp(res)
    setMostrarCboResp(res.length > 0)
  }

  function selecionarCboResp(cbo: CBO) {
    setResponsavelOcupacao(`${cbo.titulo} (${cbo.codigo})`)
    setMostrarCboResp(false)
  }

  function handleOcupacaoMembroChange(val: string) {
    const txt = val.toUpperCase()
    setNovoMembroOcupacao(txt)
    const res = buscarCBO(txt)
    setSugestoesCboMembro(res)
    setMostrarCboMembro(res.length > 0)
  }

  function selecionarCboMembro(cbo: CBO) {
    setNovoMembroOcupacao(`${cbo.titulo} (${cbo.codigo})`)
    setMostrarCboMembro(false)
  }

  function handleCpfBlur() {
    if (cpf && cpf.replace(/\D/g, '').length === 11 && familiasExistentes) {
      const dup = verificarDuplicidadePessoa({ nome: responsavel, cpf, nis }, familiasExistentes, familia.id)
      if (dup.duplicado) {
        alert(dup.mensagem)
      }
    }
  }

  function handleNisBlur() {
    const nisClean = nis.replace(/\D/g, '')
    if (nisClean && nisClean.length >= 7 && nisClean !== '00000000000' && familiasExistentes) {
      const dup = verificarDuplicidadePessoa({ nome: responsavel, cpf, nis }, familiasExistentes, familia.id)
      if (dup.duplicado) {
        alert(dup.mensagem)
      }
    }
  }

  function selecionarSugestaoPaciente(p: any) {
    if (p.cpf && familiasExistentes) {
      const dup = verificarDuplicidadePessoa({ nome: p.nome, cpf: p.cpf, nis: p.nis }, familiasExistentes, familia.id)
      if (dup.duplicado) {
        alert(dup.mensagem)
        return
      }
    }
    pacienteJaSelecionadoRef.current = true
    if (p.nome) setResponsavel(p.nome.toUpperCase())
    if (p.cpf) setCpf(maskCPF(p.cpf))
    if (p.rg) setRg(p.rg.toUpperCase())
    if (p.logradouro) setLogradouro(p.logradouro.toUpperCase())
    if (p.bairro) setBairro(p.bairro.toUpperCase())
    if (p.cep) setCep(maskCEP(p.cep))
    if (p.telefone) setTelefone(maskPhone(p.telefone))
    if (p.data_nascimento) setResponsavelNasc(p.data_nascimento)
    if (p.sexo) setSexoResp(p.sexo)
    setSugestoesPacientes([])
    setMostrarSugestoes(false)
  }

  function selecionarSugestaoMembro(p: any) {
    if (p.cpf && familiasExistentes) {
      const dup = verificarDuplicidadePessoa({ nome: p.nome, cpf: p.cpf }, familiasExistentes, familia.id)
      if (dup.duplicado) {
        alert(dup.mensagem)
        return
      }
    }
    membroJaSelecionadoRef.current = true
    if (p.nome) setNovoMembroNome(p.nome.toUpperCase())
    if (p.cpf) setNovoMembroCpf(maskCPF(p.cpf))
    if (p.rg) setNovoMembroRg(p.rg.toUpperCase())
    if (p.data_nascimento) setNovoMembroNasc(p.data_nascimento)
    if (p.sexo) setNovoMembroSexo(p.sexo)
    setSugestoesMembros([])
    setMostrarSugestoesMembros(false)
  }

  function toggleVulnerabilidade(v: string) {
    if (vulnerabilidades.includes(v)) {
      setVulnerabilidades(vulnerabilidades.filter(x => x !== v))
    } else {
      setVulnerabilidades([...vulnerabilidades, v])
    }
  }

  function prepararEdicaoMembro(idx: number) {
    const m = membros[idx]
    if (!m) return
    setMembroEditandoIndex(idx)
    setNovoMembroNome(m.nome?.toUpperCase() || '')
    setNovoMembroParentesco(m.parentesco || '')
    setNovoMembroNasc(m.data_nascimento || '')
    setNovoMembroSexo((m.sexo as any) || 'Feminino')
    setNovoMembroRacaCor((m.raca_cor as any) || 'Parda')
    setNovoMembroCpf(m.cpf ? maskCPF(m.cpf) : '')
    setNovoMembroRg(m.rg || '')
    setNovoMembroNis(m.nis ? maskNIS(m.nis) : '')
    setNovoMembroCertidao(m.certidao_nascimento || '')
    setNovoMembroEscolaridade(m.escolaridade || '')
    setNovoMembroOcupacao(m.ocupacao?.toUpperCase() || '')
    setNovoMembroRenda(m.renda !== undefined ? maskCurrency(m.renda * 100) : '')
    setNovoMembroProgSocial(m.programa_governo || 'Nenhum')
    setNovoMembroFreqEscolar((m.frequencia_escolar as any) || 'Não se aplica')
    setNovoMembroEscolaNome(m.escola_nome || '')
    setNovoMembroPossuiDeficiencia(Boolean(m.possui_deficiencia))
    setNovoMembroTipoDeficiencia(m.tipo_deficiencia || '')
    setNovoMembroTrabalhoInfantil(Boolean(m.trabalho_infantil))
    setNovoMembroAcolhimento(Boolean(m.acolhimento_institucional))
    setNovoMembroDescumprimento(Boolean(m.descumprimento_condicionalidades))
  }

  function cancelarEdicaoMembro() {
    setMembroEditandoIndex(null)
    setNovoMembroNome('')
    setNovoMembroParentesco('')
    setNovoMembroNasc('')
    setNovoMembroSexo('Feminino')
    setNovoMembroRacaCor('Parda')
    setNovoMembroCpf('')
    setNovoMembroRg('')
    setNovoMembroNis('')
    setNovoMembroCertidao('')
    setNovoMembroEscolaridade('')
    setNovoMembroOcupacao('')
    setNovoMembroRenda('')
    setNovoMembroProgSocial('Nenhum')
    setNovoMembroFreqEscolar('Não se aplica')
    setNovoMembroEscolaNome('')
    setNovoMembroPossuiDeficiencia(false)
    setNovoMembroTipoDeficiencia('')
    setNovoMembroTrabalhoInfantil(false)
    setNovoMembroAcolhimento(false)
    setNovoMembroDescumprimento(false)
  }

  function adicionarOuSalvarMembro() {
    if (!novoMembroNome.trim()) {
      alert('Por favor, preencha o Nome do Integrante Familiar.')
      return
    }
    if (!novoMembroParentesco) {
      alert('Por favor, selecione o Parentesco com o Responsável.')
      return
    }
    if (!novoMembroNasc) {
      alert('Por favor, preencha a Data de Nascimento.')
      return
    }
    if (!novoMembroSexo) {
      alert('Por favor, selecione o Sexo / Gênero.')
      return
    }
    if (!novoMembroRacaCor) {
      alert('Por favor, selecione a Cor / Raça.')
      return
    }
    if (!novoMembroCpf.trim()) {
      alert('Por favor, preencha o CPF do Integrante.')
      return
    }
    if (!novoMembroRenda.trim()) {
      alert('Por favor, preencha a Renda Individual.')
      return
    }
    if (!novoMembroEscolaridade) {
      alert('Por favor, selecione a Escolaridade.')
      return
    }
    if (!novoMembroOcupacao.trim()) {
      alert('Por favor, preencha a Ocupação / CBO.')
      return
    }
    if (!novoMembroProgSocial) {
      alert('Por favor, selecione o Programa Social.')
      return
    }

    const ocupacaoUpper = novoMembroOcupacao.trim().toUpperCase()
    const isEstudante = ocupacaoUpper.includes('ESTUDANTE') || ocupacaoUpper.includes('ALUNO') || ocupacaoUpper.includes('ESTUDAR')
    if (isEstudante && (!novoMembroFreqEscolar || novoMembroFreqEscolar === 'Não se aplica')) {
      alert('Quando a Ocupação for Estudante, a Frequência Escolar é obrigatória (Sim ou Não).')
      return
    }

    const idade = calculateAge(novoMembroNasc)
    if (idade >= 18 && !novoMembroRg.trim()) {
      alert('Para integrantes com 18 anos ou mais, o preenchimento do RG é obrigatório.')
      return
    }

    const mAtualizado: MembroFamilia = {
      nome: novoMembroNome.trim().toUpperCase(),
      parentesco: novoMembroParentesco,
      data_nascimento: novoMembroNasc,
      idade,
      sexo: novoMembroSexo,
      raca_cor: novoMembroRacaCor,
      cpf: novoMembroCpf.replace(/\D/g, '') || undefined,
      rg: novoMembroRg.trim().toUpperCase() || undefined,
      nis: novoMembroNis.replace(/\D/g, '') || undefined,
      certidao_nascimento: novoMembroCertidao.trim().toUpperCase() || undefined,
      renda: parseCurrencyToFloat(novoMembroRenda),
      escolaridade: novoMembroEscolaridade,
      ocupacao: novoMembroOcupacao.trim().toUpperCase(),
      programa_governo: novoMembroProgSocial,
      frequencia_escolar: novoMembroFreqEscolar,
      escola_nome: novoMembroEscolaNome.trim().toUpperCase() || undefined,
      possui_deficiencia: novoMembroPossuiDeficiencia,
      tipo_deficiencia: novoMembroPossuiDeficiencia ? novoMembroTipoDeficiencia : undefined,
      trabalho_infantil: novoMembroTrabalhoInfantil,
      acolhimento_institucional: novoMembroAcolhimento,
      descumprimento_condicionalidades: novoMembroDescumprimento
    }

    if (familiasExistentes) {
      const dupMembro = verificarDuplicidadePessoa(
        { nome: novoMembroNome, cpf: mAtualizado.cpf },
        familiasExistentes,
        familia.id
      )
      if (dupMembro.duplicado) {
        alert(dupMembro.mensagem)
        return
      }
    }

    if (membroEditandoIndex !== null) {
      const novosMembros = [...membros]
      novosMembros[membroEditandoIndex] = mAtualizado
      setMembros(novosMembros)
      setMembroEditandoIndex(null)
    } else {
      setMembros([...membros, mAtualizado])
    }

    cancelarEdicaoMembro()
  }

  function removerMembro(idx: number) {
    if (membroEditandoIndex === idx) {
      cancelarEdicaoMembro()
    }
    setMembros(membros.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!responsavel.trim()) {
      alert('Por favor, informe o Nome Completo do Responsável.')
      return
    }
    if (!nomeMae.trim()) {
      alert('Por favor, informe o Nome Completo da Mãe do Responsável.')
      return
    }
    if (!rg.trim()) {
      alert('Por favor, informe o RG do Responsável.')
      return
    }
    if (!pontoReferencia.trim()) {
      alert('Por favor, informe o Ponto de Referência do Endereço.')
      return
    }

    // Validação do Bloco 3: Condições Habitacionais & Infraestrutura Sanitária
    if (!moradiaTipo) {
      alert('Por favor, selecione a Forma de Ocupação da Moradia (Bloco 3).')
      return
    }
    if (!tipoConstrucao) {
      alert('Por favor, selecione o Material Predominante da Construção (Bloco 3).')
      return
    }
    if (!moradiaAgua) {
      alert('Por favor, selecione o Abastecimento de Água (Bloco 3).')
      return
    }
    if (!moradiaSanear) {
      alert('Por favor, selecione o Esgotamento Sanitário (Bloco 3).')
      return
    }
    if (!moradiaLixo) {
      alert('Por favor, selecione o Destino do Lixo (Bloco 3).')
      return
    }
    if (!moradiaEnergia) {
      alert('Por favor, selecione a Energia Elétrica (Bloco 3).')
      return
    }
    if (!moradiaComodos) {
      alert('Por favor, informe a Quantidade de Cômodos da Moradia (Bloco 3).')
      return
    }

    if (novoMembroNome.trim()) {
      alert(`Atenção: Há um integrante em preenchimento ("${novoMembroNome.trim().toUpperCase()}"). Por favor, clique no botão "${membroEditandoIndex !== null ? 'Salvar Alterações' : 'Adicionar Integrante'}" para incluí-lo na lista da família ou limpe o campo Nome Completo.`)
      return
    }

    // Trava de Duplicidade Completa
    if (familiasExistentes && familiasExistentes.length > 0) {
      const dupResp = verificarDuplicidadePessoa(
        { nome: responsavel, cpf, nis },
        familiasExistentes,
        familia.id
      )
      if (dupResp.duplicado) {
        alert(dupResp.mensagem)
        return
      }

      for (const m of membros) {
        const dupMembro = verificarDuplicidadePessoa(
          { nome: m.nome, cpf: m.cpf, nis: m.nis },
          familiasExistentes,
          familia.id
        )
        if (dupMembro.duplicado) {
          alert(dupMembro.mensagem)
          return
        }
      }
    }

    if (paifAtivo && vulnerabilidades.length === 0) {
      alert('Atenção: Ao ativar o Acompanhamento PAIF, é obrigatório selecionar pelo menos uma opção no Perfil de Vulnerabilidade Social.')
      return
    }

    let vulnerabilidadesFinais = [...vulnerabilidades]
    if (vulnerabilidades.includes('Outras...') && outraVulnerabilidadeTexto.trim()) {
      vulnerabilidadesFinais = vulnerabilidadesFinais.filter(v => v !== 'Outras...')
      vulnerabilidadesFinais.push(`OUTRAS: ${outraVulnerabilidadeTexto.trim().toUpperCase()}`)
    }

    const progSocialFinal = responsavelProgSocial === 'Outros' && outroProgSocialText.trim()
      ? outroProgSocialText.trim().toUpperCase()
      : responsavelProgSocial

    setSalvando(true)
    try {
      const famAtualizada: Partial<Familia> = {
        responsavel: responsavel.trim().toUpperCase(),
        nome_mae_responsavel: nomeMae.trim().toUpperCase() || undefined,
        sexo_responsavel: sexoResp,
        raca_cor_responsavel: racaCorResp,
        data_nascimento_responsavel: responsavelNasc || undefined,
        escolaridade_responsavel: responsavelEscolaridade,
        ocupacao_responsavel: responsavelOcupacao.trim().toUpperCase(),
        renda_responsavel: parseCurrencyToFloat(responsavelRenda),
        programa_social_responsavel: progSocialFinal,
        cpf_responsavel: cpf.replace(/\D/g, ''),
        rg_responsavel: rg.trim().toUpperCase() || undefined,
        nis_responsavel: nis.replace(/\D/g, '') || undefined,

        // Endereço e Território
        logradouro: logradouro.trim().toUpperCase(),
        numero: numero.trim().toUpperCase() || 'S/N',
        complemento: complemento.trim().toUpperCase() || undefined,
        bairro: bairro.trim().toUpperCase(),
        cep: cep.replace(/\D/g, '') || undefined,
        ponto_referencia: pontoReferencia.trim().toUpperCase() || undefined,
        zona_territorio: zonaTerritorio,
        telefone: telefone ? maskPhone(telefone) : undefined,
        outro_contato: outroContato.trim().toUpperCase() || undefined,

        // Moradia
        moradia_tipo: moradiaTipo,
        tipo_construcao: tipoConstrucao,
        moradia_agua: moradiaAgua,
        moradia_sanear: moradiaSanear,
        moradia_lixo: moradiaLixo,
        moradia_energia: moradiaEnergia,
        moradia_comodos: Number(moradiaComodos) || 4,
        acessibilidade,

        // PAIF
        vulnerabilidades: paifAtivo ? vulnerabilidadesFinais : [],
        paif_ativo: paifAtivo,
        paif_data_inicio: paifAtivo ? (paifDataInicio || undefined) : undefined,
        paif_data_fim: paifAtivo ? (paifDataFim || undefined) : undefined,
        paif_motivo_desligamento: paifAtivo ? (paifMotivoDesligamento.trim().toUpperCase() || undefined) : undefined,
        paif_potencialidades: paifAtivo ? (paifPotencialidades.trim().toUpperCase() || undefined) : undefined,
        paif_metas: paifAtivo ? (paifMetas.trim().toUpperCase() || undefined) : undefined,
        tecnico_referencia: paifAtivo ? (tecnicoReferencia.trim().toUpperCase() || undefined) : undefined
      }

      const membroResponsavel: MembroFamilia = {
        nome: responsavel.trim().toUpperCase(),
        parentesco: 'Responsável',
        sexo: sexoResp,
        raca_cor: racaCorResp,
        cpf: cpf.replace(/\D/g, ''),
        rg: rg.trim().toUpperCase(),
        nis: nis.replace(/\D/g, ''),
        data_nascimento: responsavelNasc,
        idade: calculateAge(responsavelNasc),
        renda: parseCurrencyToFloat(responsavelRenda),
        escolaridade: responsavelEscolaridade,
        ocupacao: responsavelOcupacao.trim().toUpperCase(),
        programa_governo: progSocialFinal,
        frequencia_escolar: 'Não se aplica',
        possui_deficiencia: false
      }

      const todosMembros = [membroResponsavel, ...membros]

      await onSalvar(familia.id, famAtualizada, todosMembros)

      // Sincronizar na base da busca inteligente (pacientes)
      syncPacienteComBase({
        nome: responsavel.trim().toUpperCase(),
        cpf: cpf.replace(/\D/g, ''),
        rg: rg.trim().toUpperCase(),
        data_nascimento: responsavelNasc,
        logradouro: logradouro.trim().toUpperCase(),
        bairro: bairro.trim().toUpperCase(),
        cep: cep.replace(/\D/g, ''),
        telefone: telefone ? maskPhone(telefone) : undefined,
        sexo: sexoResp
      })

      for (const m of membros) {
        if (m.nome) {
          syncPacienteComBase({
            nome: m.nome,
            cpf: m.cpf,
            rg: m.rg,
            data_nascimento: m.data_nascimento,
            logradouro: logradouro.trim().toUpperCase(),
            bairro: bairro.trim().toUpperCase(),
            cep: cep.replace(/\D/g, ''),
            sexo: m.sexo
          })
        }
      }

      onClose()
    } catch (err: any) {
      alert('Erro ao atualizar família: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  const opcoesEscolaridade = [
    'Não Alfabetizado(a)',
    'Ensino Fundamental Incompleto',
    'Ensino Fundamental Completo',
    'Ensino Médio Incompleto',
    'Ensino Médio Completo',
    'Ensino Superior Incompleto',
    'Ensino Superior Completo',
    'Pós-Graduação / Especialização',
    'Mestrado',
    'Doutorado'
  ]

  const rendaTotal = parseCurrencyToFloat(responsavelRenda) + membros.reduce((acc, m) => acc + (m.renda || 0), 0)
  const totalPessoas = 1 + membros.length
  const rendaPerCapita = totalPessoas > 0 ? rendaTotal / totalPessoas : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-pen-to-square text-amber-400"></i> Edição de Prontuário Familiar nº {familia.cod_familiar}
            </h3>
            <p className="text-xs text-teal-200 mt-0.5 uppercase">
              Responsável: {familia.responsavel} • Município: {familia.municipio || 'CONCEIÇÃO DO TOCANTINS'} - {familia.uf || 'TO'}
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Card Resumo Renda */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calculator text-teal-700 text-base"></i>
              <div>
                <span className="text-[11px] font-bold text-teal-950 uppercase">Renda Familiar Total: </span>
                <strong className="text-xs font-mono text-teal-900">R$ {rendaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                <span className="text-[10px] text-gray-500 ml-2">({totalPessoas} integrante{totalPessoas > 1 ? 's' : ''})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-950 uppercase">Renda Per Capita: </span>
              <strong className="text-xs font-mono text-emerald-900">R$ {rendaPerCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          {/* 1. IDENTIFICAÇÃO DO RESPONSÁVEL */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b flex justify-between items-center">
              <span><i className="fa-solid fa-user text-teal-700 mr-1.5"></i> 1. Identificação do Responsável Familiar (RF)</span>
              <span className="text-[10px] text-red-600 font-normal">* campos obrigatórios</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Nome Responsável */}
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome Completo do Responsável <span className="text-red-600 font-bold">*</span>
                  {buscandoSugestoes && <span className="ml-2 text-[10px] text-teal-600 animate-pulse">Buscando na base...</span>}
                </label>
                <input
                  type="text"
                  required
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value.toUpperCase())}
                  placeholder="DIGITE O NOME COMPLETO..."
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                />

                {mostrarSugestoes && sugestoesPacientes.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-teal-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {sugestoesPacientes.map(p => (
                      <div
                        key={p.id}
                        onClick={() => selecionarSugestaoPaciente(p)}
                        className="p-2.5 hover:bg-teal-50 cursor-pointer transition text-xs flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-gray-800 block uppercase">{p.nome}</strong>
                          <span className="text-gray-500 text-[11px] uppercase">CPF: {p.cpf || '—'}</span>
                        </div>
                        <span className="px-2 py-1 bg-teal-600 text-white rounded font-bold text-[10px] uppercase">Preencher</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nome da Mãe */}
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome Completo da Mãe do Responsável <span className="text-red-600 font-bold">*</span>
                  {buscandoMae && <span className="ml-2 text-[10px] text-teal-600 animate-pulse">Buscando na base...</span>}
                </label>
                <input
                  type="text"
                  required
                  value={nomeMae}
                  onChange={e => setNomeMae(e.target.value.toUpperCase())}
                  placeholder="DIGITE O NOME DA MÃE PARA BUSCAR..."
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-medium"
                />

                {mostrarSugestoesMae && sugestoesMae.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-teal-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                    <div className="p-2 bg-teal-50 text-[11px] font-bold text-teal-900 flex justify-between items-center">
                      <span>Sugestões Encontradas ({sugestoesMae.length})</span>
                      <button type="button" onClick={() => setMostrarSugestoesMae(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    {sugestoesMae.map(p => (
                      <div
                        key={p.id}
                        onClick={() => selecionarSugestaoMae(p)}
                        className="p-2.5 hover:bg-teal-50 cursor-pointer transition text-xs flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-gray-800 block uppercase">{p.nome}</strong>
                          <span className="text-gray-500 text-[11px] uppercase">
                            CPF: {p.cpf || '—'} • RG: {p.rg || '—'}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-teal-600 text-white rounded font-bold text-[10px] uppercase">Preencher</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Nascimento */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Data de Nascimento <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={responsavelNasc}
                  onChange={e => setResponsavelNasc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
                />
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sexo / Gênero</label>
                <select
                  value={sexoResp}
                  onChange={e => setSexoResp(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                >
                  <option value="Feminino">FEMININO</option>
                  <option value="Masculino">MASCULINO</option>
                  <option value="Outro">OUTRO</option>
                </select>
              </div>

              {/* Cor / Raça */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cor / Raça (IBGE)</label>
                <select
                  value={racaCorResp}
                  onChange={e => setRacaCorResp(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                >
                  <option value="Parda">PARDA</option>
                  <option value="Branca">BRANCA</option>
                  <option value="Preta">PRETA</option>
                  <option value="Amarela">AMARELA</option>
                  <option value="Indígena">INDÍGENA</option>
                  <option value="Não declarada">NÃO DECLARADA</option>
                </select>
              </div>

              {/* RG */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  RG do Responsável <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rg}
                  onChange={e => setRg(e.target.value.toUpperCase())}
                  placeholder="EX: 00.000.000-0"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-mono font-semibold"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CPF do Responsável <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(maskCPF(e.target.value))}
                  onBlur={handleCpfBlur}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold"
                />
              </div>

              {/* NIS */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NIS do Responsável (opcional)
                </label>
                <input
                  type="text"
                  value={nis}
                  onChange={e => setNis(maskNIS(e.target.value))}
                  onBlur={handleNisBlur}
                  placeholder="000.00000.00-0 (OPCIONAL)"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telefone Principal <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={e => setTelefone(maskPhone(e.target.value))}
                  placeholder="(63) 90000-0000"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              {/* Outro Contato */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Outro Contato</label>
                <input
                  type="text"
                  value={outroContato}
                  onChange={e => setOutroContato(e.target.value.toUpperCase())}
                  placeholder="EX: (63) 98888-8888"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
                />
              </div>

              {/* Renda Individual */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Renda Individual (R$) <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={responsavelRenda}
                  onChange={e => setResponsavelRenda(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold text-emerald-800 bg-emerald-50/40"
                />
              </div>

              {/* Ocupação / CBO */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ocupação / CBO <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={responsavelOcupacao}
                  onChange={e => handleOcupacaoRespChange(e.target.value)}
                  placeholder="DIGITE PARA BUSCAR CBO..."
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                />

                {mostrarCboResp && sugestoesCboResp.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-teal-300 rounded-xl shadow-xl max-h-44 overflow-y-auto divide-y divide-gray-100">
                    {sugestoesCboResp.map(cbo => (
                      <div
                        key={cbo.codigo}
                        onClick={() => selecionarCboResp(cbo)}
                        className="p-2 hover:bg-teal-50 cursor-pointer transition text-xs flex justify-between items-center"
                      >
                        <span className="font-semibold text-gray-800 uppercase">{cbo.titulo}</span>
                        <span className="px-1.5 py-0.5 bg-teal-100 text-teal-900 font-mono text-[10px] rounded font-bold">{cbo.codigo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Escolaridade */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Escolaridade <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={responsavelEscolaridade}
                  onChange={e => setResponsavelEscolaridade(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                >
                  <option value="">SELECIONE A ESCOLARIDADE *</option>
                  {opcoesEscolaridade.map(esc => (
                    <option key={esc} value={esc}>{esc.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Benefício / Programa do Governo */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Benefício / Prog. Governo <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={responsavelProgSocial}
                  onChange={e => setResponsavelProgSocial(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                >
                  <option value="Nenhum">NENHUM</option>
                  <option value="Bolsa Família">BOLSA FAMÍLIA</option>
                  <option value="BPC (Benefício de Prestação Continuada)">BPC (BENEFÍCIO DE PRESTAÇÃO CONTINUADA)</option>
                  <option value="Bolsa Família + BPC">BOLSA FAMÍLIA + BPC</option>
                  <option value="Tarifa Social de Energia / Água">TARIFA SOCIAL DE ENERGIA / ÁGUA</option>
                  <option value="Outros">OUTROS (ESPECIFICAR)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. ENDEREÇO E TERRITÓRIO */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b">
              <i className="fa-solid fa-map-location-dot text-teal-700 mr-1.5"></i> 2. Endereço e Territorialização
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Zona / Território SUAS <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  value={zonaTerritorio}
                  onChange={e => setZonaTerritorio(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-900"
                >
                  <option value="Urbana">URBANA</option>
                  <option value="Rural">RURAL</option>
                  <option value="Área de Risco">ÁREA DE RISCO</option>
                  <option value="Quilombola">COMUNIDADE QUILOMBOLA</option>
                  <option value="Indígena">COMUNIDADE INDÍGENA</option>
                  <option value="Ribeirinha">COMUNIDADE RIBEIRINHA</option>
                  <option value="Assentamento">ASSENTAMENTO RURAL</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Logradouro <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={logradouro}
                  onChange={e => setLogradouro(e.target.value.toUpperCase())}
                  placeholder="EX: RUA CENTRAL"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Número <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={numero}
                  onChange={e => setNumero(e.target.value.toUpperCase())}
                  placeholder="Nº OU S/N"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bairro / Povoado <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bairro}
                  onChange={e => setBairro(e.target.value.toUpperCase())}
                  placeholder="EX: CENTRO, SETOR SUL..."
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Complemento</label>
                <input
                  type="text"
                  value={complemento}
                  onChange={e => setComplemento(e.target.value.toUpperCase())}
                  placeholder="EX: CASA 02, FUNDOS"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={e => setCep(maskCEP(e.target.value))}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ponto de Referência <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pontoReferencia}
                  onChange={e => setPontoReferencia(e.target.value.toUpperCase())}
                  placeholder="EX: PRÓXIMO AO POSTO DE SAÚDE"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 3. CONDIÇÕES HABITACIONAIS */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b flex justify-between items-center">
              <span><i className="fa-solid fa-house-chimney text-teal-700 mr-1.5"></i> 3. Condições Habitacionais & Infraestrutura Sanitária</span>
              <span className="text-[10px] text-red-600 font-normal">* campos obrigatórios</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Forma de Ocupação <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={moradiaTipo}
                  onChange={e => setMoradiaTipo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-medium"
                >
                  <option value="">SELECIONE A FORMA DE OCUPAÇÃO *</option>
                  <option value="Própria">PRÓPRIA (QUITADA OU FINANCIADA)</option>
                  <option value="Alugada">ALUGADA</option>
                  <option value="Cedida">CEDIDA (POR PARENTES OU TERCEIROS)</option>
                  <option value="Ocupação / Irregular">OCUPAÇÃO / POSSE IRREGULAR</option>
                  <option value="Outra">OUTRA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Material Predominante <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={tipoConstrucao}
                  onChange={e => setTipoConstrucao(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-medium"
                >
                  <option value="">SELECIONE O MATERIAL *</option>
                  <option value="Alvenaria com Revestimento">ALVENARIA COM REVESTIMENTO</option>
                  <option value="Alvenaria sem Revestimento">ALVENARIA SEM REVESTIMENTO</option>
                  <option value="Madeira / Madeira Tratada">MADEIRA / TÁBUA</option>
                  <option value="Taipa / Barro / Adobe">TAIPA / BARRO / ADOBE</option>
                  <option value="Material Aproveitado / Improvisado">MATERIAL IMPROVISADO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Abastecimento de Água <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={moradiaAgua}
                  onChange={e => setMoradiaAgua(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-medium"
                >
                  <option value="">SELECIONE O ABASTECIMENTO *</option>
                  <option value="Rede Pública / Canalizada">REDE PÚBLICA CANALIZADA</option>
                  <option value="Poço Artesiano / Nascente">POÇO ARTESIANO / NASCENTE</option>
                  <option value="Cisterna / Água de Chuva">CISTERNA</option>
                  <option value="Carro-Pipa">CARRO-PIPA</option>
                  <option value="Rio / Açude / Sem Tratamento">RIO / CÓRREGO / AÇUDE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Esgotamento Sanitário <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={moradiaSanear}
                  onChange={e => setMoradiaSanear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-medium"
                >
                  <option value="">SELECIONE O ESGOTAMENTO *</option>
                  <option value="Rede Pública / Fossa Séptica">REDE COLETORA OU FOSSA SÉPTICA</option>
                  <option value="Fossa Rudimentar / Buraco">FOSSA RUDIMENTAR / NEGRA</option>
                  <option value="Direto na Vala / Céu Aberto">DIRETO NA VALA / CÉU ABERTO</option>
                  <option value="Não Possui Banheiro no Domicílio">NÃO POSSUI BANHEIRO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destino do Lixo <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={moradiaLixo}
                  onChange={e => setMoradiaLixo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-medium"
                >
                  <option value="">SELECIONE O DESTINO DO LIXO *</option>
                  <option value="Coleta Pública Regular">COLETA PÚBLICA DIRETA</option>
                  <option value="Depositado em Caçamba">DEPOSITADO EM CAÇAMBA COLETIVA</option>
                  <option value="Queimado ou Enterrado">QUEIMADO OU ENTERRADO</option>
                  <option value="Jogado em Terreno Baldio">JOGADO EM TERRENO BALDIO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Energia Elétrica <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  required
                  value={moradiaEnergia}
                  onChange={e => setMoradiaEnergia(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-medium"
                >
                  <option value="">SELECIONE A ENERGIA *</option>
                  <option value="Rede Elétrica com Medidor Próprio">COM MEDIDOR PRÓPRIO (RELÓGIO)</option>
                  <option value="Rede Elétrica com Medidor Comunitário">COM MEDIDOR COMUNITÁRIO</option>
                  <option value="Ligação Clandestina / Sem Medidor">SEM MEDIDOR (LIGAÇÃO CLANDESTINA)</option>
                  <option value="Sem Acesso à Energia Elétrica">SEM ENERGIA ELÉTRICA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantidade de Cômodos <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={moradiaComodos}
                  onChange={e => setMoradiaComodos(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={acessibilidade}
                    onChange={e => setAcessibilidade(e.target.checked)}
                    className="w-4 h-4 text-teal-700 rounded"
                  />
                  <span>Domicílio com Acessibilidade</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. VULNERABILIDADES & PAF */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b">
              <i className="fa-solid fa-hand-holding-heart text-teal-700 mr-1.5"></i> 4. Vulnerabilidades e Acompanhamento PAIF (PAF)
            </h4>

            {/* Toggle PAIF */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex flex-wrap justify-between items-center gap-2 mb-3">
              <div>
                <span className="font-bold text-teal-950 uppercase text-xs block">Acompanhamento PAIF Ativo?</span>
                <span className="text-[10px] text-teal-800">Alimenta os indicadores do Bloco 1 do RMA</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paifAtivo}
                  onChange={e => {
                    const ativo = e.target.checked
                    setPaifAtivo(ativo)
                    if (!ativo) {
                      setVulnerabilidades([])
                      setOutraVulnerabilidadeTexto('')
                      setPaifDataInicio('')
                      setPaifDataFim('')
                      setPaifMotivoDesligamento('')
                      setPaifPotencialidades('')
                      setPaifMetas('')
                      setTecnicoReferencia('')
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
                <span className="ml-2 text-xs font-bold text-teal-900 uppercase">{paifAtivo ? 'PAIF ATIVO' : 'PAIF INATIVO'}</span>
              </label>
            </div>

            {paifAtivo ? (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-teal-950 mb-1">
                        Data de Início PAIF <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="date"
                        required={paifAtivo}
                        value={paifDataInicio}
                        onChange={e => setPaifDataInicio(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-teal-950 mb-1">Data de Desligamento / Fim (se houver)</label>
                      <input
                        type="date"
                        value={paifDataFim}
                        onChange={e => setPaifDataFim(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-teal-950 mb-1">Técnico(a) de Referência</label>
                      <select
                        value={tecnicoReferencia}
                        onChange={e => setTecnicoReferencia(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white font-medium"
                      >
                        <option value="">SELECIONE O(A) TÉCNICO(A) DE REFERÊNCIA...</option>
                        {usuarios.map(u => (
                          <option key={u.id} value={u.nome || u.usuario}>
                            {u.nome} ({u.cargo || u.perfil}) {u.conselho && u.conselho !== 'Não aplicável' ? `— ${u.conselho}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {paifDataFim && (
                    <div>
                      <label className="block text-xs font-semibold text-teal-950 mb-1">Motivo do Desligamento PAIF</label>
                      <select
                        value={paifMotivoDesligamento}
                        onChange={e => setPaifMotivoDesligamento(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                      >
                        <option value="">Selecione o motivo...</option>
                        <option value="Superação da situação de vulnerabilidade">Superação da situação de vulnerabilidade</option>
                        <option value="Mudança de território / município">Mudança de território / município</option>
                        <option value="Transferência para CREAS / Proteção Especial">Transferência para CREAS / Proteção Especial</option>
                        <option value="Evasão / Não comparecimento continuado">Evasão / Não comparecimento continuado</option>
                        <option value="Óbito do responsável familiar">Óbito do responsável familiar</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-teal-950 mb-1">Potencialidades da Família</label>
                    <textarea
                      rows={2}
                      value={paifPotencialidades}
                      onChange={e => setPaifPotencialidades(e.target.value.toUpperCase())}
                      placeholder="RECURSOS, HABILIDADES E REDES DE APOIO DA FAMÍLIA..."
                      className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-950 mb-1">Metas Pactuadas (PAF)</label>
                    <textarea
                      rows={2}
                      value={paifMetas}
                      onChange={e => setPaifMetas(e.target.value.toUpperCase())}
                      placeholder="COMPROMISSOS MÚTUOS PACTUADOS COM A FAMÍLIA..."
                      className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Checklist de Vulnerabilidades */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <label className="block text-xs font-bold text-gray-800 mb-2 uppercase">
                    Situações de Vulnerabilidade / Risco Identificadas <span className="text-red-600 font-bold">*</span>:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                    {[
                      'Situação de Extrema Pobreza (RMA B.1)',
                      'Beneficiária do Bolsa Família (RMA B.2)',
                      'Descumprimento de Condicionalidades do PBF (RMA B.3)',
                      'Membro Beneficiário do BPC Idoso / PcD (RMA B.4)',
                      'Presença de Trabalho Infantil (RMA B.5)',
                      'Criança/Adolescente em Serviço de Acolhimento (RMA B.6)',
                      'Violência Intrafamiliar / Negligência',
                      'Desemprego Prolongado / Sem Renda Fixa',
                      'Uso Prejudicial de Álcool e Outras Drogas',
                      'Isolamento Social / Rompimento de Vínculos',
                      'Conflito com a Lei / Medida Socioeducativa',
                      'Outras...'
                    ].map(v => (
                      <label
                        key={v}
                        onClick={() => toggleVulnerabilidade(v)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                          vulnerabilidades.includes(v)
                            ? 'bg-teal-100 border-teal-400 font-bold text-teal-950'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={vulnerabilidades.includes(v)}
                          readOnly
                          className="rounded text-teal-700"
                        />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>

                  {vulnerabilidades.includes('Outras...') && (
                    <div className="mt-2">
                      <input
                        type="text"
                        required
                        value={outraVulnerabilidadeTexto}
                        onChange={e => setOutraVulnerabilidadeTexto(e.target.value.toUpperCase())}
                        placeholder="DESCREVA A OUTRA SITUAÇÃO DE VULNERABILIDADE..."
                        className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="text-xs text-gray-500 italic">
                  <i className="fa-solid fa-circle-info mr-1 text-teal-700"></i>
                  Acompanhamento PAIF desativado para esta família. Caso a família entre em acompanhamento sistemático no futuro, ative o botão acima.
                </span>
              </div>
            )}
          </div>

          {/* 5. COMPOSIÇÃO FAMILIAR & DEPENDENTES */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b flex justify-between items-center">
              <span><i className="fa-solid fa-users text-teal-700 mr-1.5"></i> 5. Demais Integrantes da Família ({membros.length} dependentes cadastrados)</span>
            </h4>

            {/* Formulário Dependente */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                <i className={`fa-solid ${membroEditandoIndex !== null ? 'fa-pen-to-square text-amber-600' : 'fa-user-plus text-teal-700'}`}></i>
                {membroEditandoIndex !== null ? `Editando Integrante #${membroEditandoIndex + 1}` : 'Adicionar Novo Integrante à Família'}
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 relative">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={novoMembroNome}
                    onChange={e => setNovoMembroNome(e.target.value.toUpperCase())}
                    placeholder="NOME DO DEPENDENTE..."
                    className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold bg-white"
                  />

                  {mostrarSugestoesMembros && sugestoesMembros.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-teal-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-gray-100">
                      {sugestoesMembros.map(p => (
                        <div
                          key={p.id}
                          onClick={() => selecionarSugestaoMembro(p)}
                          className="p-2 hover:bg-teal-50 cursor-pointer transition text-xs flex justify-between items-center"
                        >
                          <div>
                            <strong className="text-gray-800 block uppercase">{p.nome}</strong>
                            <span className="text-gray-500 text-[10px]">CPF: {p.cpf || '—'}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-teal-600 text-white rounded font-bold text-[9px] uppercase">Selecionar</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Parentesco {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <select
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroParentesco}
                    onChange={e => setNovoMembroParentesco(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                  >
                    <option value="">SELECIONE *</option>
                    <option value="Filho(a)">FILHO(A)</option>
                    <option value="Cônjuge / Companheiro(a)">CÔNJUGE / COMPANHEIRO(A)</option>
                    <option value="Enteado(a)">ENTEADO(A)</option>
                    <option value="Neto(a)">NETO(A)</option>
                    <option value="Mãe / Pai">MÃE / PAI</option>
                    <option value="Sogro(a)">SOGRO(A)</option>
                    <option value="Irmão / Irmã">IRMÃO / IRMÃ</option>
                    <option value="Genro / Nora">GENRO / NORA</option>
                    <option value="Outro Parente">OUTRO PARENTE</option>
                    <option value="Não Parente">NÃO PARENTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Data Nascimento {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <input
                    type="date"
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroNasc}
                    onChange={e => setNovoMembroNasc(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Sexo / Gênero {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <select
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroSexo}
                    onChange={e => setNovoMembroSexo(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase"
                  >
                    <option value="">SELECIONE O SEXO *</option>
                    <option value="Feminino">FEMININO</option>
                    <option value="Masculino">MASCULINO</option>
                    <option value="Outro">OUTRO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Cor / Raça {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <select
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroRacaCor}
                    onChange={e => setNovoMembroRacaCor(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase"
                  >
                    <option value="">SELECIONE A COR/RAÇA *</option>
                    <option value="Parda">PARDA</option>
                    <option value="Branca">BRANCA</option>
                    <option value="Preta">PRETA</option>
                    <option value="Amarela">AMARELA</option>
                    <option value="Indígena">INDÍGENA</option>
                    <option value="Não declarada">NÃO DECLARADA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    CPF {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <input
                    type="text"
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroCpf}
                    onChange={e => setNovoMembroCpf(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    RG (obrigatório se &ge; 18 anos / opcional se menor)
                  </label>
                  <input
                    type="text"
                    value={novoMembroRg}
                    onChange={e => setNovoMembroRg(e.target.value.toUpperCase())}
                    placeholder="EX: 00.000.000-0"
                    className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-mono bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Certidão de Nascimento (Termo/Livro/Folha/Cartório) (opcional)
                  </label>
                  <input
                    type="text"
                    value={novoMembroCertidao}
                    onChange={e => setNovoMembroCertidao(e.target.value.toUpperCase())}
                    placeholder="EX: TERMO 1234, LIVRO A-10, FOLHA 50... (OPCIONAL)"
                    className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Renda Individual (R$) {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <input
                    type="text"
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroRenda}
                    onChange={e => setNovoMembroRenda(maskCurrency(e.target.value))}
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold text-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Escolaridade {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <select
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroEscolaridade}
                    onChange={e => setNovoMembroEscolaridade(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                  >
                    <option value="">SELECIONE *</option>
                    {opcoesEscolaridade.map(esc => (
                      <option key={esc} value={esc}>{esc.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Ocupação / CBO {novoMembroNome.trim() && <span className="text-red-600 font-bold">*</span>}
                  </label>
                  <input
                    type="text"
                    required={Boolean(novoMembroNome.trim())}
                    value={novoMembroOcupacao}
                    onChange={e => handleOcupacaoMembroChange(e.target.value)}
                    placeholder="DIGITE PARA BUSCAR CBO..."
                    className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold bg-white"
                  />
                  {mostrarCboMembro && sugestoesCboMembro.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-teal-300 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-gray-100">
                      {sugestoesCboMembro.map(cbo => (
                        <div
                          key={cbo.codigo}
                          onClick={() => selecionarCboMembro(cbo)}
                          className="p-2 hover:bg-teal-50 cursor-pointer transition text-xs flex justify-between items-center"
                        >
                          <span className="font-semibold text-gray-800 uppercase">{cbo.titulo}</span>
                          <span className="px-1 py-0.5 bg-teal-100 text-teal-900 font-mono text-[9px] rounded font-bold">{cbo.codigo}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Programa Social <span className="text-red-600 font-bold">*</span></label>
                  <select
                    required
                    value={novoMembroProgSocial}
                    onChange={e => setNovoMembroProgSocial(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase"
                  >
                    <option value="">SELECIONE O PROGRAMA *</option>
                    <option value="Nenhum">NENHUM</option>
                    <option value="Bolsa Família">BOLSA FAMÍLIA</option>
                    <option value="BPC Idoso">BPC IDOSO</option>
                    <option value="BPC Pessoa com Deficiência">BPC PESSOA COM DEFICIÊNCIA</option>
                    <option value="Outros">OUTROS</option>
                  </select>
                </div>
              </div>

              {/* Indicadores do Membro */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-2.5">
                <span className="font-bold text-gray-800 text-[11px] block uppercase">
                  <i className="fa-solid fa-clipboard-check text-teal-700 mr-1"></i> Indicadores de Acompanhamento SUAS / RMA:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Frequência Escolar
                      {novoMembroOcupacao.toUpperCase().includes('ESTUDANTE') && <span className="text-red-600 font-bold ml-1">*</span>}
                    </label>
                    <select
                      value={novoMembroFreqEscolar}
                      onChange={e => setNovoMembroFreqEscolar(e.target.value as any)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white"
                    >
                      <option value="Não se aplica">Não se aplica</option>
                      <option value="Sim">Frequenta Regularmente (Sim)</option>
                      <option value="Não">Não Frequenta / Evadido (Não)</option>
                    </select>
                  </div>

                  {novoMembroFreqEscolar === 'Sim' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Nome da Escola / Série</label>
                      <input
                        type="text"
                        value={novoMembroEscolaNome}
                        onChange={e => setNovoMembroEscolaNome(e.target.value.toUpperCase())}
                        placeholder="EX: ESCOLA MUNICIPAL..."
                        className="w-full px-2 py-1.5 border rounded-lg text-xs uppercase"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={novoMembroPossuiDeficiencia}
                      onChange={e => setNovoMembroPossuiDeficiencia(e.target.checked)}
                      className="rounded text-teal-700"
                    />
                    <span className="font-bold text-gray-800">PcD (Deficiência)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={novoMembroTrabalhoInfantil}
                      onChange={e => setNovoMembroTrabalhoInfantil(e.target.checked)}
                      className="rounded text-red-700"
                    />
                    <span className="font-bold text-red-900">Trabalho Infantil</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={novoMembroAcolhimento}
                      onChange={e => setNovoMembroAcolhimento(e.target.checked)}
                      className="rounded text-amber-700"
                    />
                    <span className="font-bold text-amber-900">Em Acolhimento</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 cursor-pointer text-[11px]">
                    <input
                      type="checkbox"
                      checked={novoMembroDescumprimento}
                      onChange={e => setNovoMembroDescumprimento(e.target.checked)}
                      className="rounded text-purple-700"
                    />
                    <span className="font-bold text-purple-900">Descumprimento PBF</span>
                  </label>
                </div>

                {novoMembroPossuiDeficiencia && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">Tipo de Deficiência</label>
                    <select
                      value={novoMembroTipoDeficiencia}
                      onChange={e => setNovoMembroTipoDeficiencia(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white"
                    >
                      <option value="">Selecione o tipo...</option>
                      <option value="Física / Motora">Física / Motora</option>
                      <option value="Visual / Cegueira / Baixa Visão">Visual / Cegueira / Baixa Visão</option>
                      <option value="Auditiva / Surdez">Auditiva / Surdez</option>
                      <option value="Intelectual / Mental / Cognitiva">Intelectual / Mental / Cognitiva</option>
                      <option value="Transtorno do Espectro Autista (TEA)">Transtorno do Espectro Autista (TEA)</option>
                      <option value="Múltipla">Múltipla</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Botões Membro */}
              <div className="flex justify-end gap-2 pt-1">
                {membroEditandoIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelarEdicaoMembro}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold uppercase"
                  >
                    Cancelar Edição
                  </button>
                )}
                <button
                  type="button"
                  onClick={adicionarOuSalvarMembro}
                  className={`px-4 py-1.5 ${membroEditandoIndex !== null ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-700 hover:bg-teal-800'} text-white rounded-lg text-xs font-bold shadow uppercase`}
                >
                  {membroEditandoIndex !== null ? 'Atualizar Integrante' : '+ Adicionar Integrante'}
                </button>
              </div>
            </div>

            {/* Lista de Membros */}
            {membros.length > 0 && (
              <div className="mt-3 divide-y divide-gray-100 border rounded-xl overflow-hidden bg-white shadow-2xs">
                {membros.map((m, idx) => (
                  <div key={idx} className="p-3 flex flex-wrap justify-between items-center gap-2 hover:bg-gray-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-gray-900 uppercase text-xs">{m.nome}</strong>
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-900 rounded font-bold text-[10px] uppercase">
                          {m.parentesco}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {m.idade} anos • R$ {(m.renda || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-2">
                        <span>CPF: {m.cpf ? maskCPF(m.cpf) : '—'}</span>
                        {m.possui_deficiencia && (
                          <span className="font-bold text-amber-800 bg-amber-50 px-1 rounded">PcD: {m.tipo_deficiencia || 'Sim'}</span>
                        )}
                        {m.trabalho_infantil && (
                          <span className="font-bold text-red-800 bg-red-50 px-1 rounded">Trabalho Infantil</span>
                        )}
                        {m.acolhimento_institucional && (
                          <span className="font-bold text-amber-800 bg-amber-50 px-1 rounded">Acolhimento</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => prepararEdicaoMembro(idx)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-bold text-[10px] uppercase border border-amber-200"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removerMembro(idx)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-[10px] uppercase border border-red-200"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border rounded-xl text-xs text-gray-600 hover:bg-gray-50 uppercase font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-8 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md transition uppercase flex items-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              {salvando ? 'Salvando Alterações...' : 'Salvar Alterações do Prontuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
