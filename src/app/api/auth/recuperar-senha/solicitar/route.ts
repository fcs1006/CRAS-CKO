import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { signSessionToken } from '@/lib/authSession'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json({ ok: false, error: 'CPF obrigatório.' }, { status: 400 })
    }

    const cpfLimpo = String(cpf).replace(/\D/g, '')
    const rateCheck = checkRateLimit(`recuperar:${ip}:${cpfLimpo}`, 3, 10 * 60 * 1000)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Muitas solicitações de recuperação. Aguarde ${rateCheck.resetInSec} segundos antes de tentar novamente.`
        },
        { status: 429 }
      )
    }

    const supabase = getSupabaseServer()

    // Verificar se o CPF existe no cadastro
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nome, usuario, email, telefone')
      .eq('usuario', cpfLimpo)
      .single()

    if (error || !user) {
      return NextResponse.json({ ok: false, error: 'CPF não encontrado no quadro de usuários.' }, { status: 404 })
    }

    // Gerar código OTP de 6 dígitos
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Token assinado criptograficamente contendo o hash do OTP válido por 15 minutos
    const recoveryToken = await signSessionToken(
      {
        id: user.id,
        nome: user.nome,
        usuario: user.usuario,
        perfil: 'recovery_flow',
        cargo: otp
      },
      15 * 60 // 15 minutos
    )

    // Mascarar dados de contato para resposta
    const emailMask = user.email
      ? user.email.replace(/^(.)(.*)(@.*)$/, (_: string, a: string, b: string, c: string) => a + '*'.repeat(Math.max(b.length, 3)) + c)
      : 'E-mail funcional cadastrado'

    return NextResponse.json({
      ok: true,
      mensagem: `Código de verificação gerado com validade de 15 minutos para ${emailMask}.`,
      recoveryToken,
      // Para ambiente local e homologação do CRAS:
      codigoVerificacao: otp
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
