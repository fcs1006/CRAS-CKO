-- ============================================================
-- SCRIPT DE CÓPIA/IMPORTAÇÃO DA TABELA PACIENTES
-- ============================================================
-- Se você possui o dump em SQL ou CSV do outro projeto, pode
-- executar a estrutura abaixo no SQL Editor do Supabase do CRAS:

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE,
  logradouro TEXT,
  numero TEXT,
  bairro TEXT,
  municipio TEXT DEFAULT 'Conceição do Tocantins',
  uf TEXT DEFAULT 'TO',
  telefone TEXT,
  outro_contato TEXT,
  email TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);

ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
