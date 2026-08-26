'use client'

import { useState, useEffect } from 'react'
import { Configuracao } from '@/types'
import { compressImage } from '@/utils/masks'

interface ConfiguracoesViewProps {
  configuracao: Configuracao
  onSalvarConfiguracao: (config: Configuracao) => Promise<void>
}

export function ConfiguracoesView({ configuracao, onSalvarConfiguracao }: ConfiguracoesViewProps) {
  const [form, setForm] = useState<Configuracao>({ ...configuracao })
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [processandoImagem, setProcessandoImagem] = useState(false)

  useEffect(() => {
    if (configuracao) {
      setForm({ ...configuracao })
    }
  }, [configuracao])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Exibição instantânea do preview (<10ms)
    const tempUrl = URL.createObjectURL(file)
    setForm(prev => ({ ...prev, logo_url: tempUrl }))
    setProcessandoImagem(true)

    try {
      // 2. Compactação otimizada em segundo plano
      const compressed = await compressImage(tempUrl, 350, 350)
      setForm(prev => ({ ...prev, logo_url: compressed }))
    } catch (err) {
      console.error('Erro ao otimizar imagem:', err)
    } finally {
      URL.revokeObjectURL(tempUrl)
      setProcessandoImagem(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setMensagem('')
    try {
      await onSalvarConfiguracao(form)
      setMensagem('Configurações institucionais salvas com sucesso!')
    } catch (err: any) {
      setMensagem('Erro ao salvar configurações: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner Principal Padronizado */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-xl border border-slate-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-slate-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-700/50 text-slate-200 border border-slate-600/40 tracking-wider">
                Parâmetros Globais • SUAS Digital
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-gears text-teal-400 text-xl"></i>
              <span>Configurações Institucionais</span>
            </h2>
            <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
              Personalização de cabeçalhos de relatórios, logomarca oficial da Prefeitura/Secretaria e contatos institucionais.
            </p>
          </div>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${
          mensagem.includes('sucesso') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }`}>
          {mensagem}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Município / Prefeitura
            </label>
            <input
              type="text"
              value={form.municipio}
              onChange={e => setForm({ ...form, municipio: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Secretaria Municipal
            </label>
            <input
              type="text"
              value={form.secretaria}
              onChange={e => setForm({ ...form, secretaria: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nome da Unidade CRAS
            </label>
            <input
              type="text"
              value={form.cras_unidade}
              onChange={e => setForm({ ...form, cras_unidade: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Telefone Institucional
            </label>
            <input
              type="text"
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              value={form.endereco}
              onChange={e => setForm({ ...form, endereco: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              E-mail Oficial da Unidade
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Upload de Logotipo */}
        <div className="pt-3 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Logotipo / Brasão Oficial
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            {form.logo_url ? (
              <div className="relative group">
                <img src={form.logo_url} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain border p-1 rounded bg-gray-50" />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))}
                  className="mt-1 block text-xs text-red-600 hover:text-red-800 font-semibold"
                >
                  <i className="fa-solid fa-trash mr-1"></i>Remover
                </button>
              </div>
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                Sem Logo
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={processandoImagem}
              onChange={handleLogoUpload}
              className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer disabled:opacity-50"
            />
            {processandoImagem && (
              <span className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 animate-pulse">
                <i className="fa-solid fa-spinner fa-spin"></i> Otimizando imagem...
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={salvando || processandoImagem}
            className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow transition disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : processandoImagem ? 'Processando imagem...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
