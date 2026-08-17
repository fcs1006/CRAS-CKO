'use client'

import { useEffect, useRef, useState } from 'react'
import { Familia } from '@/types'
import { getNeighborhoodCoords } from '@/utils/masks'

interface GeomapeamentoViewProps {
  familias: Familia[]
}

export function GeomapeamentoView({ familias }: GeomapeamentoViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [bairroFiltro, setBairroFiltro] = useState('TODOS')

  const bairrosUnicos = Array.from(new Set(familias.map(f => f.bairro).filter(Boolean)))

  const familiasComCoords = familias.map(f => {
    const coords = (f.latitude && f.longitude) 
      ? [f.latitude, f.longitude] as [number, number]
      : getNeighborhoodCoords(f.bairro)
    return { ...f, coords }
  }).filter(f => bairroFiltro === 'TODOS' || f.bairro === bairroFiltro)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const L = (window as any).L
    if (!L || !mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([-12.2152, -47.2625], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    // Limpar marcadores anteriores
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Adicionar novos marcadores das famílias
    familiasComCoords.forEach(f => {
      const isCritical = f.vulnerabilidades && f.vulnerabilidades.length >= 3
      const color = isCritical ? '#e71d36' : f.paif_ativo ? '#134e5e' : '#2ec4b6'

      const marker = L.circleMarker(f.coords, {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map)

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 13px; color: #134e5e;">${f.responsavel}</strong><br/>
          <span style="font-size: 11px; color: #666;">Cód: ${f.cod_familiar} • Bairro: ${f.bairro}</span><br/>
          <span style="font-size: 11px; font-weight: bold; color: ${f.paif_ativo ? '#134e5e' : '#666'};">
            PAIF: ${f.paif_ativo ? 'Ativo' : 'Não'}
          </span><br/>
          <small style="color: #444; font-size: 10px;">Vulnerabilidades: ${f.vulnerabilidades?.join(', ') || 'Nenhuma'}</small>
        </div>
      `)
    })
  }, [familiasComCoords, bairroFiltro])

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-emerald-600"></i> Geoprocessamento de Vulnerabilidades
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Mapeamento territorial das famílias assistidas e densidade de vulnerabilidade social.
          </p>
        </div>
        <div>
          <select
            value={bairroFiltro}
            onChange={e => setBairroFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="TODOS">Todos os Bairros ({familias.length} Famílias)</option>
            {bairrosUnicos.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legenda e Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Vulnerabilidade Baixa / Moderada</p>
            <p className="text-xs text-gray-400">Atendimento Pontual</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-teal-800 shadow-sm"></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Acompanhamento PAIF Ativo</p>
            <p className="text-xs text-gray-400">Plano de Acompanhamento Familiar</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm"></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Vulnerabilidade Alta (3+ Fatores)</p>
            <p className="text-xs text-gray-400">Atenção Prioritária</p>
          </div>
        </div>
      </div>

      {/* Recipiente do Mapa Leaflet */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 overflow-hidden">
        <div 
          ref={mapContainerRef}
          style={{ width: '100%', height: '520px', borderRadius: '8px' }}
        />
      </div>
    </div>
  )
}
