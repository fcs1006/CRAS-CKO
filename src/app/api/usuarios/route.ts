import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { registrarLogAuditoria } from '@/lib/auditLogger'

function verificarPermissaoAdmin(request: NextRequest): boolean {
  const perfil = request.headers.get('x-auth-user-perfil')
  return perfil === 'admin' || perfil === 'coordenador'
}

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, usuario, perfil, ativo, cargo, conselho, telefone, email, criado_em')
      .order('criado_em', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verificarPermissaoAdmin(request)) {
      await registrarLogAuditoria({
        acao: 'ACESSO_NEGADO_SIGILO',
        usuario_id: request.headers.get('x-auth-user-id') || undefined,
        usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
        detalhes: 'Tentativa não autorizada de cadastrar profissional.',
        entidade: 'usuarios'
      })
      return NextResponse.json({ ok: false, error: 'Apenas Administradores ou Coordenadores podem criar usuários.' }, { status: 403 })
    }

    const { nome, cpf, senha, cargo, conselho, telefone, email, perfil = 'usuario', ativo = true } = await request.json()

    if (!nome || !cpf || !senha || !cargo) {
      return NextResponse.json({ ok: false, error: 'Nome, CPF, Senha e Cargo são obrigatórios.' }, { status: 400 })
    }

    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      return NextResponse.json({ ok: false, error: 'CPF deve conter 11 dígitos válidos.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // 1. Criar o usuário usando a RPC segura
    const { data: resRpc, error: errRpc } = await supabase.rpc('criar_usuario', {
      p_nome: nome.trim().toUpperCase(),
      p_cpf: cleanCpf,
      p_senha: senha.trim(),
      p_cargo: cargo.trim(),
      p_conselho: (conselho || 'Não aplicável').trim(),
      p_telefone: telefone ? telefone.trim() : null,
      p_email: email ? email.trim() : null
    })

    if (errRpc) {
      return NextResponse.json({ ok: false, error: errRpc.message }, { status: 500 })
    }

    if (!resRpc?.ok) {
      return NextResponse.json({ ok: false, error: resRpc?.error || 'Erro ao cadastrar profissional.' }, { status: 400 })
    }

    // 2. Se for cadastrado pelo Administrador no Painel, ajustar perfil e ativar diretamente
    const updatePayload: Record<string, any> = {
      ativo: ativo === true,
      perfil: perfil === 'admin' ? 'admin' : (perfil === 'coordenador' ? 'coordenador' : 'usuario')
    }

    const { error: errUpdate } = await supabase
      .from('usuarios')
      .update(updatePayload)
      .eq('usuario', cleanCpf)

    if (errUpdate) {
      console.error('Aviso ao atualizar perfil do usuário criado:', errUpdate)
    }

    await registrarLogAuditoria({
      acao: 'USUARIO_CRIADO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Usuário cadastrado: ${nome.toUpperCase()} (CPF: ${cleanCpf}, Perfil: ${perfil}).`,
      entidade: 'usuarios'
    })

    // Retorna os dados do usuário recém-criado
    const { data: usuarioCriado } = await supabase
      .from('usuarios')
      .select('id, nome, usuario, perfil, ativo, cargo, conselho, telefone, email, criado_em')
      .eq('usuario', cleanCpf)
      .single()

    return NextResponse.json({ ok: true, data: usuarioCriado || resRpc })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verificarPermissaoAdmin(request)) {
      return NextResponse.json({ ok: false, error: 'Apenas Administradores ou Coordenadores podem editar profissionais.' }, { status: 403 })
    }

    const { id, nome, cargo, conselho, telefone, email, perfil, ativo, senha } = await request.json()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do usuário é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const updateData: Record<string, any> = {}
    if (nome !== undefined) updateData.nome = nome.trim().toUpperCase()
    if (cargo !== undefined) updateData.cargo = cargo.trim()
    if (conselho !== undefined) updateData.conselho = conselho.trim()
    if (telefone !== undefined) updateData.telefone = telefone ? telefone.trim() : null
    if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : null
    if (perfil !== undefined) updateData.perfil = perfil
    if (ativo !== undefined) updateData.ativo = ativo

    const { data: usuarioAtual, error: errGet } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single()

    if (errGet || !usuarioAtual) {
      return NextResponse.json({ ok: false, error: 'Usuário não encontrado.' }, { status: 404 })
    }

    // Se uma nova senha for fornecida
    if (senha && senha.trim()) {
      await supabase.rpc('recuperar_senha', {
        p_cpf: usuarioAtual.usuario,
        p_contato: usuarioAtual.email || usuarioAtual.telefone || 'cras',
        p_nova_senha: senha.trim()
      })
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select('id, nome, usuario, perfil, ativo, cargo, conselho, telefone, email, criado_em')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    await registrarLogAuditoria({
      acao: 'USUARIO_EDITADO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Usuário editado ID ${id} (${usuarioAtual.nome}).`,
      entidade: 'usuarios',
      entidade_id: id
    })

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verificarPermissaoAdmin(request)) {
      return NextResponse.json({ ok: false, error: 'Apenas Administradores ou Coordenadores podem remover profissionais.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do usuário é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    await registrarLogAuditoria({
      acao: 'USUARIO_EXCLUIDO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Usuário removido ID ${id}.`,
      entidade: 'usuarios',
      entidade_id: id
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
