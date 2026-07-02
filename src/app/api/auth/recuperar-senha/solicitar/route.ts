import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { cpf } = await request.json()
    if (!cpf) {
      return NextResponse.json({ ok: false, error: 'CPF obrigatório' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const cpfLimpo = cpf.replace(/\D/g, '')

    // Verificar se o CPF existe
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('usuario')
      .eq('usuario', cpfLimpo)
      .single()

    if (error || !user) {
      return NextResponse.json({ ok: false, error: 'CPF não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
