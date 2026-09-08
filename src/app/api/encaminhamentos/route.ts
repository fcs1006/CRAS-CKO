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

    // Registrar no Histórico do Beneficiário / Prontuário Familiar
    if (encInserido) {
      let targetFamiliaId = encInserido.familia_id
      if (!targetFamiliaId && encInserido.beneficiario) {
        try {
          const { data: fams } = await supabase.from('familias').select('id, responsavel, membros')
          if (fams) {
            const nomeB = encInserido.beneficiario.trim().toUpperCase()
            const famEncontrada = fams.find(f => {
              if (f.responsavel && f.responsavel.trim().toUpperCase() === nomeB) return true
              if (Array.isArray(f.membros)) {
                return f.membros.some((m: any) => m.nome && m.nome.trim().toUpperCase() === nomeB)
              }
              return false
            })
            if (famEncontrada) targetFamiliaId = famEncontrada.id
          }
        } catch (e) {
          console.warn('Aviso ao buscar família para histórico de encaminhamento:', e)
        }
      }

      if (targetFamiliaId) {
        try {
          const payloadHist = {
            familia_id: targetFamiliaId,
            usuario_visitado: (encInserido.beneficiario || 'BENEFICIÁRIO').toUpperCase(),
            tecnico: encInserido.tecnico || 'TÉCNICO CRAS',
            tipo: 'Encaminhamento Intersetorial',
            local: 'CRAS',
            relato: `ENCAMINHAMENTO INTERSETORIAL [Destino: ${encInserido.destino}] — Motivo: ${encInserido.motivo} (Status: PENDENTE)`,
            providencias: `Guia Oficial de Encaminhamento emitida para o serviço/órgão destinatário: ${encInserido.destino}.`,
            data: encInserido.data_envio || new Date().toISOString().split('T')[0]
          }
          await supabase.from('historico_atendimentos').insert(payloadHist)
        } catch (hErr) {
          console.warn('Erro ao inserir histórico de encaminhamento:', hErr)
        }
      }
    }

    return NextResponse.json({ ok: true, data: encInserido })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID é obrigatório para atualização.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data: encAtualizado, error } = await supabase
      .from('encaminhamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Registrar atualização de Devolutiva / Status no Histórico do Prontuário
    if (encAtualizado && (updates.resposta || updates.status)) {
      let targetFamiliaId = encAtualizado.familia_id
      if (!targetFamiliaId && encAtualizado.beneficiario) {
        try {
          const { data: fams } = await supabase.from('familias').select('id, responsavel, membros')
          if (fams) {
            const nomeB = encAtualizado.beneficiario.trim().toUpperCase()
            const famEncontrada = fams.find(f => {
              if (f.responsavel && f.responsavel.trim().toUpperCase() === nomeB) return true
              if (Array.isArray(f.membros)) {
                return f.membros.some((m: any) => m.nome && m.nome.trim().toUpperCase() === nomeB)
              }
              return false
            })
            if (famEncontrada) targetFamiliaId = famEncontrada.id
          }
        } catch (e) {
          console.warn('Aviso ao buscar família para histórico de devolutiva:', e)
        }
      }

      if (targetFamiliaId) {
        try {
          const payloadHist = {
            familia_id: targetFamiliaId,
            usuario_visitado: (encAtualizado.beneficiario || 'BENEFICIÁRIO').toUpperCase(),
            tecnico: encAtualizado.tecnico || 'TÉCNICO CRAS',
            tipo: 'Devolutiva de Encaminhamento',
            local: 'CRAS / Rede',
            relato: `DEVOLUTIVA DE ENCAMINHAMENTO [Destino: ${encAtualizado.destino}] — Status: ${encAtualizado.status.toUpperCase()}.\nRetorno/Devolutiva: ${encAtualizado.resposta || 'Sem detalhamento complementar'}`,
            providencias: `Devolutiva e parecer do órgão receptor gravados no prontuário da família.`,
            data: new Date().toISOString().split('T')[0]
          }
          await supabase.from('historico_atendimentos').insert(payloadHist)
        } catch (hErr) {
          console.warn('Erro ao inserir histórico de devolutiva:', hErr)
        }
      }
    }

    return NextResponse.json({ ok: true, data: encAtualizado })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID do encaminhamento é obrigatório.' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { error } = await supabase
      .from('encaminhamentos')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
