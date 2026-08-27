'use client'

import { useState, useEffect } from 'react'
import { Encaminhamento } from '@/types'

interface ModalEditarEncaminhamentoProps {
  encaminhamento: Encaminhamento
  onClose: () => void
  onSalvar: (id: string, updates: Partial<Encaminhamento>) => Promise<void>
}

export function ModalEditarEncaminhamento({
  encaminhamento,
  onClose,
  onSalvar
}: ModalEditarEncaminhamentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [tipoRma, setTipoRma] = useState<string>(encaminhamento.tipo_rma || 'outro')
  const [destino, setDestino] = useState(encaminhamento.destino || '')
  const [motivo, setMotivo] = useState(encaminhamento.motivo || '')
  const [dataEnvio, setDataEnvio] = useState(encaminhamento.data_envio || '')
  const [status, setStatus] = useState<string>(encaminhamento.status || 'Pendente')
  const [resposta, setResposta] = useState(encaminhamento.resposta || '')

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
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!destino.trim()) return alert('Informe o serviço de destino.')
    if (!dataEnvio) return alert('Informe a data de emissão.')
    if (!motivo.trim()) return alert('Informe o motivo do encaminhamento.')

    setSalvando(true)
    try {
      await onSalvar(encaminhamento.id, {
        tipo_rma: tipoRma as any,
        destino: destino.trim().toUpperCase(),
        motivo: motivo.trim().toUpperCase(),
        data_envio: dataEnvio,
        status: status,
        resposta: resposta.trim().toUpperCase()
      })
      onClose()
    } catch (err: any) {
      alert('Erro ao atualizar encaminhamento: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 overflow-hidden flex flex-col border border-rose-100">
        
        {/* Modal Header */}
        <div className="bg-rose-950 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-pen-to-square text-rose-400"></i> Editar Encaminhamento Intersetorial
            </h3>
            <p className="text-[11px] text-rose-200 mt-0.5">
              Beneficiário: <strong className="text-white uppercase">{encaminhamento.beneficiario}</strong>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white transition flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Categorização no RMA (Bloco 2) */}
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-rose-950 uppercase">
              Categorização no RMA Oficial (Bloco 2 - C.2 a C.5)
            </label>
            <select
              value={tipoRma}
              onChange={e => handleTipoRmaChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-rose-900"
            >
              <option value="inclusao_cadunico">C.2 - Encaminhamento para Inclusão no Cadastro Único</option>
              <option value="atualizacao_cadunico">C.3 - Encaminhamento para Atualização no Cadastro Único</option>
              <option value="acesso_bpc">C.4 - Encaminhamento para Acesso ao BPC / INSS</option>
              <option value="creas">C.5 - Encaminhamento para o CREAS (Proteção Especial)</option>
              <option value="outro">Demais Encaminhamentos da Rede (Saúde, Educação, Habitação, etc.)</option>
            </select>
          </div>

          {/* Órgão / Destino */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
              Órgão / Serviço de Destino <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={destino}
              onChange={e => setDestino(e.target.value)}
              placeholder="EX: SECRETARIA MUNICIPAL DE SAÚDE / POSTO DE SAÚDE"
              required
              className="w-full px-3 py-2 border rounded-lg text-xs font-bold uppercase focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700"
            />
          </div>

          {/* Data de Envio & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                Data de Emissão / Envio <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                value={dataEnvio}
                onChange={e => setDataEnvio(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                Situação / Status <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-extrabold uppercase ${
                  status === 'Respondido' || status === 'Concluído'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <option value="Pendente">PENDENTE DE RESPOSTA</option>
                <option value="Respondido">RESPONDIDO / CONCLUÍDO</option>
              </select>
            </div>
          </div>

          {/* Motivo do Encaminhamento */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
              Motivo e Justificativa Técnica <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="DESCREVA O MOTIVO E A JUSTIFICATIVA TÉCNICA..."
              required
              className="w-full p-3 border rounded-xl text-xs uppercase font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700"
            />
          </div>

          {/* Devolutiva / Resposta do Órgão Destinatário */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-gray-800 uppercase flex items-center justify-between">
              <span>Devolutiva / Contrarreferência do Órgão Destinatário</span>
              {status === 'Respondido' && (
                <span className="text-[10px] text-emerald-700 font-black flex items-center gap-1">
                  <i className="fa-solid fa-circle-check"></i> RESPOSTA REGISTRADA
                </span>
              )}
            </label>
            <textarea
              rows={3}
              value={resposta}
              onChange={e => setResposta(e.target.value)}
              placeholder="REGISTRE O RETORNO DA INSTITUIÇÃO DESTINATÁRIA (EX: USUÁRIO ATENDIDO E INCLUÍDO NO PROGRAMA X NA DATA Y)..."
              className="w-full p-3 border rounded-xl text-xs uppercase font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700 bg-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Salvando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Salvar Alterações
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
