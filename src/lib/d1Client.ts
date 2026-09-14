import { getCloudflareContext } from '@opennextjs/cloudflare'

export interface D1Cidadao {
  id: string
  nome: string
  cpf: string | null
  cns: string | null
  rg: string | null
  nis: string | null
  data_nascimento: string | null
  nome_mae: string | null
  sexo: string | null
  raca_cor: string | null
  escolaridade: string | null
  ocupacao: string | null
  telefone: string | null
  outro_contato: string | null
  logradouro: string | null
  numero: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
  zona_territorio: string | null
  criado_em?: string
  atualizado_em?: string
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike
  all<T = unknown>(): Promise<{ results?: T[] }>
  first<T = unknown>(): Promise<T | null>
  run(): Promise<unknown>
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike
}

/**
 * Retorna a instância do banco D1 'banco-cidadaos-cko' fornecida pelo Cloudflare Worker.
 */
export async function getD1Database(): Promise<D1DatabaseLike | null> {
  try {
    const context = await getCloudflareContext({ async: true })
    const db = (context.env as Record<string, unknown> | undefined)?.DB as D1DatabaseLike | undefined
    return db || null
  } catch {
    return null
  }
}

/**
 * Busca munícipes no Cloudflare D1 por termo de pesquisa (CPF ou Nome).
 */
export async function buscarCidadaosD1(termo: string, limit = 20): Promise<D1Cidadao[]> {
  const db = await getD1Database()
  if (!db) {
    return []
  }

  const cleanTerm = termo.trim()
  if (!cleanTerm) return []

  const digits = cleanTerm.replace(/\D/g, '')

  // Se tem pelo menos 3 dígitos, pode ser início de CPF, NIS ou CNS
  if (digits.length >= 3) {
    const res = await db
      .prepare(
        `SELECT * FROM pacientes 
         WHERE REPLACE(REPLACE(REPLACE(COALESCE(cpf, ''), '.', ''), '-', ''), ' ', '') LIKE ?
            OR REPLACE(COALESCE(cns, ''), ' ', '') LIKE ?
            OR REPLACE(COALESCE(nis, ''), ' ', '') LIKE ?
            OR UPPER(nome) LIKE ?
         ORDER BY nome ASC 
         LIMIT ?`
      )
      .bind(`${digits}%`, `${digits}%`, `${digits}%`, `%${cleanTerm.toUpperCase()}%`, limit)
      .all<D1Cidadao>()

    return res.results || []
  }

  // Busca por nome
  const res = await db
    .prepare(
      `SELECT * FROM pacientes 
       WHERE UPPER(nome) LIKE ? 
       ORDER BY nome ASC 
       LIMIT ?`
    )
    .bind(`%${cleanTerm.toUpperCase()}%`, limit)
    .all<D1Cidadao>()

  return res.results || []
}

/**
 * Salva ou atualiza um munícipe diretamente no Cloudflare D1
 */
