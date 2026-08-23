'use client'

import { useState, useEffect } from 'react'
import { GrupoSCFV, Usuario } from '@/types'

interface ModalNovoGrupoScfvProps {
  usuarioLogadoNome?: string
  usuarios?: Usuario[]
  grupoParaEditar?: GrupoSCFV | null
  onClose: () => void
  onSalvar: (grupo: Partial<GrupoSCFV>) => Promise<void>
}

export function ModalNovoGrupoScfv({
  usuarioLogadoNome = '',
  usuarios = [],
  grupoParaEditar = null,
  onClose,
  onSalvar
}: ModalNovoGrupoScfvProps) {
  const [salvando, setSalvando] = useState(false)
  const [nome, setNome] = useState(grupoParaEditar?.nome || '')
  const [tipoGrupo, setTipoGrupo] = useState<'SCFV' | 'PAIF' | 'OUTRO'>((grupoParaEditar?.tipo_grupo as 'SCFV' | 'PAIF' | 'OUTRO') || 'SCFV')
  const [faixaEtaria, setFaixaEtaria] = useState<string>(grupoParaEditar?.faixa_etaria || '60_mais')
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>(
    grupoParaEditar?.dias_semana ? grupoParaEditar.dias_semana.split(' e ') : ['Terça', 'Quinta']
  )
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFim, setHoraFim] = useState('10:30')
  const [localEncontro, setLocalEncontro] = useState(grupoParaEditar?.local_encontro || 'CRAS (Sede)')
  const [tecnico, setTecnico] = useState(grupoParaEditar?.tecnico_responsavel || usuarioLogadoNome || '')
  const [vagasLimite, setVagasLimite] = useState<number | ''>(grupoParaEditar?.vagas_limite || 25)
  const [descricao, setDescricao] = useState(grupoParaEditar?.descricao || '')

  useEffect(() => {
    if (grupoParaEditar) {
      setNome(grupoParaEditar.nome || '')
      setTipoGrupo((grupoParaEditar.tipo_grupo as 'SCFV' | 'PAIF' | 'OUTRO') || 'SCFV')
      setFaixaEtaria(grupoParaEditar.faixa_etaria || '60_mais')
      if (grupoParaEditar.dias_semana) {
        setDiasSelecionados(grupoParaEditar.dias_semana.split(' e '))
      }
      if (grupoParaEditar.local_encontro) setLocalEncontro(grupoParaEditar.local_encontro)
      if (grupoParaEditar.tecnico_responsavel) setTecnico(grupoParaEditar.tecnico_responsavel)
      if (grupoParaEditar.vagas_limite) setVagasLimite(grupoParaEditar.vagas_limite)
      if (grupoParaEditar.descricao) setDescricao(grupoParaEditar.descricao)
    } else if (usuarioLogadoNome && !tecnico) {
      setTecnico(usuarioLogadoNome)
    }
  }, [usuarioLogadoNome, grupoParaEditar])

  const todosDias = [
    { sigla: 'SEG', nome: 'Segunda' },
    { sigla: 'TER', nome: 'Terça' },
    { sigla: 'QUA', nome: 'Quarta' },
    { sigla: 'QUI', nome: 'Quinta' },
    { sigla: 'SEX', nome: 'Sexta' },
    { sigla: 'SÁB', nome: 'Sábado' }
  ]

  function toggleDia(diaNome: string) {
    if (diasSelecionados.includes(diaNome)) {
      setDiasSelecionados(diasSelecionados.filter(d => d !== diaNome))
    } else {
      setDiasSelecionados([...diasSelecionados, diaNome])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return alert('Por favor, informe o nome do coletivo/grupo.')
    if (!horaInicio || !horaFim) return alert('Por favor, informe os horários de início e término dos encontros.')
    if (!descricao.trim()) return alert('Por favor, informe o Objetivo e Descrição das Atividades / Plano de Trabalho.')
    setSalvando(true)

    try {
      const diasTexto = diasSelecionados.length > 0 ? diasSelecionados.join(' e ') : 'Encontros Periódicos'
      const horarioFinal = `${diasTexto} das ${horaInicio} às ${horaFim}`.trim()

      const novo: Partial<GrupoSCFV> = {
        ...(grupoParaEditar ? { id: grupoParaEditar.id } : {}),
        nome: nome.trim().toUpperCase(),
        tipo_grupo: tipoGrupo,
        faixa_etaria: faixaEtaria,
        horario: horarioFinal,
        dias_semana: diasTexto,
        local_encontro: localEncontro.trim(),
        vagas_limite: vagasLimite === '' ? undefined : Number(vagasLimite),
        tecnico_responsavel: tecnico.trim() || usuarioLogadoNome || 'TÉCNICO RESPONSÁVEL',
        descricao: descricao.trim().toUpperCase(),
        status: grupoParaEditar?.status || 'Ativo'
      }

      await onSalvar(novo)
      onClose()
    } catch (err: any) {
      alert('Erro ao salvar grupo/oficina.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-6 overflow-hidden flex flex-col max-h-[92vh] border border-indigo-100">
        
        {/* Modal Header */}
        <div className="bg-indigo-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-people-group text-indigo-300"></i> {grupoParaEditar ? 'Editar Coletivo / Grupo' : 'Criar Grupo / Oficina SCFV (SUAS)'}
            </h3>
            <p className="text-[11px] text-indigo-200 mt-0.5">
              Serviço de Convivência e Fortalecimento de Vínculos / Oficinas PAIF
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-indigo-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Nome do Coletivo */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
              Nome do Coletivo / Grupo <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="EX: GRUPO DE IDOSOS 'VIVER MELHOR', OFICINA DE ARTESANATO..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          {/* Tipo de Coletivo & Faixa Etária */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Tipo de Serviço / Modalidade *
              </label>
              <select
                value={tipoGrupo}
                onChange={e => setTipoGrupo(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white uppercase"
              >
                <option value="SCFV">SCFV (Convivência e Vínculos)</option>
                <option value="PAIF">Oficina / Grupo PAIF (Proteção Social)</option>
                <option value="OUTRO">Grupo Comunitário / Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Faixa Etária / Ciclo de Vida (MDS) *
              </label>
              <select
                value={faixaEtaria}
                onChange={e => setFaixaEtaria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white uppercase"
              >
                <option value="0_a_6">0 a 6 anos (Primeira Infância)</option>
                <option value="6_a_15">6 a 15 anos (Crianças e Adolescentes)</option>
                <option value="15_a_17">15 a 17 anos (Adolescentes e Jovens)</option>
                <option value="18_a_59">18 a 59 anos (Adultos / Famílias)</option>
                <option value="60_mais">60+ anos (Pessoas Idosas)</option>
                <option value="Intergeracional">Intergeracional (Todas as Idades)</option>
              </select>
            </div>
          </div>

          {/* Dias da Semana Selecionáveis */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Dias dos Encontros</span>
              <span className="text-[10px] font-semibold text-indigo-700">Clique para selecionar os dias</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {todosDias.map(d => {
                const ativo = diasSelecionados.includes(d.nome)
                return (
                  <button
                    key={d.sigla}
                    type="button"
                    onClick={() => toggleDia(d.nome)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                      ativo
                        ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`fa-solid ${ativo ? 'fa-circle-check text-indigo-300' : 'fa-circle text-gray-300'}`}></i>
                    {d.sigla}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Horário & Local dos Encontros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Horário de Início <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                type="time"
                required
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Horário de Término <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                type="time"
                required
                value={horaFim}
                onChange={e => setHoraFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Local de Realização
              </label>
              <input
                type="text"
                value={localEncontro}
                onChange={e => setLocalEncontro(e.target.value)}
                placeholder="EX: CRAS (SEDE), CENTRO DE CONVIVÊNCIA..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold uppercase bg-white"
              />
            </div>
          </div>

          {/* Técnico Responsável & Limite de Vagas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <i className="fa-solid fa-user-tie text-indigo-700"></i> Técnico / Orientador Responsável *
              </label>
              {usuarios && usuarios.length > 0 ? (
                <select
                  value={tecnico}
                  onChange={e => setTecnico(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold uppercase bg-white text-indigo-950"
                >
                  {usuarios.map(u => (
                    <option key={u.id} value={u.nome}>
                      {u.nome} ({u.cargo || 'TÉCNICO'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={tecnico}
                  onChange={e => setTecnico(e.target.value)}
                  placeholder="NOME DO TÉCNICO RESPONSÁVEL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold uppercase bg-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Limite de Vagas
              </label>
              <input
                type="number"
                min={1}
                value={vagasLimite}
                onChange={e => setVagasLimite(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="EX: 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white"
              />
            </div>
          </div>

          {/* Objetivo e Descrição das Atividades */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
              Objetivo e Descrição das Atividades / Plano de Trabalho <span className="text-rose-600 font-bold">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="DESCRIÇÃO OBRIGATÓRIA DAS TEMÁTICAS ABORDADAS, OBJETIVOS OPERACIONAIS E PERFIL DOS PARTICIPANTES..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs leading-relaxed uppercase bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <i className="fa-solid fa-check"></i>
              {salvando ? 'Criando...' : 'Concluir & Criar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
