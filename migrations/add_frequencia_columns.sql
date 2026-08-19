-- Script SQL para adicionar as novas colunas na tabela frequencia_scfv no Supabase
-- Execute este script no SQL Editor do Supabase se desejar armazenar os registros completos em formato JSON.

ALTER TABLE frequencia_scfv ADD COLUMN IF NOT EXISTS tema TEXT;
ALTER TABLE frequencia_scfv ADD COLUMN IF NOT EXISTS tecnico TEXT;
ALTER TABLE frequencia_scfv ADD COLUMN IF NOT EXISTS registros JSONB DEFAULT '[]';
