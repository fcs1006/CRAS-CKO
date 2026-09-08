-- ==============================================================================
-- SCHEMA COMPLETO UNIFICADO DO SISTEMA CRAS & SMS - CLOUDFLARE D1 (SQLITE)
-- Banco de Dados: banco-cidadaos-cko (ID: 54fc80c4-f8da-4462-8521-34e6bffceee0)
-- ==============================================================================

-- 1. TABELA DE USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE, -- CPF do Usuário
  senha_hash TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 0, -- 1 = ativo, 0 = inativo
  perfil TEXT NOT NULL DEFAULT 'usuario', -- admin | usuario | RECEPCAO | ASSISTENTE_SOCIAL | PSICOLOGO | COORDENADOR
  telefone TEXT,
  email TEXT,
  conselho TEXT,
  cargo TEXT NOT NULL,
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(usuario);

-- Inserir usuário Administrador inicial padrão (se não existir)
INSERT OR IGNORE INTO usuarios (nome, usuario, senha_hash, ativo, perfil, cargo, conselho, email)
VALUES (
  'Administrador CRAS',
  '000.000.000-00',
  'admin',
  1,
  'admin',
  'Coordenador / Admin',
  'CRESS/TO 0001',
  'admin@cras.gov.br'
);

-- 2. TABELA DE CONFIGURAÇÕES INSTITUCIONAIS
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY,
  municipio TEXT NOT NULL DEFAULT 'Prefeitura Municipal de Conceição do Tocantins',
  secretaria TEXT NOT NULL DEFAULT 'Secretaria Municipal de Assistência Social',
  cras_unidade TEXT NOT NULL DEFAULT 'CRAS Pedro de Santana Brito',
  endereco TEXT NOT NULL DEFAULT 'Rua Central, s/n - Centro',
  telefone TEXT NOT NULL DEFAULT '(63) 3381-1234',
  email TEXT NOT NULL DEFAULT 'cras@conceicao.to.gov.br',
  logo_url TEXT,
  atualizado_em TEXT DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO configuracoes (id, municipio, secretaria, cras_unidade, endereco, telefone, email)
VALUES (
  1,
  'Prefeitura Municipal de Conceição do Tocantins',
  'Secretaria Municipal de Assistência Social',
  'CRAS Pedro de Santana Brito',
  'Rua Central, s/n - Centro',
  '(63) 3381-1234',
  'cras@conceicao.to.gov.br'
);

