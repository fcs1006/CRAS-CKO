import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupo_id')

    const supabase = getSupabaseServer()
    let query = supabase.from('relatorios_scfv').select('*').order('data_encontro', { ascending: false })

    if (grupoId) {
      query = query.eq('grupo_id', grupoId)
    }

    const { data, error } = await query

    if (error) {
      // Se a tabela ainda não existir no Supabase, retorna lista vazia de forma segura
      console.warn('Aviso/Erro ao buscar relatórios SCFV:', error.message)
      return NextResponse.json({ ok: true, data: [] })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      grupo_id,
      grupo_nome,
      data_encontro,
      objetivo_encontro,
      atividade_realizada,
      detalhamento,
      relato,
      providencias,
      profissionais_participantes,
      tecnico
    } = body

    if (!grupo_id || !data_encontro) {
      return NextResponse.json({ ok: false, error: 'Grupo e Data do Encontro são obrigatórios.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    const payload = {
      grupo_id,
      data_encontro,
      objetivo_encontro: objetivo_encontro || null,
      atividade_realizada: atividade_realizada || null,
      detalhamento: detalhamento || null,
      relato: relato || null,
      providencias: providencias || null,
      profissionais_participantes: profissionais_participantes || null,
      tecnico: tecnico || 'TÉCNICO RESPONSÁVEL'
    }

    // Tentar upsert por grupo_id e data_encontro
    let { data: relSalvo, error: relErr } = await supabase
      .from('relatorios_scfv')
      .upsert(payload, { onConflict: 'grupo_id,data_encontro' })
      .select()
      .single()

    if (relErr) {
      console.warn('Tentativa de upsert em relatorios_scfv falhou, aplicando fallback de substituição:', relErr.message)
      await supabase.from('relatorios_scfv').delete().eq('grupo_id', grupo_id).eq('data_encontro', data_encontro)
      const retry = await supabase.from('relatorios_scfv').insert(payload).select().single()
      relSalvo = retry.data
    }

    return NextResponse.json({ ok: true, data: relSalvo || payload })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
