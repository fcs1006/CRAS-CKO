'use client'

import { useState } from 'react'
import { Encaminhamento, Configuracao, Familia, Usuario } from '@/types'
import { maskCPF, maskPhone } from '@/utils/masks'

interface EncaminhamentosViewProps {
  encaminhamentos: Encaminhamento[]
  familias?: Familia[]
  usuarios?: Usuario[]
  configuracao?: Configuracao
  onAbrirModalNovoEncaminhamento: () => void
}

import { DocumentoOficialLayout } from '@/components/impressao/DocumentoOficialLayout'

export function ConteudoGuiaEncaminhamento({
  enc,
  configuracao,
  familias = []
}: {
  enc: Encaminhamento
  configuracao?: Configuracao
  familias?: Familia[]
}) {
  const fam = familias.find(f => f.id === enc.familia_id || f.cod_familiar === enc.familia_id)
  const nomeBeneficiario = (enc.beneficiario || fam?.responsavel || 'BENEFICIÁRIO(A)').toUpperCase()
  const dataFormatada = (enc.data_envio || '').split('-').reverse().join('/')
  
  let dataExtensaFormatada = ''
  if (enc.data_envio) {
    const [ano, mes, dia] = enc.data_envio.split('-').map(Number)
    if (ano && mes && dia) {
      const dataObj = new Date(ano, mes - 1, dia)
      dataExtensaFormatada = dataObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }
  if (!dataExtensaFormatada) {
    dataExtensaFormatada = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <DocumentoOficialLayout
      configuracao={configuracao}
      tituloDocumento="GUIA OFICIAL DE"
      subtituloDocumento="ENCAMINHAMENTO"
      dataExtensa={dataExtensaFormatada}
      assinaturas={
        <div className="flex justify-center text-center text-[10px] pt-4 pb-2">
          <div className="border-t-[1.5px] border-black pt-1.5 min-w-[280px]">
            <p className="font-extrabold uppercase text-[10.5px] text-black">{(enc.tecnico || 'TÉCNICO(A) RESPONSÁVEL — CRAS').toUpperCase()}</p>
            <p className="text-[9.5px] font-semibold text-black mt-0.5">Técnico(a) de Referência Emissor(a) — CRAS</p>
          </div>
        </div>
      }
    >
      {/* 1. Identificação do Usuário / Família */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          1. Identificação do(a) Usuário(a) / Responsável Familiar
        </h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-1 text-[10px]">
          <div className="col-span-2"><strong className="font-extrabold">Nome:</strong> {nomeBeneficiario}</div>
          <div><strong className="font-extrabold">CPF:</strong> {fam?.cpf_responsavel ? maskCPF(fam.cpf_responsavel) : '—'}</div>
          <div><strong className="font-extrabold">Prontuário SUAS nº:</strong> {fam?.cod_familiar || '—'}</div>
          <div><strong className="font-extrabold">Telefone / Contato:</strong> {fam?.telefone ? maskPhone(fam.telefone) : '—'}</div>
          <div><strong className="font-extrabold">Território:</strong> {(fam?.zona_territorio || 'Urbana').toUpperCase()}</div>
          <div className="col-span-3"><strong className="font-extrabold">Endereço:</strong> {fam?.logradouro || ''}, nº {fam?.numero || 'S/N'} — Bairro: {fam?.bairro || ''}</div>
        </div>
      </div>

      {/* 2. Destino e Dados do Encaminhamento */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          2. Órgão / Serviço de Destino & Detalhes da Solicitação
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[10px]">
          <div><strong className="font-extrabold">Órgão / Instituição Destinatária:</strong> {(enc.destino || '').toUpperCase()}</div>
          <div><strong className="font-extrabold">Data de Emissão / Envio:</strong> {dataFormatada}</div>
          <div><strong className="font-extrabold">Técnico(a) Emissor(a):</strong> {(enc.tecnico || 'TÉCNICO CRAS').toUpperCase()}</div>
          <div><strong className="font-extrabold">Situação / Status:</strong> {(enc.status || 'Pendente').toUpperCase()}</div>
        </div>
      </div>

      {/* 3. Motivo e Justificativa Técnica */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          3. Motivo e Justificativa Técnica do Encaminhamento
        </h4>
        <div className="border border-black p-2.5 rounded bg-white text-[10px] leading-relaxed text-justify whitespace-pre-line min-h-[75px]">
          {enc.motivo || 'Encaminhamento para providências pertinentes no âmbito das competências desta instituição parceira da rede.'}
        </div>
      </div>

      {/* 4. Campo de Contrarreferência / Devolutiva */}
      <div className="space-y-1 mt-3">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          4. Devolutiva / Contrarreferência do Órgão Receptor (Preenchimento pelo Destinatário)
        </h4>
        <div className="border border-dashed border-black p-3.5 rounded bg-white text-[9.5px] min-h-[160px] flex flex-col justify-between space-y-4">
          <div>
            <p className="text-gray-600 italic text-[9.5px] mb-2 font-medium">
              Espaço reservado para registro de recebimento, acolhimento, atendimento realizado e providências/desfecho adotados pela instituição recebedora:
            </p>
            {enc.resposta ? (
              <div className="text-black font-semibold text-[10px] uppercase whitespace-pre-line p-2 bg-gray-50 border border-gray-300 rounded">
                {enc.resposta}
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                <div className="border-b border-gray-300 border-dotted h-4"></div>
                <div className="border-b border-gray-300 border-dotted h-4"></div>
                <div className="border-b border-gray-300 border-dotted h-4"></div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-10 pt-4">
            <div className="border-t border-black text-center text-[9px] pt-1 font-extrabold uppercase">
              Data e Assinatura / Carimbo do Responsável pelo Recebimento
            </div>
            <div className="border-t border-black text-center text-[9px] pt-1 font-extrabold uppercase">
              Providência / Parecer do Órgão Receptor
            </div>
          </div>
        </div>
      </div>
    </DocumentoOficialLayout>
  )
}

export function EncaminhamentosView({
  encaminhamentos,
  familias = [],
  usuarios = [],
  configuracao,
  onAbrirModalNovoEncaminhamento
}: EncaminhamentosViewProps) {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [encaminhamentoParaImprimir, setEncaminhamentoParaImprimir] = useState<Encaminhamento | null>(null)

  const encaminhamentosFiltrados = encaminhamentos.filter(e => {
    const termo = busca.toLowerCase().trim()
    const bateTexto = 
      (e.beneficiario || '').toLowerCase().includes(termo) ||
      (e.destino || '').toLowerCase().includes(termo) ||
      (e.motivo || '').toLowerCase().includes(termo)
    const bateStatus = filtroStatus === 'TODOS' || e.status === filtroStatus
    return bateTexto && bateStatus
  })

  return (
    <div className="space-y-6">
      <div className="space-y-6 print:hidden">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-route text-rose-600"></i> Encaminhamentos Intersetoriais
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Articulação com a Rede Socioassistencial (Saúde, Educação, INSS, Conselho Tutelar, Habitação).
          </p>
        </div>
        <button
          onClick={onAbrirModalNovoEncaminhamento}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition flex items-center gap-2"
        >
          <i className="fa-solid fa-share font-bold"></i> Emitir Novo Encaminhamento
        </button>
      </div>

      {/* Filtros Padronizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-xs"></i>
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="PESQUISAR POR BENEFICIÁRIO, ÓRGÃO DE DESTINO OU MOTIVO..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 bg-white"
          />
        </div>

        <div>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 text-gray-700"
          >
            <option value="TODOS">TODOS OS STATUS DE ENCAMINHAMENTO</option>
            <option value="Pendente">PENDENTES DE RESPOSTA</option>
            <option value="Respondido">RESPONDIDOS / CONCLUÍDOS</option>
          </select>
        </div>
      </div>

      {/* Tabela de Encaminhamentos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Data Envio</th>
                <th className="py-3 px-4">Beneficiário</th>
                <th className="py-3 px-4">Órgão / Destino</th>
                <th className="py-3 px-4">Motivo / Síntese</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Técnico Emissor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {encaminhamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    <i className="fa-solid fa-envelope-open-text text-3xl mb-2 text-gray-300"></i>
                    <p>Nenhum encaminhamento registrado.</p>
                  </td>
                </tr>
              ) : (
                encaminhamentosFiltrados.map(enc => (
                  <tr key={enc.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-medium text-gray-800">{enc.data_envio}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{enc.beneficiario}</td>
                    <td className="py-3 px-4 font-bold text-rose-700">{enc.destino}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">{enc.motivo}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        enc.status === 'Respondido'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {enc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{enc.tecnico}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEncaminhamentoParaImprimir(enc)
                          setTimeout(() => {
                            window.print()
                          }, 50)
                        }}
                        className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg font-bold transition border border-rose-200 inline-flex items-center justify-center shadow-xs"
                        title="Imprimir Guia Oficial de Encaminhamento"
                      >
                        <i className="fa-solid fa-print text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Área de Impressão Direta do Encaminhamento */}
      {encaminhamentoParaImprimir && (
        <div className="hidden print:block print:w-full print-document-area">
          <ConteudoGuiaEncaminhamento enc={encaminhamentoParaImprimir} configuracao={configuracao} familias={familias} />
        </div>
      )}
    </div>
  )
}
