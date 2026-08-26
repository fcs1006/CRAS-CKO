'use client'

import { useState } from 'react'
import { Familia } from '@/types'
import { maskCPF, maskNIS } from '@/utils/masks'

interface FamiliasViewProps {
  familias: Familia[]
  onAbrirModalNovaFamilia: () => void
  onAbrirModalVerFamilia: (familia: Familia) => void
  onAbrirModalEditarFamilia: (familia: Familia) => void
  onExcluirFamilia: (id: string) => void
}

export function FamiliasView({
  familias,
  onAbrirModalNovaFamilia,
  onAbrirModalVerFamilia,
  onAbrirModalEditarFamilia,
  onExcluirFamilia
}: FamiliasViewProps) {
  const [busca, setBusca] = useState('')
  const [filtroBairro, setFiltroBairro] = useState('TODOS')
  const [filtroZona, setFiltroZona] = useState('TODAS')
  const [filtroPaif, setFiltroPaif] = useState('TODOS')

  const bairrosUnicos = Array.from(new Set(familias.map(f => f.bairro).filter(Boolean)))
  const zonasUnicas = Array.from(new Set(familias.map(f => f.zona_territorio).filter(Boolean)))

  const familiasFiltradas = familias.filter(f => {
    const termo = busca.toLowerCase().trim()
    const bateTexto =
      f.responsavel.toLowerCase().includes(termo) ||
      (f.nome_mae_responsavel && f.nome_mae_responsavel.toLowerCase().includes(termo)) ||
      (f.cpf_responsavel && f.cpf_responsavel.includes(termo)) ||
      (f.nis_responsavel && f.nis_responsavel.includes(termo)) ||
      (f.cod_familiar && f.cod_familiar.toLowerCase().includes(termo)) ||
      (f.bairro && f.bairro.toLowerCase().includes(termo))

    const bateBairro = filtroBairro === 'TODOS' || f.bairro === filtroBairro
    const bateZona = filtroZona === 'TODAS' || f.zona_territorio === filtroZona
    const batePaif = filtroPaif === 'TODOS' || (filtroPaif === 'SIM' ? f.paif_ativo : !f.paif_ativo)

    return bateTexto && bateBairro && bateZona && batePaif
  })

  return (
    <div className="space-y-6 print:hidden">
      {/* Banner Principal Padronizado */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-teal-900 rounded-2xl p-6 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/30 text-teal-200 border border-teal-400/30 tracking-wider">
                Proteção Social Básica • SUAS Digital
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-address-book text-teal-400 text-xl"></i>
              <span>Prontuário Familiar SUAS</span>
            </h2>
            <p className="text-xs text-teal-200/90 leading-relaxed font-normal">
              Gestão normativa do Prontuário SUAS: Folha de Rosto, Composição Familiar, Territorialização e Plano PAIF (PAF).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="px-3 py-1 text-center">
                <span className="text-[10px] uppercase text-teal-300 block font-semibold">Total de Famílias</span>
                <strong className="text-base font-black text-white">{familias.length}</strong>
              </div>
            </div>

            <button
              onClick={onAbrirModalNovaFamilia}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 border border-emerald-300"
            >
              <i className="fa-solid fa-plus text-sm"></i>
              <span>Novo Prontuário</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros Harmonizados */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-center">
        <div className="sm:col-span-5 relative w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por responsável, mãe, CPF, NIS ou código..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
          />
        </div>

        <div className="sm:col-span-2">
          <select
            value={filtroZona}
            onChange={e => setFiltroZona(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white text-gray-700 font-semibold uppercase"
          >
            <option value="TODAS">Território (Todos)</option>
            <option value="Urbana">Urbana</option>
            <option value="Rural">Rural</option>
            <option value="Área de Risco">Área de Risco</option>
            <option value="Quilombola">Quilombola</option>
            <option value="Indígena">Indígena</option>
            <option value="Ribeirinha">Ribeirinha</option>
            <option value="Assentamento">Assentamento</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filtroBairro}
            onChange={e => setFiltroBairro(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white text-gray-700 font-semibold uppercase"
          >
            <option value="TODOS">Todos os Bairros / Povoados</option>
            {bairrosUnicos.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={filtroPaif}
            onChange={e => setFiltroPaif(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white text-gray-700 font-semibold uppercase"
          >
            <option value="TODOS">PAIF (Todos)</option>
            <option value="SIM">PAIF Ativo</option>
            <option value="NAO">Sem PAIF</option>
          </select>
        </div>
      </div>

      {/* Tabela de Famílias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/90 text-gray-700 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Cód. Família</th>
                <th className="py-3.5 px-4">Responsável Familiar</th>
                <th className="py-3.5 px-4">CPF / NIS</th>
                <th className="py-3.5 px-4">Endereço e Território</th>
                <th className="py-3.5 px-4">Renda Capita</th>
                <th className="py-3.5 px-4 text-center">Integrantes</th>
                <th className="py-3.5 px-4 text-center">Plano PAIF</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {familiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <i className="fa-solid fa-folder-open text-3xl mb-2 text-gray-300"></i>
                    <p className="font-semibold text-gray-600">Nenhum prontuário encontrado com os filtros selecionados.</p>
                  </td>
                </tr>
              ) : (
                familiasFiltradas.map(f => {
                  const membrosCount = f.membros && f.membros.length > 0 ? f.membros.length : 1
                  const totalRenda = (f.membros || []).reduce((acc, m) => acc + (m.renda || 0), 0)
                  const perCapitaVal = totalRenda / membrosCount
                  const hasPcd = (f.membros || []).some(m => m.possui_deficiencia)
                  const hasTrabInfantil = (f.membros || []).some(m => m.trabalho_infantil)

                  return (
                    <tr key={f.id} className="hover:bg-teal-50/30 transition">
                      <td className="py-3 px-4 font-bold font-mono text-gray-800 whitespace-nowrap">
                        {f.cod_familiar}
                      </td>
                      <td className="py-3 px-4 leading-snug">
                        <div className="font-bold text-gray-900 uppercase text-xs">{f.responsavel}</div>
                        {f.nome_mae_responsavel && (
                          <div className="text-[10px] text-gray-500 uppercase">Mãe: {f.nome_mae_responsavel}</div>
                        )}
                        <div className="flex gap-1.5 mt-0.5">
                          {hasPcd && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              PcD
                            </span>
                          )}
                          {hasTrabInfantil && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-900 border border-red-200">
                              Trab. Infantil
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] font-mono text-gray-500 leading-tight whitespace-nowrap">
                        <div className="text-gray-800 font-medium">{f.cpf_responsavel ? maskCPF(f.cpf_responsavel) : '—'}</div>
                        <div className="text-teal-700 font-medium">{f.nis_responsavel ? maskNIS(f.nis_responsavel) : '—'}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-600 leading-relaxed max-w-xs uppercase">
                        <div>{f.logradouro}, {f.numero || 'S/N'} — {f.bairro}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                          {f.zona_territorio || 'Urbana'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap font-mono">
                        R$ {perCapitaVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-800">
                        {membrosCount}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {f.paif_ativo ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                            PAIF ATIVO
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            NÃO
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onAbrirModalVerFamilia(f)}
                            className="w-7 h-7 rounded-full bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center shadow transition"
                            title="Ver Prontuário Completo"
                          >
                            <i className="fa-solid fa-folder text-[11px]"></i>
                          </button>
                          <button
                            onClick={() => onAbrirModalEditarFamilia(f)}
                            className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center transition"
                            title="Alterar Prontuário"
                          >
                            <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                          </button>
                          <button
                            onClick={() => onExcluirFamilia(f.id)}
                            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 flex items-center justify-center transition"
                            title="Excluir Prontuário"
                          >
                            <i className="fa-solid fa-trash-can text-[11px]"></i>
                          </button>
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
  )
}
