import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('encaminhamentos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const encaminhamento = await request.json()
    const supabase = getSupabaseServer()

    const { data: encInserido, error: encErr } = await supabase
      .from('encaminhamentos')
      .insert(encaminhamento)
      .select()
      .single()

    if (encErr) {
      return NextResponse.json({ ok: false, error: encErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: encInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
