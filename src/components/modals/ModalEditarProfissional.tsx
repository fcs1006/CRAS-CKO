'use client'

import { useState } from 'react'
import { Usuario } from '@/types'
import { maskCPF, maskPhone } from '@/utils/masks'

interface ModalEditarProfissionalProps {
  usuario: Usuario
  onFechar: () => void
  onSalvar: (id: number, dados: Partial<Usuario> & { senha?: string }) => Promise<void>
}

export function ModalEditarProfissional({ usuario, onFechar, onSalvar }: ModalEditarProfissionalProps) {
  const parseConselhoInicial = () => {
    const raw = (usuario.conselho || '').trim()
    if (!raw || raw === 'Não aplicável') {
      return { conselho: 'Não aplicável', uf: 'TO', registro: '' }
    }
    const match = raw.match(/^(CRESS|CRP|OAB)(?:\/([A-Z]{2}))?\s*(.*)$/i)
    if (match) {
      return {
        conselho: match[1].toUpperCase(),
        uf: match[2] ? match[2].toUpperCase() : 'TO',
        registro: match[3] ? match[3].trim() : ''
      }
    }
    return { conselho: 'CRESS', uf: 'TO', registro: raw }
  }

  const inicial = parseConselhoInicial()

  const [nome, setNome] = useState(usuario.nome || '')
  const [cargo, setCargo] = useState(usuario.cargo || 'Assistente Social')
  const [outroCargo, setOutroCargo] = useState('')
  const [conselho, setConselho] = useState(inicial.conselho)
  const [ufConselho, setUfConselho] = useState(inicial.uf)
  const [registroConselho, setRegistroConselho] = useState(inicial.registro)
  const [telefone, setTelefone] = useState(usuario.telefone ? maskPhone(usuario.telefone) : '')
  const [email, setEmail] = useState(usuario.email || '')
  const [perfil, setPerfil] = useState<'usuario' | 'admin' | 'tecnico' | 'recepcao' | 'scfv'>((usuario.perfil as any) || 'tecnico')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const ufsBrasil = [
    'TO', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 
    'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE'
  ]

  const cargosPredefinidos = [
    'Assistente Social',
    'Psicólogo(a)',
    'Coordenador(a) / Diretor(a)',
    'Orientador(a) Social',
    'Advogado(a) / Assessor(a) Jurídico',
    'Entrevistador(a) / Digitador(a) CadÚnico',
    'Técnico(a) Administrativo',
    'Educador(a) Social',
    'Outro'
  ]

  const cargoInicialEhOutro = !cargosPredefinidos.slice(0, -1).includes(usuario.cargo || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const cargoFinal = cargo === 'Outro' ? outroCargo.trim().toUpperCase() : cargo
    if (!cargoFinal) {
      setErro('Por favor, informe o cargo do profissional.')
      return
    }

    let conselhoFinal = 'Não aplicável'
    if (conselho !== 'Não aplicável' && registroConselho.trim()) {
      conselhoFinal = `${conselho}/${ufConselho} ${registroConselho.trim().toUpperCase()}`
    }

    setSalvando(true)
    try {
      await onSalvar(usuario.id, {
        nome: nome.trim().toUpperCase(),
        cargo: cargoFinal,
        conselho: conselhoFinal,
        telefone: telefone ? telefone.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        perfil,
        senha: senha.trim() ? senha.trim() : undefined
      })
      onFechar()
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar alterações do profissional.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-6 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="bg-slate-800 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <i className="fa-solid fa-user-pen text-amber-300"></i> Alterar Dados do Profissional
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              CPF / Login: <span className="font-mono font-bold text-white">{maskCPF(usuario.usuario)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-slate-400 hover:text-white text-xl transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
              <span>{erro}</span>
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nome Completo do Profissional <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold text-gray-900 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800"
            />
          </div>

          {/* Cargo e Perfil de Acesso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cargo / Função Técnica <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={cargoInicialEhOutro && cargo === 'Outro' ? 'Outro' : cargo}
                onChange={e => {
                  setCargo(e.target.value)
                  if (e.target.value === 'Assistente Social') setConselho('CRESS')
                  else if (e.target.value === 'Psicólogo(a)') setConselho('CRP')
                  else if (e.target.value === 'Advogado(a) / Assessor(a) Jurídico') setConselho('OAB')
                  else setConselho('Não aplicável')
                }}
                className="w-full px-3 py-2 border rounded-lg text-xs font-semibold text-gray-900 bg-white uppercase"
              >
                {cargosPredefinidos.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Perfil de Permissão <span className="text-red-600 font-bold">*</span>
              </label>
              <select
                value={perfil}
                onChange={e => setPerfil(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-semibold text-gray-900 bg-white"
              >
                <option value="usuario">TÉCNICO / OPERADOR</option>
                <option value="admin">ADMINISTRADOR DO SISTEMA</option>
              </select>
            </div>
          </div>

          {cargo === 'Outro' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Especifique o Cargo <span className="text-red-600 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={outroCargo}
                onChange={e => setOutroCargo(e.target.value.toUpperCase())}
                placeholder="EX: COORDENADOR(A) PEDAGÓGICO(A)"
                className="w-full px-3 py-2 border rounded-lg text-xs uppercase font-semibold"
              />
            </div>
          )}

          {/* Conselho Regional / Registro Profissional (CRESS, CRP, OAB, Não aplicável) */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
              Conselho Regional / Registro Profissional
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Conselho</label>
                <select
                  value={conselho}
                  onChange={e => setConselho(e.target.value)}
                  className="w-full px-2.5 py-2 border rounded-lg text-xs font-semibold bg-white uppercase"
                >
                  <option value="CRESS">CRESS (Serviço Social)</option>
                  <option value="CRP">CRP (Psicologia)</option>
                  <option value="OAB">OAB (Direito / Jurídico)</option>
                  <option value="Não aplicável">NÃO APLICÁVEL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">UF do Conselho</label>
                <select
                  disabled={conselho === 'Não aplicável'}
                  value={ufConselho}
                  onChange={e => setUfConselho(e.target.value)}
                  className="w-full px-2.5 py-2 border rounded-lg text-xs font-semibold bg-white uppercase disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {ufsBrasil.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Nº do Registro</label>
                <input
                  type="text"
                  disabled={conselho === 'Não aplicável'}
                  value={registroConselho}
                  onChange={e => setRegistroConselho(e.target.value.toUpperCase())}
                  placeholder="EX: 1234 / 227358"
                  className="w-full px-2.5 py-2 border rounded-lg text-xs font-semibold uppercase disabled:bg-gray-100 disabled:text-gray-400 bg-white"
                />
              </div>
            </div>
            {conselho !== 'Não aplicável' && (
              <span className="text-[11px] text-teal-800 font-semibold block">
                Formato salvo: <strong className="font-mono">{conselho}/{ufConselho} {registroConselho || '0000'}</strong>
              </span>
            )}
          </div>

          {/* Perfil de Acesso e Permissões */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 uppercase flex items-center gap-1">
              <i className="fa-solid fa-user-shield text-teal-700"></i> Perfil de Acesso & Nível de Permissão *
            </label>
            <select
              value={perfil}
              onChange={e => setPerfil(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white uppercase font-bold text-teal-950"
            >
              <option value="tecnico">📋 Técnico Superior (Assistente Social / Psicólogo / Referência PAIF)</option>
              <option value="admin">👑 Administrador / Coordenador(a) (Acesso Total)</option>
              <option value="recepcao">🏢 Atendimento / Recepção / CadÚnico (Acesso Operacional / Sem Relatos Confidenciais)</option>
              <option value="scfv">🎨 Educador(a) / Orientador(a) Social (Restrito a Oficinas e SCFV)</option>
            </select>
          </div>

          {/* Telefone e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={e => setTelefone(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tecnico@cras.gov.br"
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Redefinição Opcional de Senha */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <label className="block text-xs font-bold text-amber-900">
              Redefinir Senha de Acesso (Opcional)
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="DEIXE EM BRANCO PARA MANTER A SENHA ATUAL..."
                className="w-full px-3 py-2 pr-10 border rounded-lg text-xs font-mono font-bold bg-white"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <i className={`fa-solid ${mostrarSenha ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              disabled={salvando}
              onClick={onFechar}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 uppercase transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md uppercase transition flex items-center gap-2 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Salvando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
