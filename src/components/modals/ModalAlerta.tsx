'use client'

import React from 'react'

export interface AlertaConfig {
  tipo?: 'aviso' | 'erro' | 'duplicidade' | 'sucesso' | 'info'
  titulo?: string
  mensagem?: string
  detalhes?: string
  textoBotao?: string
  onFechar?: () => void
}

interface ModalAlertaProps {
  alerta: AlertaConfig | null
  onClose: () => void
}

export default function ModalAlerta({ alerta, onClose }: ModalAlertaProps) {
  if (!alerta) return null

  const msg = alerta.mensagem || 'Atenção às informações do formulário.'
  const tipo = alerta.tipo || (msg.toUpperCase().includes('DUPLICIDADE') ? 'duplicidade' : 'aviso')

  const fechar = () => {
    if (alerta.onFechar) alerta.onFechar()
    onClose()
  }

  // Configuração visual por tipo
  const temas = {
    duplicidade: {
      bgIcon: 'bg-amber-50 border-amber-200 text-amber-600',
      icon: 'fa-solid fa-people-arrows',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeTexto: 'TRAVA DE DUPLICIDADE',
      btnBg: 'bg-amber-700 hover:bg-amber-800 text-white',
      borderCard: 'border-amber-200'
    },
    erro: {
      bgIcon: 'bg-rose-50 border-rose-200 text-rose-600',
      icon: 'fa-solid fa-circle-exclamation',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      badgeTexto: 'ERRO / IMPEDIMENTO',
      btnBg: 'bg-rose-700 hover:bg-rose-800 text-white',
      borderCard: 'border-rose-200'
    },
    aviso: {
      bgIcon: 'bg-orange-50 border-orange-200 text-orange-600',
      icon: 'fa-solid fa-triangle-exclamation',
      badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
      badgeTexto: 'ATENÇÃO & VALIDAÇÃO',
      btnBg: 'bg-teal-800 hover:bg-teal-900 text-white',
      borderCard: 'border-orange-200'
    },
    sucesso: {
      bgIcon: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      icon: 'fa-solid fa-circle-check',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeTexto: 'OPERAÇÃO CONCLUÍDA',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      borderCard: 'border-emerald-200'
    },
    info: {
      bgIcon: 'bg-blue-50 border-blue-200 text-blue-600',
      icon: 'fa-solid fa-circle-info',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeTexto: 'INFORMAÇÃO SUAS',
      btnBg: 'bg-teal-800 hover:bg-teal-900 text-white',
      borderCard: 'border-blue-200'
    }
  }

  const tema = temas[tipo] || temas.aviso

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white rounded-2xl shadow-2xl border ${tema.borderCard} max-w-md w-full overflow-hidden transform transition-all animate-scale-up`}>
        {/* Barra superior decorativa */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-amber-500 to-emerald-600" />

        <div className="p-6 text-center">
          {/* Ícone com círculo de destaque */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full border shadow-inner mb-4 transition-transform hover:scale-105 duration-200">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${tema.bgIcon}`}>
              <i className={`${tema.icon} text-2xl`}></i>
            </div>
          </div>

          {/* Badge institucional */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border mb-2.5">
            <span className={tema.badgeBg + ' px-2.5 py-0.5 rounded-full border'}>{alerta.titulo || tema.badgeTexto}</span>
          </div>

          {/* Mensagem Principal */}
          <div className="mt-2 text-sm text-gray-800 font-medium leading-relaxed px-2 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 text-left">
            {msg.split('\n').map((paragrafo, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-2 text-xs text-gray-600' : 'text-xs text-gray-800 font-semibold'}>
                {paragrafo}
              </p>
            ))}
          </div>

          {alerta.detalhes && (
            <p className="mt-2.5 text-[11px] text-gray-500 italic">
              {alerta.detalhes}
            </p>
          )}

          {/* Botão de Ação */}
          <div className="mt-5">
            <button
              type="button"
              onClick={fechar}
              className={`w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tema.btnBg}`}
            >
              {alerta.textoBotao || 'Entendido, fechar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
