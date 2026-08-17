'use client'

import { useState, useEffect, useRef } from 'react'
import { Familia, MembroFamilia, Atendimento, BeneficioConcedido, Configuracao, Usuario } from '@/types'
import { maskCPF, maskNIS, maskPhone, calculateAge, maskCurrency, parseCurrencyToFloat, formatDateBR } from '@/utils/masks'
import { buscarCBO, CBO } from '@/data/cboList'
import { verificarDuplicidadePessoa } from '@/utils/duplicidade'
import { syncPacienteComBase } from '@/utils/syncPaciente'

interface ModalVerFamiliaProps {
  familia: Familia
  atendimentosFamilia: Atendimento[]
  beneficiosFamilia: BeneficioConcedido[]
  configuracao?: Configuracao
  usuarioLogado?: Usuario | null
  familiasExistentes?: Familia[]
  onClose: () => void
  onTogglePaif: (familiaId: string, paifAtual: boolean) => Promise<void>
  onSalvarMembro?: (familiaId: string, novoMembro: MembroFamilia) => Promise<void>
}

function extrairNomeTecnicoLimpo(raw: string) {
  if (!raw) return 'TÉCNICO(A) CRAS'
  let tec = raw.trim()
  tec = tec.replace(/\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):.*?\)\s*$/i, '').trim()
  tec = tec.replace(/\s*\(.*?\)\s*$/, '').trim()
  return tec.toUpperCase() || 'TÉCNICO(A) CRAS'
}

import { DocumentoOficialLayout } from '@/components/impressao/DocumentoOficialLayout'

