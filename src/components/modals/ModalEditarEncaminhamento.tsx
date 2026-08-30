'use client'

import { useState } from 'react'
import { Encaminhamento, Familia } from '@/types'
import { maskCPF } from '@/utils/masks'
import ModalAlerta, { AlertaConfig } from './ModalAlerta'

interface ModalEditarEncaminhamentoProps {
  encaminhamento: Encaminhamento
  familias?: Familia[]
  onClose: () => void
  onSalvar: (id: string, updates: Partial<Encaminhamento>) => Promise<void>
}

export function ModalEditarEncaminhamento({
  encaminhamento,
  familias = [],
  onClose,
  onSalvar
}: ModalEditarEncaminhamentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [beneficiario, setBeneficiario] = useState(encaminhamento.beneficiario || '')
  const [tipoRma, setTipoRma] = useState<string>(encaminhamento.tipo_rma || 'outro')
  const [destino, setDestino] = useState(encaminhamento.destino || '')
  const [motivo, setMotivo] = useState(encaminhamento.motivo || '')
  const [dataEnvio, setDataEnvio] = useState(encaminhamento.data_envio || '')
  const [status, setStatus] = useState<string>(encaminhamento.status || 'Pendente')
  const [resposta, setResposta] = useState(encaminhamento.resposta || '')
  const [alertaModal, setAlertaModal] = useState<AlertaConfig | null>(null)

  const fam = familias.find(f => f.id === encaminhamento.familia_id || f.cod_familiar === encaminhamento.familia_id)

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
    if (!beneficiario.trim()) {
      setAlertaModal({ tipo: 'aviso', titulo: 'CAMPO OBRIGATÓRIO', mensagem: 'Por favor, informe a pessoa/integrante encaminhado(a).' })
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
      setAlertaModal({ tipo: 'aviso', titulo: 'JUSTIFICATIVA OBRIGATÓRIA', mensagem: 'Por favor, preencha o motivo do encaminhamento.' })
      return
    }

    setSalvando(true)
    try {
      await onSalvar(encaminhamento.id, {
        beneficiario: beneficiario.trim().toUpperCase(),
        tipo_rma: tipoRma as any,
        destino: destino.trim().toUpperCase(),
        motivo: motivo.trim().toUpperCase(),
        data_envio: dataEnvio,
        status: status,
        resposta: resposta.trim().toUpperCase()
      })
      onClose()
    } catch (err: any) {
      setAlertaModal({
        tipo: 'erro',
        titulo: 'ERRO AO ATUALIZAR',
        mensagem: err.message || 'Ocorreu um erro ao atualizar o encaminhamento. Tente novamente.'
      })
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
              Família: <strong className="text-white uppercase">{fam?.responsavel || encaminhamento.responsavel_nome || '—'}</strong>
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
          
          {/* Seleção do Integrante Encaminhado */}
          {fam ? (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-user-tag text-emerald-700"></i> Pessoa Atendida / Integrante Encaminhado(a) <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={beneficiario}
                onChange={e => setBeneficiario(e.target.value)}
                required
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-white font-bold uppercase text-emerald-950"
              >
                <option value={fam.responsavel}>
                  {fam.responsavel} (Responsável Familiar - CPF: {fam.cpf_responsavel ? maskCPF(fam.cpf_responsavel) : '—'})
                </option>
                {fam.membros && fam.membros
                  .filter(m => m.nome.trim().toUpperCase() !== fam.responsavel.trim().toUpperCase())
                  .map(m => (
                    <option key={m.id || m.nome} value={m.nome}>
                      {m.nome} ({m.parentesco || 'Integrante'}{m.cpf ? ` — CPF: ${maskCPF(m.cpf)}` : ''})
                    </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Pessoa Atendida / Integrante Encaminhado(a) <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                value={beneficiario}
                onChange={e => setBeneficiario(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold uppercase bg-white"
              />
            </div>
          )}

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
              onChange={e => setDestino(e.target.value.toUpperCase())}
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
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold uppercase bg-white text-gray-800"
              >
                <option value="Pendente">PENDENTE / AGUARDANDO DEVOLUTIVA</option>
                <option value="Respondido">RESPONDIDO / EM ANDAMENTO</option>
                <option value="Concluído">CONCLUÍDO / ATENDIDO NA REDE</option>
                <option value="Não Atendido">NÃO ATENDIDO / RECUSADO</option>
              </select>
            </div>
          </div>

          {/* Motivo e Justificativa */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
              Motivo e Justificativa Técnica do Encaminhamento <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              rows={4}
              value={motivo}
              onChange={e => setMotivo(e.target.value.toUpperCase())}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase leading-relaxed focus:ring-2 focus:ring-rose-500/20 focus:border-rose-700"
            />
          </div>

          {/* Registro de Resposta / Devolutiva da Rede */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
              <i className="fa-solid fa-reply text-rose-700"></i> Registro de Resposta / Devolutiva da Rede (opcional)
            </label>
            <textarea
              rows={2}
              value={resposta}
              onChange={e => setResposta(e.target.value.toUpperCase())}
              placeholder="REGISTRE O RETORNO RECEBIDO DO ÓRGÃO DE DESTINO (EX: PACIENTE AGENDADO, BENEFÍCIO CONCEDIDO, DOCUMENTO EMITIDO)..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase leading-relaxed bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-rose-900 hover:bg-rose-950 text-white rounded-xl font-bold shadow-md transition uppercase flex items-center gap-2 text-xs"
            >
              <i className={`fa-solid ${salvando ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Alerta */}
      <ModalAlerta alerta={alertaModal} onClose={() => setAlertaModal(null)} />
    </div>
  )
}
