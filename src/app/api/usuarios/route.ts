import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { registrarLogAuditoria } from '@/lib/auditLogger'
import { getD1Database } from '@/lib/d1Client'

function verificarPermissaoAdmin(request: NextRequest): boolean {
  const perfil = request.headers.get('x-auth-user-perfil')
  return perfil === 'admin' || perfil === 'coordenador'
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = verificarPermissaoAdmin(request)

    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const colunas = isAdmin 
          ? 'id, nome, usuario, perfil, ativo, cargo, conselho, telefone, email, criado_em' 
          : 'id, nome, perfil, ativo, cargo, conselho'
        const order = isAdmin ? 'criado_em DESC' : 'nome ASC'
        const where = !isAdmin ? 'WHERE ativo = 1' : ''
        const usersRes = await db.prepare(`SELECT ${colunas} FROM usuarios ${where} ORDER BY ${order}`).all<any>()
        return NextResponse.json({ ok: true, data: usersRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_USUARIOS_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      let query = supabase
        .from('usuarios')
        .select(isAdmin ? 'id, nome, usuario, perfil, ativo, cargo, conselho, telefone, email, criado_em' : 'id, nome, perfil, ativo, cargo, conselho')

      if (!isAdmin) {
        query = query.eq('ativo', true).order('nome', { ascending: true })
      } else {
        query = query.order('criado_em', { ascending: false })
      }

      const { data, error } = await query
      if (!error && data) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_USR_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
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

    const bcrypt = await import('bcryptjs')
    const hash = bcrypt.hashSync(senha.trim(), 10)
    let usuarioCriado: any = null

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const exist = await db.prepare('SELECT id FROM usuarios WHERE REPLACE(REPLACE(REPLACE(usuario, ".", ""), "-", ""), " ", "") = ?').bind(cleanCpf).first()
        if (exist) {
          return NextResponse.json({ ok: false, error: 'Este CPF já possui cadastro de usuário no sistema.' }, { status: 400 })
        }

        const resD1 = await db.prepare(`
          INSERT INTO usuarios (nome, usuario, senha_hash, cargo, conselho, telefone, email, ativo, perfil, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          nome.trim().toUpperCase(),
          cleanCpf,
          hash,
          cargo.trim(),
          (conselho || 'Não aplicável').trim(),
          telefone ? telefone.trim() : null,
          email ? email.trim() : null,
          ativo === true ? 1 : 0,
          perfil === 'admin' ? 'admin' : (perfil === 'coordenador' ? 'coordenador' : 'usuario')
        ).run()

        usuarioCriado = {
          id: (resD1 as any)?.meta?.last_row_id || Date.now(),
          nome: nome.trim().toUpperCase(),
          usuario: cleanCpf,
          perfil,
          ativo,
          cargo,
          conselho
        }
      }
    } catch (d1Err) {
      console.warn('[D1_USUARIO_POST_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      const { data: resRpc } = await supabase.rpc('criar_usuario', {
        p_nome: nome.trim().toUpperCase(),
        p_cpf: cleanCpf,
        p_senha: senha.trim(),
        p_cargo: cargo.trim(),
        p_conselho: (conselho || 'Não aplicável').trim(),
        p_telefone: telefone ? telefone.trim() : null,
        p_email: email ? email.trim() : null
      })

      if (resRpc?.ok) {
        await supabase.from('usuarios').update({
          ativo: ativo === true,
          perfil: perfil === 'admin' ? 'admin' : (perfil === 'coordenador' ? 'coordenador' : 'usuario')
        }).eq('usuario', cleanCpf)
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_USER_POST_FALLBACK]:', sbErr)
    }

    await registrarLogAuditoria({
      acao: 'USUARIO_CRIADO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Usuário cadastrado: ${nome.toUpperCase()} (CPF: ${cleanCpf}, Perfil: ${perfil}).`,
      entidade: 'usuarios'
    })

    return NextResponse.json({ ok: true, data: usuarioCriado || { nome, usuario: cleanCpf, perfil, ativo } })
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

    let senhaHashNova: string | null = null
    if (senha && senha.trim()) {
      const bcrypt = await import('bcryptjs')
      senhaHashNova = bcrypt.hashSync(senha.trim(), 10)
    }

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const ativoNum = ativo !== undefined ? (ativo ? 1 : 0) : null
        await db.prepare(`
          UPDATE usuarios
          SET 
            nome = COALESCE(?, nome),
            cargo = COALESCE(?, cargo),
            conselho = COALESCE(?, conselho),
            telefone = COALESCE(?, telefone),
            email = COALESCE(?, email),
            perfil = COALESCE(?, perfil),
            ativo = COALESCE(?, ativo),
            senha_hash = COALESCE(?, senha_hash)
          WHERE id = ?
        `).bind(
          nome ? nome.trim().toUpperCase() : null,
          cargo ? cargo.trim() : null,
          conselho ? conselho.trim() : null,
          telefone ? telefone.trim() : null,
          email ? email.trim().toLowerCase() : null,
          perfil || null,
          ativoNum,
          senhaHashNova,
          id
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_USUARIO_PUT_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      const updateData: Record<string, any> = {}
      if (nome !== undefined) updateData.nome = nome.trim().toUpperCase()
      if (cargo !== undefined) updateData.cargo = cargo.trim()
      if (conselho !== undefined) updateData.conselho = conselho.trim()
      if (telefone !== undefined) updateData.telefone = telefone ? telefone.trim() : null
      if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : null
      if (perfil !== undefined) updateData.perfil = perfil
      if (ativo !== undefined) updateData.ativo = ativo

      await supabase.from('usuarios').update(updateData).eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_USER_PUT_FALLBACK]:', sbErr)
    }

    await registrarLogAuditoria({
      acao: 'USUARIO_EDITADO',
      usuario_id: request.headers.get('x-auth-user-id') || undefined,
      usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
      detalhes: `Usuário editado ID ${id}.`,
      entidade: 'usuarios',
      entidade_id: id
    })

    return NextResponse.json({ ok: true, data: { id, nome, cargo, conselho, telefone, email, perfil, ativo } })
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

    // 1. Excluir no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM usuarios WHERE id = ?').bind(id).run()
      }
    } catch (d1Err) {
      console.warn('[D1_USUARIO_DELETE_ERR]:', d1Err)
    }

    // 2. Excluir no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      await supabase.from('usuarios').delete().eq('id', id)
    } catch (sbErr) {
      console.warn('[SUPABASE_USER_DELETE_FALLBACK]:', sbErr)
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