-- 3. TABELA DE FAMÍLIAS (PRONTUÁRIO SUAS)
CREATE TABLE IF NOT EXISTS familias (
  id TEXT PRIMARY KEY,
  cod_familiar TEXT NOT NULL UNIQUE,
  responsavel TEXT NOT NULL,
  cpf_responsavel TEXT NOT NULL UNIQUE,
  nis_responsavel TEXT NOT NULL UNIQUE,
  nome_mae_responsavel TEXT,
  sexo_responsavel TEXT DEFAULT 'Feminino',
  raca_cor_responsavel TEXT DEFAULT 'Parda',
  data_nascimento_responsavel TEXT,
  escolaridade_responsavel TEXT,
  ocupacao_responsavel TEXT,
  renda_responsavel REAL DEFAULT 0.00,
  programa_social_responsavel TEXT DEFAULT 'Nenhum',
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cep TEXT,
  municipio TEXT NOT NULL DEFAULT 'Conceição do Tocantins',
  uf TEXT NOT NULL DEFAULT 'TO',
  ponto_referencia TEXT,
  zona_territorio TEXT DEFAULT 'Urbana',
  telefone TEXT,
  outro_contato TEXT,
  latitude REAL,
  longitude REAL,
  moradia_tipo TEXT NOT NULL DEFAULT 'Própria',
  tipo_construcao TEXT DEFAULT 'Alvenaria',
  moradia_agua TEXT NOT NULL DEFAULT 'Rede Pública',
  moradia_sanear TEXT NOT NULL DEFAULT 'Rede Pública',
  moradia_lixo TEXT NOT NULL DEFAULT 'Coleta Pública',
  moradia_energia TEXT DEFAULT 'Rede Elétrica com Relógio',
  moradia_comodos INTEGER DEFAULT 4,
  acessibilidade INTEGER DEFAULT 1,
  vulnerabilidades TEXT DEFAULT '[]', -- JSON string
  paif_ativo INTEGER NOT NULL DEFAULT 0,
  paif_data_inicio TEXT,
  paif_data_fim TEXT,
  paif_motivo_desligamento TEXT,
  paif_metas TEXT,
  paif_potencialidades TEXT,
  tecnico_referencia TEXT,
  criado_em TEXT DEFAULT (datetime('now')),
  atualizado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_familias_cpf ON familias(cpf_responsavel);
CREATE INDEX IF NOT EXISTS idx_familias_nis ON familias(nis_responsavel);
CREATE INDEX IF NOT EXISTS idx_familias_cod ON familias(cod_familiar);

-- 4. TABELA DE MEMBROS FAMILIARES
CREATE TABLE IF NOT EXISTS membros_familia (
  id TEXT PRIMARY KEY,
  familia_id TEXT REFERENCES familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  parentesco TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  idade INTEGER NOT NULL,
  cpf TEXT,
  rg TEXT DEFAULT 'Não Informado',
  nis TEXT,
  renda REAL DEFAULT 0.00,
  escolaridade TEXT NOT NULL,
  ocupacao TEXT NOT NULL,
  programa_governo TEXT NOT NULL DEFAULT 'Nenhum',
  sexo TEXT,
  raca_cor TEXT,
  certidao_nascimento TEXT,
  frequencia_escolar TEXT DEFAULT 'Não se aplica',
  escola_nome TEXT,
  possui_deficiencia INTEGER DEFAULT 0,
  tipo_deficiencia TEXT,
  trabalho_infantil INTEGER DEFAULT 0,
  acolhimento_institucional INTEGER DEFAULT 0,
  descumprimento_condicionalidades INTEGER DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_membros_familia_id ON membros_familia(familia_id);
CREATE INDEX IF NOT EXISTS idx_membros_cpf ON membros_familia(cpf);
CREATE INDEX IF NOT EXISTS idx_membros_nis ON membros_familia(nis);

-- 5. TABELA DE HISTÓRICO DE ATENDIMENTOS (EVOLUÇÕES)
CREATE TABLE IF NOT EXISTS historico_atendimentos (
  id TEXT PRIMARY KEY,
  familia_id TEXT REFERENCES familias(id) ON DELETE CASCADE,
  data TEXT NOT NULL DEFAULT (date('now')),
  hora TEXT NOT NULL DEFAULT (time('now')),
  usuario_visitado TEXT NOT NULL,
  participantes_familiares TEXT DEFAULT '[]', -- JSON string
  local TEXT NOT NULL DEFAULT 'CRAS',
  compartilhada TEXT NOT NULL DEFAULT 'Não',
  profissionais_participantes TEXT,
  tecnico TEXT NOT NULL,
  tecnico_conselho TEXT,
  relato TEXT NOT NULL,
  providencias TEXT,
  sigilo TEXT NOT NULL DEFAULT 'equipe_tecnica',
  tipo TEXT NOT NULL DEFAULT 'Atendimento',
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_historico_familia_id ON historico_atendimentos(familia_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_atendimentos(data);

-- 6. TABELA DE BENEFÍCIOS CONCEDIDOS (SUAS / EVENTUAIS)
CREATE TABLE IF NOT EXISTS beneficios_concedidos (
  id TEXT PRIMARY KEY,
  familia_id TEXT REFERENCES familias(id) ON DELETE CASCADE,
  data TEXT NOT NULL DEFAULT (date('now')),
  tipo TEXT NOT NULL,
  categoria_rma TEXT DEFAULT 'outros_eventuais',
  quantidade INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Entregue',
  tecnico_responsavel TEXT,
  tecnico_conselho TEXT,
  parecer_social TEXT,
  observacao TEXT,
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_beneficios_familia_id ON beneficios_concedidos(familia_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_data ON beneficios_concedidos(data);

-- 7. TABELA DE ALMOXARIFADO (ESTOQUE)
CREATE TABLE IF NOT EXISTS almoxarifado (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL UNIQUE,
  saldo INTEGER NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'Unidades',
  atualizado_em TEXT DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO almoxarifado (tipo, saldo, unidade) VALUES
('Cesta Básica', 40, 'Unidades'),
('Enxoval de Bebê / Auxílio Natalidade', 15, 'Kits'),
('Auxílio Funeral', 5, 'Ordens'),
('Aluguel Social', 10, 'Benefícios');

-- 8. TABELA DE GRUPOS SCFV
CREATE TABLE IF NOT EXISTS grupos_scfv (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tecnico_responsavel TEXT NOT NULL,
  horario TEXT NOT NULL,
  tipo_grupo TEXT DEFAULT 'SCFV',
  faixa_etaria TEXT DEFAULT '0_a_6',
  criado_em TEXT DEFAULT (datetime('now'))
);

-- 9. TABELA DE PARTICIPANTES GRUPOS SCFV
CREATE TABLE IF NOT EXISTS participantes_scfv (
  id TEXT PRIMARY KEY,
  grupo_id TEXT REFERENCES grupos_scfv(id) ON DELETE CASCADE,
  membro_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  familia_id TEXT REFERENCES familias(id) ON DELETE CASCADE,
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_participantes_grupo_id ON participantes_scfv(grupo_id);

-- 10. TABELA DE FREQUÊNCIA SCFV
CREATE TABLE IF NOT EXISTS frequencia_scfv (
  id TEXT PRIMARY KEY,
  grupo_id TEXT REFERENCES grupos_scfv(id) ON DELETE CASCADE,
  data TEXT NOT NULL DEFAULT (date('now')),
  tema TEXT,
  tecnico TEXT,
  presentes TEXT DEFAULT '[]', -- JSON string
  registros TEXT DEFAULT '[]', -- JSON string
  criado_em TEXT DEFAULT (datetime('now')),
  UNIQUE(grupo_id, data)
);

-- 11. TABELA DE ATIVIDADES COLETIVAS (PALESTRAS/OFICINAS - D.6 RMA)
CREATE TABLE IF NOT EXISTS atividades_coletivas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Palestra',
  data TEXT NOT NULL DEFAULT (date('now')),
  descricao TEXT,
  tecnico_responsavel TEXT NOT NULL,
  quantidade_participantes INTEGER NOT NULL DEFAULT 0,
  local TEXT NOT NULL DEFAULT 'CRAS',
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_atividades_coletivas_data ON atividades_coletivas(data);

-- 12. TABELA DE ENCAMINHAMENTOS
CREATE TABLE IF NOT EXISTS encaminhamentos (
  id TEXT PRIMARY KEY,
  familia_id TEXT REFERENCES familias(id) ON DELETE CASCADE,
  beneficiario TEXT NOT NULL,
  destino TEXT NOT NULL,
  motivo TEXT NOT NULL,
  data_envio TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'Pendente',
  tipo_rma TEXT DEFAULT 'outro',
  tecnico TEXT NOT NULL,
  resposta TEXT,
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_familia ON encaminhamentos(familia_id);

-- 13. TABELA DE AGENDA TÉCNICA
CREATE TABLE IF NOT EXISTS agenda_tecnica (
  id TEXT PRIMARY KEY,
  familia_id TEXT REFERENCES familias(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  hora TEXT NOT NULL,
  tipo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  tecnico TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'Agendado',
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agenda_data ON agenda_tecnica(data);

-- 14. TABELA MESTRE UNIFICADA DE CIDADÃOS / PACIENTES (CRAS + SAÚDE)
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
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_cns ON pacientes(cns);
CREATE INDEX IF NOT EXISTS idx_pacientes_nis ON pacientes(nis);

-- 15. TABELA DE LOGS DE AUDITORIA (LGPD)
CREATE TABLE IF NOT EXISTS auditoria_logs (
  id TEXT PRIMARY KEY,
  usuario_id TEXT,
  usuario_nome TEXT,
  usuario_perfil TEXT,
  acao TEXT NOT NULL,
  detalhes TEXT,
  entidade TEXT,
  entidade_id TEXT,
  ip TEXT,
  criado_em TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON auditoria_logs(criado_em);
