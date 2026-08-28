'use client'

import { useState, useEffect } from 'react'
import { Familia, Atendimento, Usuario } from '@/types'
import { isPsicologo, isAssistenteSocial } from '@/utils/permissoes'

interface ModalNovoAtendimentoProps {
  familias: Familia[]
  usuarios: Usuario[]
  usuarioLogadoNome: string
  dadosIniciais?: (Partial<Atendimento> & { agenda_id?: string }) | null
  onClose: () => void
  onSalvar: (atendimento: Partial<Atendimento> & { agenda_id?: string }) => Promise<void>
}

export function ModalNovoAtendimento({
  familias,
  usuarios,
  usuarioLogadoNome,
  dadosIniciais,
  onClose,
  onSalvar
}: ModalNovoAtendimentoProps) {
  const [salvando, setSalvando] = useState(false)
  const [familiaId, setFamiliaId] = useState(dadosIniciais?.familia_id || '')
  const [usuarioVisitado, setUsuarioVisitado] = useState(dadosIniciais?.usuario_visitado || '')
  const [tipo, setTipo] = useState(dadosIniciais?.tipo || '')
  const [local, setLocal] = useState(dadosIniciais?.local || '')
  const [data, setData] = useState(dadosIniciais?.data || '')
  const [hora, setHora] = useState(dadosIniciais?.hora || '')
  const [tecnico, setTecnico] = useState(dadosIniciais?.tecnico || usuarioLogadoNome || '')
  const [compartilhada, setCompartilhada] = useState<'Sim' | 'Não' | ''>((dadosIniciais?.compartilhada as 'Sim' | 'Não') || '')
  const [profissionaisParticipantes, setProfissionaisParticipantes] = useState(dadosIniciais?.profissionais_participantes || '')
  const [selecionadosCompartilhados, setSelecionadosCompartilhados] = useState<string[]>([])
  const [outrosProfissionaisTexto, setOutrosProfissionaisTexto] = useState('')
  const [relato, setRelato] = useState(dadosIniciais?.relato || '')
  const [providencias, setProvidencias] = useState(dadosIniciais?.providencias || '')
  const [sigilo, setSigilo] = useState<string>(dadosIniciais?.sigilo || 'equipe_tecnica')

  useEffect(() => {
    if (!tecnico && usuarioLogadoNome) {
      setTecnico(usuarioLogadoNome)
    }
  }, [usuarioLogadoNome])

  const familiaSelecionada = familias.find(f => f.id === familiaId)

  function handleTipoChange(novoTipo: string) {
    setTipo(novoTipo)
    if (novoTipo === 'Visita Domiciliar') {
      setLocal('Domicílio')
    }
  }

  function toggleProfissionalCompartilhado(nomeCargo: string) {
    setSelecionadosCompartilhados(prev =>
      prev.includes(nomeCargo) ? prev.filter(n => n !== nomeCargo) : [...prev, nomeCargo]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familiaId) return alert('Por favor, selecione a família atendida.')
    if (!usuarioVisitado.trim()) return alert('Por favor, informe quem foi a pessoa atendida / visitada.')
    if (!tipo) return alert('Por favor, selecione a tipologia do atendimento.')
    if (!local) return alert('Por favor, selecione o local do atendimento.')
    if (!data) return alert('Por favor, informe a data do atendimento.')
    if (!hora) return alert('Por favor, informe o horário do atendimento.')
    if (!tecnico) return alert('Por favor, selecione o técnico responsável.')
    if (!relato.trim()) {
      alert('Por favor, preencha o relato técnico da escuta qualificada.')
      return
    }

    if (!providencias.trim()) {
      alert('Por favor, informe as Providências Adotadas e Encaminhamentos.')
      return
    }

    let profissionaisFinais: string | undefined = undefined
    if (compartilhada === 'Sim') {
      const lista = [...selecionadosCompartilhados]
      if (outrosProfissionaisTexto.trim()) {
        lista.push(outrosProfissionaisTexto.trim().toUpperCase())
      }
      if (lista.length === 0 && profissionaisParticipantes.trim()) {
        lista.push(profissionaisParticipantes.trim().toUpperCase())
      }
      if (lista.length === 0) {
        return alert('Por favor, selecione ou informe ao menos um profissional participante do atendimento compartilhado.')
      }
      profissionaisFinais = lista.join(', ')
    }

    setSalvando(true)

    try {
      const tecnicoObj = usuarios.find(u => u.nome === tecnico || u.usuario === tecnico)
      const conselhoInfo = tecnicoObj?.conselho && tecnicoObj.conselho !== 'Não aplicável' ? tecnicoObj.conselho : undefined

      const atendimentoPayload: Partial<Atendimento> & { agenda_id?: string } = {
        familia_id: familiaId,
        data,
        hora,
        usuario_visitado: usuarioVisitado.trim().toUpperCase(),
        participantes_familiares: [usuarioVisitado.trim().toUpperCase()],
        local,
        compartilhada: (compartilhada as 'Sim' | 'Não') || 'Não',
        profissionais_participantes: compartilhada === 'Sim' ? profissionaisFinais : undefined,
        tecnico: tecnico.trim().toUpperCase(),
        tecnico_conselho: conselhoInfo,
        sigilo,
        relato: `${relato.trim().toUpperCase()}\n\n[SIGILO:${sigilo}]`,
        providencias: providencias.trim().toUpperCase(),
        tipo,
        agenda_id: dadosIniciais?.agenda_id
      }

      await onSalvar(atendimentoPayload)
      onClose()
    } catch (err: any) {
      alert('Erro ao registrar atendimento: ' + (err.message || 'Tente novamente.'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-teal-800 text-white p-5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-notes-medical text-teal-300"></i> Registro de Atendimento / Evolução Técnica (SUAS)
            </h3>
            <p className="text-[11px] text-teal-100 mt-0.5">
              Instrumento Oficial de Registro de Atendimentos do Prontuário SUAS
            </p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Seleção da Família */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
              Família / Prontuário <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={familiaId}
              onChange={e => {
                setFamiliaId(e.target.value)
                setUsuarioVisitado('')
              }}
              required
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-semibold truncate"
            >
              <option value="">SELECIONE A FAMÍLIA ATENDIDA *</option>
              {familias.map(f => (
                <option key={f.id} value={f.id}>
                  {f.responsavel} — PRONTUÁRIO Nº: {f.cod_familiar} (CPF: {f.cpf_responsavel || '—'}) {f.paif_ativo ? '— [PAIF ATIVO]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Pessoa Atendida e Tipo de Atendimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
                Pessoa Atendida / Solicitante <span className="text-red-600 font-bold">*</span>
              </label>
              {familiaSelecionada ? (
                <select
                  value={usuarioVisitado}
                  onChange={e => setUsuarioVisitado(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950 truncate"
                >
                  <option value="">SELECIONE QUEM FOI ATENDIDO *</option>
                  <option value={familiaSelecionada.responsavel}>
                    {familiaSelecionada.responsavel} (Responsável Familiar)
                  </option>
                  {familiaSelecionada.membros && familiaSelecionada.membros
                    .filter(m => m.nome.trim().toUpperCase() !== familiaSelecionada.responsavel.trim().toUpperCase())
                    .map(m => (
                      <option key={m.id || m.nome} value={m.nome}>
                        {m.nome} ({m.parentesco || 'Membro Familiar'})
                      </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={usuarioVisitado}
                  onChange={e => setUsuarioVisitado(e.target.value.toUpperCase())}
                  placeholder="SELECIONE A FAMÍLIA ACIMA"
                  className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-medium"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
                Tipologia do Atendimento (SUAS/RMA) <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={tipo}
                onChange={e => handleTipoChange(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold uppercase truncate"
              >
                <option value="">SELECIONE A TIPOLOGIA *</option>
                <option value="Recepção / Acolhida Inicial">RECEPÇÃO / ACOLHIDA INICIAL</option>
                <option value="Atendimento Particularizado">ATENDIMENTO PARTICULARIZADO</option>
                <option value="Acompanhamento PAIF">ACOMPANHAMENTO PAIF</option>
                <option value="Visita Domiciliar">VISITA DOMICILIAR</option>
                <option value="Atendimento em Grupo / Coletivo">ATENDIMENTO EM GRUPO / COLETIVO</option>
              </select>
            </div>
          </div>

          {/* Técnico Responsável e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
                Técnico(a) Responsável <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={tecnico}
                onChange={e => setTecnico(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950 truncate"
              >
                <option value="">SELECIONE O TÉCNICO *</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.nome}>
                    {u.nome} ({u.cargo || 'Técnico'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
                Local do Atendimento <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={local}
                onChange={e => setLocal(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold uppercase truncate"
              >
                <option value="">SELECIONE O LOCAL *</option>
                <option value="CRAS">CRAS (UNIDADE)</option>
                <option value="Domicílio">DOMICÍLIO</option>
                <option value="Espaço Comunitário">ESPAÇO COMUNITÁRIO</option>
                <option value="Outro">OUTRO</option>
              </select>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
                Data do Atendimento <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap">
                Horário do Atendimento <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* Atendimento Compartilhado */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="font-bold text-gray-800 uppercase text-xs block">Atendimento Compartilhado (Interdisciplinar / Co-visita)?</span>
                <span className="text-[10px] text-gray-500">Marque SIM caso mais de um técnico da equipe tenha participado do atendimento/visita</span>
              </div>
              <select
                value={compartilhada}
                onChange={e => setCompartilhada(e.target.value as any)}
                className="px-3 py-1.5 border border-teal-300 rounded-lg text-xs bg-white font-bold uppercase text-teal-950 shadow-xs"
              >
                <option value="">SELECIONE</option>
                <option value="Não">NÃO</option>
                <option value="Sim">SIM</option>
              </select>
            </div>

            {compartilhada === 'Sim' && (
              <div className="p-3 bg-white border border-teal-200 rounded-xl space-y-2.5">
                <label className="block text-xs font-bold text-teal-950 uppercase flex items-center gap-1.5">
                  <i className="fa-solid fa-user-group text-teal-700"></i> Selecione os Profissionais Participantes / Co-visitantes Cadastrados <span className="text-red-600 font-bold">*</span>:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {usuarios
                    .filter(u => {
                      const uNomeUpper = u.nome.trim().toUpperCase()
                      const tecUpper = (tecnico || '').trim().toUpperCase()
                      const logUpper = (usuarioLogadoNome || '').trim().toUpperCase()
                      return uNomeUpper !== tecUpper && uNomeUpper !== logUpper
                    })
                    .map(u => {
                      const itemStr = `${u.nome.toUpperCase()} (${(u.cargo || 'TÉCNICO').toUpperCase()})`
                      const isChecked = selecionadosCompartilhados.includes(itemStr)
                      return (
                        <label
                          key={u.id}
                          onClick={() => toggleProfissionalCompartilhado(itemStr)}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                            isChecked
                              ? 'bg-teal-100 border-teal-400 font-bold text-teal-950 shadow-xs'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded text-teal-700"
                          />
                          <span>{itemStr}</span>
                        </label>
                      )
                    })}
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Outros Profissionais Externos / Participantes Adicionais (opcional):
                  </label>
                  <input
                    type="text"
                    value={outrosProfissionaisTexto}
                    onChange={e => setOutrosProfissionaisTexto(e.target.value.toUpperCase())}
                    placeholder="EX: ENFERMEIRA MARIA (POSTO DE SAÚDE), CONSELHEIRO PEDRO..."
                    className="w-full px-3 py-2 border rounded-lg text-xs uppercase bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Nível de Sigilo Profissional */}
          {(() => {
            const tecnicoObj = usuarios.find(u => u.nome === tecnico || u.usuario === tecnico || u.nome === usuarioLogadoNome)
            const ehPsicologoTecnico = isPsicologo(tecnicoObj) || (tecnico || '').toLowerCase().includes('psicól') || (tecnico || '').toLowerCase().includes('crp')
            const ehAssistenteSocialTecnico = isAssistenteSocial(tecnicoObj) || (tecnico || '').toLowerCase().includes('social') || (tecnico || '').toLowerCase().includes('cress')
            const ehAdmin = tecnicoObj?.perfil === 'admin'

            return (
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 uppercase flex items-center gap-1.5">
                  <i className="fa-solid fa-lock text-amber-600"></i> Nível de Sigilo Profissional / Privacidade da Escuta *
                </label>
                <select
                  value={sigilo}
                  onChange={e => setSigilo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950"
                >
                  <option value="equipe_tecnica">Restrito à Equipe Técnica Superior (Assistentes Sociais e Psicólogos)</option>

                  {(ehPsicologoTecnico || ehAdmin || (!ehPsicologoTecnico && !ehAssistenteSocialTecnico)) && (
                    <option value="apenas_psicologia">Restrito à Categoria Profissional de Psicologia (Resolução CFP / CRP)</option>
                  )}

                  {(ehAssistenteSocialTecnico || ehAdmin || (!ehPsicologoTecnico && !ehAssistenteSocialTecnico)) && (
                    <option value="apenas_servico_social">Restrito à Categoria Profissional de Serviço Social (Código de Ética CRESS)</option>
                  )}

                  <option value="publico">Geral / Público (Visível para toda a equipe do CRAS)</option>
                </select>
                {compartilhada === 'Sim' && (
                  <p className="text-[10px] text-teal-800 font-semibold mt-1">
                    Atendimento compartilhado: os profissionais e co-visitantes selecionados terão acesso garantido à leitura do atendimento.
                  </p>
                )}
              </div>
            )
          })()}

          {/* Relato Técnico / Síntese */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Síntese do Atendimento / Relato Técnico (SUAS) <span className="text-red-600 font-bold">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={relato}
              onChange={e => setRelato(e.target.value.toUpperCase())}
              placeholder="DESCREVA DE FORMA OBJETIVA A DEMANDA APRESENTADA, A ESCUTA QUALIFICADA E A INTERVENÇÃO REALIZADA..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
            />
          </div>

          {/* Providências / Encaminhamentos */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Providências Adotadas e Encaminhamentos <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={providencias}
              onChange={e => setProvidencias(e.target.value.toUpperCase())}
              placeholder="ORIENTAÇÕES FORNECIDAS, INSERÇÃO EM GRUPO, AGENDAMENTO DE VISITA OU ENCAMINHAMENTOS..."
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 uppercase font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow transition uppercase flex items-center gap-1.5"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              {salvando ? 'Registrando...' : 'Registrar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}