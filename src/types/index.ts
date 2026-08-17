export interface Usuario {
  id: number
  nome: string
  usuario: string // CPF
  perfil: 'admin' | 'usuario'
  ativo: boolean
  cargo: string
  conselho?: string // Ex: CRESS/TO 1234, CRP-23 5678
  telefone?: string
  email?: string
  criado_em?: string
}

export interface MembroFamilia {
  id?: string
  familia_id?: string
  nome: string
  parentesco: string
  data_nascimento: string
  idade: number
  sexo?: 'Feminino' | 'Masculino' | 'Outro' | string
  raca_cor?: 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena' | 'Não declarada' | string
  cpf?: string
  rg?: string
  nis?: string
  certidao_nascimento?: string // Termo, Livro, Folha, Cartório
  renda: number
  escolaridade: string
  ocupacao: string
  programa_governo: string // Nenhum | Bolsa Família | BPC Idoso | BPC Deficiência | etc.
  frequencia_escolar?: 'Sim' | 'Não' | 'Não se aplica' | string
  escola_nome?: string
  possui_deficiencia?: boolean
  tipo_deficiencia?: string // Física | Auditiva | Visual | Intelectual | Múltipla | etc.
  trabalho_infantil?: boolean
  acolhimento_institucional?: boolean
  descumprimento_condicionalidades?: boolean
  criado_em?: string
}

export interface Familia {
  id: string
  cod_familiar: string // Nº do Prontuário / Código Familiar
  responsavel: string
  nome_mae_responsavel?: string
  cpf_responsavel: string
  rg_responsavel?: string
  nis_responsavel: string
  sexo_responsavel?: 'Feminino' | 'Masculino' | 'Outro' | string
  raca_cor_responsavel?: 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena' | 'Não declarada' | string
  data_nascimento_responsavel?: string
  escolaridade_responsavel?: string
  ocupacao_responsavel?: string
  renda_responsavel?: number
  programa_social_responsavel?: string
  
  // Endereço e Território
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cep?: string
  municipio: string
  uf: string
  ponto_referencia?: string
  zona_territorio?: 'Urbana' | 'Rural' | 'Área de Risco' | 'Quilombola' | 'Indígena' | 'Ribeirinha' | 'Assentamento' | string
  telefone?: string
  outro_contato?: string
  latitude?: number
  longitude?: number

  // Condições Habitacionais
  moradia_tipo: string
  tipo_construcao?: string // Alvenaria, Madeira, Taipa/Barro, etc.
  moradia_agua: string
  moradia_sanear: string
  moradia_lixo: string
  moradia_energia?: string
  moradia_comodos?: number
  acessibilidade?: boolean

  // Vulnerabilidades e Situações Prioritárias
  vulnerabilidades: string[]

  // PAIF (Plano de Acompanhamento Familiar - PAF)
  paif_ativo: boolean
  paif_data_inicio?: string
  paif_data_fim?: string
  paif_motivo_desligamento?: string // Superação da vulnerabilidade | Mudança de território | Transferência CREAS | Evasão | Óbito | Outro
  paif_metas?: string
  paif_potencialidades?: string
  tecnico_referencia?: string

  criado_em?: string
  atualizado_em?: string
  membros?: MembroFamilia[]
}

export interface Atendimento {
  id: string
  familia_id: string
  data: string
  hora: string
  usuario_visitado: string
  participantes_familiares: string[]
  local: string // CRAS | Domicílio | Espaço Comunitário | Outro
  compartilhada: string // Sim | Não
  profissionais_participantes?: string
  tecnico: string
  tecnico_conselho?: string
  relato: string
  providencias?: string
  tipo: string // Acolhida Inicial | Atendimento Particularizado | Acompanhamento PAIF | Visita Domiciliar | Atendimento Coletivo | Falta
  criado_em?: string
  responsavel_nome?: string
  bairro?: string
}

export interface BeneficioConcedido {
  id: string
  familia_id: string
  solicitante?: string
  data: string
  tipo: string // Cesta Básica | Auxílio-Natalidade / Enxoval | Auxílio-Funeral | Aluguel Social | Outro
  categoria_rma?: 'auxilio_natalidade' | 'auxilio_funeral' | 'outros_eventuais'
  quantidade?: number
  tecnico_responsavel?: string
  tecnico_conselho?: string
  parecer_social?: string
  status: string
  observacao?: string
  criado_em?: string
  responsavel_nome?: string
  bairro?: string
}

export interface AlmoxarifadoItem {
  id: number
  tipo: string
  saldo: number
  unidade: string
  atualizado_em?: string
}

export interface GrupoSCFV {
  id: string
  nome: string
  tipo_grupo?: 'SCFV' | 'PAIF' | string // Grupo SCFV ou Grupo/Oficina com Famílias do PAIF
  faixa_etaria?: '0_a_6' | '7_a_14' | '15_a_17' | '18_a_59' | '60_mais' | 'Intergeracional' | string
  descricao?: string
  tecnico_responsavel: string
  horario: string
  criado_em?: string
  participantes_count?: number
}

export interface ParticipanteSCFV {
  id: string
  grupo_id: string
  membro_id: string
  nome: string
  familia_id: string
  possui_deficiencia?: boolean
  idade?: number
  criado_em?: string
}

export interface Encaminhamento {
  id: string
  familia_id: string
  beneficiario: string
  tipo_rma?: 'inclusao_cadunico' | 'atualizacao_cadunico' | 'acesso_bpc' | 'creas' | 'outro' | string
  destino: string
  motivo: string
  data_envio: string
  status: string // Pendente | Atendido / Concluído | Não Atendido
  tecnico: string
  resposta?: string
  criado_em?: string
  responsavel_nome?: string
}

export interface AtividadeColetiva {
  id: string
  nome: string
  tipo: 'Palestra' | 'Oficina' | 'Ação Comunitária' | 'Campanha' | string
  data: string
  descricao?: string
  tecnico_responsavel: string
  quantidade_participantes: number
  local: string
  criado_em?: string
}

export interface AgendaItem {
  id: string
  familia_id: string
  data: string
  hora: string
  tipo: string
  responsavel: string
  tecnico: string
  descricao?: string
  status: string // Agendado | Realizado | Não Compareceu | Cancelado
  criado_em?: string
  bairro?: string
}

export interface Configuracao {
  id?: number
  municipio: string
  secretaria: string
  cras_unidade: string
  endereco: string
  telefone: string
  email: string
  logo_url?: string | null
}

export interface Paciente {
  id: string
  nome: string
  cpf?: string
  rg?: string
  data_nascimento?: string
  logradouro?: string
  numero?: string
  bairro?: string
  municipio?: string
  uf?: string
  telefone?: string
  outro_contato?: string
  email?: string
  observacoes?: string
  criado_em?: string
}
