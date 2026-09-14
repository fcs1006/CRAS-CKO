import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { checkRateLimit } from '@/lib/rateLimit'
import { registrarLogAuditoria } from '@/lib/auditLogger'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    
    // Proteção contra inundação de cadastros automatizados (Rate Limiting: máx 5 solicitações a cada 15 minutos por IP)
    const rateCheck = checkRateLimit(`cadastro:${ip}`, 5, 15 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Muitas solicitações consecutivas de cadastro. Aguarde ${rateCheck.resetInSec} segundos para tentar novamente.`
        },
        { status: 429 }
      )
    }

    const { nome, cpf, senha, cargo, conselho, telefone, email } = await request.json()
    if (!nome || !cpf || !senha || !cargo) {
      return NextResponse.json({ ok: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    const cleanCpf = String(cpf).replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      return NextResponse.json({ ok: false, error: 'CPF inválido. O CPF deve conter 11 dígitos.' }, { status: 400 })
    }

    if (String(senha).trim().length < 6) {
      return NextResponse.json({ ok: false, error: 'A senha deve conter no mínimo 6 caracteres.' }, { status: 400 })
    }

    // 1. Criação prioritária e segura no Cloudflare D1
    try {
      const { getD1Database } = await import('@/lib/d1Client')
      const db = await getD1Database()
      if (db) {
        const exist = await db.prepare('SELECT id FROM usuarios WHERE REPLACE(REPLACE(REPLACE(usuario, ".", ""), "-", ""), " ", "") = ?').bind(cleanCpf).first()
        if (exist) {
          return NextResponse.json({ ok: false, error: 'Este CPF já possui cadastro no sistema.' }, { status: 400 })
        }

        const bcrypt = await import('bcryptjs')
        const hash = bcrypt.hashSync(senha.trim(), 10)
        await db.prepare(`
          INSERT INTO usuarios (nome, usuario, senha_hash, cargo, conselho, telefone, email, ativo, perfil, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'usuario', datetime('now'))
        `).bind(
          nome.trim().toUpperCase(),
          cleanCpf,
          hash,
          cargo.trim(),
          (conselho || 'Não aplicável').trim(),
          telefone ? telefone.trim() : null,
          email ? email.trim() : null
        ).run()

        await registrarLogAuditoria({
          acao: 'USUARIO_CRIADO',
          usuario_nome: cleanCpf,
          detalhes: `Solicitação pública de acesso registrada para "${nome.trim()}" (${cargo.trim()}). Aguarda aprovação da coordenação.`,
          ip
        })

        return NextResponse.json({ ok: true, message: 'Solicitação realizada com sucesso! Aguarde a liberação da coordenação.' })
      }
    } catch (d1Err) {
      console.warn('[D1_CADASTRO_FALLBACK]:', d1Err)
    }

    let data: any = null
    try {
      const supabase = getSupabaseServer()
      const res = await supabase.rpc('criar_usuario', {
        p_nome: nome.trim(),
        p_cpf: cleanCpf,
        p_senha: senha.trim(),
        p_cargo: cargo.trim(),
        p_conselho: (conselho || 'Não aplicável').trim(),
        p_telefone: telefone ? telefone.trim() : null,
        p_email: email ? email.trim() : null
      })

      if (res.error) {
        return NextResponse.json({ ok: false, error: res.error.message }, { status: 500 })
      }
      data = res.data
      if (!data?.ok) {
        return NextResponse.json({ ok: false, error: data?.error || 'Erro ao cadastrar.' }, { status: 400 })
      }
    } catch (sbErr) {
      return NextResponse.json({ ok: false, error: 'Falha ao processar solicitação de cadastro.' }, { status: 500 })
    }

    await registrarLogAuditoria({
      acao: 'USUARIO_CRIADO',
      usuario_nome: cleanCpf,
      detalhes: `Solicitação pública de acesso registrada para "${nome.trim()}" (${cargo.trim()}). Aguarda aprovação da coordenação.`,
      ip
    })

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
