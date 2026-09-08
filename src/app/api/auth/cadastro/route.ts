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

    const supabase = getSupabaseServer()
    const { data, error } = await supabase.rpc('criar_usuario', {
      p_nome: nome.trim(),
      p_cpf: cleanCpf,
      p_senha: senha.trim(),
      p_cargo: cargo.trim(),
      p_conselho: (conselho || 'Não aplicável').trim(),
      p_telefone: telefone ? telefone.trim() : null,
      p_email: email ? email.trim() : null
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    if (!data?.ok) {
      return NextResponse.json({ ok: false, error: data?.error || 'Erro ao cadastrar.' }, { status: 400 })
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
