import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { cpf, codigo, novaSenha } = await request.json()
    if (!cpf || !codigo || !novaSenha) {
      return NextResponse.json({ ok: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data, error } = await supabase.rpc('recuperar_senha', {
      p_cpf: cpf.trim(),
      p_contato: codigo.trim(),
      p_nova_senha: novaSenha.trim()
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    if (!data?.ok) {
      return NextResponse.json({ ok: false, error: data?.error || 'Contato ou dados incorretos.' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
