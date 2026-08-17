import { useState } from 'react'
import { Usuario } from '@/types'
import { maskCPF } from '@/utils/masks'
import { ModalNovoProfissional } from '../modals/ModalNovoProfissional'
import { ModalEditarProfissional } from '../modals/ModalEditarProfissional'

interface UsuariosViewProps {
  usuarios: Usuario[]
  usuarioLogado: Usuario | null
  onAprovarUsuario: (id: number) => void
  onAlternarStatusUsuario: (id: number, ativoAtual: boolean) => void
  onCadastrarUsuario?: (dados: any) => Promise<void>
  onEditarUsuario?: (id: number, dados: any) => Promise<void>
  onExcluirUsuario?: (id: number) => Promise<void>
}

export function UsuariosView({
  usuarios,
  usuarioLogado,
  onAprovarUsuario,
  onAlternarStatusUsuario,
  onCadastrarUsuario,
  onEditarUsuario,
  onExcluirUsuario
}: UsuariosViewProps) {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [mostrarModalCadastro, setMostrarModalCadastro] = useState(false)
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null)

  const pendentesCount = usuarios.filter(u => !u.ativo).length

  const usuariosFiltrados = usuarios.filter(u => {
    const termo = busca.toLowerCase().trim()
    const bateTexto = 
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.usuario || '').includes(termo) ||
      (u.cargo || '').toLowerCase().includes(termo)
    const bateStatus = filtroStatus === 'TODOS' 
      ? true 
      : filtroStatus === 'INATIVO' || filtroStatus === 'PENDENTE'
        ? !u.ativo 
        : u.ativo
    return bateTexto && bateStatus
  })

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-users-gear text-slate-700"></i> Gestão de Usuários & Técnicos do CRAS
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Controle de acessos, habilitação de técnicos e perfis administrativos.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pendentesCount > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-2 animate-pulse">
              <i className="fa-solid fa-triangle-exclamation"></i> {pendentesCount} Pendente(s)
            </span>
          )}
          <button
            type="button"
            onClick={() => setMostrarModalCadastro(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow uppercase"
          >
            <i className="fa-solid fa-user-plus text-emerald-400"></i> Cadastrar Profissional
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm"></i>
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou cargo..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
        </div>

        <div>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 bg-white"
          >
            <option value="TODOS">Todos os Profissionais ({usuarios.length})</option>
            <option value="ATIVO">Apenas Profissionais Ativos ({usuarios.filter(u => u.ativo).length})</option>
            <option value="INATIVO">Apenas Profissionais Inativos ({usuarios.filter(u => !u.ativo).length})</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Nome do Profissional</th>
                <th className="py-3 px-4">CPF / Usuário</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4">Conselho Profissional</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-gray-800">{u.nome}</td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-600">{maskCPF(u.usuario)}</td>
                    <td className="py-3 px-4 text-gray-700">{u.cargo}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{u.conselho || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.perfil === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.perfil.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.ativo ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Ativo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Botão de Editar */}
                        <button
                          type="button"
                          onClick={() => setUsuarioParaEditar(u)}
                          title="Editar Dados do Profissional"
                          className="w-8 h-8 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold transition flex items-center justify-center shadow-xs"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>

                        {/* Botão de Ativar / Inativar */}
                        {!u.ativo ? (
                          <button
                            type="button"
                            onClick={() => onAlternarStatusUsuario(u.id, u.ativo)}
                            title="Ativar / Habilitar Acesso do Profissional"
                            className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-bold transition flex items-center justify-center shadow-xs"
                          >
                            <i className="fa-solid fa-user-check text-xs"></i>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (usuarioLogado?.id === u.id) {
                                alert('Você não pode inativar seu próprio usuário em uso.')
                                return
                              }
                              if (confirm(`Tem certeza que deseja inativar o acesso de ${u.nome}?`)) {
                                onAlternarStatusUsuario(u.id, u.ativo)
                              }
                            }}
                            title="Inativar Acesso do Profissional"
                            className="w-8 h-8 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 rounded-lg font-bold transition flex items-center justify-center shadow-xs"
                          >
                            <i className="fa-solid fa-user-slash text-xs"></i>
                          </button>
                        )}

                        {/* Botão de Excluir */}
                        {onExcluirUsuario && (
                          <button
                            type="button"
                            onClick={() => {
                              if (usuarioLogado?.id === u.id) {
                                alert('Você não pode excluir seu próprio usuário logado.')
                                return
                              }
                              if (confirm(`Atenção: Tem certeza que deseja excluir permanentemente o cadastro do profissional ${u.nome}? Esta ação não poderá ser desfeita.`)) {
                                onExcluirUsuario(u.id)
                              }
                            }}
                            title="Excluir Permanentemente o Profissional"
                            className="w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold transition flex items-center justify-center shadow-xs"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Novo Profissional */}
      {mostrarModalCadastro && (
        <ModalNovoProfissional
          onFechar={() => setMostrarModalCadastro(false)}
          onSalvar={async dados => {
            if (onCadastrarUsuario) {
              await onCadastrarUsuario(dados)
            }
          }}
        />
      )}

      {/* Modal de Edição de Profissional */}
      {usuarioParaEditar && (
        <ModalEditarProfissional
          usuario={usuarioParaEditar}
          onFechar={() => setUsuarioParaEditar(null)}
          onSalvar={async (id, dados) => {
            if (onEditarUsuario) {
              await onEditarUsuario(id, dados)
            }
          }}
        />
      )}
    </div>
  )
}
