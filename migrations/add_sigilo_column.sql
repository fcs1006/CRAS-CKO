-- Migration SQL para adicionar a coluna sigilo na tabela historico_atendimentos
-- Execute este comando no Editor SQL do seu Supabase para ativar a persistência da coluna sigilo no banco.

ALTER TABLE historico_atendimentos ADD COLUMN IF NOT EXISTS sigilo TEXT DEFAULT 'equipe_tecnica';
