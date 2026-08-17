'use client'

import { useState } from 'react'
import { AlmoxarifadoItem } from '@/types'

interface ModalAlmoxarifadoProps {
  almoxarifado: AlmoxarifadoItem[]
  onClose: () => void
  onAtualizarAlmoxarifado: (itensAtualizados: AlmoxarifadoItem[]) => Promise<void>
}

export function ModalAlmoxarifado({
  almoxarifado,
  onClose,
  onAtualizarAlmoxarifado
}: ModalAlmoxarifadoProps) {
  const [salvando, setSalvando] = useState(false)
  const [itens, setItens] = useState<AlmoxarifadoItem[]>(JSON.parse(JSON.stringify(almoxarifado)))
  const [novoTipo, setNovoTipo] = useState('')
  const [novoSaldo, setNovoSaldo] = useState<number>(0)
  const [novaUnidade, setNovaUnidade] = useState('Unidades')

  function handleAlterarSaldo(id: number, delta: number) {
    setItens(prev =>
      prev.map(item => {
        if (item.id === id) {
          const v = Math.max(0, item.saldo + delta)
          return { ...item, saldo: v }
        }
        return item
      })
    )
  }

  function handleSetSaldoDirect(id: number, val: number) {
    const v = Math.max(0, val)
    setItens(prev =>
      prev.map(item => (item.id === id ? { ...item, saldo: v } : item))
    )
  }

  async function handleAdicionarNovoItem(e: React.FormEvent) {
    e.preventDefault()
    if (!novoTipo.trim()) return alert('Informe o nome do item de almoxarifado.')

    const existe = itens.some(i => i.tipo.trim().toUpperCase() === novoTipo.trim().toUpperCase())
    if (existe) return alert('Este item já está cadastrado no almoxarifado.')

    setSalvando(true)
    try {
      const res = await fetch('/api/almoxarifado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: novoTipo.trim(),
          saldo: Number(novoSaldo) || 0,
          unidade: novaUnidade.trim() || 'Unidades'
        })
      })

      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Erro ao adicionar item.')
      }

      setItens(prev => [...prev, json.data])
      setNovoTipo('')
      setNovoSaldo(0)
      setNovaUnidade('Unidades')
      alert('Novo item de almoxarifado cadastrado com sucesso!')
    } catch (err: any) {
      alert('Erro: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  async function handleSalvarTodosOsSaldos() {
    setSalvando(true)
    try {
      // Atualizar no backend todos os saldos modificados
      for (const item of itens) {
        await fetch('/api/almoxarifado', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            saldo: item.saldo,
            unidade: item.unidade
          })
        })
      }

      await onAtualizarAlmoxarifado(itens)
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar saldos: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluirItem(id: number, tipo: string) {
    if (!confirm(`Deseja realmente excluir o item "${tipo}" do almoxarifado?`)) return
    setSalvando(true)
    try {
      const res = await fetch(`/api/almoxarifado?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao excluir item.')

      const filtrados = itens.filter(i => i.id !== id)
      setItens(filtrados)
      await onAtualizarAlmoxarifado(filtrados)
    } catch (err: any) {
      alert('Erro ao excluir: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Padronizado */}
        <div className="bg-teal-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-boxes-packing text-emerald-400"></i> Gestão do Almoxarifado e Saldo em Estoque (CRAS)
            </h3>
            <p className="text-[11px] text-teal-200 mt-0.5">
              Cadastre novos itens de provisão e gerencie a quantidade disponível para concessões
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Formulário de Cadastro de Novo Item */}
          <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs text-teal-950 uppercase flex items-center gap-1.5">
              <i className="fa-solid fa-plus-circle text-teal-700"></i> Cadastrar Novo Item de Almoxarifado
            </h4>
            <form onSubmit={handleAdicionarNovoItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Nome / Descrição do Item *
                </label>
                <input
                  type="text"
                  required
                  value={novoTipo}
                  onChange={e => setNovoTipo(e.target.value)}
                  placeholder="EX: COBERTOR / COLCHÃO, KIT HIGIENE..."
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Saldo Inicial *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={novoSaldo}
                  onChange={e => setNovoSaldo(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Unidade de Medida *
                </label>
                <div className="flex gap-2">
                  <select
                    value={novaUnidade}
                    onChange={e => setNovaUnidade(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold"
                  >
                    <option value="Unidades">Unidades</option>
                    <option value="Kits">Kits</option>
                    <option value="Ordens">Ordens</option>
                    <option value="Benefícios">Benefícios</option>
                    <option value="Caixas">Caixas</option>
                    <option value="Fardos">Fardos</option>
                  </select>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold shadow uppercase transition shrink-0 flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus"></i> Cadastrar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Lista e Edição dos Itens Existentes */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center justify-between">
              <span><i className="fa-solid fa-list-check text-teal-700 mr-1.5"></i> Saldos em Estoque Atuais</span>
              <span className="text-[10px] text-gray-500 font-normal">Ajuste os valores abaixo e clique em Salvar Alterações</span>
            </h4>

            {itens.length === 0 ? (
              <p className="text-center py-6 text-gray-400 italic">Nenhum item cadastrado no almoxarifado.</p>
            ) : (
              <div className="space-y-2.5">
                {itens.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 hover:border-teal-300 transition"
                  >
                    <div className="flex-1 min-w-[180px]">
                      <span className="font-bold text-xs text-gray-900 uppercase block">{item.tipo}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Unidade: {item.unidade}</span>
                    </div>

                    {/* Controles de Saldo */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAlterarSaldo(item.id, -5)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 rounded-lg text-xs transition flex items-center justify-center"
                        title="Subtrair 5"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlterarSaldo(item.id, -1)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 rounded-lg text-xs transition flex items-center justify-center"
                        title="Subtrair 1"
                      >
                        -1
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={item.saldo}
                        onChange={e => handleSetSaldoDirect(item.id, Number(e.target.value))}
                        className="w-20 px-2 py-1.5 text-center font-mono font-black text-sm border-2 border-teal-600 rounded-lg bg-teal-50/50 text-teal-950"
                      />

                      <button
                        type="button"
                        onClick={() => handleAlterarSaldo(item.id, 1)}
                        className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-lg text-xs transition flex items-center justify-center"
                        title="Adicionar 1"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlterarSaldo(item.id, 5)}
                        className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-lg text-xs transition flex items-center justify-center"
                        title="Adicionar 5"
                      >
                        +5
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExcluirItem(item.id, item.tipo)}
                        className="w-7 h-7 ml-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center"
                        title="Excluir item do Almoxarifado"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer com botão Salvar */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 uppercase font-semibold text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvarTodosOsSaldos}
            disabled={salvando}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5 text-xs"
          >
            <i className="fa-solid fa-check"></i>
            {salvando ? 'Salvando...' : 'Salvar Alterações de Estoque'}
          </button>
        </div>
      </div>
    </div>
  )
}
