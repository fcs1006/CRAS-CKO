'use client'

import React, { ReactNode } from 'react'
import { Configuracao } from '@/types'

interface DocumentoOficialLayoutProps {
  configuracao?: Configuracao
  tituloDocumento: string
  subtituloDocumento?: string
  numeroProtocolo?: string
  cidade?: string
  dataExtensa?: string
  assinaturas?: ReactNode
  children: ReactNode
}

/**
 * Layout Base Padronizado para Todos os Documentos Oficiais e Formulários de Impressão (A4).
 * Suporta documentos de 1 página ou múltiplas páginas.
 * O rodapé institucional (endereço, telefone, e-mail e data/hora de emissão)
 * é fixado com classe .print-fixed-footer no final exato de TODAS as páginas físicas.
 */
export function DocumentoOficialLayout({
  configuracao,
  tituloDocumento,
  subtituloDocumento,
  numeroProtocolo,
  cidade,
  dataExtensa,
  assinaturas,
  children
}: DocumentoOficialLayoutProps) {
  const cidadeFormatada = (cidade || configuracao?.municipio || 'Conceição do Tocantins - TO').replace(/Prefeitura Municipal de\s*/i, '').trim()
  const dataFormatada = dataExtensa || new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="print-document-container relative flex flex-col justify-between min-h-[250mm] sm:min-h-[255mm] print:min-h-0 text-black font-sans w-full pb-10 print:pb-8">
      {/* Conteúdo Principal do Documento */}
      <div className="space-y-3 flex-1 w-full">
        {/* Cabeçalho Institucional Oficial */}
        <div className="border-b-2 border-black pb-2 flex items-center justify-between gap-4">
          {configuracao?.logo_url ? (
            <img
              src={configuracao.logo_url}
              alt="Brasão Oficial"
              className="h-14 w-auto max-w-[80px] object-contain shrink-0"
            />
          ) : (
            <div className="w-12" />
          )}

          <div className="text-center flex-1 space-y-0.5">
            <h1 className="text-[13px] font-black uppercase text-black leading-tight">
              {configuracao?.municipio || 'PREFEITURA MUNICIPAL DE CONCEIÇÃO DO TOCANTINS'}
            </h1>
            <h2 className="text-[11px] font-extrabold uppercase text-black leading-tight">
              {configuracao?.secretaria || 'SECRETARIA MUNICIPAL DE ASSISTÊNCIA SOCIAL'}
            </h2>
            <h3 className="text-[10px] font-extrabold uppercase text-black leading-tight">
              {configuracao?.cras_unidade || 'CRAS PEDRO DE SANTANA BRITO'}
            </h3>
          </div>

          <div className="border-2 border-black px-3 py-1 text-center font-mono text-[10px] font-black shrink-0">
            {tituloDocumento}
            {subtituloDocumento && (
              <>
                <br />
                <strong>{subtituloDocumento}</strong>
              </>
            )}
            {numeroProtocolo && (
              <>
                <br />
                <strong>{numeroProtocolo}</strong>
              </>
            )}
          </div>
        </div>

        {/* Conteúdo Específico */}
        <div className="space-y-3 pt-1">
          {children}
        </div>
      </div>

      {/* Seção de Assinaturas e Data (Evita quebra de página isolada) */}
      {assinaturas && (
        <div className="mt-auto pt-6 space-y-4 shrink-0 break-inside-avoid page-break-inside-avoid print:break-inside-avoid print:page-break-inside-avoid">
          <div className="text-right text-[10px] font-bold pb-1 pr-2 text-black">
            {cidadeFormatada}, {dataFormatada}.
          </div>
          {assinaturas}
        </div>
      )}

      {/* Rodapé Institucional Oficial - Fixado no Final Absoluto de TODAS as páginas */}
      <div className="print-fixed-footer print:block pt-2 border-t border-black text-center text-[9px] text-black w-full mt-4">
        <p className="text-[9px]">
          {configuracao?.endereco || 'Rua Central, s/n - Centro, Conceição do Tocantins - TO, CEP: 77305-000'} • Telefone: {configuracao?.telefone || '(63) 3381-1234'} • E-mail: {configuracao?.email || 'cras@conceicao.to.gov.br'}
        </p>
      </div>
    </div>
  )
}
