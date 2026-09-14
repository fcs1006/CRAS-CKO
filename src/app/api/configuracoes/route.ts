import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { registrarLogAuditoria } from '@/lib/auditLogger'
import { getD1Database } from '@/lib/d1Client'

export const dynamic = 'force-dynamic'

function verificarPermissaoGestao(request: NextRequest): boolean {
  const perfil = (request.headers.get('x-auth-user-perfil') || '').toLowerCase().trim()
  return perfil === 'admin' || perfil === 'coordenador'
}

export async function GET() {
  try {
    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        const config = await db.prepare('SELECT * FROM configuracoes LIMIT 1').first()
        if (config) {
          return NextResponse.json({ ok: true, data: config }, {
            headers: {
              'Cache-Control': 'no-store, max-age=0'
            }
          })
        }
      }
    } catch (d1Err) {
      console.warn('[D1_CONFIG_FALLBACK]:', d1Err)
    }

    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verificarPermissaoGestao(request)) {
      await registrarLogAuditoria({
        acao: 'ACESSO_NEGADO_SIGILO',
        usuario_id: request.headers.get('x-auth-user-id') || undefined,
        usuario_nome: request.headers.get('x-auth-user-nome') || undefined,
        detalhes: 'Tentativa não autorizada de alterar configurações institucionais do CRAS.',
        entidade: 'configuracoes'
      })
      return NextResponse.json(
        { ok: false, error: 'Apenas Administradores ou Coordenadores possuem permissão para alterar as configurações do sistema.' },
        { status: 403 }
      )
    }

    const payload = await request.json()
    const supabase = getSupabaseServer()

    // Sanitizar payload para evitar erros de chave primária/data imutável
    const updateData = { ...payload }
    delete updateData.id
    delete updateData.criado_em
    delete updateData.atualizado_em
    updateData.atualizado_em = new Date().toISOString()

    // 1. Atualizar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare(`
          UPDATE configuracoes
          SET 
            municipio = COALESCE(?, municipio),
            secretaria = COALESCE(?, secretaria),
            cras_unidade = COALESCE(?, cras_unidade),
            endereco = COALESCE(?, endereco),
            telefone = COALESCE(?, telefone),
            email = COALESCE(?, email),
            logo_url = COALESCE(?, logo_url),
            atualizado_em = datetime('now')
          WHERE id = 1
        `).bind(
          updateData.municipio || null,
          updateData.secretaria || null,
          updateData.cras_unidade || null,
          updateData.endereco || null,
          updateData.telefone || null,
          updateData.email || null,
          updateData.logo_url || null
        ).run()
      }
    } catch (d1Err) {
      console.warn('[D1_CONFIG_UPDATE_ERR]:', d1Err)
    }

    // 2. Atualizar no Supabase de forma resiliente
    let dataFinal = { id: 1, ...updateData }
    try {
      const supabase = getSupabaseServer()
      const { data: existing } = await supabase
        .from('configuracoes')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (existing) {
        const res = await supabase.from('configuracoes').update(updateData).eq('id', existing.id).select().single()
        if (res.data) dataFinal = res.data
      } else {
        const res = await supabase.from('configuracoes').insert({ id: 1, ...updateData }).select().single()
        if (res.data) dataFinal = res.data
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_CONFIG_POST_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: dataFinal })
  } catch (e: any) {
    console.error('Exceção no POST de configurações:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
