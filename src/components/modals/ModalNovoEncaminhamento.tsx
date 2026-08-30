'use client'

import { useState, useEffect, useRef } from 'react'
import { Familia, Encaminhamento } from '@/types'
import { maskCPF } from '@/utils/masks'
import ModalAlerta, { AlertaConfig } from './ModalAlerta'

interface ModalNovoEncaminhamentoProps {
  familias: Familia[]
  usuarioLogadoNome: string
  onClose: () => void
  onSalvar: (encaminhamento: Partial<Encaminhamento>) => Promise<void>
}

export function ModalNovoEncaminhamento({
  familias = [],
  usuarioLogadoNome,
  onClose,
  onSalvar
}: ModalNovoEncaminhamentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState('')
  const [pessoaAtendida, setPessoaAtendida] = useState('')
  const [tipoRma, setTipoRma] = useState<string>('')
  const [destino, setDestino] = useState('')
  const [motivo, setMotivo] = useState('')
  const [dataEnvio, setDataEnvio] = useState(new Date().toISOString().split('T')[0])
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

  const sugestoesFamilias = familias.filter(f => {
    if (!buscaFamilia.trim()) return true
    const termo = buscaFamilia.toLowerCase().trim()
    const cpfLimpo = termo.replace(/\D/g, '')

    const bateResp = (f.responsavel || '').toLowerCase().includes(termo)
    const bateProntuario = (f.cod_familiar || '').toLowerCase().includes(termo)
    const bateCpf = cpfLimpo.length > 0 && (f.cpf_responsavel || '').replace(/\D/g, '').includes(cpfLimpo)
    const bateBairro = (f.bairro || '').toLowerCase().includes(termo)
    const bateMembro = (f.membros || []).some(m =>
      (m.nome || '').toLowerCase().includes(termo) ||
      (cpfLimpo.length > 0 && (m.cpf || '').replace(/\D/g, '').includes(cpfLimpo))
    )

    return bateResp || bateProntuario || bateCpf || bateBairro || bateMembro
  }).slice(0, 20)

  function selecionarFamilia(f: Familia) {
    setFamiliaId(f.id)
    setPessoaAtendida(f.responsavel)
    setBuscaFamilia('')
    setMostrarSugestoes(false)
  }

  function handleTipoRmaChange(tipo: string) {
    setTipoRma(tipo)
    if (tipo === 'inclusao_cadunico') {
      setDestino('Setor do Cadastro Único / Bolsa Família (Inclusão)')
    } else if (tipo === 'atualizacao_cadunico') {
      setDestino('Setor do Cadastro Único / Bolsa Família (Atualização)')
    } else if (tipo === 'acesso_bpc') {
      setDestino('INSS / Agência da Previdência Social (Acesso BPC)')
    } else if (tipo === 'creas') {
      setDestino('CREAS / Centro de Referência Especializado de Assistência Social')
    } else {
      setDestino('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familiaId) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, busque e selecione a Família / Responsável.' })
      return
    }
    if (!pessoaAtendida.trim()) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione quem é a Pessoa Atendida / Integrante Encaminhado(a).' })
      return
    }
    if (!tipoRma) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione a categoria do encaminhamento no RMA.' })
      return
    }
    if (!destino.trim()) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, informe o serviço ou órgão de destino.' })
      return
    }
    if (!dataEnvio) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, preencha a data de emissão.' })
      return
    }
    if (!motivo.trim()) {
      setAlertaModal({ tipo: 'aviso', titulo: 'JUSTIFICATIVA OBRIGATÓRIA', mensagem: 'Por favor, descreva o motivo e a justificativa técnica do encaminhamento.' })
      return
    }

    setSalvando(true)

    try {
      const novo: Partial<Encaminhamento> = {
        familia_id: familiaId,
        beneficiario: pessoaAtendida.trim().toUpperCase(),
        tipo_rma: (tipoRma as any) || 'outro',
        destino: destino.trim().toUpperCase(),
        motivo: motivo.trim().toUpperCase(),
        data_envio: dataEnvio,
        status: 'Pendente',
        tecnico: usuarioLogadoNome || 'Técnico CRAS'
      }

      await onSalvar(novo)
      onClose()
    } catch (err: any) {
      setAlertaModal({
        tipo: 'erro',
        titulo: 'ERRO AO ENCAMINHAR',
        mensagem: err.message || 'Ocorreu um erro ao registrar o encaminhamento. Tente novamente.'
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8 overflow-hidden flex flex-col">
        {/* Modal Header Padronizado */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-route text-emerald-400"></i> Novo Encaminhamento SUAS / Rede
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Guia oficial de encaminhamento para a rede socioassistencial e demais políticas públicas
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Busca / Autocomplete da Família */}
          <div ref={containerBuscaRef} className="relative">
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase flex items-center justify-between">
              <span>Família / Responsável Familiar <span className="text-red-600 font-bold">*</span></span>
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
                    ) : null}
                  </div>
                  <p className="text-[11px] text-teal-900 font-medium">
                    CPF: {familiaSelecionada.cpf_responsavel ? maskCPF(familiaSelecionada.cpf_responsavel) : '—'} • Prontuário: {familiaSelecionada.cod_familiar} • Bairro: {familiaSelecionada.bairro || '—'}
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
                    placeholder="DIGITE O NOME DO RESPONSÁVEL, INTEGRANTE, CPF OU PRONTUÁRIO..."
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-teal-700/30 focus:border-teal-700 rounded-xl text-xs uppercase font-semibold bg-white shadow-xs focus:outline-none"
                  />
                </div>

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
                            <strong className="text-gray-900 uppercase font-bold text-xs block">
                              {f.responsavel}
                            </strong>
                            <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                              Prontuário: <span className="font-mono text-teal-900 font-bold">{f.cod_familiar}</span> • CPF: {f.cpf_responsavel ? maskCPF(f.cpf_responsavel) : '—'} • {f.bairro || 'Zona Urbana'}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2.5 py-1 rounded-md shrink-0">
                            Selecionar
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pessoa Atendida / Integrante Encaminhado(a) */}
          {familiaSelecionada && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-user-tag text-emerald-700"></i> Pessoa Atendida / Integrante Encaminhado(a) <span className="text-red-600 font-bold">*</span>
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
                {familiaSelecionada.membros && familiaSelecionada.membros
                  .filter(m => m.nome.trim().toUpperCase() !== familiaSelecionada.responsavel.trim().toUpperCase())
                  .map(m => (
                    <option key={m.id || m.nome} value={m.nome}>
                      {m.nome} ({m.parentesco || 'Integrante'}{m.cpf ? ` — CPF: ${maskCPF(m.cpf)}` : ''})
                    </option>
                ))}
              </select>
              <p className="text-[10px] text-emerald-800 font-medium">
                Indique qual integrante específico da família está sendo encaminhado para o serviço externo.
              </p>
            </div>
          )}

          {/* Categorização no RMA (Bloco 2) */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-rose-950 uppercase">
              Categorização no RMA Oficial (Bloco 2 - C.2 a C.5) <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={tipoRma}
              onChange={e => handleTipoRmaChange(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold uppercase text-rose-950"
            >
              <option value="">SELECIONE O TIPO NO RMA *</option>
              <option value="inclusao_cadunico">Item C.2 — Encaminhamento para INCLUSÃO no Cadastro Único</option>
              <option value="atualizacao_cadunico">Item C.3 — Encaminhamento para ATUALIZAÇÃO no Cadastro Único</option>
              <option value="acesso_bpc">Item C.4 — Encaminhamento para ACESSO AO BPC (INSS)</option>
              <option value="creas">Item C.5 — Encaminhamento para o CREAS (Proteção Especial)</option>
              <option value="outro">Outro Encaminhamento (Saúde, Educação, Habitação, etc.)</option>
            </select>
          </div>

          {/* Destino */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Órgão / Serviço de Destino <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={destino}
              onChange={e => setDestino(e.target.value.toUpperCase())}
              placeholder="EX: SECRETARIA MUNICIPAL DE SAÚDE, CONSELHO TUTELAR..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-medium bg-white"
            />
          </div>

          {/* Data de Emissão */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Data de Emissão / Envio <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="date"
              required
              value={dataEnvio}
              onChange={e => setDataEnvio(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
            />
          </div>

          {/* Motivo e Justificativa Técnica */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Motivo e Justificativa Técnica do Encaminhamento <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={motivo}
              onChange={e => setMotivo(e.target.value.toUpperCase())}
              placeholder="DESCREVA A DEMANDA IDENTIFICADA, A FINALIDADE DO ENCAMINHAMENTO E O SERVIÇO OU BENEFÍCIO SOLICITADO..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Footer */}
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
              disabled={salvando}
              className="px-6 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5"
            >
              <i className="fa-solid fa-paper-plane"></i>
              {salvando ? 'Salvando...' : 'Emitir Encaminhamento'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Alerta / Validação */}
      <ModalAlerta alerta={alertaModal} onClose={() => setAlertaModal(null)} />
    </div>
  )
}
