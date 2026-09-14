'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Familia } from '@/types'
import { getNeighborhoodCoords, CENTRO_CONCEICAO_TO } from '@/utils/masks'

interface GeomapeamentoViewProps {
  familias: Familia[]
  onAbrirModalVerFamilia?: (familia: Familia) => void
}

export function GeomapeamentoView({ familias, onAbrirModalVerFamilia }: GeomapeamentoViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)

  const [leafletPronto, setLeafletPronto] = useState(false)
  const [bairroFiltro, setBairroFiltro] = useState('TODOS')
  const [tipoFiltro, setTipoFiltro] = useState<'TODAS' | 'PAIF' | 'ALTA'>('TODAS')
  const [termoBusca, setTermoBusca] = useState('')

  // Lista de bairros existentes na base de dados
  const bairrosUnicos = useMemo(() => {
    return Array.from(new Set(familias.map(f => f.bairro).filter(Boolean))).sort()
  }, [familias])

  // Carregar biblioteca Leaflet caso ainda não esteja disponível no escopo global
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ((window as any).L) {
      setLeafletPronto(true)
      return
    }

    const scriptExistente = document.querySelector('script[src*="leaflet.js"]')
    if (scriptExistente) {
      scriptExistente.addEventListener('load', () => setLeafletPronto(true))
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletPronto(true)
          clearInterval(interval)
        }
      }, 300)
      return () => clearInterval(interval)
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => setLeafletPronto(true)
    document.body.appendChild(script)
  }, [])

  // Filtragem das famílias com coordenadas geográficas precisas na malha urbana de Conceição do Tocantins
  const familiasMapeadas = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase()

    return familias
      .map(f => {
        // Coordenadas calculadas deterministicamente dentro da malha urbana de Conceição do Tocantins
        const coords = (f.latitude && f.longitude)
          ? [f.latitude, f.longitude] as [number, number]
          : getNeighborhoodCoords(f.bairro, f.id || f.cod_familiar || f.responsavel)
        
        // Avaliação de vulnerabilidade socioassistencial (CadÚnico / SUAS):
        // 1. Mais de 3 fatores cadastrados
        // 2. Extrema pobreza: renda informada zerada ou menor que R$ 218 por pessoa
        // 3. Beneficiário de Bolsa Família ou BPC sem outra fonte de renda
        const numMembros = (f.membros && f.membros.length > 0) ? f.membros.length : 1
        const rendaTotal = Number(f.renda_responsavel || 0)
        const rendaPerCapita = rendaTotal / numMembros

        const temVulnManual = Boolean(f.vulnerabilidades && f.vulnerabilidades.length >= 3)
        const temExtremaPobreza = rendaPerCapita < 218 || rendaTotal === 0
        const temProgramaSocial = Boolean(
          f.programa_social_responsavel && 
          f.programa_social_responsavel !== 'Nenhum' && 
          f.programa_social_responsavel !== 'Não se aplica'
        )

        const isCritical = temVulnManual || (temExtremaPobreza && temProgramaSocial)

        return { ...f, coords, isCritical }
      })
      .filter(f => {
        // Filtro por Bairro
        if (bairroFiltro !== 'TODOS' && f.bairro !== bairroFiltro) return false

        // Filtro por Tipo de Vulnerabilidade
        if (tipoFiltro === 'PAIF' && !f.paif_ativo) return false
        if (tipoFiltro === 'ALTA' && !f.isCritical) return false

        // Filtro por Termo de Busca
        if (termo) {
          const bateNome = (f.responsavel || '').toLowerCase().includes(termo)
          const bateCod = (f.cod_familiar || '').toLowerCase().includes(termo)
          const bateCpf = (f.cpf_responsavel || '').replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
          if (!bateNome && !bateCod && !bateCpf) return false
        }

        return true
      })
  }, [familias, bairroFiltro, tipoFiltro, termoBusca])

  // Contadores estatísticos em tempo real
  const totalNoFiltro = familiasMapeadas.length
  const totalPaifNoFiltro = familiasMapeadas.filter(f => f.paif_ativo).length
  const totalAltaNoFiltro = familiasMapeadas.filter(f => f.isCritical).length

  // Inicialização do Mapa Leaflet
  useEffect(() => {
    if (!leafletPronto || !mapContainerRef.current) return

    const L = (window as any).L
    if (!L) return

    if (!mapInstanceRef.current) {
      // Limpeza de resíduos caso o container já tenha sido anexado
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null
      }

      const map = L.map(mapContainerRef.current, {
        center: CENTRO_CONCEICAO_TO,
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | SUAS Digital',
        maxZoom: 19
      }).addTo(map)

      const markersGroup = L.layerGroup().addTo(map)
      markersLayerRef.current = markersGroup
      mapInstanceRef.current = map

      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    }

    return () => {
      // Manter mapa se apenas re-renderizar marcadores
    }
  }, [leafletPronto])

  // Atualização dos Marcadores no Mapa
  useEffect(() => {
    if (!leafletPronto || !mapInstanceRef.current || !markersLayerRef.current) return

    const L = (window as any).L
    const map = mapInstanceRef.current
    const markersGroup = markersLayerRef.current

    markersGroup.clearLayers()

    familiasMapeadas.forEach(f => {
      // Definição de cor por nível de prioridade
      let color = '#10b981' // Verde normal
      if (f.isCritical) {
        color = '#ef4444' // Vermelho crítico (3+ fatores)
      } else if (f.paif_ativo) {
        color = '#0f766e' // Azul petróleo / Verde escuro PAIF
      }

      const marker = L.circleMarker(f.coords, {
        radius: f.isCritical ? 9 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85
      })

      const vulnerabilidadesTexto = f.vulnerabilidades && f.vulnerabilidades.length > 0
        ? f.vulnerabilidades.join(', ')
        : 'Nenhuma vulnerabilidade crítica registrada'

      const statusPaifBadge = f.paif_ativo
        ? '<span style="background: #ccfbf1; color: #0f766e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">PAIF ATIVO</span>'
        : '<span style="background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ATENDIMENTO PONTUAL</span>'

      const prioridadeBadge = f.isCritical
        ? '<span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; margin-left: 4px;">PRIORITÁRIA</span>'
        : ''

      marker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
          <div style="font-size: 11px; font-weight: bold; color: #0f766e; margin-bottom: 2px;">
            PRONTUÁRIO Nº ${f.cod_familiar || 'S/N'}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1.3; margin-bottom: 6px;">
            ${f.responsavel}
          </div>
          <div style="margin-bottom: 6px;">
            ${statusPaifBadge} ${prioridadeBadge}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <strong>Bairro:</strong> ${f.bairro || 'Não informado'}
          </div>
          ${f.logradouro ? `<div style="font-size: 11px; color: #475569; margin-bottom: 4px;"><strong>Endereço:</strong> ${f.logradouro}, ${f.numero || 'S/N'}</div>` : ''}
          ${f.telefone ? `<div style="font-size: 11px; color: #475569; margin-bottom: 4px;"><strong>Contato:</strong> ${f.telefone}</div>` : ''}
          <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 6px;">
            <strong>Vulnerabilidades:</strong> ${vulnerabilidadesTexto}
          </div>
        </div>
      `)

      markersGroup.addLayer(marker)
    })

    // Centralizar mapa suavemente se filtrado por bairro específico
    if (bairroFiltro !== 'TODOS') {
      const coordsBairro = getNeighborhoodCoords(bairroFiltro)
      map.flyTo(coordsBairro, 15, { duration: 1 })
    } else if (familiasMapeadas.length > 0 && termoBusca.trim()) {
      map.flyTo(familiasMapeadas[0].coords, 16, { duration: 1 })
    }
  }, [familiasMapeadas, leafletPronto, bairroFiltro, termoBusca])

  return (
    <div className="space-y-6">
      {/* Banner de Apresentação e Identidade */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 tracking-wider">
                Territorialização • SUAS Digital
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-map-location-dot text-emerald-400 text-xl"></i>
              <span>Geoprocessamento de Vulnerabilidades</span>
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
              Mapeamento territorial interativo de Conceição do Tocantins com vigilância socioassistencial das famílias assistidas pelo CRAS.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap w-full md:w-auto">
            {/* Seletor de Bairro */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 w-full md:w-auto">
              <label className="block text-[10px] font-bold uppercase text-emerald-200 mb-1">
                Filtrar por Bairro:
              </label>
              <select
                value={bairroFiltro}
                onChange={e => setBairroFiltro(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-400 border border-emerald-500/30 outline-none"
              >
                <option value="TODOS">Todos os Bairros ({familias.length} Famílias)</option>
                {bairrosUnicos.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Rápidos e Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total no Filtro Atual */}
        <button
          onClick={() => setTipoFiltro('TODAS')}
          className={`p-4 rounded-xl border text-left transition-all shadow-sm flex items-center justify-between ${
            tipoFiltro === 'TODAS'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Mapeadas no Filtro</p>
            <p className="text-xl font-black text-slate-800">{totalNoFiltro}</p>
            <p className="text-[11px] text-gray-400">Total visível no mapa</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
            <i className="fa-solid fa-users"></i>
          </div>
        </button>

        {/* Famílias com PAIF Ativo */}
        <button
          onClick={() => setTipoFiltro('PAIF')}
          className={`p-4 rounded-xl border text-left transition-all shadow-sm flex items-center justify-between ${
            tipoFiltro === 'PAIF'
              ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Acompanhamento PAIF</p>
            <p className="text-xl font-black text-teal-900">{totalPaifNoFiltro}</p>
            <p className="text-[11px] text-gray-400">Plano de Acompanhamento</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-base">
            <i className="fa-solid fa-folder-open"></i>
          </div>
        </button>

        {/* Famílias com Alta Vulnerabilidade */}
        <button
          onClick={() => setTipoFiltro('ALTA')}
          className={`p-4 rounded-xl border text-left transition-all shadow-sm flex items-center justify-between ${
            tipoFiltro === 'ALTA'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Alta Vulnerabilidade</p>
            <p className="text-xl font-black text-rose-900">{totalAltaNoFiltro}</p>
            <p className="text-[11px] text-gray-400">3+ fatores críticos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-base">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </button>

        {/* Campo de Busca Rápida no Mapa */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
            <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            <span>Localizar Família:</span>
          </label>
          <input
            type="text"
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            placeholder="Nome, CPF ou Cód..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Recipiente do Mapa Cartográfico */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-3 overflow-hidden relative">
        {!leafletPronto && (
          <div className="h-[540px] flex flex-col items-center justify-center gap-3 bg-slate-50 rounded-xl text-gray-500">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-600"></i>
            <span className="text-xs font-bold text-gray-600">Carregando mapa cartográfico de Conceição do Tocantins...</span>
          </div>
        )}

        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '560px',
            borderRadius: '12px',
            display: leafletPronto ? 'block' : 'none'
          }}
        />

        {/* Rodapé Informativo do Mapa */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-500 px-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>Atendimento Pontual</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-700 inline-block"></span>
              <span>Acompanhamento PAIF Ativo</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span>Alta Vulnerabilidade (3+ Riscos)</span>
            </span>
          </div>
          <div className="text-gray-400 font-medium">
            Clique sobre os marcadores para visualizar o resumo do prontuário familiar.
          </div>
        </div>
      </div>
    </div>
  )
}
