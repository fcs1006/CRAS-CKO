'use client'

import { useState, useEffect, useRef } from 'react'
import { Familia, AgendaItem, Usuario } from '@/types'
import { maskCPF } from '@/utils/masks'
import ModalAlerta, { AlertaConfig } from './ModalAlerta'

interface ModalNovoAgendamentoProps {
  familias: Familia[]
  usuarios: Usuario[]
  usuarioLogadoNome: string
  onClose: () => void
  onSalvar: (agendamento: Partial<AgendaItem>) => Promise<void>
}

export function ModalNovoAgendamento({
  familias,
  usuarios,
  usuarioLogadoNome,
  onClose,
  onSalvar
}: ModalNovoAgendamentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState('')
  const [tipo, setTipo] = useState<string>('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState('')
  const [tecnico, setTecnico] = useState(usuarioLogadoNome || '')
  const [descricao, setDescricao] = useState('')
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

  // Filtragem de famílias em tempo real
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
    setBuscaFamilia('')
    setMostrarSugestoes(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familiaId) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione a família a ser agendada.' })
      return
    }
    if (!tipo) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione o tipo de compromisso.' })
      return
    }
    if (!data) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, informe a data prevista do agendamento.' })
      return
    }
    if (!hora) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, informe o horário do agendamento.' })
      return
    }
    if (!tecnico) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, selecione o técnico responsável.' })
      return
    }

    setSalvando(true)
    const fam = familias.find(f => f.id === familiaId)

    try {
      const novo: Partial<AgendaItem> = {
        familia_id: familiaId,
        responsavel: fam?.responsavel || 'Responsável Familiar',
        bairro: fam?.bairro || '',
        data,
        hora,
        tipo: (tipo as 'Atendimento' | 'Visita Domiciliar') || 'Atendimento',
        tecnico: tecnico.trim().toUpperCase(),
        descricao: descricao.trim().toUpperCase(),
        status: 'Agendado'
      }

      await onSalvar(novo)
      onClose()
    } catch (err: any) {
      setAlertaModal({
        tipo: 'erro',
        titulo: 'ERRO NO AGENDAMENTO',
        mensagem: err.message || 'Ocorreu um erro ao criar o agendamento. Tente novamente.'
      })
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-regular fa-calendar-plus text-emerald-400"></i> Novo Agendamento Técnico
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Agendamento de atendimentos no CRAS ou visitas domiciliares
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Seleção da Família por Busca Escrita / Autocomplete */}
          <div ref={containerBuscaRef} className="relative">
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase flex items-center justify-between">
              <span>Família / Prontuário SUAS <span className="text-red-600 font-bold">*</span></span>
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

          {/* Tipo de Agendamento */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tipo de Compromisso <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE O TIPO DE COMPROMISSO *</option>
              <option value="Atendimento">Atendimento Particularizado (na Unidade)</option>
              <option value="Visita Domiciliar">Visita Domiciliar (no Território)</option>
            </select>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Data Prevista <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Horário <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Técnico Responsável */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Técnico(a) Responsável <span className="text-red-600 font-bold">*</span>
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
                  {u.nome} ({u.cargo || 'Técnico'})
                </option>
              ))}
            </select>
          </div>

          {/* Descrição / Motivo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motivo / Observações do Agendamento (opcional)
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value.toUpperCase())}
              placeholder="DESCREVA O OBJETIVO DO AGENDAMENTO (EX: ATUALIZAÇÃO DO PLANO DE ACOMPANHAMENTO FAMILIAR / VISITA PARA AVERIGUAÇÃO HABITACIONAL)..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t flex justify-end gap-2">
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
              <i className="fa-regular fa-calendar-check"></i>
              {salvando ? 'Salvando...' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Alerta / Validação */}
      <ModalAlerta alerta={alertaModal} onClose={() => setAlertaModal(null)} />
    </div>
  )
}