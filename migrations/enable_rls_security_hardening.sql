-- ==============================================================================
-- MIGRAÇÃO DE HARDENING DE SEGURANÇA E ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
-- Execute este script no SQL Editor do Supabase para blindar a base de dados
-- contra acessos indevidos e extração não autorizada via Client / Anon Key.
-- ==============================================================================

-- 1. Criação e Habilitação de RLS na tabela de auditoria (LGPD)
CREATE TABLE IF NOT EXISTS auditoria_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id text,
  usuario_nome text,
  usuario_perfil text,
  acao text NOT NULL,
  detalhes text,
  entidade text,
  entidade_id text,
  ip text,
  criado_em timestamptz DEFAULT now()
);

-- 2. Habilitar RLS em todas as tabelas sensíveis
ALTER TABLE IF EXISTS usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS historico_atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS beneficios_concedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS almoxarifado ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grupos_scfv ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS participantes_scfv ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS frequencia_scfv ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS encaminhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agenda_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auditoria_logs ENABLE ROW LEVEL SECURITY;

-- 3. Limpar políticas permissivas anteriores se existirem
DROP POLICY IF EXISTS "Acesso total anon e auth" ON usuarios;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON familias;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON membros_familia;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON historico_atendimentos;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON beneficios_concedidos;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON almoxarifado;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON grupos_scfv;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON participantes_scfv;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON frequencia_scfv;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON encaminhamentos;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON agenda_tecnica;
DROP POLICY IF EXISTS "Acesso total anon e auth" ON pacientes;

-- 3. Configurações: permitir leitura pública de nome e brasão institucional (necessário para a tela de login)
DROP POLICY IF EXISTS "Permitir leitura publica de configuracoes" ON configuracoes;
CREATE POLICY "Permitir leitura publica de configuracoes"
  ON configuracoes FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. O papel 'service_role' (utilizado pelas rotas de servidor Next.js) possui bypass nativo de RLS.
-- Para garantir total segurança em conexões diretas:
REVOKE ALL ON TABLE usuarios, familias, membros_familia, historico_atendimentos, beneficios_concedidos, almoxarifado, grupos_scfv, participantes_scfv, frequencia_scfv, encaminhamentos, agenda_tecnica, pacientes, auditoria_logs FROM anon;

-- Conceder permissão de leitura institucional à tabela configuracoes
GRANT SELECT ON TABLE configuracoes TO anon;

-- Conceder execução segura das RPCs necessárias para login e cadastro inicial
GRANT EXECUTE ON FUNCTION fazer_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION criar_usuario(text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION recuperar_senha(text, text, text) TO anon, authenticated;

COMMENT ON TABLE familias IS 'Prontuários e famílias SUAS - Protegido por RLS e acessível apenas via Next.js Server API';