export async function salvarCidadaoD1(cidadao: Partial<D1Cidadao>): Promise<boolean> {
  const db = await getD1Database()
  if (!db) return false

  try {
    const id = cidadao.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cid_${Date.now()}`)
    const nome = (cidadao.nome || '').trim().toUpperCase()
    const cpf = cidadao.cpf ? cidadao.cpf.replace(/\D/g, '') : null
    const cns = cidadao.cns ? cidadao.cns.replace(/\D/g, '') : null
    const cpfCns = cpf || cns
    const telefone = cidadao.telefone || null
    const dataNasc = cidadao.data_nascimento || null
    const logradouro = cidadao.logradouro ? cidadao.logradouro.trim().toUpperCase() : null
    const bairro = cidadao.bairro ? cidadao.bairro.trim().toUpperCase() : null
    const cep = cidadao.cep ? cidadao.cep.replace(/\D/g, '') : null
    const sexo = cidadao.sexo || null

    await db.prepare(`
      INSERT INTO pacientes (id, nome, cpf, cns, cpf_cns, data_nascimento, dt_nasc, logradouro, endereco, bairro, cep, telefone, sexo, atualizado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        nome = excluded.nome,
        cpf = COALESCE(excluded.cpf, pacientes.cpf),
        cns = COALESCE(excluded.cns, pacientes.cns),
        cpf_cns = COALESCE(excluded.cpf_cns, pacientes.cpf_cns),
        data_nascimento = COALESCE(excluded.data_nascimento, pacientes.data_nascimento),
        dt_nasc = COALESCE(excluded.dt_nasc, pacientes.dt_nasc),
        logradouro = COALESCE(excluded.logradouro, pacientes.logradouro),
        endereco = COALESCE(excluded.endereco, pacientes.endereco),
        bairro = COALESCE(excluded.bairro, pacientes.bairro),
        cep = COALESCE(excluded.cep, pacientes.cep),
        telefone = COALESCE(excluded.telefone, pacientes.telefone),
        sexo = COALESCE(excluded.sexo, pacientes.sexo),
        atualizado_em = datetime('now')
    `).bind(id, nome, cpf, cns, cpfCns, dataNasc, dataNasc, logradouro, logradouro, bairro, cep, telefone, sexo).run()

    return true
  } catch (err) {
    console.warn('[D1_SAVE_FALLBACK]: Falha ao salvar no D1:', err)
    return false
  }
}

export interface ResultadoAutenticacaoD1 {
  ok: boolean
  error?: string
  id?: number | string
  nome?: string
  usuario?: string
  perfil?: string
  cargo?: string | null
  conselho?: string | null
}

/**
 * Autentica um operador diretamente contra a base de usuários do Cloudflare D1
 */
export async function autenticarUsuarioD1(
  usuarioInput: string,
  senhaInput: string
): Promise<ResultadoAutenticacaoD1 | null> {
  const db = await getD1Database()
  if (!db) return null

  try {
    const bcrypt = await import('bcryptjs')
    const digits = usuarioInput.replace(/\D/g, '')
    const cleanUser = usuarioInput.trim()

    // Buscar no D1 pelo CPF limpo ou formatado
    const query = `
      SELECT id, nome, usuario, senha_hash, perfil, cargo, conselho, ativo
      FROM usuarios 
      WHERE (REPLACE(REPLACE(REPLACE(usuario, '.', ''), '-', ''), ' ', '') = ? OR usuario = ?)
        AND ativo = 1 
      LIMIT 1
    `
    const user = await db.prepare(query).bind(digits, cleanUser).first<any>()
    if (!user || !user.senha_hash) {
      return null
    }

    const senhaValida = bcrypt.compareSync(senhaInput, user.senha_hash)
    if (!senhaValida) {
      return { ok: false, error: 'Usuário ou senha incorretos.' }
    }

    return {
      ok: true,
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      perfil: user.perfil || 'usuario',
      cargo: user.cargo || null,
      conselho: user.conselho || null
    }
  } catch (err) {
    console.warn('[D1_AUTH_ERROR]: Falha ao autenticar via D1:', err)
    return null
  }
}

/**
 * Estatísticas e contagem de prontuários / famílias no D1
 */
export async function contarFamiliasD1(): Promise<{ total: number; totalPaif: number } | null> {
  const db = await getD1Database()
  if (!db) return null
  try {
    const res = await db.prepare(`
      SELECT 
        count(*) as total,
        COALESCE(SUM(CASE WHEN paif_ativo = 1 OR paif_ativo = '1' OR paif_ativo = 'true' THEN 1 ELSE 0 END), 0) as totalPaif
      FROM familias
    `).first<{ total: number; totalPaif: number }>()
    return res || { total: 0, totalPaif: 0 }
  } catch (err) {
    console.warn('[D1_CONTAR_FAMILIAS_ERR]:', err)
    return null
  }
}

/**
 * Busca lista de prontuários familiares com membros associados no D1
 */
export async function buscarFamiliasD1(limit = 100, offset = 0): Promise<{ data: any[]; total: number } | null> {
  const db = await getD1Database()
  if (!db) return null
  try {
    const countRes = await db.prepare(`SELECT count(*) as total FROM familias`).first<{ total: number }>()
    const total = countRes?.total || 0

    const famRes = await db.prepare(`
      SELECT * FROM familias 
      ORDER BY criado_em DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all<any>()

    const familias = famRes.results || []
    if (familias.length === 0) {
      return { data: [], total }
    }

    // Buscar membros para essas famílias (em 1 consulta ultra-rápida se lista grande, ou chunking se pequena)
    const ids = familias.map(f => f.id).filter(Boolean)
    const membrosPorFamilia: Record<string, any[]> = {}

    if (ids.length > 0) {
      if (ids.length > 80) {
        try {
          const memRes = await db.prepare(`SELECT * FROM membros_familia`).all<any>()
          for (const m of memRes.results || []) {
            if (!membrosPorFamilia[m.familia_id]) {
              membrosPorFamilia[m.familia_id] = []
            }
            membrosPorFamilia[m.familia_id].push(m)
          }
        } catch (memErr) {
          console.warn('[D1_MEMBROS_ALL_WARN]:', memErr)
        }
      } else {
        const CHUNK_SIZE = 40
        for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
          const chunk = ids.slice(i, i + CHUNK_SIZE)
          const placeholders = chunk.map(() => '?').join(',')
          try {
            const memRes = await db.prepare(`
              SELECT * FROM membros_familia 
              WHERE familia_id IN (${placeholders})
            `).bind(...chunk).all<any>()

            for (const m of memRes.results || []) {
              if (!membrosPorFamilia[m.familia_id]) {
                membrosPorFamilia[m.familia_id] = []
              }
              membrosPorFamilia[m.familia_id].push(m)
            }
          } catch (memErr) {
            console.warn('[D1_MEMBROS_CHUNK_WARN]:', memErr)
          }
        }
      }
    }

    const dataCompleta = familias.map(f => {
      const membros = membrosPorFamilia[f.id] || []
      const membroResp = membros.find((m: any) => m.parentesco === 'Responsável' || m.nome === f.responsavel)
      const rawNis = f.nis_responsavel || ''
      const nisClean = rawNis.startsWith('SEM_NIS_') ? '' : rawNis

      let vulnerabilidadesParsed: any[] = []
      try {
        if (typeof f.vulnerabilidades === 'string') {
          vulnerabilidadesParsed = JSON.parse(f.vulnerabilidades)
        } else if (Array.isArray(f.vulnerabilidades)) {
          vulnerabilidadesParsed = f.vulnerabilidades
        }
      } catch {}

      return {
        ...f,
        paif_ativo: Boolean(f.paif_ativo === 1 || f.paif_ativo === '1' || f.paif_ativo === true || f.paif_ativo === 'true'),
        vulnerabilidades: vulnerabilidadesParsed,
        membros,
        nis_responsavel: nisClean,
        rg_responsavel: f.rg_responsavel || membroResp?.rg || null,
        sexo_responsavel: f.sexo_responsavel || membroResp?.sexo || 'Feminino',
        raca_cor_responsavel: f.raca_cor_responsavel || membroResp?.raca_cor || 'Parda',
        data_nascimento_responsavel: f.data_nascimento_responsavel || membroResp?.data_nascimento || null,
        escolaridade_responsavel: f.escolaridade_responsavel || membroResp?.escolaridade || null,
        ocupacao_responsavel: f.ocupacao_responsavel || membroResp?.ocupacao || null,
        renda_responsavel: f.renda_responsavel !== undefined ? f.renda_responsavel : (membroResp?.renda || 0),
        programa_social_responsavel: f.programa_social_responsavel || membroResp?.programa_governo || 'Nenhum'
      }
    })

    return { data: dataCompleta, total }
  } catch (err) {
    console.warn('[D1_BUSCAR_FAMILIAS_ERR]:', err)
    return null
  }
}

