import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { nome, cpf, senha, cargo, conselho, telefone, email } = await request.json()
    if (!nome || !cpf || !senha || !cargo) {
      return NextResponse.json({ ok: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data, error } = await supabase.rpc('criar_usuario', {
      p_nome: nome.trim(),
      p_cpf: cpf.trim(),
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

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
