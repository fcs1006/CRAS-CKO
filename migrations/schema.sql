-- ============================================================
-- BANCO DE DADOS SUPABASE - SISTEMA CRAS (SUAS DIGITAL)
-- EXECUTE ESTE SCRIPT NO EDITOR SQL DO SUPABASE
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELA DE USUÁRIOS (TÉCNICOS DO CRAS)
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE, -- CPF do Técnico
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT false,
  perfil TEXT NOT NULL DEFAULT 'usuario', -- admin | usuario
  telefone TEXT,
  email TEXT,
  conselho TEXT, -- Conselho Profissional (ex: CRESS/BA 1234, CRP-03/9876)
  cargo TEXT NOT NULL, -- Assistente Social, Psicólogo, Orientador, etc.
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(usuario);

-- 2. TABELA DE CONFIGURAÇÕES INSTITUCIONAIS
CREATE TABLE IF NOT EXISTS configuracoes (
  id BIGSERIAL PRIMARY KEY,
  municipio TEXT NOT NULL DEFAULT 'Prefeitura Municipal',
  secretaria TEXT NOT NULL DEFAULT 'Secretaria de Assistência Social',
  cras_unidade TEXT NOT NULL DEFAULT 'CRAS Geral',
  endereco TEXT NOT NULL DEFAULT 'Endereço da Unidade, nº 0',
  telefone TEXT NOT NULL DEFAULT '(00) 0000-0000',
  email TEXT NOT NULL DEFAULT 'cras@municipio.gov.br',
  logo_url TEXT, -- Logotipo convertido em Base64
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados padrão de configuração se não houver registros
INSERT INTO configuracoes (id, municipio, secretaria, cras_unidade, endereco, telefone, email)
VALUES (1, 'Prefeitura Municipal de Conceição do Tocantins', 'Secretaria Municipal de Assistência Social', 'CRAS Conceição do Tocantins', 'Rua Central, s/n - Centro', '(63) 3381-1234', 'cras@conceicao.to.gov.br')
ON CONFLICT (id) DO NOTHING;

-- 3. TABELA DE FAMÍLIAS
CREATE TABLE IF NOT EXISTS familias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cod_familiar TEXT NOT NULL UNIQUE,
  responsavel TEXT NOT NULL,
  cpf_responsavel TEXT NOT NULL UNIQUE,
  nis_responsavel TEXT NOT NULL UNIQUE,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  bairro TEXT NOT NULL,
  municipio TEXT NOT NULL DEFAULT 'Conceição do Tocantins',
  uf TEXT NOT NULL DEFAULT 'TO',
  telefone TEXT,
  outro_contato TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  moradia_tipo TEXT NOT NULL DEFAULT 'Própria',
  moradia_agua TEXT NOT NULL DEFAULT 'Rede Pública',
  moradia_sanear TEXT NOT NULL DEFAULT 'Rede Pública',
  moradia_lixo TEXT NOT NULL DEFAULT 'Coleta Pública',
  vulnerabilidades TEXT[] DEFAULT '{}',
  paif_ativo BOOLEAN NOT NULL DEFAULT false,
  paif_data_inicio DATE,
  paif_metas TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_familias_cpf ON familias(cpf_responsavel);
CREATE INDEX IF NOT EXISTS idx_familias_nis ON familias(nis_responsavel);
CREATE INDEX IF NOT EXISTS idx_familias_cod ON familias(cod_familiar);

-- 4. TABELA DE MEMBROS FAMILIARES
CREATE TABLE IF NOT EXISTS membros_familia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  parentesco TEXT NOT NULL, -- Responsável | Filho(a) | Cônjuge | etc.
  data_nascimento DATE NOT NULL,
  idade INTEGER NOT NULL,
  cpf TEXT,
  rg TEXT DEFAULT 'Não Informado',
  nis TEXT,
  renda NUMERIC(10, 2) DEFAULT 0.00,
  escolaridade TEXT NOT NULL,
  ocupacao TEXT NOT NULL,
  programa_governo TEXT NOT NULL DEFAULT 'Nenhum',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membros_familia_id ON membros_familia(familia_id);

-- 5. TABELA DE HISTÓRICO DE ATENDIMENTOS (EVOLUÇÕES)
CREATE TABLE IF NOT EXISTS historico_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  hora TIME NOT NULL DEFAULT CURRENT_TIME,
  usuario_visitado TEXT NOT NULL,
  participantes_familiares TEXT[] DEFAULT '{}',
  local TEXT NOT NULL DEFAULT 'CRAS', -- CRAS | Domicílio
  compartilhada TEXT NOT NULL DEFAULT 'Não', -- Sim | Não
  profissionais_participantes TEXT, -- Co-visitantes
  tecnico TEXT NOT NULL, -- Técnico principal
  relato TEXT NOT NULL,
  providencias TEXT,
  tipo TEXT NOT NULL DEFAULT 'Atendimento', -- Atendimento | Visita Domiciliar | Falta / Não Comparecimento | Agendamento Cancelado
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historico_familia_id ON historico_atendimentos(familia_id);

-- 6. TABELA DE BENEFÍCIOS CONCEDIDOS
CREATE TABLE IF NOT EXISTS beneficios_concedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL, -- Cesta Básica | Enxoval de Bebê | etc.
  status TEXT NOT NULL DEFAULT 'Entregue',
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_beneficios_familia_id ON beneficios_concedidos(familia_id);

-- 7. TABELA DE ALMOXARIFADO (ESTOQUE)
CREATE TABLE IF NOT EXISTS almoxarifado (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL UNIQUE, -- Cesta Básica | Enxoval de Bebê | etc.
  saldo INTEGER NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'Unidades',
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir itens padrão de almoxarifado
INSERT INTO almoxarifado (tipo, saldo, unidade) VALUES
('Cesta Básica', 40, 'Unidades'),
('Enxoval de Bebê / Auxílio Natalidade', 15, 'Kits'),
('Auxílio Funeral', 5, 'Ordens'),
('Aluguel Social', 10, 'Benefícios')
ON CONFLICT (tipo) DO NOTHING;

-- 8. TABELA DE GRUPOS SCFV
CREATE TABLE IF NOT EXISTS grupos_scfv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tecnico_responsavel TEXT NOT NULL,
  horario TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABELA DE PARTICIPANTES GRUPOS SCFV
CREATE TABLE IF NOT EXISTS participantes_scfv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_scfv(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL, -- ID do membro familiar
  nome TEXT NOT NULL,
  familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participantes_grupo_id ON participantes_scfv(grupo_id);

-- 10. TABELA DE FREQUÊNCIA SCFV
CREATE TABLE IF NOT EXISTS frequencia_scfv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID REFERENCES grupos_scfv(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  presentes UUID[] DEFAULT '{}', -- IDs dos membros presentes
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(grupo_id, data)
);

-- 11. TABELA DE ENCAMINHAMENTOS
CREATE TABLE IF NOT EXISTS encaminhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
  beneficiario TEXT NOT NULL,
  destino TEXT NOT NULL,
  motivo TEXT NOT NULL,
  data_envio DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Pendente', -- Pendente | Respondido
  tecnico TEXT NOT NULL,
  resposta TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_encaminhamentos_familia ON encaminhamentos(familia_id);

-- 12. TABELA DE AGENDA TÉCNICA
CREATE TABLE IF NOT EXISTS agenda_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES familias(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  tipo TEXT NOT NULL, -- Atendimento | Visita Domiciliar
  responsavel TEXT NOT NULL, -- Responsável familiar
  tecnico TEXT NOT NULL, -- Técnico agendado
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'Agendado', -- Agendado | Realizado | Não Compareceu | Cancelado
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agenda_data ON agenda_tecnica(data);

-- ============================================================
-- FUNÇÕES DE AUTENTICAÇÃO E LOGIN (COMPATÍVEIS COM O SISTEMA)
-- ============================================================

-- A. FUNÇÃO PARA CRIAR USUÁRIO (TÉCNICO)
CREATE OR REPLACE FUNCTION criar_usuario(
  p_nome      text,
  p_cpf       text,
  p_senha     text,
  p_cargo     text,
  p_conselho  text DEFAULT 'Não aplicável',
  p_telefone  text DEFAULT NULL,
  p_email     text DEFAULT NULL
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_existe int;
DECLARE v_cpf_limpo text;
BEGIN
  v_cpf_limpo := regexp_replace(p_cpf, '\D', '', 'g');
  
  SELECT count(*) INTO v_existe FROM usuarios WHERE regexp_replace(usuario, '\D', '', 'g') = v_cpf_limpo;
  IF v_existe > 0 THEN
    RETURN json_build_object('ok', false, 'error', 'CPF já cadastrado.');
  END IF;

  INSERT INTO usuarios (nome, usuario, senha_hash, ativo, perfil, cargo, conselho, telefone, email)
  VALUES (p_nome, p_cpf, crypt(p_senha, gen_salt('bf')), false, 'usuario', p_cargo, p_conselho, p_telefone, p_email);

  RETURN json_build_object('ok', true);
END; $$;

-- B. FUNÇÃO PARA FAZER LOGIN
CREATE OR REPLACE FUNCTION fazer_login(p_usuario text, p_senha text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_row usuarios%ROWTYPE;
DECLARE v_cpf text;
BEGIN
  v_cpf := regexp_replace(p_usuario, '\D', '', 'g');
  
  SELECT * INTO v_row FROM usuarios WHERE regexp_replace(usuario, '\D', '', 'g') = v_cpf;
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Usuário ou senha incorretos.');
  END IF;

  IF v_row.senha_hash != crypt(p_senha, v_row.senha_hash) THEN
    RETURN json_build_object('ok', false, 'error', 'Usuário ou senha incorretos.');
  END IF;

  IF NOT v_row.ativo THEN
    RETURN json_build_object('ok', false, 'error', 'Acesso pendente de aprovação pelo administrador do CRAS.');
  END IF;

  RETURN json_build_object(
    'ok',      true,
    'id',      v_row.id,
    'nome',    v_row.nome,
    'usuario', v_row.usuario,
    'perfil',  v_row.perfil,
    'cargo',   v_row.cargo,
    'conselho', v_row.conselho
  );
END; $$;

-- C. FUNÇÃO PARA RECUPERAÇÃO DE SENHA
CREATE OR REPLACE FUNCTION recuperar_senha(
  p_cpf        text,
  p_contato    text,
  p_nova_senha text
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row usuarios%ROWTYPE;
  v_contato_limpo text;
  v_cpf_limpo text;
BEGIN
  v_cpf_limpo := regexp_replace(p_cpf, '\D', '', 'g');
  
  SELECT * INTO v_row FROM usuarios WHERE regexp_replace(usuario, '\D', '', 'g') = v_cpf_limpo;
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'CPF não cadastrado.');
  END IF;

  IF length(p_nova_senha) < 6 THEN
    RETURN json_build_object('ok', false, 'error', 'A senha deve ter pelo menos 6 caracteres.');
  END IF;

  v_contato_limpo := regexp_replace(p_contato, '\D', '', 'g');

  IF NOT (
    (v_row.telefone IS NOT NULL AND regexp_replace(v_row.telefone, '\D', '', 'g') = v_contato_limpo)
    OR
    (v_row.email IS NOT NULL AND lower(v_row.email) = lower(p_contato))
  ) THEN
    RETURN json_build_object('ok', false, 'error', 'Telefone ou e-mail não confere com o cadastro do profissional.');
  END IF;

  UPDATE usuarios
  SET senha_hash = crypt(p_nova_senha, gen_salt('bf'))
  WHERE id = v_row.id;

  RETURN json_build_object('ok', true);
END; $$;
