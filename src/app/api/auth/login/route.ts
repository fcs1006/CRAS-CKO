import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { usuario, senha } = await request.json()
    if (!usuario || !senha) {
      return NextResponse.json({ ok: false, error: 'Usuário e senha obrigatórios' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data, error } = await supabase.rpc('fazer_login', {
      p_usuario: usuario.trim(),
      p_senha: senha.trim()
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    if (!data?.ok) {
      return NextResponse.json({ ok: false, error: data?.error || 'Usuário ou senha incorretos.' }, { status: 401 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
