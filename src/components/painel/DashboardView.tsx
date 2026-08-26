'use client'

import { Familia, Atendimento, BeneficioConcedido, AgendaItem } from '@/types'

interface DashboardViewProps {
  familias: Familia[]
  atendimentos: Atendimento[]
  beneficios: BeneficioConcedido[]
  agenda?: AgendaItem[]
  onNavegarTab: (tab: string) => void
  onAbrirModalNovoAtendimento: () => void
  onAbrirModalNovaFamilia: () => void
}

function extrairTecnicoInfo(rawTecnico: string) {
  if (!rawTecnico) return { principal: 'NÃO INFORMADO', compartilhado: false }
  
  let tec = rawTecnico.trim()
  const regexCo = /\s*\((?:co[- ](?:visitantes?|participantes?)|participantes?):.*?\)\s*$/i
  const compartilhado = regexCo.test(tec)
  
  // Limpar co-visitantes
  tec = tec.replace(regexCo, '').trim()
  // Limpar parênteses adicionais de cargo/conselho do nome principal para exibição limpa
  tec = tec.replace(/\s*\(.*?\)\s*$/, '').trim()
  
  return {
    principal: tec.toUpperCase() || 'TÉCNICO(A) CRAS',
    compartilhado
  }
}

export function DashboardView({
  familias = [],
  atendimentos = [],
  beneficios = [],
  agenda = [],
  onNavegarTab,
  onAbrirModalNovoAtendimento,
  onAbrirModalNovaFamilia
}: DashboardViewProps) {
  const totalFamilias = familias.length
  const paifAtivas = familias.filter(f => f.paif_ativo).length
  const totalAtendimentos = atendimentos.length
  const totalBeneficios = beneficios.length

  const hojeStr = new Date().toISOString().split('T')[0]
  const agendaHoje = agenda.filter(a => a.data === hojeStr)
  const atendimentosRecentes = [...atendimentos]
    .sort((a, b) => {
      const dataDiff = (b.data || '').localeCompare(a.data || '')
      if (dataDiff !== 0) return dataDiff
      return (b.hora || '').localeCompare(a.hora || '')
    })
    .slice(0, 5)

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
                Painel de Gestão SUAS Digital
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-house-user text-teal-400 text-xl"></i>
              <span>Centro de Referência de Assistência Social (CRAS)</span>
            </h2>
            <p className="text-xs text-teal-200/90 leading-relaxed font-normal">
              Acompanhamento integral de prontuários familiares, atendimentos PAIF, serviços de convivência e geração oficial do RMA.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={onAbrirModalNovoAtendimento}
              className="bg-teal-700 hover:bg-teal-600 text-white font-extrabold px-4 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2 hover:scale-[1.02] active:scale-95 border border-teal-500/40"
            >
              <i className="fa-solid fa-notes-medical text-sm"></i>
              <span>Registrar Atendimento</span>
            </button>

            <button
              onClick={onAbrirModalNovaFamilia}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2.5 hover:scale-[1.02] active:scale-95 border border-emerald-300"
            >
              <i className="fa-solid fa-user-plus text-sm"></i>
              <span>Novo Prontuário</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Prontuários */}
        <div
          onClick={() => onNavegarTab('families')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prontuários Cadastrados</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1 font-mono">{totalFamilias}</h3>
            </div>
            <div className="w-11 h-11 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">
              <i className="fa-solid fa-folder-open"></i>
            </div>
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-3 flex items-center gap-1">
            <i className="fa-solid fa-arrow-right text-[10px]"></i> Ver todas as famílias cadastradas
          </p>
        </div>

        {/* Card 2: PAIF */}
        <div
          onClick={() => onNavegarTab('families')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Acompanhamento PAIF</p>
              <h3 className="text-3xl font-black text-emerald-900 mt-1 font-mono">{paifAtivas}</h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">
              <i className="fa-solid fa-people-roof"></i>
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-3 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Famílias com plano PAF ativo
          </p>
        </div>

        {/* Card 3: Atendimentos */}
        <div
          onClick={() => onNavegarTab('appointments')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Atendimentos Registrados</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1 font-mono">{totalAtendimentos}</h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">
              <i className="fa-solid fa-hand-holding-hand"></i>
            </div>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-3 flex items-center gap-1">
            <i className="fa-solid fa-arrow-right text-[10px]"></i> Ver histórico e evoluções
          </p>
        </div>

        {/* Card 4: Benefícios */}
        <div
          onClick={() => onNavegarTab('benefits')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Benefícios Concedidos</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1 font-mono">{totalBeneficios}</h3>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">
              <i className="fa-solid fa-box-open"></i>
            </div>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-3 flex items-center gap-1">
            <i className="fa-solid fa-arrow-right text-[10px]"></i> Concessões e almoxarifado
          </p>
        </div>
      </div>

      {/* Grid Inferior: Agenda de Hoje & Atendimentos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda Técnica */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-regular fa-calendar-check text-teal-700"></i> Agenda de Hoje ({agendaHoje.length})
            </h4>
            <button
              onClick={() => onNavegarTab('appointments')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 uppercase transition"
            >
              Ver Agenda
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {agendaHoje.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                <i className="fa-regular fa-calendar text-3xl mb-2 block text-gray-300"></i>
                Nenhum atendimento ou visita agendado para hoje.
              </div>
            ) : (
              agendaHoje.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center text-xs hover:bg-teal-50/50 transition">
                  <div>
                    <strong className="text-gray-900 block uppercase">{item.responsavel}</strong>
                    <span className="text-gray-500 text-[11px] uppercase">
                      {item.tipo} • Técnico(a): {item.tecnico}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-900 rounded-lg font-mono font-bold text-[11px]">
                    {item.hora}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atendimentos Recentes (Evoluções) - Ajustado com Layout Limpo e Sem Quebra */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-clock-rotate-left text-teal-700"></i> Últimos Atendimentos Registrados
            </h4>
            <button
              onClick={() => onNavegarTab('appointments')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 uppercase transition"
            >
              Ver Todos
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {atendimentosRecentes.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <i className="fa-regular fa-folder-open text-3xl mb-2 block text-gray-300"></i>
                Nenhum atendimento registrado até o momento.
              </div>
            ) : (
              atendimentosRecentes.map(atend => {
                const tecInfo = extrairTecnicoInfo(atend.tecnico || '')
                const isVisita = (atend.tipo || '').toUpperCase().includes('VISITA')
                const isAcompanhamento = (atend.tipo || '').toUpperCase().includes('PAIF') || (atend.tipo || '').toUpperCase().includes('ACOMPANHAMENTO')

                return (
                  <div
                    key={atend.id}
                    onClick={() => onNavegarTab('appointments')}
                    className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-teal-300 hover:shadow-sm transition cursor-pointer space-y-2"
                  >
                    {/* Linha Superior: Nome do Usuário, Tipo e Data */}
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-gray-900 uppercase text-xs">
                          {atend.usuario_visitado || atend.responsavel_nome || 'Usuário'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isVisita
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : isAcompanhamento
                            ? 'bg-teal-100 text-teal-900 border border-teal-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {atend.tipo || 'Atendimento'}
                        </span>
                      </div>

                      {/* Data e Hora Formatada */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs">
                        <i className="fa-regular fa-calendar text-gray-400"></i>
                        <span>
                          {atend.data ? atend.data.split('-').reverse().join('/') : '—'}
                        </span>
                        {atend.hora && (
                          <span className="text-gray-400">às {atend.hora}</span>
                        )}
                      </div>
                    </div>

                    {/* Relato / Síntese Técnica */}
                    <p className="text-[11px] text-gray-700 leading-relaxed uppercase line-clamp-2 bg-white/80 p-2 rounded-lg border border-gray-100">
                      <i className="fa-solid fa-quote-left text-gray-300 mr-1.5 text-[10px]"></i>
                      {atend.relato || 'Sem descrição informada.'}
                    </p>

                    {/* Linha Inferior: Técnico Responsável e Badge Compartilhado */}
                    <div className="flex flex-wrap justify-between items-center text-[10px] text-gray-500 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-900 flex items-center gap-1 uppercase">
                          <i className="fa-solid fa-user-tie text-teal-700"></i>
                          {tecInfo.principal}
                        </span>
                        {tecInfo.compartilhado && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[9px] uppercase border border-amber-200">
                            Co-atendimento
                          </span>
                        )}
                      </div>
                      <span className="text-teal-700 font-semibold hover:underline flex items-center gap-1">
                        Ver detalhes <i className="fa-solid fa-chevron-right text-[8px]"></i>
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Acesso Direto aos Módulos SUAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
        <button
          onClick={() => onNavegarTab('rma')}
          className="p-4 bg-white border border-teal-200 rounded-2xl shadow-sm hover:bg-teal-50 transition flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <div>
            <span className="text-gray-900 block font-extrabold">RMA Oficial</span>
            <span className="text-[10px] text-gray-500 font-normal">Relatório Mensal</span>
          </div>
        </button>

        <button
          onClick={() => onNavegarTab('referrals')}
          className="p-4 bg-white border border-rose-200 rounded-2xl shadow-sm hover:bg-rose-50 transition flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition">
            <i className="fa-solid fa-route"></i>
          </div>
          <div>
            <span className="text-gray-900 block font-extrabold">Encaminhamentos</span>
            <span className="text-[10px] text-gray-500 font-normal">Rede e CadÚnico</span>
          </div>
        </button>

        <button
          onClick={() => onNavegarTab('scfv')}
          className="p-4 bg-white border border-purple-200 rounded-2xl shadow-sm hover:bg-purple-50 transition flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition">
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <span className="text-gray-900 block font-extrabold">SCFV / Grupos</span>
            <span className="text-[10px] text-gray-500 font-normal">Serviço Convivência</span>
          </div>
        </button>

        <button
          onClick={() => onNavegarTab('map')}
          className="p-4 bg-white border border-cyan-200 rounded-2xl shadow-sm hover:bg-cyan-50 transition flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition">
            <i className="fa-solid fa-map-location-dot"></i>
          </div>
          <div>
            <span className="text-gray-900 block font-extrabold">Geomapeamento</span>
            <span className="text-[10px] text-gray-500 font-normal">Vulnerabilidades</span>
          </div>
        </button>
      </div>
    </div>
  )
}