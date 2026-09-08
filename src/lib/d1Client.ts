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
