-- Tabela para registro de frequencia detalhada dos grupos SCFV
CREATE TABLE IF NOT EXISTS frequencia_scfv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_scfv(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tema TEXT,
  tecnico TEXT,
  registros JSONB NOT NULL DEFAULT '[]',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(grupo_id, data)
);

ALTER TABLE frequencia_scfv DISABLE ROW LEVEL SECURITY;