export function ConteudoDocumentoProntuario({
  familia,
  configuracao,
  usuarioLogado,
  atendimentosFamilia = []
}: {
  familia: Familia
  configuracao?: Configuracao
  usuarioLogado?: Usuario | null
  atendimentosFamilia?: Atendimento[]
}) {
  const membrosLista = familia.membros || []
  const membroResp = membrosLista.find(m => m.parentesco === 'Responsável' || m.nome === familia.responsavel)
  const outrosMembros = membrosLista.filter(m => m !== membroResp && m.parentesco !== 'Responsável')

  const rendaResp = familia.renda_responsavel !== undefined ? familia.renda_responsavel : (membroResp?.renda || 0)
  const rendaOutros = outrosMembros.reduce((acc, m) => acc + (m.renda || 0), 0)
  const rendaTotalVal = rendaResp + rendaOutros
  const totalIntegrantes = Math.max(1, (membroResp ? 1 : 0) + outrosMembros.length)
  const perCapitaVal = totalIntegrantes > 0 ? rendaTotalVal / totalIntegrantes : 0
  const dataExtensaFormatada = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <DocumentoOficialLayout
      configuracao={configuracao}
      tituloDocumento="PRONTUÁRIO Nº"
      numeroProtocolo={familia.cod_familiar}
      dataExtensa={dataExtensaFormatada}
      assinaturas={
        <div className="grid grid-cols-2 gap-10 text-center text-[10px] pt-4 pb-2">
          <div className="border-t-[1.5px] border-black pt-1.5">
            <p className="font-extrabold uppercase text-[10.5px] text-black">{familia.responsavel}</p>
            <p className="text-[9.5px] font-semibold text-black mt-0.5">Responsável Familiar</p>
          </div>
          <div className="border-t-[1.5px] border-black pt-1.5">
            <p className="font-extrabold uppercase text-[10.5px] text-black">{usuarioLogado?.nome ? usuarioLogado.nome.toUpperCase() : 'TÉCNICO(A) RESPONSÁVEL — CRAS'}</p>
            <p className="text-[9.5px] font-semibold text-black mt-0.5">
              {usuarioLogado?.cargo || 'Assistente Social / Psicólogo(a)'}{usuarioLogado?.conselho && usuarioLogado.conselho !== 'Não aplicável' ? ` — ${usuarioLogado.conselho}` : ''}
            </p>
          </div>
        </div>
      }
    >
      {/* 1. Identificação do Responsável Familiar */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          1. Identificação do Responsável Familiar e Território
        </h4>
        <div className="grid grid-cols-12 gap-x-3 gap-y-1 pt-1 text-[10px]">
          <div className="col-span-8"><strong className="font-extrabold">Nome do RF:</strong> {familia.responsavel}</div>
          <div className="col-span-4"><strong className="font-extrabold">Data Nasc:</strong> {formatDateBR(familia.data_nascimento_responsavel || membroResp?.data_nascimento)} ({calculateAge(familia.data_nascimento_responsavel || membroResp?.data_nascimento || '')} anos)</div>
          <div className="col-span-8"><strong className="font-extrabold">Nome da Mãe:</strong> {familia.nome_mae_responsavel || 'NÃO INFORMADO'}</div>
          <div className="col-span-4"><strong className="font-extrabold">CPF:</strong> {familia.cpf_responsavel ? maskCPF(familia.cpf_responsavel) : '—'}</div>
          <div className="col-span-3"><strong className="font-extrabold">NIS:</strong> {familia.nis_responsavel ? maskNIS(familia.nis_responsavel) : '—'}</div>
          <div className="col-span-3"><strong className="font-extrabold">RG:</strong> {familia.rg_responsavel || membroResp?.rg || '—'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Sexo / Raça:</strong> {familia.sexo_responsavel || 'Feminino'} • {familia.raca_cor_responsavel || 'Parda'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Telefone:</strong> {familia.telefone ? maskPhone(familia.telefone) : '—'}</div>
          <div className="col-span-6"><strong className="font-extrabold">Endereço:</strong> {familia.logradouro}, nº {familia.numero || 'S/N'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Bairro:</strong> {familia.bairro}</div>
          <div className="col-span-3"><strong className="font-extrabold">Território SUAS:</strong> {(familia.zona_territorio || 'Urbana').toUpperCase()}</div>
        </div>
      </div>

      {/* 2. Composição Familiar */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          2. Composição Familiar ({totalIntegrantes} integrantes)
        </h4>
        <table className="w-full border-collapse text-[9.5px] mt-1">
          <thead>
            <tr className="bg-gray-100 font-black uppercase text-black border border-black">
              <th className="p-1 border border-black text-left">Nome</th>
              <th className="p-1 border border-black text-left w-24 whitespace-nowrap">Parentesco</th>
              <th className="p-1 border border-black text-center w-16 whitespace-nowrap">Idade</th>
              <th className="p-1 border border-black text-center w-14 whitespace-nowrap">Sexo</th>
              <th className="p-1 border border-black text-center w-28 whitespace-nowrap">CPF / NIS</th>
              <th className="p-1 border border-black text-left">Ocupação</th>
              <th className="p-1 border border-black text-left">Programa Social</th>
              <th className="p-1 border border-black text-right w-24 whitespace-nowrap">Renda (R$)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border border-black">
              <td className="p-1 border border-black font-extrabold uppercase">{familia.responsavel}</td>
              <td className="p-1 border border-black whitespace-nowrap">Responsável</td>
              <td className="p-1 border border-black text-center whitespace-nowrap">{calculateAge(familia.data_nascimento_responsavel || membroResp?.data_nascimento || '')} anos</td>
              <td className="p-1 border border-black text-center whitespace-nowrap">{familia.sexo_responsavel || 'Feminino'}</td>
              <td className="p-1 border border-black text-center font-mono whitespace-nowrap">{familia.cpf_responsavel ? maskCPF(familia.cpf_responsavel) : '—'}</td>
              <td className="p-1 border border-black uppercase">{familia.ocupacao_responsavel || membroResp?.ocupacao || '—'}</td>
              <td className="p-1 border border-black uppercase">{familia.programa_social_responsavel || 'Nenhum'}</td>
              <td className="p-1 border border-black text-right font-mono font-bold whitespace-nowrap">R$ {rendaResp.toFixed(2)}</td>
            </tr>
            {outrosMembros.map((m, idx) => (
              <tr key={idx} className="border border-black">
                <td className="p-1 border border-black uppercase font-medium">{m.nome} {m.possui_deficiencia ? '[PcD]' : ''}</td>
                <td className="p-1 border border-black whitespace-nowrap">{m.parentesco}</td>
                <td className="p-1 border border-black text-center whitespace-nowrap">{m.idade} anos</td>
                <td className="p-1 border border-black text-center whitespace-nowrap">{m.sexo || '—'}</td>
                <td className="p-1 border border-black text-center font-mono whitespace-nowrap">{m.cpf ? maskCPF(m.cpf) : (m.nis ? maskNIS(m.nis) : '—')}</td>
                <td className="p-1 border border-black uppercase">{m.ocupacao || '—'}</td>
                <td className="p-1 border border-black uppercase">{m.programa_governo || 'Nenhum'}</td>
                <td className="p-1 border border-black text-right font-mono whitespace-nowrap">R$ {(m.renda || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold text-[9.5px] pt-1 text-black">
          Renda Familiar Total: R$ {rendaTotalVal.toFixed(2)} | Renda Per Capita: R$ {perCapitaVal.toFixed(2)} / pessoa
        </div>
      </div>

      {/* 3. Condições Habitacionais */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          3. Condições Habitacionais e Infraestrutura Sanitária
        </h4>
        <div className="grid grid-cols-12 gap-x-3 gap-y-1 pt-1 text-[10px]">
          <div className="col-span-3"><strong className="font-extrabold">Ocupação:</strong> {familia.moradia_tipo || 'Própria'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Construção:</strong> {familia.tipo_construcao || 'Alvenaria'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Água:</strong> {familia.moradia_agua || 'Rede Geral'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Esgoto:</strong> {familia.moradia_sanear || 'Rede Geral'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Lixo:</strong> {familia.moradia_lixo || 'Coleta Pública'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Energia:</strong> {familia.moradia_energia || 'Com Medidor'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Cômodos:</strong> {familia.moradia_comodos || 4}</div>
          <div className="col-span-3"><strong className="font-extrabold">Acessibilidade:</strong> {familia.acessibilidade !== false ? 'Sim' : 'Não'}</div>
        </div>
      </div>

      {/* 4. Plano de Acompanhamento Familiar (PAF) */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          4. Plano de Acompanhamento Familiar (PAIF / PAF)
        </h4>
        <div className="border border-black p-2 rounded bg-white text-[10px] space-y-0.5">
          <p><strong className="font-extrabold">Status do Acompanhamento:</strong> {familia.paif_ativo ? 'EM ACOMPANHAMENTO SISTEMÁTICO ATIVO' : 'NÃO ACOMPANHADO ATIVAMENTE'}</p>
          <p><strong className="font-extrabold">Técnico(a) de Referência:</strong> {familia.tecnico_referencia || (usuarioLogado?.nome ? usuarioLogado.nome.toUpperCase() : 'TÉCNICO CRAS')}</p>
          <p><strong className="font-extrabold">Potencialidades Identificadas:</strong> {familia.paif_potencialidades || 'Vínculos familiares preservados, disponibilidade para participação nas atividades do CRAS.'}</p>
          <p><strong className="font-extrabold">Metas e Compromissos Pactuados:</strong> {familia.paif_metas || 'Acompanhamento do acesso a direitos socioassistenciais e condicionalidades de programas sociais.'}</p>
        </div>
      </div>

      {/* 5. Histórico de Atendimentos */}
      {atendimentosFamilia.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
            5. Registro de Atendimentos Realizados ({atendimentosFamilia.length})
          </h4>
          <div className="space-y-1.5 mt-1">
            {atendimentosFamilia.map((a, idx) => (
              <div key={idx} className="border border-black rounded p-2 bg-white text-[9.5px] space-y-1">
                <div className="flex flex-wrap justify-between items-center text-[10px] font-extrabold text-black border-b border-black pb-0.5 gap-x-3 gap-y-0.5">
                  <div>
                    <strong>Data & Local:</strong> {a.data ? a.data.split('-').reverse().join('/') : '—'} às {a.hora || '10:00'} • {a.tipo?.toUpperCase()} ({a.local || 'CRAS'})
                  </div>
                  <div>
                    <strong>Pessoa Atendida:</strong> {(a.usuario_visitado || familia.responsavel).toUpperCase()}
                  </div>
                  <div>
                    <strong>Técnico(a):</strong> {extrairNomeTecnicoLimpo(a.tecnico)}
                  </div>
                </div>
                <div className="leading-relaxed text-black text-justify whitespace-pre-line pt-0.5">
                  <strong className="font-extrabold">Síntese / Relato Técnico:</strong> {a.relato || 'Atendimento socioassistencial realizado no âmbito do PAIF.'}
                  {a.providencias && (
                    <span className="block mt-0.5 font-medium">
                      <strong className="font-extrabold">Providências & Encaminhamentos:</strong> {a.providencias}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DocumentoOficialLayout>
  )
}

export function ModalVerFamilia({
  familia,
  atendimentosFamilia = [],
  beneficiosFamilia = [],
  configuracao,
  usuarioLogado,
  familiasExistentes,
  onClose,
  onTogglePaif,
  onSalvarMembro
}: ModalVerFamiliaProps) {
  const [mostrarFormAdicionarMembro, setMostrarFormAdicionarMembro] = useState(false)
  const [salvandoMembro, setSalvandoMembro] = useState(false)

  // Formulário rápido de novo membro
  const [novoMembroNome, setNovoMembroNome] = useState('')
  const [novoMembroParentesco, setNovoMembroParentesco] = useState('')
  const [novoMembroNasc, setNovoMembroNasc] = useState('')
  const [novoMembroSexo, setNovoMembroSexo] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino')
  const [novoMembroRacaCor, setNovoMembroRacaCor] = useState<'Parda' | 'Branca' | 'Preta' | 'Amarela' | 'Indígena' | 'Não declarada'>('Parda')
  const [novoMembroCpf, setNovoMembroCpf] = useState('')
  const [novoMembroRg, setNovoMembroRg] = useState('')
  const [novoMembroNis, setNovoMembroNis] = useState('')
  const [novoMembroEscolaridade, setNovoMembroEscolaridade] = useState('')
  const [novoMembroOcupacao, setNovoMembroOcupacao] = useState('')
  const [novoMembroRenda, setNovoMembroRenda] = useState('')
  const [novoMembroProgSocial, setNovoMembroProgSocial] = useState('NENHUM')
  const [novoMembroFreqEscolar, setNovoMembroFreqEscolar] = useState('Não se aplica')
  const [novoMembroPossuiDeficiencia, setNovoMembroPossuiDeficiencia] = useState(false)
  const [novoMembroTipoDeficiencia, setNovoMembroTipoDeficiencia] = useState('')

  // CBO Autocomplete para Dependente
  const [sugestoesCboMembro, setSugestoesCboMembro] = useState<CBO[]>([])
  const [mostrarCboMembro, setMostrarCboMembro] = useState(false)

  // Autocomplete de pacientes
  const [sugestoesMembros, setSugestoesMembros] = useState<any[]>([])
  const [buscandoMembros, setBuscandoMembros] = useState(false)
  const [mostrarSugestoesMembros, setMostrarSugestoesMembros] = useState(false)
  const membroJaSelecionadoRef = useRef(false)

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
    if (p.sexo) setNovoMembroSexo(p.sexo as any)
    setSugestoesMembros([])
    setMostrarSugestoesMembros(false)
  }

  async function handleAdicionarMembroRapido(e: React.FormEvent) {
    e.preventDefault()
    if (!novoMembroNome.trim()) return alert('Informe o nome do dependente.')
    if (!novoMembroParentesco) return alert('Selecione o parentesco.')
    if (!novoMembroNasc) return alert('Informe a data de nascimento.')
    if (!novoMembroSexo) return alert('Selecione o sexo / gênero.')
    if (!novoMembroRacaCor) return alert('Selecione a cor / raça.')
    if (!novoMembroCpf.trim()) return alert('Informe o CPF do dependente.')
    if (!novoMembroRenda.trim()) return alert('Informe a renda individual.')
    if (!novoMembroEscolaridade) return alert('Selecione a escolaridade.')
    if (!novoMembroOcupacao.trim()) return alert('Informe a ocupação / CBO.')
    if (!novoMembroProgSocial) return alert('Selecione o programa social.')

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

    const m: MembroFamilia = {
      nome: novoMembroNome.trim().toUpperCase(),
      parentesco: novoMembroParentesco,
      data_nascimento: novoMembroNasc,
      idade,
      sexo: novoMembroSexo,
      raca_cor: novoMembroRacaCor,
      cpf: novoMembroCpf.replace(/\D/g, '') || undefined,
      rg: novoMembroRg.trim().toUpperCase() || undefined,
      nis: novoMembroNis.replace(/\D/g, '') || undefined,
      renda: parseCurrencyToFloat(novoMembroRenda),
      escolaridade: novoMembroEscolaridade || 'Não informada',
      ocupacao: novoMembroOcupacao.trim().toUpperCase() || 'NÃO INFORMADA',
      programa_governo: novoMembroProgSocial,
      possui_deficiencia: novoMembroPossuiDeficiencia,
      tipo_deficiencia: novoMembroPossuiDeficiencia ? novoMembroTipoDeficiencia : undefined
    }

    if (familiasExistentes) {
      const dup = verificarDuplicidadePessoa({ nome: m.nome, cpf: m.cpf }, familiasExistentes, familia.id)
      if (dup.duplicado) {
        alert(dup.mensagem)
        return
      }
    }

    if (!onSalvarMembro) return

    setSalvandoMembro(true)
    try {
      await onSalvarMembro(familia.id, m)
      syncPacienteComBase({
        nome: m.nome,
        cpf: m.cpf,
        rg: m.rg,
        data_nascimento: m.data_nascimento,
        logradouro: familia.logradouro,
        bairro: familia.bairro,
        cep: familia.cep,
        sexo: m.sexo
      })
      setMostrarFormAdicionarMembro(false)
      setNovoMembroNome('')
      setNovoMembroParentesco('')
      setNovoMembroNasc('')
      setNovoMembroCpf('')
      setNovoMembroRg('')
      setNovoMembroNis('')
      setNovoMembroEscolaridade('')
      setNovoMembroOcupacao('')
      setNovoMembroRenda('')
      setNovoMembroProgSocial('NENHUM')
      setNovoMembroPossuiDeficiencia(false)
      setNovoMembroTipoDeficiencia('')
    } catch (err: any) {
      alert('Erro ao salvar membro: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvandoMembro(false)
    }
  }

  // Cálculos de Renda e Membros
  const membrosLista = familia.membros || []
  const membroResp = membrosLista.find(m => m.parentesco === 'Responsável' || m.nome === familia.responsavel)
  const outrosMembros = membrosLista.filter(m => m !== membroResp && m.parentesco !== 'Responsável')

  const rendaResp = familia.renda_responsavel !== undefined ? familia.renda_responsavel : (membroResp?.renda || 0)
  const rendaOutros = outrosMembros.reduce((acc, m) => acc + (m.renda || 0), 0)
  const rendaTotalVal = rendaResp + rendaOutros
  const totalIntegrantes = Math.max(1, (membroResp ? 1 : 0) + outrosMembros.length)
  const perCapitaVal = totalIntegrantes > 0 ? rendaTotalVal / totalIntegrantes : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:w-full print:h-auto">
      {/* Área de Impressão Direta do Prontuário Familiar */}
      <div className="hidden print:block print:w-full print-document-area">
        <ConteudoDocumentoProntuario
          familia={familia}
          configuracao={configuracao}
          usuarioLogado={usuarioLogado}
          atendimentosFamilia={atendimentosFamilia}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[92vh] print:hidden">
        {/* Modal Header */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-folder-open text-emerald-400"></i> Prontuário Familiar nº {familia.cod_familiar}
            </h3>
            <p className="text-xs text-teal-200 mt-0.5 uppercase">
              Responsável: {familia.responsavel} • Município: {familia.municipio || 'CONCEIÇÃO DO TOCANTINS'} - {familia.uf || 'TO'} • Território: {familia.zona_territorio || 'Urbana'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow uppercase"
            >
              <i className="fa-solid fa-print"></i> Imprimir Prontuário
            </button>
            <button onClick={onClose} className="text-teal-200 hover:text-white text-xl px-2">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-gray-50/30">
          {/* Top Grid: Identificação do Responsável & Território (Esquerda) e Plano PAIF (Direita) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Identificação e Território */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <i className="fa-solid fa-id-card text-teal-700"></i> 1. Identificação e Território (SUAS)
              </h4>
              <div className="text-xs space-y-1 text-gray-700">
                <p><strong>Responsável:</strong> <span className="font-bold uppercase text-gray-900">{familia.responsavel}</span> ({familia.sexo_responsavel || 'Feminino'}, {familia.raca_cor_responsavel || 'Parda'})</p>
                {familia.nome_mae_responsavel && (
                  <p><strong>Nome da Mãe:</strong> <span className="uppercase text-gray-800">{familia.nome_mae_responsavel}</span></p>
                )}
                <p><strong>CPF:</strong> <span className="font-mono text-gray-900">{familia.cpf_responsavel ? maskCPF(familia.cpf_responsavel) : '—'}</span> • <strong>NIS:</strong> <span className="font-mono text-gray-900">{familia.nis_responsavel ? maskNIS(familia.nis_responsavel) : '—'}</span></p>
                <p className="uppercase"><strong>Endereço:</strong> {familia.logradouro}, nº {familia.numero || 'S/N'} {familia.complemento ? `(${familia.complemento})` : ''} — Bairro: {familia.bairro}</p>
                <p><strong>Território:</strong> <span className="font-bold text-teal-900 uppercase">{familia.zona_territorio || 'Urbana'}</span> {familia.ponto_referencia ? `(Ref: ${familia.ponto_referencia})` : ''}</p>
                <p><strong>Renda per capita:</strong> <strong className="text-emerald-700 font-mono text-xs font-bold">R$ {perCapitaVal.toFixed(2)}</strong> / integrante</p>
              </div>
            </div>

            {/* Box 2: Acompanhamento PAIF / PAF */}
            <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 shadow-sm space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-teal-200 pb-2">
                  <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-hand-holding-heart text-teal-700"></i> Plano de Acompanhamento (PAF)
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    familia.paif_ativo ? 'bg-teal-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {familia.paif_ativo ? 'PAIF ATIVO' : 'NÃO ACOMPANHADO'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-teal-950 mt-2">
                  <p><strong>Técnico(a) Referência:</strong> {familia.tecnico_referencia || 'NÃO DESIGNADO'}</p>
                  <p><strong>Data de Início:</strong> {familia.paif_data_inicio ? familia.paif_data_inicio.split('-').reverse().join('/') : '—'}</p>
                  {familia.paif_data_fim && (
                    <p className="text-red-800"><strong>Desligamento:</strong> {familia.paif_data_fim.split('-').reverse().join('/')} ({familia.paif_motivo_desligamento || 'Superação'})</p>
                  )}
                  <p className="text-[11px] leading-relaxed">
                    <strong>Potencialidades:</strong> {familia.paif_potencialidades || 'Vínculos familiares preservados e rede de apoio comunitário.'}
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Metas Pactuadas:</strong> {familia.paif_metas || 'Acompanhamento do acesso a direitos e participação em grupos do CRAS.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Composição Familiar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-users text-teal-700"></i> Composição Familiar ({totalIntegrantes} integrantes)
              </h4>

              <button
                onClick={() => setMostrarFormAdicionarMembro(!mostrarFormAdicionarMembro)}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow uppercase"
              >
                <i className={`fa-solid ${mostrarFormAdicionarMembro ? 'fa-minus' : 'fa-plus'}`}></i>
                {mostrarFormAdicionarMembro ? 'Cancelar' : 'Adicionar Integrante'}
              </button>
            </div>

            {/* Form Rápido de Novo Membro */}
            {mostrarFormAdicionarMembro && (
              <form onSubmit={handleAdicionarMembroRapido} className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-teal-900 uppercase flex items-center gap-1">
                  <i className="fa-solid fa-user-plus"></i> Novo Integrante da Família
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 relative">
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={novoMembroNome}
                      onChange={e => setNovoMembroNome(e.target.value.toUpperCase())}
                      placeholder="NOME DO INTEGRANTE..."
                      className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white font-semibold"
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
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">Parentesco</label>
                    <select
                      value={novoMembroParentesco}
                      onChange={e => setNovoMembroParentesco(e.target.value)}
                      required
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
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">Data Nascimento</label>
                    <input
                      type="date"
                      required
                      value={novoMembroNasc}
                      onChange={e => setNovoMembroNasc(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">CPF</label>
                    <input
                      type="text"
                      value={novoMembroCpf}
                      onChange={e => setNovoMembroCpf(maskCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">RG</label>
                    <input
                      type="text"
                      value={novoMembroRg}
                      onChange={e => setNovoMembroRg(e.target.value.toUpperCase())}
                      placeholder="EX: 00.000.000-0"
                      className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">Renda Individual (R$)</label>
                    <input
                      type="text"
                      value={novoMembroRenda}
                      onChange={e => setNovoMembroRenda(maskCurrency(e.target.value))}
                      placeholder="R$ 0,00"
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold text-emerald-800 bg-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-semibold text-teal-950 mb-1">Ocupação / CBO</label>
                    <input
                      type="text"
                      value={novoMembroOcupacao}
                      onChange={e => handleOcupacaoMembroChange(e.target.value)}
                      placeholder="DIGITE PARA BUSCAR CBO..."
                      className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white font-semibold"
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarFormAdicionarMembro(false)}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoMembro}
                    className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold shadow uppercase flex items-center gap-1"
                  >
                    <i className="fa-solid fa-save"></i>
                    {salvandoMembro ? 'Salvando...' : 'Salvar Integrante'}
                  </button>
                </div>
              </form>
            )}

            {/* Tabela de Membros */}
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left divide-y divide-gray-200">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Nome do Integrante</th>
                    <th className="p-3">Parentesco</th>
                    <th className="p-3">Idade</th>
                    <th className="p-3">CPF / NIS</th>
                    <th className="p-3">Ocupação / CBO</th>
                    <th className="p-3">Prog. Social</th>
                    <th className="p-3 text-right">Renda Indiv.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {/* Linha do Responsável */}
                  <tr className="bg-teal-50/40 font-semibold">
                    <td className="p-3">
                      <span className="uppercase text-gray-900 font-bold">{familia.responsavel}</span>
                    </td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-teal-200 text-teal-900 rounded font-bold text-[10px] uppercase">Responsável</span></td>
                    <td className="p-3">{calculateAge(familia.data_nascimento_responsavel || membroResp?.data_nascimento || '')} anos</td>
                    <td className="p-3 font-mono text-[11px]">{familia.cpf_responsavel ? maskCPF(familia.cpf_responsavel) : '—'}</td>
                    <td className="p-3 uppercase">{familia.ocupacao_responsavel || membroResp?.ocupacao || '—'}</td>
                    <td className="p-3 uppercase">{familia.programa_social_responsavel || 'Nenhum'}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800">R$ {rendaResp.toFixed(2)}</td>
                  </tr>

                  {/* Demais Membros */}
                  {outrosMembros.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <span className="uppercase font-medium text-gray-900">{m.nome}</span>
                        {m.possui_deficiencia && (
                          <span className="ml-2 px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold text-[9px]">PcD</span>
                        )}
                        {m.trabalho_infantil && (
                          <span className="ml-1 px-1.5 py-0.2 bg-red-100 text-red-900 rounded font-bold text-[9px]">Trab. Infantil</span>
                        )}
                      </td>
                      <td className="p-3 uppercase text-gray-600">{m.parentesco}</td>
                      <td className="p-3 text-gray-600">{m.idade} anos</td>
                      <td className="p-3 font-mono text-[11px] text-gray-600">{m.cpf ? maskCPF(m.cpf) : (m.nis ? maskNIS(m.nis) : '—')}</td>
                      <td className="p-3 uppercase text-gray-600">{m.ocupacao || '—'}</td>
                      <td className="p-3 uppercase text-gray-600">{m.programa_governo || 'Nenhum'}</td>
                      <td className="p-3 text-right font-mono font-semibold text-gray-900">R$ {(m.renda || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico de Atendimentos da Família */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <i className="fa-solid fa-clock-rotate-left text-teal-700"></i> Histórico de Atendimentos e Evoluções ({atendimentosFamilia.length})
            </h4>

            {atendimentosFamilia.length === 0 ? (
              <p className="text-gray-400 py-3 text-center">Nenhum atendimento registrado para esta família até o momento.</p>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {atendimentosFamilia.map(a => (
                  <div key={a.id} className="py-2.5 space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-gray-900">{a.tipo}</span>
                        <span className="text-[10px] text-gray-500">({a.local})</span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-500">
                        {a.data ? a.data.split('-').reverse().join('/') : '—'} às {a.hora}
                      </span>
                    </div>
                    <p className="text-gray-700 uppercase bg-gray-50 p-2 rounded leading-relaxed">{a.relato}</p>
                    <div className="text-[10px] text-teal-800 font-bold uppercase">
                      Técnico(a): {a.tecnico}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Benefícios Concedidos */}
          {beneficiosFamilia.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                <i className="fa-solid fa-box-open text-amber-700"></i> Benefícios Concedidos à Família ({beneficiosFamilia.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {beneficiosFamilia.map(b => (
                  <div key={b.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-amber-950 uppercase text-xs">{b.tipo}</strong>
                      <span className="font-mono text-[10px] text-gray-500">{b.data ? b.data.split('-').reverse().join('/') : '—'}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[9px] uppercase">
                      {b.status || 'Entregue'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
