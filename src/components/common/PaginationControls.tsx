'use client'

import React from 'react'

interface PaginationControlsProps {
  paginaAtual: number
  totalItens: number
  itensPorPagina: number
  onMudarPagina: (pagina: number) => void
  onMudarItensPorPagina?: (itens: number) => void
  opcoesItensPorPagina?: number[]
  nomeItem?: string
}

export function PaginationControls({
  paginaAtual,
  totalItens,
  itensPorPagina,
  onMudarPagina,
  onMudarItensPorPagina,
  opcoesItensPorPagina = [25, 50, 100],
  nomeItem = 'registros'
}: PaginationControlsProps) {
  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina))
  const inicio = totalItens === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens)

  // Geração da lista de páginas visíveis com ellipsis
  function getPaginasVisiveis(): (number | string)[] {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    }

    if (paginaAtual <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPaginas]
    }

    if (paginaAtual >= totalPaginas - 3) {
      return [
        1,
        '...',
        totalPaginas - 4,
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas
      ]
    }

    return [
      1,
      '...',
      paginaAtual - 1,
      paginaAtual,
      paginaAtual + 1,
      '...',
      totalPaginas
    ]
  }

  const paginasVisiveis = getPaginasVisiveis()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 text-xs border-t border-gray-100">
      {/* Indicador de Itens e Seletor de Registros */}
      <div className="flex items-center gap-3 text-gray-500 order-2 sm:order-1 flex-wrap">
        <span>
          Mostrando <strong className="font-bold text-gray-800">{inicio.toLocaleString('pt-BR')}</strong> a{' '}
          <strong className="font-bold text-gray-800">{fim.toLocaleString('pt-BR')}</strong> de{' '}
          <strong className="font-bold text-gray-900">{totalItens.toLocaleString('pt-BR')}</strong> {nomeItem}
        </span>

        {onMudarItensPorPagina && (
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200">
            <span className="text-gray-400">Exibir:</span>
            <select
              value={itensPorPagina}
              onChange={e => {
                onMudarItensPorPagina(Number(e.target.value))
                onMudarPagina(1)
              }}
              className="px-2 py-1 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {opcoesItensPorPagina.map(op => (
                <option key={op} value={op}>
                  {op} por página
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botões de Navegação */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Primeira Página */}
        <button
          onClick={() => onMudarPagina(1)}
          disabled={paginaAtual <= 1}
          title="Primeira página"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <i className="fa-solid fa-angles-left text-[11px]"></i>
        </button>

        {/* Anterior */}
        <button
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1}
          title="Página anterior"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <i className="fa-solid fa-chevron-left text-[11px]"></i>
        </button>

        {/* Números das Páginas */}
        <div className="flex items-center gap-1">
          {paginasVisiveis.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold"
                >
                  ...
                </span>
              )
            }

            const pageNum = Number(p)
            const isAtivo = pageNum === paginaAtual

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onMudarPagina(pageNum)}
                className={`min-w-8 h-8 px-2 rounded-lg font-bold text-xs transition flex items-center justify-center ${
                  isAtivo
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Próximo */}
        <button
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas}
          title="Próxima página"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <i className="fa-solid fa-chevron-right text-[11px]"></i>
        </button>

        {/* Última Página */}
        <button
          onClick={() => onMudarPagina(totalPaginas)}
          disabled={paginaAtual >= totalPaginas}
          title="Última página"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <i className="fa-solid fa-angles-right text-[11px]"></i>
        </button>
      </div>
    </div>
  )
}
