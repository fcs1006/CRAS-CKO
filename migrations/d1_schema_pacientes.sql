-- ==============================================================================
-- SCHEMA DA TABELA UNIFICADA DE CIDADÃOS / PACIENTES - CLOUDFLARE D1 (SQLITE)
-- Banco: banco-cidadaos-cko (ID: 54fc80c4-f8da-4462-8521-34e6bffceee0)
-- Compartilhado entre CRAS (SUAS Digital) e SMS (Secretaria Municipal de Saúde)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS pacientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  cns TEXT,
  rg TEXT,
  nis TEXT,
  data_nascimento TEXT,
  nome_mae TEXT,
  sexo TEXT,
  raca_cor TEXT,
  escolaridade TEXT,
  ocupacao TEXT,
  telefone TEXT,
  outro_contato TEXT,
  logradouro TEXT,
  numero TEXT,
  bairro TEXT,
  municipio TEXT DEFAULT 'Conceição do Tocantins',
  uf TEXT DEFAULT 'TO',
  cep TEXT DEFAULT '77305-000',
  zona_territorio TEXT DEFAULT 'Urbana',
  criado_em TEXT DEFAULT (datetime('now')),
  atualizado_em TEXT DEFAULT (datetime('now'))
);

-- Índices otimizados para buscas instantâneas
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_cns ON pacientes(cns);
CREATE INDEX IF NOT EXISTS idx_pacientes_nis ON pacientes(nis);
