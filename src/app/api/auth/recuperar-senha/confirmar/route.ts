import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { verifySessionToken } from '@/lib/authSession'
import { registrarLogAuditoria } from '@/lib/auditLogger'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const body = await request.json()
    const { cpf, codigo, novaSenha, recoveryToken } = body

    if (!cpf || !codigo || !novaSenha) {
      return NextResponse.json(
        { ok: false, error: 'CPF, código de verificação e nova senha são obrigatórios.' },
        { status: 400 }
      )
    }

    if (String(novaSenha).length < 6) {
      return NextResponse.json(
        { ok: false, error: 'A nova senha deve possuir no mínimo 6 caracteres.' },
        { status: 400 }
      )
    }

    const cpfLimpo = String(cpf).replace(/\D/g, '')
    const rateCheck = checkRateLimit(`confirmar_recuperar:${ip}:${cpfLimpo}`, 5, 10 * 60 * 1000)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Número excessivo de tentativas de validação de código. Tente novamente mais tarde.'
        },
        { status: 429 }
      )
    }

    // Se houver recoveryToken criptográfico fornecido no fluxo
    if (recoveryToken) {
      const tokenPayload = await verifySessionToken(recoveryToken)
      if (
        !tokenPayload ||
        tokenPayload.perfil !== 'recovery_flow' ||
        tokenPayload.usuario !== cpfLimpo ||
        tokenPayload.cargo !== String(codigo).trim()
      ) {
        return NextResponse.json(
          { ok: false, error: 'Código de verificação incorreto ou expirado (limite de 15 min).' },
          { status: 400 }
        )
      }
    }

    const supabase = getSupabaseServer()

    // 1. Tentar via RPC padrão do banco
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('recuperar_senha', {
      p_cpf: cpfLimpo,
      p_contato: String(codigo).trim(),
      p_nova_senha: String(novaSenha).trim()
    })

    if (!rpcErr && rpcRes?.ok) {
      await registrarLogAuditoria({
        acao: 'SENHA_REDEFINIDA',
        usuario_nome: cpfLimpo,
        detalhes: 'Senha redefinida com sucesso via código de verificação.',
        ip
      })
      return NextResponse.json(rpcRes)
    }

    // 2. Se falhar no RPC mas o token criptográfico for válido, atualiza diretamente
    if (recoveryToken) {
      const { error: updateErr } = await supabase
        .from('usuarios')
        .update({
          senha: String(novaSenha).trim(),
          atualizado_em: new Date().toISOString()
        })
        .eq('usuario', cpfLimpo)

      if (updateErr) {
        return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 })
      }

      await registrarLogAuditoria({
        acao: 'SENHA_REDEFINIDA',
        usuario_nome: cpfLimpo,
        detalhes: 'Senha redefinida com sucesso via token OTP assinado.',
        ip
      })

      return NextResponse.json({ ok: true, mensagem: 'Senha redefinida com sucesso!' })
    }

    return NextResponse.json(
      { ok: false, error: rpcRes?.error || 'Código de verificação ou dados incorretos.' },
      { status: 400 }
    )
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
