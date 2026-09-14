import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { getD1Database } from '@/lib/d1Client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grupoId = searchParams.get('grupo_id')

    // 1. Consulta prioritária no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        let query = 'SELECT * FROM frequencia_scfv'
        const params: any[] = []
        if (grupoId) {
          query += ' WHERE grupo_id = ?'
          params.push(grupoId)
        }
        query += ' ORDER BY data DESC LIMIT 200'
        const freqRes = await db.prepare(query).bind(...params).all<any>()
        return NextResponse.json({ ok: true, data: freqRes.results || [], source: 'cloudflare-d1' })
      }
    } catch (d1Err) {
      console.warn('[D1_FREQ_FALLBACK]:', d1Err)
    }

    try {
      const supabase = getSupabaseServer()
      let query = supabase.from('frequencia_scfv').select('*').order('data', { ascending: false })

      if (grupoId) {
        query = query.eq('grupo_id', grupoId)
      }

      const { data, error } = await query
      if (!error && data) {
        return NextResponse.json({ ok: true, data })
      }
    } catch (sbErr) {
      console.warn('[SUPABASE_FREQ_ERR]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: [] })
  } catch (e: any) {
    return NextResponse.json({ ok: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grupo_id, grupo_nome, data, tema, tecnico, registros } = body

    if (!grupo_id || !data || !Array.isArray(registros)) {
      return NextResponse.json({ ok: false, error: 'Grupo, Data e lista de registros são obrigatórios.' }, { status: 400 })
    }

    const freqId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `freq_${Date.now()}`
    const regJson = JSON.stringify(registros)
    const presentesList = registros
      .filter((r: any) => r.status === 'presente' && r.membro_id)
      .map((r: any) => r.membro_id)
    const presentesJson = JSON.stringify(presentesList)

    // 1. Salvar no Cloudflare D1
    try {
      const db = await getD1Database()
      if (db) {
        await db.prepare('DELETE FROM frequencia_scfv WHERE grupo_id = ? AND data = ?').bind(grupo_id, data).run()
        await db.prepare(`
          INSERT INTO frequencia_scfv (id, grupo_id, data, tema, tecnico, presentes, registros, criado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(freqId, grupo_id, data, tema || null, tecnico || 'TÉCNICO RESPONSÁVEL', presentesJson, regJson).run()

        // Histórico de atendimentos
        const dataPartes = data.split('-')
        const dataBr = dataPartes.length === 3 ? `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}` : data

        for (const reg of registros) {
          if (reg.nome) {
            let famId = reg.familia_id
            if (!famId) {
              const famRow = await db.prepare('SELECT id FROM familias WHERE UPPER(responsavel) = ? LIMIT 1').bind(reg.nome.trim().toUpperCase()).first<any>()
              if (famRow) famId = famRow.id
            }

            if (famId) {
              let statusTexto = 'PRESENÇA CONFIRMADA'
              let tipoAtendimento = 'SCFV / Convivência'

              if (reg.status === 'falta_justificada') {
                statusTexto = 'FALTA JUSTIFICADA'
                tipoAtendimento = 'Falta / Não Comparecimento'
              } else if (reg.status === 'falta_nao_justificada') {
                statusTexto = 'FALTA NÃO JUSTIFICADA'
                tipoAtendimento = 'Falta / Não Comparecimento'
              }

              const obsTexto = reg.observacao ? ` (Obs: ${reg.observacao})` : ''
              const pautaTemaTexto = (tema && !tema.startsWith('RELATORIO_JSON:')) ? tema : ''
              const relato = `FREQUÊNCIA SCFV [${statusTexto}]: Registrado encontro do grupo "${grupo_nome || 'COLETIVO SCFV'}" na data ${dataBr}.${obsTexto}`
              const providencias = pautaTemaTexto ? `Objetivo/Pauta do encontro: ${pautaTemaTexto}` : `Registro de frequência em encontro de convivência.`
              const histId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `atd_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`

              await db.prepare(`
                INSERT INTO historico_atendimentos (
                  id, familia_id, data, hora, usuario_visitado, local,
                  compartilhada, tecnico, relato, providencias, sigilo, tipo, criado_em
                ) VALUES (?, ?, ?, ?, ?, 'CRAS', 'Não', ?, ?, ?, 'publico', ?, datetime('now'))
              `).bind(
                histId,
                famId,
                data,
                new Date().toTimeString().split(' ')[0],
                reg.nome.toUpperCase(),
                tecnico || 'TÉCNICO RESPONSÁVEL',
                relato,
                providencias,
                tipoAtendimento
              ).run()
            }
          }
        }
      }
    } catch (d1Err) {
      console.warn('[D1_FREQ_INSERT_ERR]:', d1Err)
    }

    // 2. Salvar no Supabase de forma resiliente
    try {
      const supabase = getSupabaseServer()
      let payload = {
        grupo_id,
        data,
        tema: tema || null,
        tecnico: tecnico || 'TÉCNICO RESPONSÁVEL',
        registros
      }
      await supabase.from('frequencia_scfv').delete().eq('grupo_id', grupo_id).eq('data', data)
      await supabase.from('frequencia_scfv').insert(payload)
    } catch (sbErr) {
      console.warn('[SUPABASE_FREQ_FALLBACK]:', sbErr)
    }

    return NextResponse.json({ ok: true, data: { id: freqId, grupo_id, data } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
