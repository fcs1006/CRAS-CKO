-- Script SQL para adicionar as novas colunas da tabela grupos_scfv no Supabase
-- Execute este script no SQL Editor do Supabase se desejar gravar as colunas individualmente.

ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS tipo_grupo TEXT DEFAULT 'SCFV';
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS faixa_etaria TEXT DEFAULT 'Intergeracional';
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS dias_semana TEXT;
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS local_encontro TEXT;
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS vagas_limite INTEGER;
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativo';
