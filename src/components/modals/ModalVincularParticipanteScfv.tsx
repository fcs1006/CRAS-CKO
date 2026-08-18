'use client'

import { useState, useMemo } from 'react'
import { GrupoSCFV, ParticipanteSCFV, Familia } from '@/types'
import { calculateAge, maskCPF, maskNIS } from '@/utils/masks'

interface ModalVincularParticipanteScfvProps {
  grupo: GrupoSCFV
  familias: Familia[]
  participantesGrupoExistentes: ParticipanteSCFV[]
  onClose: () => void
  onSalvarParticipante: (dados: { grupo_id: string; membro_id: string; nome: string; familia_id?: string }) => Promise<void>
}

interface BeneficiarioItem {
  idKey: string
  membro_id: string
  nome: string
  parentesco: string
  cpf?: string
  nis?: string
  familia_id: string
  responsavel_nome: string
  cod_familiar: string
  data_nascimento?: string
}

export function ModalVincularParticipanteScfv({
  grupo,
  familias,
  participantesGrupoExistentes,
  onClose,
  onSalvarParticipante
}: ModalVincularParticipanteScfvProps) {
  const [busca, setBusca] = useState('')
  const [vinculandoId, setVinculandoId] = useState<string | null>(null)

  // Extrai todos os beneficiários cadastrados na base de famílias
  const todosBeneficiarios = useMemo(() => {
    const lista: BeneficiarioItem[] = []
    const idsEncontrados = new Set<string>()

    familias.forEach(f => {
      // 1. Responsável Familiar
      if (f.responsavel) {
        const keyResp = `resp_${f.id}`
        idsEncontrados.add(keyResp)
        lista.push({
          idKey: keyResp,
          membro_id: f.id,
          nome: f.responsavel.toUpperCase(),
          parentesco: 'RESPONSÁVEL FAMILIAR',
          cpf: f.cpf_responsavel || (f as any).cpf,
          nis: f.nis_responsavel || (f as any).nis,
          familia_id: f.id,
          responsavel_nome: f.responsavel,
          cod_familiar: f.cod_familiar,
          data_nascimento: f.data_nascimento_responsavel
        })
      }

      // 2. Demais membros familiares
      if (f.membros && Array.isArray(f.membros)) {
        f.membros.forEach((m, idx) => {
          const keyMembro = m.id ? `membro_${m.id}` : `membro_${f.id}__${idx}`
          if (!idsEncontrados.has(keyMembro) && m.nome) {
            idsEncontrados.add(keyMembro)
            lista.push({
              idKey: keyMembro,
              membro_id: m.id || f.id,
              nome: m.nome.toUpperCase(),
              parentesco: (m.parentesco || 'MEMBRO FAMILIAR').toUpperCase(),
              cpf: m.cpf || f.cpf_responsavel || (f as any).cpf,
              nis: m.nis || f.nis_responsavel || (f as any).nis,
              familia_id: f.id,
              responsavel_nome: f.responsavel,
              cod_familiar: f.cod_familiar,
              data_nascimento: m.data_nascimento
            })
          }
        })
      }
    })

    return lista
  }, [familias])

  // Nomes dos participantes que já estão vinculados neste grupo
  const nomesJaVinculados = useMemo(() => {
    return new Set(participantesGrupoExistentes.map(p => (p.nome || '').toUpperCase().trim()))
  }, [participantesGrupoExistentes])

  // Filtragem pela busca e remoção de quem já está no grupo
  const beneficiariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    return todosBeneficiarios.filter(b => {
      const jaNoGrupo = nomesJaVinculados.has(b.nome.trim())
      if (jaNoGrupo) return false

      if (!termo) return true

      const bateNome = b.nome.toLowerCase().includes(termo)
      const bateCpf = (b.cpf || '').replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
      const bateNis = (b.nis || '').replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
      const bateCod = (b.cod_familiar || '').toLowerCase().includes(termo)
      const bateResp = (b.responsavel_nome || '').toLowerCase().includes(termo)

      return bateNome || bateCpf || bateNis || bateCod || bateResp
    })
  }, [todosBeneficiarios, nomesJaVinculados, busca])

  async function handleVincular(beneficiario: BeneficiarioItem) {
    setVinculandoId(beneficiario.idKey)
    try {
      await onSalvarParticipante({
        grupo_id: grupo.id,
        membro_id: beneficiario.membro_id,
        nome: beneficiario.nome,
        familia_id: beneficiario.familia_id
      })
    } catch (err: any) {
      alert('Erro ao vincular participante: ' + (err.message || 'Tente novamente.'))
    } finally {
      setVinculandoId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6 overflow-hidden flex flex-col max-h-[90vh] border border-emerald-100">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-user-plus text-emerald-300 text-lg"></i> Vincular Beneficiário ao Coletivo
            </h3>
            <p className="text-[11px] text-emerald-200 mt-0.5 font-medium uppercase">
              Grupo: <strong className="text-white">{grupo.nome}</strong> • Selecione da base cadastral do CRAS
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Busca */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-gray-400 text-xs"></i>
            <input
              type="text"
              autoFocus
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar beneficiário por nome, CPF, NIS ou responsável familiar..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5 flex justify-between">
            <span>Selecione uma pessoa cadastrada no Prontuário SUAS.</span>
            <span>Exibindo <strong>{beneficiariosFiltrados.length}</strong> beneficiário(s) disponível(is)</span>
          </p>
        </div>

        {/* Lista de Beneficiários Disponíveis */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
          {beneficiariosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <i className="fa-solid fa-users-slash text-3xl block text-gray-300"></i>
              <p className="font-semibold text-xs">Nenhum beneficiário disponível encontrado.</p>
              <p className="text-[11px] text-gray-400">
                {busca ? 'Tente buscar com outros termos.' : 'Todos os beneficiários cadastrados já estão vinculados a este grupo.'}
              </p>
            </div>
          ) : (
            beneficiariosFiltrados.map(b => {
              const estaVinculando = vinculandoId === b.idKey
              const idade = b.data_nascimento ? calculateAge(b.data_nascimento) : null

              return (
                <div
                  key={b.idKey}
                  className="p-3 bg-white hover:bg-emerald-50/40 border border-gray-200 rounded-xl transition flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-gray-900 font-bold uppercase text-xs truncate">
                        {b.nome}
                      </strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {b.parentesco}
                      </span>
                      {idade !== null && (
                        <span className="text-[10px] font-bold text-gray-500">
                          {idade} ANOS
                        </span>
                      )}
                    </div>
                    
                    <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>RESP: <strong>{b.responsavel_nome}</strong></span>
                      {b.cpf && <span>CPF: <strong>{maskCPF(b.cpf)}</strong></span>}
                      {b.nis && <span>NIS: <strong>{maskNIS(b.nis)}</strong></span>}
                      <span>CÓD. FAMILIAR: <strong>{b.cod_familiar}</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={estaVinculando}
                    onClick={() => handleVincular(b)}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs uppercase tracking-wide transition shadow flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {estaVinculando ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin text-xs"></i> Vinculando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-link text-xs"></i> Vincular
                      </>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold uppercase transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