/**
 * Salva uma família e seus membros diretamente no Cloudflare D1
 */
export async function salvarFamiliaD1(familiaData: any, membrosData: any[] = []): Promise<boolean> {
  const db = await getD1Database()
  if (!db) return false

  try {
    const familiaId = familiaData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fam_${Date.now()}`)
    const codFamiliar = familiaData.cod_familiar || String(Math.floor(1000 + Math.random() * 9000))
    const responsavel = (familiaData.responsavel || '').trim().toUpperCase()
    const cpfResp = familiaData.cpf_responsavel ? familiaData.cpf_responsavel.replace(/\D/g, '') : ''
    const nisResp = familiaData.nis_responsavel || `SEM_NIS_${codFamiliar}`
    const logradouro = (familiaData.logradouro || '').trim().toUpperCase()
    const numero = (familiaData.numero || 'S/N').trim().toUpperCase()
    const bairro = (familiaData.bairro || 'CENTRO').trim().toUpperCase()
    const paifAtivo = familiaData.paif_ativo ? 1 : 0
    const vulnerabilidadesJson = typeof familiaData.vulnerabilidades === 'string' 
      ? familiaData.vulnerabilidades 
      : JSON.stringify(familiaData.vulnerabilidades || [])

    // Upsert na tabela familias
    await db.prepare(`
      INSERT INTO familias (
        id, cod_familiar, responsavel, cpf_responsavel, nis_responsavel, nome_mae_responsavel,
        sexo_responsavel, raca_cor_responsavel, data_nascimento_responsavel, escolaridade_responsavel,
        ocupacao_responsavel, renda_responsavel, programa_social_responsavel, logradouro, numero,
        complemento, bairro, cep, municipio, uf, ponto_referencia, zona_territorio, telefone,
        outro_contato, moradia_tipo, tipo_construcao, moradia_agua, moradia_sanear, moradia_lixo,
        moradia_energia, moradia_comodos, acessibilidade, vulnerabilidades, paif_ativo,
        paif_data_inicio, paif_data_fim, paif_motivo_desligamento, paif_metas, paif_potencialidades,
        tecnico_referencia, criado_em, atualizado_em
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, datetime('now'), datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        cod_familiar = excluded.cod_familiar,
        responsavel = excluded.responsavel,
        cpf_responsavel = excluded.cpf_responsavel,
        nis_responsavel = excluded.nis_responsavel,
        nome_mae_responsavel = excluded.nome_mae_responsavel,
        sexo_responsavel = excluded.sexo_responsavel,
        raca_cor_responsavel = excluded.raca_cor_responsavel,
        data_nascimento_responsavel = excluded.data_nascimento_responsavel,
        escolaridade_responsavel = excluded.escolaridade_responsavel,
        ocupacao_responsavel = excluded.ocupacao_responsavel,
        renda_responsavel = excluded.renda_responsavel,
        programa_social_responsavel = excluded.programa_social_responsavel,
        logradouro = excluded.logradouro,
        numero = excluded.numero,
        complemento = excluded.complemento,
        bairro = excluded.bairro,
        cep = excluded.cep,
        telefone = excluded.telefone,
        vulnerabilidades = excluded.vulnerabilidades,
        paif_ativo = excluded.paif_ativo,
        tecnico_referencia = excluded.tecnico_referencia,
        atualizado_em = datetime('now')
    `).bind(
      familiaId, codFamiliar, responsavel, cpfResp, nisResp, familiaData.nome_mae_responsavel || null,
      familiaData.sexo_responsavel || 'Feminino', familiaData.raca_cor_responsavel || 'Parda', familiaData.data_nascimento_responsavel || null, familiaData.escolaridade_responsavel || null,
      familiaData.ocupacao_responsavel || null, Number(familiaData.renda_responsavel) || 0, familiaData.programa_social_responsavel || 'Nenhum', logradouro, numero,
      familiaData.complemento || null, bairro, familiaData.cep || '77305-000', familiaData.municipio || 'Conceição do Tocantins', familiaData.uf || 'TO', familiaData.ponto_referencia || null, familiaData.zona_territorio || 'Urbana', familiaData.telefone || null,
      familiaData.outro_contato || null, familiaData.moradia_tipo || 'Própria', familiaData.tipo_construcao || 'Alvenaria', familiaData.moradia_agua || 'Rede Pública', familiaData.moradia_sanear || 'Rede Pública', familiaData.moradia_lixo || 'Coleta Pública',
      familiaData.moradia_energia || 'Rede Elétrica com Relógio', Number(familiaData.moradia_comodos) || 4, Number(familiaData.acessibilidade) || 1, vulnerabilidadesJson, paifAtivo,
      familiaData.paif_data_inicio || null, familiaData.paif_data_fim || null, familiaData.paif_motivo_desligamento || null, familiaData.paif_metas || null, familiaData.paif_potencialidades || null,
      familiaData.tecnico_referencia || null
    ).run()

    // Atualizar membros
    if (membrosData && Array.isArray(membrosData) && membrosData.length > 0) {
      for (const m of membrosData) {
        const membroId = m.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`)
        const mNome = (m.nome || '').trim().toUpperCase()
        const mCpf = m.cpf ? String(m.cpf).replace(/\D/g, '') : null
        await db.prepare(`
          INSERT INTO membros_familia (
            id, familia_id, nome, parentesco, data_nascimento, idade, cpf, rg, nis, renda,
            escolaridade, ocupacao, programa_governo, sexo, raca_cor, certidao_nascimento,
            frequencia_escolar, escola_nome, possui_deficiencia, tipo_deficiencia,
            trabalho_infantil, acolhimento_institucional, descumprimento_condicionalidades, criado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            nome = excluded.nome,
            parentesco = excluded.parentesco,
            data_nascimento = excluded.data_nascimento,
            idade = excluded.idade,
            cpf = excluded.cpf,
            rg = excluded.rg,
            nis = excluded.nis,
            renda = excluded.renda,
            escolaridade = excluded.escolaridade,
            ocupacao = excluded.ocupacao,
            sexo = excluded.sexo,
            raca_cor = excluded.raca_cor
        `).bind(
          membroId, familiaId, mNome, m.parentesco || 'Outro', m.data_nascimento || null, Number(m.idade) || 0, mCpf, m.rg || null, m.nis || null, Number(m.renda) || 0,
          m.escolaridade || 'Não informada', (m.ocupacao || 'Não informada').trim().toUpperCase(), m.programa_governo || 'Nenhum', m.sexo || 'Não informado', m.raca_cor || 'Não informada', m.certidao_nascimento || null,
          m.frequencia_escolar || 'Não se aplica', m.escola_nome || null, m.possui_deficiencia ? 1 : 0, m.tipo_deficiencia || null,
          m.trabalho_infantil ? 1 : 0, m.acolhimento_institucional ? 1 : 0, m.descumprimento_condicionalidades ? 1 : 0
        ).run()
      }
    }

    return true
  } catch (err) {
    console.warn('[D1_SALVAR_FAMILIA_ERR]:', err)
    return false
  }
}




