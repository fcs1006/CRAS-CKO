'use client'

import { useState } from 'react'
import { Encaminhamento, Configuracao, Familia, Usuario } from '@/types'
import { maskCPF, maskPhone } from '@/utils/masks'
import { ModalEditarEncaminhamento } from '@/components/modals/ModalEditarEncaminhamento'
import { podeEmitirEncaminhamento, podeVerDetalheEncaminhamento, podeEditarEncaminhamento, podeExcluirEncaminhamento } from '@/utils/permissoes'

interface EncaminhamentosViewProps {
  encaminhamentos: Encaminhamento[]
  familias?: Familia[]
  usuarios?: Usuario[]
  configuracao?: Configuracao
  usuarioLogado?: Usuario | null
  onAbrirModalNovoEncaminhamento: () => void
  onEditarEncaminhamento?: (id: string, updates: Partial<Encaminhamento>) => Promise<void>
  onExcluirEncaminhamento?: (id: string) => Promise<void>
}

import { DocumentoOficialLayout } from '@/components/impressao/DocumentoOficialLayout'

export function ConteudoGuiaEncaminhamento({
  enc,
  configuracao,
  familias = [],
  usuarioLogado
}: {
  enc: Encaminhamento
  configuracao?: Configuracao
  familias?: Familia[]
  usuarioLogado?: Usuario | null
}) {
  const fam = familias.find(f => f.id === enc.familia_id || f.cod_familiar === enc.familia_id)
  const nomeResponsavel = (fam?.responsavel || enc.responsavel_nome || 'RESPONSÁVEL FAMILIAR').toUpperCase()
  const nomePessoaEncaminhada = (enc.beneficiario || fam?.responsavel || 'BENEFICIÁRIO(A)').toUpperCase()
  const dataFormatada = (enc.data_envio || '').split('-').reverse().join('/')
  const podeVerMotivo = podeVerDetalheEncaminhamento(usuarioLogado, enc)
  
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
          1. Identificação do(a) Responsável e da Pessoa Encaminhada
        </h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-1 text-[10px]">
          <div><strong className="font-extrabold">Responsável Familiar:</strong> {nomeResponsavel}</div>
          <div><strong className="font-extrabold">CPF do Responsável:</strong> {fam?.cpf_responsavel ? maskCPF(fam.cpf_responsavel) : '—'}</div>
          <div><strong className="font-extrabold">Prontuário SUAS nº:</strong> {fam?.cod_familiar || '—'}</div>
          <div className="col-span-3 bg-gray-50 p-1.5 border border-black rounded my-0.5 uppercase">
            <strong className="font-extrabold text-black">PESSOA / INTEGRANTE ENCAMINHADO(A):</strong> <span className="font-black text-black">{nomePessoaEncaminhada}</span>
          </div>
          <div><strong className="font-extrabold">Telefone / Contato:</strong> {fam?.telefone ? maskPhone(fam.telefone) : '—'}</div>
          <div><strong className="font-extrabold">Território:</strong> {(fam?.zona_territorio || 'Urbana').toUpperCase()}</div>
          <div><strong className="font-extrabold">Bairro:</strong> {fam?.bairro || '—'}</div>
          <div className="col-span-3"><strong className="font-extrabold">Endereço:</strong> {fam?.logradouro || ''}, nº {fam?.numero || 'S/N'}</div>
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
      <div className="space-y-1 w-full max-w-full overflow-hidden">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          3. Motivo e Justificativa Técnica do Encaminhamento
        </h4>
        <div className="border border-black p-2.5 rounded bg-white text-[10px] leading-relaxed text-justify whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden min-h-[75px]">
          {podeVerMotivo
            ? (enc.motivo || 'Encaminhamento para providências pertinentes no âmbito das competências desta instituição parceira da rede.')
            : '[CONTEÚDO CONFIDENCIAL — SIGILO PROFISSIONAL / RESTRITO À EQUIPE TÉCNICA EMISSORA]'}
        </div>
      </div>

      {/* 4. Campo de Contrarreferência / Devolutiva */}
      <div className="space-y-1 mt-4 w-full max-w-full overflow-hidden">
        <h4 className="text-[11px] font-black uppercase text-black border-b-[1.5px] border-black pb-0.5 tracking-wide">
          4. Devolutiva / Contrarreferência do Órgão Receptor (Preenchimento pelo Destinatário)
        </h4>
        <div className="border border-dashed border-black p-4 rounded bg-white text-[9.5px] min-h-[280px] flex flex-col justify-between space-y-6 max-w-full overflow-hidden">
          <div>
            <p className="text-gray-700 italic text-[9.5px] mb-3 font-semibold">
              Espaço reservado para registro de recebimento, acolhimento, atendimento realizado e providências/desfecho adotados pela instituição recebedora:
            </p>
            {enc.resposta ? (
              <div className="text-black font-semibold text-[10px] uppercase whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden p-3 bg-gray-50 border border-gray-300 rounded">
                {enc.resposta}
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="border-b border-gray-300 border-dotted h-5"></div>
                <div className="border-b border-gray-300 border-dotted h-5"></div>
                <div className="border-b border-gray-300 border-dotted h-5"></div>
                <div className="border-b border-gray-300 border-dotted h-5"></div>
                <div className="border-b border-gray-300 border-dotted h-5"></div>
                <div className="border-b border-gray-300 border-dotted h-5"></div>
                <div className="border-b border-gray-300 border-dotted h-5"></div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-12 pt-6">
            <div className="border-t border-black text-center text-[9px] pt-1.5 font-extrabold uppercase">
              Data e Assinatura / Carimbo do Responsável pelo Recebimento
            </div>
            <div className="border-t border-black text-center text-[9px] pt-1.5 font-extrabold uppercase">
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
  usuarioLogado,
  onAbrirModalNovoEncaminhamento,
  onEditarEncaminhamento,
  onExcluirEncaminhamento
}: EncaminhamentosViewProps) {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [encaminhamentoParaImprimir, setEncaminhamentoParaImprimir] = useState<Encaminhamento | null>(null)
  const [encaminhamentoParaEditar, setEncaminhamentoParaEditar] = useState<Encaminhamento | null>(null)

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
        {/* Banner Principal Padronizado */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-rose-900 rounded-2xl p-6 text-white shadow-xl border border-rose-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 bottom-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/30 text-rose-200 border border-rose-400/30 tracking-wider">
                  Rede de Proteção • SUAS Digital
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-route text-rose-400 text-xl"></i>
                <span>Encaminhamentos Intersetoriais</span>
              </h2>
              <p className="text-xs text-rose-100/90 leading-relaxed font-normal">
                Articulação integrada com a Rede Socioassistencial e Intersetorial (Saúde, Educação, INSS, Conselho Tutelar, Habitação e Justiça).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] uppercase text-rose-300 block font-semibold">Total Emitidos</span>
                  <strong className="text-base font-black text-white">{encaminhamentos.length}</strong>
                </div>
              </div>

              {podeEmitirEncaminhamento(usuarioLogado) && (
                <button
                  onClick={onAbrirModalNovoEncaminhamento}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 border border-emerald-300"
                >
                  <i className="fa-solid fa-share text-sm"></i>
                  <span>Emitir Novo Encaminhamento</span>
                </button>
              )}
            </div>
          </div>
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
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 table-fixed min-w-[700px]">
            <thead className="bg-gray-50 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 w-28 shrink-0">Data Envio</th>
                <th className="py-3 px-4 w-44 shrink-0">Beneficiário</th>
                <th className="py-3 px-4 w-52 shrink-0">Órgão / Destino</th>
                <th className="py-3 px-4">Motivo / Síntese</th>
                <th className="py-3 px-4 w-32 shrink-0">Status</th>
                <th className="py-3 px-4 w-36 shrink-0">Técnico Emissor</th>
                <th className="py-3 px-4 text-center w-28 shrink-0">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {encaminhamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <i className="fa-solid fa-envelope-open-text text-3xl mb-2 text-gray-300 block"></i>
                    <p className="font-semibold">Nenhum encaminhamento registrado.</p>
                  </td>
                </tr>
              ) : (
                encaminhamentosFiltrados.map(enc => {
                  const fam = familias.find(f => f.id === enc.familia_id || f.cod_familiar === enc.familia_id)
                  const dataBr = enc.data_envio ? enc.data_envio.split('-').reverse().join('/') : '—'
                  const isRespondido = enc.status === 'Respondido' || enc.status === 'Concluído'
                  const nomeResp = fam?.responsavel || enc.responsavel_nome || ''
                  const nomeEncaminhado = enc.beneficiario || nomeResp

                  return (
                    <tr key={enc.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-extrabold text-rose-950 whitespace-nowrap align-top">
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-calendar-day text-rose-500 text-xs"></i>
                          <span>{dataBr}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top break-words [overflow-wrap:anywhere]">
                        <div className="space-y-0.5">
                          {nomeResp && nomeResp.toUpperCase() !== nomeEncaminhado.toUpperCase() ? (
                            <>
                              <span className="text-[10px] text-gray-500 font-semibold block uppercase">
                                Resp: {nomeResp}
                              </span>
                              <strong className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1">
                                <i className="fa-solid fa-user-tag text-emerald-700 text-[10px]"></i> {nomeEncaminhado}
                              </strong>
                            </>
                          ) : (
                            <strong className="text-xs font-bold text-gray-900 uppercase block">
                              {nomeEncaminhado}
                            </strong>
                          )}
                          {fam?.bairro && (
                            <span className="text-[10px] text-gray-400 font-normal block">
                              Bairro: {fam.bairro}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-700 uppercase align-top break-words [overflow-wrap:anywhere]">
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-building-columns text-rose-500 text-xs shrink-0"></i>
                          <span className="break-words [overflow-wrap:anywhere]">{enc.destino}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800 uppercase leading-relaxed align-top break-all break-words [overflow-wrap:anywhere]">
                        {podeVerDetalheEncaminhamento(usuarioLogado, enc) ? (
                          <p className="line-clamp-2 text-xs break-all break-words [overflow-wrap:anywhere]" title={enc.motivo}>
                            {enc.motivo || '—'}
                          </p>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded block truncate">
                            [CONFIDENCIAL — EQUIPE TÉCNICA]
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (podeEditarEncaminhamento(usuarioLogado, enc)) {
                              setEncaminhamentoParaEditar(enc)
                            }
                          }}
                          className="focus:outline-none"
                          title={podeEditarEncaminhamento(usuarioLogado, enc) ? "Clique para editar status e registrar devolutiva" : "Status do Encaminhamento"}
                        >
                          {isRespondido ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase shadow-xs hover:bg-emerald-100 transition cursor-pointer">
                              <i className="fa-solid fa-circle-check text-[9px] text-emerald-600"></i> Respondido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 uppercase shadow-xs hover:bg-amber-100 transition cursor-pointer animate-pulse">
                              <i className="fa-solid fa-clock text-[9px] text-amber-600"></i> Pendente
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase align-top">
                        {enc.tecnico || 'TÉCNICO CRAS'}
                      </td>
                      <td className="py-3.5 px-4 text-center align-top whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Imprimir Guia */}
                          <button
                            type="button"
                            onClick={() => {
                              setEncaminhamentoParaImprimir(enc)
                              setTimeout(() => {
                                window.print()
                              }, 50)
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white transition flex items-center justify-center border border-slate-200"
                            title="Imprimir Guia Oficial de Encaminhamento"
                          >
                            <i className="fa-solid fa-print text-xs"></i>
                          </button>

                          {/* Editar / Registrar Devolutiva / Mudar Status */}
                          {onEditarEncaminhamento && podeEditarEncaminhamento(usuarioLogado, enc) && (
                            <button
                              type="button"
                              onClick={() => setEncaminhamentoParaEditar(enc)}
                              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition flex items-center justify-center border border-indigo-200"
                              title="Editar Encaminhamento / Registrar Devolutiva"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                          )}

                          {/* Excluir Encaminhamento */}
                          {onExcluirEncaminhamento && podeExcluirEncaminhamento(usuarioLogado) && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Deseja realmente excluir o encaminhamento de "${enc.beneficiario}" para "${enc.destino}"?`)) {
                                  await onExcluirEncaminhamento(enc.id)
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition flex items-center justify-center border border-rose-200"
                              title="Excluir Encaminhamento"
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

      {/* Modal de Edição & Registro de Devolutiva */}
      {encaminhamentoParaEditar && (
        <ModalEditarEncaminhamento
          encaminhamento={encaminhamentoParaEditar}
          familias={familias}
          onClose={() => setEncaminhamentoParaEditar(null)}
          onSalvar={async (id, updates) => {
            if (onEditarEncaminhamento) {
              await onEditarEncaminhamento(id, updates)
            }
          }}
        />
      )}

      {/* Área de Impressão Direta do Encaminhamento */}
      {encaminhamentoParaImprimir && (
        <div className="hidden print:block print:w-full print-document-area">
          <ConteudoGuiaEncaminhamento enc={encaminhamentoParaImprimir} configuracao={configuracao} familias={familias} usuarioLogado={usuarioLogado} />
        </div>
      )}
    </div>
  )
}

