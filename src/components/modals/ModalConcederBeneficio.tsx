'use client'

import { useState, useEffect, useRef } from 'react'
import { Familia, BeneficioConcedido, AlmoxarifadoItem, Usuario, Configuracao } from '@/types'
import { ConteudoTermoBeneficio } from '@/components/painel/BeneficiosView'
import { maskCPF } from '@/utils/masks'
import ModalAlerta, { AlertaConfig } from './ModalAlerta'

interface ModalConcederBeneficioProps {
  familias: Familia[]
  almoxarifado: AlmoxarifadoItem[]
  usuarios?: Usuario[]
  usuarioLogadoNome?: string
  configuracao?: Configuracao
  onClose: () => void
  onSalvar: (beneficio: Partial<BeneficioConcedido>) => Promise<void>
}

export function ModalConcederBeneficio({
  familias,
  almoxarifado,
  usuarios = [],
  usuarioLogadoNome,
  configuracao,
  onClose,
  onSalvar
}: ModalConcederBeneficioProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState('')
  const [pessoaAtendida, setPessoaAtendida] = useState('')
  const [situacaoBeneficio, setSituacaoBeneficio] = useState<string>('')
  const [tipo, setTipo] = useState('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [tecnico, setTecnico] = useState(usuarioLogadoNome || '')
  const [parecerSocial, setParecerSocial] = useState('')
  const [observacao, setObservacao] = useState('')
  const [beneficioConcedidoImprimir, setBeneficioConcedidoImprimir] = useState<Partial<BeneficioConcedido> | null>(null)
  const [alertaModal, setAlertaModal] = useState<AlertaConfig | null>(null)

  // Busca e Autocomplete de Família / Prontuário
  const [buscaFamilia, setBuscaFamilia] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const containerBuscaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerBuscaRef.current && !containerBuscaRef.current.contains(event.target as Node)) {
        setMostrarSugestoes(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const familiaSelecionada = familias.find(f => f.id === familiaId)
  const membrosFamiliares = familiaSelecionada?.membros || []
  const itemEstoque = almoxarifado.find(a => a.tipo === tipo)
  const saldoInsuficiente = tipo && itemEstoque ? itemEstoque.saldo < (quantidade || 1) : false

  // Filtragem de famílias em tempo real para busca escrita
  const sugestoesFamilias = familias.filter(f => {
    if (!buscaFamilia.trim()) return true
    const termo = buscaFamilia.toLowerCase().trim()
    const cpfLimpo = termo.replace(/\D/g, '')

    const bateResp = (f.responsavel || '').toLowerCase().includes(termo)
    const bateProntuario = (f.cod_familiar || '').toLowerCase().includes(termo)
    const bateCpf = cpfLimpo.length > 0 && (f.cpf_responsavel || '').replace(/\D/g, '').includes(cpfLimpo)
    const bateBairro = (f.bairro || '').toLowerCase().includes(termo)
    const bateLogradouro = (f.logradouro || '').toLowerCase().includes(termo)
    const bateMembro = (f.membros || []).some(m =>
      (m.nome || '').toLowerCase().includes(termo) ||
      (cpfLimpo.length > 0 && (m.cpf || '').replace(/\D/g, '').includes(cpfLimpo))
    )

    return bateResp || bateProntuario || bateCpf || bateBairro || bateLogradouro || bateMembro
  }).slice(0, 20)

  function selecionarFamilia(f: Familia) {
    setFamiliaId(f.id)
    setPessoaAtendida(f.responsavel)
    setBuscaFamilia('')
    setMostrarSugestoes(false)
  }

  function handleSituacaoChange(sit: string) {
    setSituacaoBeneficio(sit)
    setTipo('')
  }

  function getCategoriaRma(sit: string): 'auxilio_natalidade' | 'auxilio_funeral' | 'outros_eventuais' {
    if (sit === 'Situação de nascimento') return 'auxilio_natalidade'
    if (sit === 'Situação de morte') return 'auxilio_funeral'
    return 'outros_eventuais'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familiaId) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione a família beneficiária.' })
      return
    }
    if (!situacaoBeneficio) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione a situação normativa do benefício (LOAS / SUAS).' })
      return
    }
    if (!tipo) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione o item/provisão a ser concedido.' })
      return
    }
    if (!data) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, preencha a data da concessão.' })
      return
    }
    if (!tecnico) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione o técnico responsável pela concessão.' })
      return
    }
    if (!parecerSocial.trim()) {
      setAlertaModal({ tipo: 'aviso', titulo: 'PARECER OBRIGATÓRIO', mensagem: 'O Parecer Social / Justificativa Técnica é obrigatório para a concessão do benefício eventual.' })
      return
    }
    if (saldoInsuficiente) {
      setAlertaModal({ tipo: 'erro', titulo: 'ESTOQUE INSUFICIENTE', mensagem: 'Saldo insuficiente em estoque no almoxarifado para atender esta concessão.' })
      return
    }

    setSalvando(true)

    const tecnicoObj = usuarios.find(u => u.nome === tecnico || u.usuario === tecnico)
    const conselhoInfo = tecnicoObj?.conselho && tecnicoObj.conselho !== 'Não aplicável' ? tecnicoObj.conselho : undefined
    const catRma = getCategoriaRma(situacaoBeneficio)
    const solicitanteFinal = (pessoaAtendida || familiaSelecionada?.responsavel || '').trim().toUpperCase()

    const novoPayload: Partial<BeneficioConcedido> = {
      familia_id: familiaId,
      solicitante: solicitanteFinal,
      data,
      tipo,
      categoria_rma: catRma,
      quantidade: Number(quantidade) || 1,
      tecnico_responsavel: tecnico.trim().toUpperCase(),
      tecnico_conselho: conselhoInfo,
      parecer_social: parecerSocial.trim().toUpperCase() || undefined,
      status: 'Entregue',
      observacao: `PESSOA ATENDIDA / SOLICITANTE: ${solicitanteFinal} | SITUAÇÃO: ${situacaoBeneficio.toUpperCase()}${observacao ? ` | OBS: ${observacao.trim().toUpperCase()}` : ''}`
    }

    try {
      await onSalvar(novoPayload)
      setBeneficioConcedidoImprimir(novoPayload)
      setTimeout(() => {
        window.print()
        onClose()
      }, 150)
    } catch (err: any) {
      setAlertaModal({
        tipo: 'erro',
        titulo: 'ERRO NA CONCESSÃO',
        mensagem: err.message || 'Ocorreu um erro ao conceder o benefício. Tente novamente.'
      })
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:w-full">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh] print:hidden">
        {/* Modal Header Padronizado */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-gift text-emerald-400"></i> Concessão de Benefício Eventual (SUAS / LOAS)
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Provisões suplementares para situações de nascimento, morte, vulnerabilidade temporária e calamidade
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Seleção da Família por Busca Escrita / Autocomplete */}
          <div ref={containerBuscaRef} className="relative">
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase flex items-center justify-between">
              <span>Família / Responsável Beneficiário <span className="text-red-600 font-bold">*</span></span>
              {familiaSelecionada && (
                <span className="text-[10px] text-gray-500 font-normal">
                  Prontuário Nº {familiaSelecionada.cod_familiar}
                </span>
              )}
            </label>

            {familiaSelecionada ? (
              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm font-extrabold text-teal-950 uppercase">
                      {familiaSelecionada.responsavel}
                    </strong>
                    {familiaSelecionada.paif_ativo ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                        <i className="fa-solid fa-circle-check mr-1 text-emerald-700"></i> PAIF Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 border border-gray-300 uppercase">
                        Sem Acompanhamento PAIF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-teal-900 font-medium">
                    CPF: {familiaSelecionada.cpf_responsavel ? maskCPF(familiaSelecionada.cpf_responsavel) : '—'} • Prontuário nº {familiaSelecionada.cod_familiar} • Bairro: {familiaSelecionada.bairro || '—'} ({familiaSelecionada.zona_territorio || 'Urbana'})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFamiliaId('')
                    setPessoaAtendida('')
                    setBuscaFamilia('')
                    setMostrarSugestoes(true)
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <i className="fa-solid fa-arrows-rotate"></i> Trocar Família
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-teal-700 text-xs"></i>
                  <input
                    type="text"
                    value={buscaFamilia}
                    onChange={e => {
                      setBuscaFamilia(e.target.value)
                      setMostrarSugestoes(true)
                    }}
                    onFocus={() => setMostrarSugestoes(true)}
                    placeholder="DIGITE O NOME DO RESPONSÁVEL, INTEGRANTE, CPF OU Nº DO PRONTUÁRIO..."
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-teal-700/30 focus:border-teal-700 rounded-xl text-xs uppercase font-semibold bg-white shadow-xs focus:outline-none"
                  />
                </div>

                {/* Dropdown com resultados filtrados */}
                {mostrarSugestoes && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-gray-100">
                    {sugestoesFamilias.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 font-medium">
                        Nenhuma família encontrada para "{buscaFamilia}".
                      </div>
                    ) : (
                      sugestoesFamilias.map(f => (
                        <div
                          key={f.id}
                          onClick={() => selecionarFamilia(f)}
                          className="p-3 hover:bg-teal-50/70 transition cursor-pointer flex justify-between items-center gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-gray-900 uppercase font-bold text-xs">
                                {f.responsavel}
                              </strong>
                              {f.paif_ativo ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase">
                                  PAIF
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                              Prontuário: <span className="font-mono text-teal-900 font-bold">{f.cod_familiar}</span> • CPF: {f.cpf_responsavel ? maskCPF(f.cpf_responsavel) : '—'} • {f.bairro || 'Zona Urbana'}
                            </p>
                          </div>
                          <span className="text-[10px] text-teal-700 font-bold uppercase flex items-center gap-1 bg-teal-100/70 px-2 py-1 rounded-md shrink-0">
                            Selecionar <i className="fa-solid fa-chevron-right text-[9px]"></i>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pessoa Atendida / Solicitante Direto */}
          {familiaSelecionada && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-user-tag text-emerald-700"></i> Pessoa Atendida / Solicitante Direto do Benefício <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={pessoaAtendida}
                onChange={e => setPessoaAtendida(e.target.value)}
                required
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-white font-bold uppercase text-emerald-950"
              >
                <option value={familiaSelecionada.responsavel}>
                  {familiaSelecionada.responsavel} (Responsável Familiar - CPF: {familiaSelecionada.cpf_responsavel ? maskCPF(familiaSelecionada.cpf_responsavel) : '—'})
                </option>
                {membrosFamiliares
                  .filter(m => m.nome.trim().toUpperCase() !== familiaSelecionada.responsavel.trim().toUpperCase())
                  .map(m => (
                    <option key={m.id || m.nome} value={m.nome}>
                      {m.nome} ({m.parentesco || 'Integrante'}{m.cpf ? ` — CPF: ${maskCPF(m.cpf)}` : ''})
                    </option>
                ))}
              </select>
              <p className="text-[10px] text-emerald-800 font-medium">
                Indique quem é o integrante específico da família solicitando ou recebendo o benefício direto.
              </p>
            </div>
          )}

          {/* As 4 Situações Oficiais de Benefício Eventual */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-teal-950 uppercase">
              Situação Normativa do Benefício Eventual (LOAS / SUAS) <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={situacaoBeneficio}
              onChange={e => handleSituacaoChange(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold uppercase text-teal-950"
            >
              <option value="">SELECIONE A SITUAÇÃO DO BENEFÍCIO *</option>
              <option value="Situação de nascimento">◼ Situação de nascimento (Auxílio-Natalidade — RMA C.7)</option>
              <option value="Situação de morte">◼ Situação de morte (Auxílio-Funeral — RMA C.8)</option>
              <option value="Situação de vulnerabilidade temporária">◼ Situação de vulnerabilidade temporária (RMA C.9)</option>
              <option value="Situação de calamidade">◼ Situação de calamidade (Calamidade Pública — RMA C.9)</option>
            </select>
          </div>

          {/* Item / Provisão Concedida */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Item / Provisão Concedida <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE O ITEM / PROVISÃO *</option>
              {situacaoBeneficio === 'Situação de nascimento' && (
                <>
                  <option value="Enxoval de Bebê / Auxílio Natalidade">Enxoval de Bebê / Kit Recém-Nascido</option>
                  <option value="Auxílio Natalidade em Pecúnia">Auxílio Natalidade em Pecúnia (Financeiro)</option>
                  <option value="Outro Item de Apoio ao Nascimento">Outro Item de Apoio ao Nascimento</option>
                </>
              )}
              {situacaoBeneficio === 'Situação de morte' && (
                <>
                  <option value="Auxílio Funeral">Urna Funerária / Custeio Funeral</option>
                  <option value="Translado e Sepultamento">Translado / Sepultamento</option>
                  <option value="Outro Item de Apoio Funeral">Outro Item de Apoio Funeral</option>
                </>
              )}
              {situacaoBeneficio === 'Situação de vulnerabilidade temporária' && (
                <>
                  <option value="Cesta Básica / Provisão de Alimentos">Cesta Básica / Provisão de Alimentos</option>
                  <option value="Colchão / Cobertor / Cama">Colchão / Cobertor / Roupas de Cama</option>
                  <option value="Kit Higiene e Limpeza">Kit Higiene e Limpeza</option>
                  <option value="Filtro de Barro / Utensílio">Filtro de Barro / Utensílio Básico</option>
                  <option value="Passagem / Auxílio Deslocamento">Passagem Terrestre / Auxílio Deslocamento</option>
                  <option value="Documentação Civil Básica">Isenção / Apoio para 2ª Via de Documentos</option>
                  <option value="Aluguel Social / Acolhimento Emergencial">Aluguel Social / Provisão Habitacional Emergencial</option>
                  <option value="Outros Benefícios Eventuais">Outro Item de Apoio à Vulnerabilidade Temporária</option>
                </>
              )}
              {situacaoBeneficio === 'Situação de calamidade' && (
                <>
                  <option value="Kit Emergencial Calamidade (Alimento + Água + Higiene)">Kit Emergencial Calamidade (Alimento + Água + Higiene)</option>
                  <option value="Colchões e Cobertores de Emergência">Colchões e Cobertores de Emergência</option>
                  <option value="Lonas / Materiais Emergenciais de Abrigo">Lonas / Materiais Emergenciais de Abrigo</option>
                  <option value="Auxílio Desabrigados / Calamidade">Auxílio Emergencial a Desabrigados</option>
                  <option value="Outro Apoio a Desastres / Calamidade">Outro Apoio a Desastres / Calamidade</option>
                </>
              )}
            </select>
          </div>

          {/* Quantidade e Saldo em Almoxarifado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantidade Concedida <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantidade}
                onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-500 font-semibold uppercase block">Controle de Almoxarifado</span>
              {tipo && itemEstoque ? (
                <div className="flex justify-between items-center mt-0.5">
                  <span className="font-bold text-gray-800 text-xs">Saldo em Estoque:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-black ${saldoInsuficiente ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                    {itemEstoque.saldo} {itemEstoque.unidade}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 italic">Item não controlado por estoque físico</span>
              )}
            </div>
          </div>

          {saldoInsuficiente && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-red-600"></i>
              Atenção: A quantidade solicitada ({quantidade}) é superior ao saldo disponível em estoque ({itemEstoque?.saldo}).
            </div>
          )}

          {/* Data e Técnico Concessor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Data da Concessão <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Técnico(a) Concessor(a) <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={tecnico}
                onChange={e => setTecnico(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
              >
                <option value="">SELECIONE O TÉCNICO *</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.nome}>
                    {u.nome} ({u.cargo || 'Técnico'} {u.conselho && u.conselho !== 'Não aplicável' ? `— ${u.conselho}` : ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parecer Social Técnico / Justificativa LOAS */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Parecer Técnico Social / Justificativa da Concessão <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={parecerSocial}
              onChange={e => setParecerSocial(e.target.value.toUpperCase())}
              placeholder="DESCREVA AVALIAÇÃO DA VULNERABILIDADE TEMPORÁRIA, EVENTO GERADOR DA DEMANDA E ENQUADRAMENTO NORMATIVO NA RESOLUÇÃO MUNICIPAL / LOAS..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Observações Complementares */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Observações Complementares (opcional)
            </label>
            <input
              type="text"
              value={observacao}
              onChange={e => setObservacao(e.target.value.toUpperCase())}
              placeholder="EX: RETIRADO PELO CÔNJUGE MEDIANTE APRESENTAÇÃO DE DOCUMENTO ORIGINAL"
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white"
            />
          </div>

          {/* Footer Padronizado */}
          <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || saldoInsuficiente}
              className={`px-6 py-2 ${saldoInsuficiente ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-800 hover:bg-teal-900'} text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5`}
            >
              <i className="fa-solid fa-gift"></i>
              {salvando ? 'Concedendo...' : 'Conceder Benefício e Gerar Termo'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Alerta / Validação Estilizado */}
      <ModalAlerta alerta={alertaModal} onClose={() => setAlertaModal(null)} />

      {/* Área de Impressão Direta do Termo de Benefício */}
      {beneficioConcedidoImprimir && (
        <div className="hidden print:block print:w-full print-document-area">
          <ConteudoTermoBeneficio b={beneficioConcedidoImprimir as BeneficioConcedido} configuracao={configuracao} familias={familias} />
        </div>
      )}
    </div>
  )
}
