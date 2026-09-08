import { NextRequest, NextResponse } from 'next/server'
import { registrarLogAuditoria } from '@/lib/auditLogger'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const body = await request.json().catch(() => ({}))
    const cpf = body?.cpf ? String(body.cpf).replace(/\D/g, '') : 'NAO_INFORMADO'

    await registrarLogAuditoria({
      acao: 'RECUPERACAO_BLOQUEADA',
      usuario_nome: cpf,
      detalhes: 'Tentativa de redefinição pública bloqueada por política de segurança institucional (LGPD).',
      ip
    })

    return NextResponse.json(
      {
        ok: false,
        error: 'Por conformidade com a LGPD e política de segurança dos prontuários SUAS, a redefinição de senhas deve ser solicitada à Coordenação do CRAS ou ao Administrador da Unidade.'
      },
      { status: 403 }
    )
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
