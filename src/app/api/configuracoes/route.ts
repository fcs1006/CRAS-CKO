import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(1)
      .maybeSingle()

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
    const payload = await request.json()
    const supabase = getSupabaseServer()

    // Obter o primeiro registro de configuração existente para pegar seu ID
    const { data: existing } = await supabase
      .from('configuracoes')
      .select('id')
      .limit(1)
      .maybeSingle()

    let result;
    if (existing) {
      result = await supabase
        .from('configuracoes')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('configuracoes')
        .insert({ id: 1, ...payload })
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json({ ok: false, error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: result.data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
