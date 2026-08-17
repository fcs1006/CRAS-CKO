'use client'

import { useState } from 'react'
import { Familia, Encaminhamento } from '@/types'

interface ModalNovoEncaminhamentoProps {
  familias: Familia[]
  usuarioLogadoNome: string
  onClose: () => void
  onSalvar: (encaminhamento: Partial<Encaminhamento>) => Promise<void>
}

export function ModalNovoEncaminhamento({
  familias,
  usuarioLogadoNome,
  onClose,
  onSalvar
}: ModalNovoEncaminhamentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState('')
  const [tipoRma, setTipoRma] = useState<string>('')
  const [destino, setDestino] = useState('')
  const [motivo, setMotivo] = useState('')
  const [dataEnvio, setDataEnvio] = useState('')

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
    if (!familiaId) return alert('Selecione a família encaminhada.')
    if (!tipoRma) return alert('Selecione a categoria do encaminhamento no RMA.')
    if (!destino) return alert('Selecione o serviço de destino.')
    if (!dataEnvio) return alert('Preencha a data de emissão.')
    if (!motivo.trim()) return alert('Preencha o motivo do encaminhamento.')

    setSalvando(true)

    const fam = familias.find(f => f.id === familiaId)

    try {
      const novo: Partial<Encaminhamento> = {
        familia_id: familiaId,
        beneficiario: fam?.responsavel || 'Beneficiário',
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
      alert('Erro ao registrar encaminhamento: ' + (err.message || 'Tente novamente.'))
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
          {/* Família */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Família / Beneficiário <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={familiaId}
              onChange={e => setFamiliaId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE A FAMÍLIA *</option>
              {familias.map(f => (
                <option key={f.id} value={f.id}>
                  {f.responsavel} — PRONTUÁRIO Nº: {f.cod_familiar} (CPF: {f.cpf_responsavel || '—'})
                </option>
              ))}
            </select>
          </div>

          {/* Categorização no RMA (Bloco 2) */}
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-rose-950 uppercase">
              Categorização no RMA Oficial (Bloco 2 - C.2 a C.5) <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={tipoRma}
              onChange={e => handleTipoRmaChange(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold uppercase text-rose-950"
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Órgão / Serviço de Destino <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={destino}
              onChange={e => setDestino(e.target.value)}
              placeholder="EX: SECRETARIA MUNICIPAL DE SAÚDE, ESCOLA MUNICIPAL..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Data de Emissão <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="date"
              required
              value={dataEnvio}
              onChange={e => setDataEnvio(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Justificativa / Motivo do Encaminhamento <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value.toUpperCase())}
              placeholder="DESCREVA A NECESSIDADE TÉCNICA E A FINALIDADE DO ENCAMINHAMENTO..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
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
              className="px-6 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5"
            >
              <i className="fa-solid fa-paper-plane"></i>
              {salvando ? 'Emitindo...' : 'Emitir Encaminhamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
