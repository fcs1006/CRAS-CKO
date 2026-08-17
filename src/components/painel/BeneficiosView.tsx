'use client'

import { useState } from 'react'
import { BeneficioConcedido, AlmoxarifadoItem, Configuracao, Familia, Usuario } from '@/types'
import { maskCPF, maskNIS, maskPhone } from '@/utils/masks'
import { ModalEditarBeneficio } from '@/components/modals/ModalEditarBeneficio'

interface BeneficiosViewProps {
  beneficios: BeneficioConcedido[]
  almoxarifado: AlmoxarifadoItem[]
  familias?: Familia[]
  usuarios?: Usuario[]
  configuracao?: Configuracao
  onAbrirModalConcederBeneficio: () => void
  onEditarBeneficio?: (id: string, updates: Partial<BeneficioConcedido>) => Promise<void>
  onExcluirBeneficio?: (id: string) => Promise<void>
}

import { DocumentoOficialLayout } from '@/components/impressao/DocumentoOficialLayout'

export function ConteudoTermoBeneficio({
  b,
  configuracao,
  familias = []
}: {
  b: Partial<BeneficioConcedido>
  configuracao?: Configuracao
  familias?: Familia[]
}) {
  const fam = familias.find(f => f.id === b.familia_id)
  const nomeBeneficiario = (b.responsavel_nome || fam?.responsavel || 'BENEFICIÁRIO(A)').toUpperCase()
  const dataFormatada = (b.data || '').split('-').reverse().join('/')
  
  let dataExtensaFormatada = ''
  if (b.data) {
    const [ano, mes, dia] = b.data.split('-').map(Number)
    if (ano && mes && dia) {
      const dataObj = new Date(ano, mes - 1, dia)
      dataExtensaFormatada = dataObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }
  if (!dataExtensaFormatada) {
    dataExtensaFormatada = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const situacaoNormativa = b.observacao?.includes('SITUAÇÃO:') ? b.observacao.split('|')[0].replace('SITUAÇÃO:', '').trim().toUpperCase() : 'BENEFÍCIO EVENTUAL'

  return (
    <DocumentoOficialLayout
      configuracao={configuracao}
      tituloDocumento="TERMO DE RECEBIMENTO"
      subtituloDocumento="BENEFÍCIO EVENTUAL"
      dataExtensa={dataExtensaFormatada}
      assinaturas={
        <div className="grid grid-cols-2 gap-10 text-center text-[10px] pt-4 pb-2">
          <div className="border-t-[1.5px] border-black pt-1.5">
            <p className="font-extrabold uppercase text-[10.5px] text-black">{nomeBeneficiario}</p>
            <p className="text-[9.5px] font-semibold text-black mt-0.5">Assinatura do(a) Beneficiário(a) (ou a Rogo)</p>
          </div>
          <div className="border-t-[1.5px] border-black pt-1.5">
            <p className="font-extrabold uppercase text-[10.5px] text-black">{(b.tecnico_responsavel || 'TÉCNICO(A) RESPONSÁVEL — CRAS').toUpperCase()}</p>
            <p className="text-[9.5px] font-semibold text-black mt-0.5">{b.tecnico_conselho || 'Técnico(a) Concessor(a) — CRAS'}</p>
          </div>
        </div>
      }
    >
      {/* 1. Identificação do Beneficiário */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          1. Identificação do(a) Beneficiário(a) e Prontuário
        </h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-1 text-[10px]">
          <div><strong className="font-extrabold">Nome do Beneficiário:</strong> {nomeBeneficiario}</div>
          <div><strong className="font-extrabold">CPF:</strong> {fam?.cpf_responsavel ? maskCPF(fam.cpf_responsavel) : '—'}</div>
          <div><strong className="font-extrabold">NIS:</strong> {fam?.nis_responsavel ? maskNIS(fam.nis_responsavel) : '—'}</div>
          <div><strong className="font-extrabold">Prontuário SUAS nº:</strong> {fam?.cod_familiar || '—'}</div>
          <div><strong className="font-extrabold">Telefone:</strong> {fam?.telefone ? maskPhone(fam.telefone) : '—'}</div>
          <div><strong className="font-extrabold">Território SUAS:</strong> {(fam?.zona_territorio || 'Urbana').toUpperCase()}</div>
          <div className="col-span-3"><strong className="font-extrabold">Endereço:</strong> {fam?.logradouro || ''}, nº {fam?.numero || 'S/N'} — Bairro: {fam?.bairro || b.bairro || ''}</div>
        </div>
      </div>

      {/* 2. Especificação do Benefício */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          2. Especificação da Provisão e Enquadramento Legal (LOAS)
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[10px]">
          <div><strong className="font-extrabold">Situação Normativa (LOAS):</strong> {situacaoNormativa}</div>
          <div><strong className="font-extrabold">Item / Provisão Entregue:</strong> {(b.tipo || '').toUpperCase()}</div>
          <div><strong className="font-extrabold">Classificação no RMA CRAS:</strong> {b.categoria_rma === 'auxilio_natalidade' ? 'Item C.7 — Auxílio-Natalidade' : (b.categoria_rma === 'auxilio_funeral' ? 'Item C.8 — Auxílio-Funeral' : 'Item C.9 — Outros Benefícios Eventuais')}</div>
          <div><strong className="font-extrabold">Quantidade Concedida:</strong> {b.quantidade || 1} unidade(s)</div>
          <div><strong className="font-extrabold">Data da Concessão:</strong> {dataFormatada}</div>
          <div><strong className="font-extrabold">Técnico(a) Concessor(a):</strong> {(b.tecnico_responsavel || 'TÉCNICO CRAS').toUpperCase()}</div>
        </div>
      </div>

      {/* 3. Parecer Social */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          3. Parecer Social / Justificativa Técnica (SUAS)
        </h4>
        <div className="border border-black p-2 rounded bg-white text-[10px] leading-relaxed text-justify">
          {b.parecer_social || 'Concessão realizada após avaliação técnica das condições de vulnerabilidade social da família, nos termos da Lei Orgânica de Assistência Social (LOAS).'}
        </div>
      </div>

      {/* 4. Declaração de Recebimento */}
      <div className="border border-black p-2 rounded bg-white text-[10px] leading-relaxed text-justify mt-2">
        Eu, <strong>{nomeBeneficiario}</strong>, portador(a) do CPF nº <strong>{fam?.cpf_responsavel ? maskCPF(fam.cpf_responsavel) : '—'}</strong>, DECLARO para os devidos fins de comprovação junto ao Sistema Único de Assistência Social (SUAS) e à Secretaria Municipal de Assistência Social, que <strong>RECEBI</strong> nesta data a provisão suplementar acima especificada, em perfeitas condições.
      </div>
    </DocumentoOficialLayout>
  )
}

// Subcomponente principal de Benefícios
export function BeneficiosView({
  beneficios,
  almoxarifado,
  familias = [],
  usuarios = [],
  configuracao,
  onAbrirModalConcederBeneficio,
  onEditarBeneficio,
  onExcluirBeneficio
}: BeneficiosViewProps) {
  const [busca, setBusca] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('TODOS')
  const [beneficioParaEditar, setBeneficioParaEditar] = useState<BeneficioConcedido | null>(null)
  const [beneficioParaImprimir, setBeneficioParaImprimir] = useState<BeneficioConcedido | null>(null)

  const beneficiosFiltrados = beneficios.filter(b => {
    const termo = busca.toLowerCase().trim()
    const fam = familias.find(f => f.id === b.familia_id)
    const nomeResp = (b.responsavel_nome || fam?.responsavel || '').toLowerCase()
    const cpfResp = (fam?.cpf_responsavel || '').toLowerCase()
    const prontuario = (fam?.cod_familiar || '').toLowerCase()
    const tipo = (b.tipo || '').toLowerCase()
    const obs = (b.observacao || '').toLowerCase()

    const bateTexto = 
      nomeResp.includes(termo) ||
      cpfResp.includes(termo) ||
      prontuario.includes(termo) ||
      tipo.includes(termo) ||
      obs.includes(termo)

    const obsUpper = (b.observacao || '').toUpperCase()
    const tipoUpper = (b.tipo || '').toUpperCase()

    const bateSituacao = 
      filtroSituacao === 'TODOS' ||
      (filtroSituacao === 'NASCIMENTO' && (b.categoria_rma === 'auxilio_natalidade' || obsUpper.includes('NASCIMENTO') || tipoUpper.includes('NATALIDADE') || tipoUpper.includes('ENXOVAL'))) ||
      (filtroSituacao === 'MORTE' && (b.categoria_rma === 'auxilio_funeral' || obsUpper.includes('MORTE') || tipoUpper.includes('FUNERAL'))) ||
      (filtroSituacao === 'CALAMIDADE' && (obsUpper.includes('CALAMIDADE') || tipoUpper.includes('CALAMIDADE') || tipoUpper.includes('COBERTOR'))) ||
      (filtroSituacao === 'VULNERABILIDADE' && (obsUpper.includes('VULNERABILIDADE') || tipoUpper.includes('CESTA') || tipoUpper.includes('ALUGUEL') || tipoUpper.includes('PASSAGEM')))

    return bateTexto && bateSituacao
  })

  function handleImprimirTermoRecebimento(b: BeneficioConcedido) {
    setBeneficioParaImprimir(b)
    setTimeout(() => {
      window.print()
    }, 50)
  }

  async function handleExcluir(id: string) {
    if (!confirm('Deseja realmente excluir este registro de concessão de benefício?')) return
    if (onExcluirBeneficio) {
      try {
        await onExcluirBeneficio(id)
      } catch (err: any) {
        alert('Erro ao excluir: ' + (err.message || 'Tente novamente.'))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 print:hidden">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-teal-950 flex items-center gap-2 tracking-tight">
            <i className="fa-solid fa-hand-holding-heart text-amber-600"></i> Benefícios Eventuais & Almoxarifado (SUAS / LOAS)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Gestão normativa das 4 situações da LOAS: Nascimento (C.7), Morte (C.8), Vulnerabilidade Temporária (C.9) e Calamidade (C.9).
          </p>
        </div>
        <button
          onClick={onAbrirModalConcederBeneficio}
          className="bg-teal-800 hover:bg-teal-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-2 uppercase tracking-wider"
        >
          <i className="fa-solid fa-gift"></i> Conceder Benefício Eventual
        </button>
      </div>

      {/* Grid de Almoxarifado / Estoque */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <i className="fa-solid fa-boxes-stacked text-teal-700"></i> Saldo em Almoxarifado CRAS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {almoxarifado.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{item.tipo}</p>
                <h4 className="text-2xl font-black text-gray-900 mt-1 font-mono">
                  {item.saldo} <span className="text-xs font-normal text-gray-500">{item.unidade}</span>
                </h4>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                item.saldo <= 0 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'
              }`}>
                <i className="fa-solid fa-box"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Concessões */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-teal-700 text-sm"></i> Histórico Oficial de Concessões Registradas ({beneficiosFiltrados.length})
          </h3>
        </div>

        {/* Filtros de Pesquisa Padronizados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="PESQUISAR POR BENEFICIÁRIO, ITEM OU TÉCNICO..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700"
            />
          </div>

          <div>
            <select
              value={filtroSituacao}
              onChange={e => setFiltroSituacao(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700"
            >
              <option value="TODOS">TODAS AS SITUAÇÕES NORMATIVAS</option>
              <option value="NASCIMENTO">SITUAÇÃO DE NASCIMENTO (AUXÍLIO-NATALIDADE)</option>
              <option value="MORTE">SITUAÇÃO DE MORTE (AUXÍLIO-FUNERAL)</option>
              <option value="VULNERABILIDADE">SITUAÇÃO DE VULNERABILIDADE TEMPORÁRIA</option>
              <option value="CALAMIDADE">SITUAÇÃO DE CALAMIDADE PÚBLICA</option>
            </select>
          </div>
        </div>

        {/* Tabela Padronizada */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-100/80 text-gray-700 font-bold text-[11px] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Data</th>
                <th className="py-2.5 px-3">Beneficiário(a)</th>
                <th className="py-2.5 px-3">Situação / Item</th>
                <th className="py-2.5 px-3">Parecer Social / Justificativa</th>
                <th className="py-2.5 px-3">Técnico(a)</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {beneficiosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <i className="fa-solid fa-clipboard-list text-3xl mb-2 text-gray-300 block"></i>
                    Nenhum benefício encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                beneficiosFiltrados.map(b => {
                  const fam = familias.find(f => f.id === b.familia_id)
                  const nomeBeneficiario = b.responsavel_nome || fam?.responsavel || 'BENEFICIÁRIO'

                  const isNatalidade = b.categoria_rma === 'auxilio_natalidade' || b.tipo.toUpperCase().includes('NATALIDADE') || b.tipo.toUpperCase().includes('ENXOVAL')
                  const isFuneral = b.categoria_rma === 'auxilio_funeral' || b.tipo.toUpperCase().includes('FUNERAL')
                  const isCalamidade = (b.observacao || '').toUpperCase().includes('CALAMIDADE') || b.tipo.toUpperCase().includes('CALAMIDADE')

                  return (
                    <tr key={b.id} className="hover:bg-teal-50/30 transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                        {b.data ? b.data.split('-').reverse().join('/') : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-gray-900 uppercase text-xs block font-bold">{nomeBeneficiario}</strong>
                        {(fam?.bairro || b.bairro) && <span className="text-[10px] text-gray-500 uppercase">Bairro: {fam?.bairro || b.bairro}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isNatalidade
                            ? 'bg-purple-100 text-purple-900 border-purple-200'
                            : isFuneral
                            ? 'bg-gray-100 text-gray-900 border-gray-300'
                            : isCalamidade
                            ? 'bg-rose-100 text-rose-900 border-rose-200'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                        }`}>
                          {b.tipo}
                        </span>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5 uppercase">
                          {isNatalidade ? 'RMA C.7' : (isFuneral ? 'RMA C.8' : 'RMA C.9')} • {b.quantidade || 1} un
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-700 max-w-xs leading-relaxed uppercase text-[11px]">
                        {b.parecer_social || b.observacao || 'Concessão deferida conforme avaliação técnica.'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-teal-900 font-bold uppercase text-[11px]">
                        <i className="fa-solid fa-user-tie text-teal-700 mr-1"></i>
                        {b.tecnico_responsavel || 'TÉCNICO CRAS'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão Imprimir Termo */}
                          <button
                            onClick={() => handleImprimirTermoRecebimento(b)}
                            className="w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-bold transition border border-teal-200 flex items-center justify-center shadow-xs"
                            title="Imprimir Termo de Recebimento Oficial"
                          >
                            <i className="fa-solid fa-print text-xs"></i>
                          </button>

                          {/* Botão Editar */}
                          {onEditarBeneficio && (
                            <button
                              onClick={() => setBeneficioParaEditar(b)}
                              className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold transition border border-blue-200 flex items-center justify-center shadow-xs"
                              title="Editar Concessão de Benefício"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                          )}

                          {/* Botão Excluir */}
                          {onExcluirBeneficio && (
                            <button
                              onClick={() => handleExcluir(b.id)}
                              className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold transition border border-red-200 flex items-center justify-center shadow-xs"
                              title="Excluir Registro de Concessão"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Modal de Edição */}
      {beneficioParaEditar && onEditarBeneficio && (
        <ModalEditarBeneficio
          beneficio={beneficioParaEditar}
          usuarios={usuarios}
          onClose={() => setBeneficioParaEditar(null)}
          onSalvar={onEditarBeneficio}
        />
      )}

      {/* Área de Impressão Direta do Termo de Benefício */}
      {beneficioParaImprimir && (
        <div className="hidden print:block print:w-full print-document-area">
          <ConteudoTermoBeneficio b={beneficioParaImprimir} configuracao={configuracao} familias={familias} />
        </div>
      )}
    </div>
  )
}
