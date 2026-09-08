'use client'

import { useState } from 'react'
import { BeneficioConcedido, Usuario } from '@/types'

interface ModalEditarBeneficioProps {
  beneficio: BeneficioConcedido
  usuarios?: Usuario[]
  onClose: () => void
  onSalvar: (id: string, updates: Partial<BeneficioConcedido>) => Promise<void>
}

export function ModalEditarBeneficio({
  beneficio,
  usuarios = [],
  onClose,
  onSalvar
}: ModalEditarBeneficioProps) {
  const [salvando, setSalvando] = useState(false)
  const [tipo, setTipo] = useState(beneficio.tipo || '')
  const [quantidade, setQuantidade] = useState<number>(beneficio.quantidade || 1)
  const [data, setData] = useState(beneficio.data || '')
  const [tecnico, setTecnico] = useState(beneficio.tecnico_responsavel || '')
  const [parecerSocial, setParecerSocial] = useState(beneficio.parecer_social || '')
  const [observacao, setObservacao] = useState(beneficio.observacao || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo) return alert('Selecione o tipo de benefício.')
    if (!data) return alert('Preencha a data da concessão.')
    if (!tecnico) return alert('Selecione o técnico concessor.')
    if (!parecerSocial.trim()) return alert('O Parecer Social / Justificativa Técnica é obrigatório.')

    setSalvando(true)

    const tecnicoObj = usuarios.find(u => u.nome === tecnico || u.usuario === tecnico)
    const conselhoInfo = tecnicoObj?.conselho && tecnicoObj.conselho !== 'Não aplicável' ? tecnicoObj.conselho : undefined

    let catRma: 'auxilio_natalidade' | 'auxilio_funeral' | 'outros_eventuais' = 'outros_eventuais'
    const upper = tipo.toUpperCase()
    if (upper.includes('NATALIDADE') || upper.includes('ENXOVAL') || upper.includes('BEBÊ')) {
      catRma = 'auxilio_natalidade'
    } else if (upper.includes('FUNERAL') || upper.includes('URNA')) {
      catRma = 'auxilio_funeral'
    }

    const updates: Partial<BeneficioConcedido> = {
      tipo,
      categoria_rma: catRma,
      quantidade: Number(quantidade) || 1,
      data,
      tecnico_responsavel: tecnico.trim().toUpperCase(),
      tecnico_conselho: conselhoInfo,
      parecer_social: parecerSocial.trim().toUpperCase(),
      observacao: observacao.trim().toUpperCase() || undefined
    }

    try {
      await onSalvar(beneficio.id, updates)
      onClose()
    } catch (err: any) {
      alert('Erro ao atualizar benefício: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Padronizado */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-pen-to-square text-emerald-400"></i> Editar Benefício Eventual
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Beneficiário: <strong>{(beneficio.responsavel_nome || 'BENEFICIÁRIO').toUpperCase()}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Beneficiário (Somente Leitura) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Responsável Familiar / Beneficiário
            </label>
            <input
              type="text"
              readOnly
              value={beneficio.responsavel_nome || 'BENEFICIÁRIO'}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-gray-100 font-bold uppercase text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Tipo / Provisão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Item / Provisão <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
              >
                <option value="">SELECIONE O ITEM / PROVISÃO *</option>
                <option value="Cesta Básica">Cesta Básica de Alimentos</option>
                <option value="Enxoval de Bebê / Auxílio Natalidade">Auxílio-Natalidade (Enxoval de Bebê)</option>
                <option value="Auxílio Funeral">Auxílio-Funeral (Urna / Custeio)</option>
                <option value="Aluguel Social">Aluguel Social Temporário</option>
                <option value="Passagem / Transporte">Passagem / Transporte</option>
                <option value="Cobertor / Colchão / Calamidade">Cobertor / Colchão / Calamidade</option>
                <option value="Filtro de Barro">Filtro de Barro</option>
                <option value="Outro Benefício Eventual">Outro Benefício Eventual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantidade <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={quantidade}
                onChange={e => setQuantidade(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* Data e Técnico */}
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
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
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
                    {u.nome} ({u.cargo || 'Técnico'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parecer Social / Justificativa Técnica */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Parecer Social / Justificativa Técnica (SUAS / LOAS) <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={parecerSocial}
              onChange={e => setParecerSocial(e.target.value.toUpperCase())}
              placeholder="DESCREVA A SITUAÇÃO DE VULNERABILIDADE..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Observações Adicionais
            </label>
            <input
              type="text"
              value={observacao}
              onChange={e => setObservacao(e.target.value.toUpperCase())}
              placeholder="EX: RETIRADO PELO RESPONSÁVEL"
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
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
              disabled={salvando}
              className="px-6 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
