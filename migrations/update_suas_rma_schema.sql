-- ============================================================
-- MIGRAÇÃO DE ADEQUAÇÃO AO PRONTUÁRIO SUAS (MDS) E RMA CRAS
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- 1. CAMPOS COMPLEMENTARES NA TABELA FAMILIAS
ALTER TABLE familias ADD COLUMN IF NOT EXISTS nome_mae_responsavel TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS sexo_responsavel TEXT DEFAULT 'Feminino';
ALTER TABLE familias ADD COLUMN IF NOT EXISTS raca_cor_responsavel TEXT DEFAULT 'Parda';
ALTER TABLE familias ADD COLUMN IF NOT EXISTS data_nascimento_responsavel DATE;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS escolaridade_responsavel TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS ocupacao_responsavel TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS renda_responsavel NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS programa_social_responsavel TEXT DEFAULT 'Nenhum';

ALTER TABLE familias ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS ponto_referencia TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS zona_territorio TEXT DEFAULT 'Urbana'; -- Urbana | Rural | Área de Risco | Quilombola | Indígena | Ribeirinha | Assentamento

ALTER TABLE familias ADD COLUMN IF NOT EXISTS tipo_construcao TEXT DEFAULT 'Alvenaria'; -- Alvenaria | Madeira | Taipa | Outro
ALTER TABLE familias ADD COLUMN IF NOT EXISTS moradia_energia TEXT DEFAULT 'Rede Elétrica com Relógio';
ALTER TABLE familias ADD COLUMN IF NOT EXISTS moradia_comodos INTEGER DEFAULT 4;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS acessibilidade BOOLEAN DEFAULT true;

-- Plano de Acompanhamento Familiar (PAF)
ALTER TABLE familias ADD COLUMN IF NOT EXISTS paif_data_fim DATE;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS paif_motivo_desligamento TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS paif_potencialidades TEXT;
ALTER TABLE familias ADD COLUMN IF NOT EXISTS tecnico_referencia TEXT;

-- 2. CAMPOS COMPLEMENTARES NA TABELA MEMBROS_FAMILIA
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS sexo TEXT;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS raca_cor TEXT;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS certidao_nascimento TEXT;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS frequencia_escolar TEXT DEFAULT 'Não se aplica';
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS escola_nome TEXT;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS possui_deficiencia BOOLEAN DEFAULT false;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS tipo_deficiencia TEXT;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS trabalho_infantil BOOLEAN DEFAULT false;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS acolhimento_institucional BOOLEAN DEFAULT false;
ALTER TABLE membros_familia ADD COLUMN IF NOT EXISTS descumprimento_condicionalidades BOOLEAN DEFAULT false;

-- 3. CAMPOS COMPLEMENTARES NA TABELA ENCAMINHAMENTOS
ALTER TABLE encaminhamentos ADD COLUMN IF NOT EXISTS tipo_rma TEXT DEFAULT 'outro';
-- Valores: inclusao_cadunico | atualizacao_cadunico | acesso_bpc | creas | outro

-- 4. CAMPOS COMPLEMENTARES NA TABELA HISTORICO_ATENDIMENTOS
ALTER TABLE historico_atendimentos ADD COLUMN IF NOT EXISTS tecnico_conselho TEXT;

-- 4.1 CAMPOS COMPLEMENTARES NA TABELA BENEFICIOS_CONCEDIDOS (SUAS/LOAS)
ALTER TABLE beneficios_concedidos ADD COLUMN IF NOT EXISTS categoria_rma TEXT DEFAULT 'outros_eventuais'; -- auxilio_natalidade | auxilio_funeral | outros_eventuais
ALTER TABLE beneficios_concedidos ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;
ALTER TABLE beneficios_concedidos ADD COLUMN IF NOT EXISTS tecnico_responsavel TEXT;
ALTER TABLE beneficios_concedidos ADD COLUMN IF NOT EXISTS tecnico_conselho TEXT;
ALTER TABLE beneficios_concedidos ADD COLUMN IF NOT EXISTS parecer_social TEXT;

-- 5. CAMPOS COMPLEMENTARES NA TABELA GRUPOS_SCFV
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS tipo_grupo TEXT DEFAULT 'SCFV'; -- SCFV | PAIF
ALTER TABLE grupos_scfv ADD COLUMN IF NOT EXISTS faixa_etaria TEXT DEFAULT '0_a_6'; -- 0_a_6 | 7_a_14 | 15_a_17 | 18_a_59 | 60_mais | Intergeracional

-- 6. TABELA DE ATIVIDADES COLETIVAS NÃO CONTINUADAS (D.6 DO RMA)
CREATE TABLE IF NOT EXISTS atividades_coletivas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Palestra', -- Palestra | Oficina | Ação Comunitária | Campanha
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT,
  tecnico_responsavel TEXT NOT NULL,
  quantidade_participantes INTEGER NOT NULL DEFAULT 0,
  local TEXT NOT NULL DEFAULT 'CRAS',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atividades_coletivas_data ON atividades_coletivas(data);
