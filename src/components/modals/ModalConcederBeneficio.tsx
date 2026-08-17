'use client'

import { useState } from 'react'
import { Familia, BeneficioConcedido, AlmoxarifadoItem, Usuario, Configuracao } from '@/types'
import { ConteudoTermoBeneficio } from '@/components/painel/BeneficiosView'

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
  const [situacaoBeneficio, setSituacaoBeneficio] = useState<string>('')
  const [tipo, setTipo] = useState('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [data, setData] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [parecerSocial, setParecerSocial] = useState('')
  const [observacao, setObservacao] = useState('')
  const [beneficioConcedidoImprimir, setBeneficioConcedidoImprimir] = useState<Partial<BeneficioConcedido> | null>(null)

  const familiaSelecionada = familias.find(f => f.id === familiaId)
  const itemEstoque = almoxarifado.find(a => a.tipo === tipo)
  const saldoInsuficiente = tipo && itemEstoque ? itemEstoque.saldo < (quantidade || 1) : false

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
    if (!familiaId) return alert('Selecione a família beneficiária.')
    if (!situacaoBeneficio) return alert('Selecione a situação legal do benefício.')
    if (!tipo) return alert('Selecione o item/provisão a ser concedido.')
    if (!data) return alert('Preencha a data da concessão.')
    if (!tecnico) return alert('Selecione o técnico concessor.')
    if (!parecerSocial.trim()) return alert('O Parecer Social / Justificativa Técnica é obrigatório para a concessão do benefício eventual.')
    if (saldoInsuficiente) return alert('Saldo insuficiente em estoque no almoxarifado.')

    setSalvando(true)

    const tecnicoObj = usuarios.find(u => u.nome === tecnico || u.usuario === tecnico)
    const conselhoInfo = tecnicoObj?.conselho && tecnicoObj.conselho !== 'Não aplicável' ? tecnicoObj.conselho : undefined
    const catRma = getCategoriaRma(situacaoBeneficio)

    const novoPayload: Partial<BeneficioConcedido> = {
      familia_id: familiaId,
      data,
      tipo,
      categoria_rma: catRma,
      quantidade: Number(quantidade) || 1,
      tecnico_responsavel: tecnico.trim().toUpperCase(),
      tecnico_conselho: conselhoInfo,
      parecer_social: parecerSocial.trim().toUpperCase() || undefined,
      status: 'Entregue',
      observacao: `SITUAÇÃO: ${situacaoBeneficio.toUpperCase()}${observacao ? ` | OBS: ${observacao.trim().toUpperCase()}` : ''}`
    }

    try {
      await onSalvar(novoPayload)
      setBeneficioConcedidoImprimir(novoPayload)
      setTimeout(() => {
        window.print()
        onClose()
      }, 100)
    } catch (err: any) {
      alert('Erro ao conceder benefício: ' + (err.message || 'Tente novamente.'))
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
          {/* Família */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Família / Responsável Beneficiário <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={familiaId}
              onChange={e => setFamiliaId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
            >
              <option value="">SELECIONE A FAMÍLIA BENEFICIÁRIA *</option>
              {familias.map(f => (
                <option key={f.id} value={f.id}>
                  {f.responsavel} — PRONTUÁRIO Nº: {f.cod_familiar} (CPF: {f.cpf_responsavel || '—'}) {f.paif_ativo ? '— [PAIF ATIVO]' : ''}
                </option>
              ))}
            </select>
          </div>

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
                  <option value="Cesta Básica">Cesta Básica de Alimentos</option>
                  <option value="Aluguel Social">Aluguel Social Temporário</option>
                  <option value="Passagem / Transporte">Passagem / Transporte</option>
                  <option value="Filtro de Barro">Filtro de Barro</option>
                  <option value="Segunda Via de Documentação Civil">2ª Via de Documentação Civil Básica</option>
                  <option value="Outro Benefício Eventual">Outro Benefício Eventual</option>
                </>
              )}
              {situacaoBeneficio === 'Situação de calamidade' && (
                <>
                  <option value="Cobertor / Colchão / Calamidade">Kits de Emergência / Cobertores e Colchões</option>
                  <option value="Cesta Básica Emergencial">Cesta de Alimentos Emergencial</option>
                  <option value="Abrigo e Deslocamento Emergencial">Apoio a Abrigo / Deslocamento Emergencial</option>
                  <option value="Outro Item de Calamidade">Outro Item de Calamidade</option>
                </>
              )}
              {!situacaoBeneficio && (
                <option value="" disabled>Selecione primeiro a Situação do Benefício acima</option>
              )}
            </select>
          </div>

          {/* Aviso de Saldo do Almoxarifado */}
          {itemEstoque && (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              itemEstoque.saldo > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              <div className="flex items-center gap-2">
                <i className={`fa-solid ${itemEstoque.saldo > 0 ? 'fa-boxes-stacked text-emerald-700' : 'fa-triangle-exclamation text-red-600'}`}></i>
                <span>Estoque no Almoxarifado CRAS: <strong>{itemEstoque.saldo} {itemEstoque.unidade}</strong></span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/80 border">
                {itemEstoque.saldo > 0 ? 'Baixa automática' : 'Sem estoque'}
              </span>
            </div>
          )}

          {/* Quantidade, Data e Técnico */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              placeholder="DESCREVA A SITUAÇÃO DE VULNERABILIDADE QUE MOTIVOU A CONCESSÃO DO BENEFÍCIO..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
            />
          </div>

          {/* Observações Adicionais */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Observações Adicionais
            </label>
            <input
              type="text"
              value={observacao}
              onChange={e => setObservacao(e.target.value.toUpperCase())}
              placeholder="EX: RETIRADO PELO RESPONSÁVEL FAMILIAR NA UNIDADE DO CRAS"
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
              disabled={salvando || saldoInsuficiente}
              className={`px-6 py-2 ${saldoInsuficiente ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-800 hover:bg-teal-900'} text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5`}
            >
              <i className="fa-solid fa-gift"></i>
              {salvando ? 'Concedendo...' : 'Conceder Benefício e Gerar Termo'}
            </button>
          </div>
        </form>
      </div>

      {/* Área de Impressão Direta do Termo de Benefício */}
      {beneficioConcedidoImprimir && (
        <div className="hidden print:block print:w-full print-document-area">
          <ConteudoTermoBeneficio b={beneficioConcedidoImprimir as BeneficioConcedido} configuracao={configuracao} familias={familias} />
        </div>
      )}
    </div>
  )
}
