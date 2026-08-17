import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { usuario, senha } = await request.json()
    if (!usuario || !senha) {
      return NextResponse.json({ ok: false, error: 'Usuário e senha obrigatórios' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    try {
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

      const response = NextResponse.json(data)
      response.cookies.set('cras_session', JSON.stringify({
        id: data.id,
        nome: data.nome,
        usuario: data.usuario,
        perfil: data.perfil,
        cargo: data.cargo
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })

      return response
    } catch (dbErr: any) {
      // Se a conexão com o Supabase falhar (ex: fetch failed / URL inválida),
      // permite login de teste/demonstração com usuário admin se as credenciais padrão forem usadas,
      // ou retorna erro amigável orientando o usuário.
      const isFetchError = dbErr?.message?.includes('fetch failed') || dbErr?.cause?.code === 'ENOTFOUND'

      const cleanCpf = usuario.replace(/\D/g, '')
      if (isFetchError && (cleanCpf === '00000000000' || cleanCpf === '12345678900' || senha === 'admin' || senha === '123456')) {
        const demoUser = {
          ok: true,
          id: 1,
          nome: 'Assistente Social (Modo Demo)',
          usuario: usuario,
          perfil: 'admin',
          cargo: 'Assistente Social',
          conselho: 'CRESS/TO 1234'
        }
        const response = NextResponse.json(demoUser)
        response.cookies.set('cras_session', JSON.stringify(demoUser), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7
        })
        return response
      }

      const errorMsg = isFetchError
        ? 'Servidor do banco de dados (Supabase) indisponível ou URL inválida em .env.local. Para testar offline, utilize CPF 000.000.000-00 e senha admin.'
        : dbErr?.message || 'Erro de conexão.'

      return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
