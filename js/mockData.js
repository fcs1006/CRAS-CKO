// Dados Mock Iniciais para o Sistema CRAS (SUAS Digital) - Versão Atualizada com Novos Campos
// Estes dados simulam um banco de dados local para carregar o sistema preenchido.

const initialFamilies = [
  {
    id: "fam-01",
    codFamiliar: "30291048",
    responsavel: "Maria das Dores Santos",
    cpfResponsavel: "123.456.789-01",
    nisResponsavel: "1.234.567.890-1",
    logradouro: "Rua do Sossego",
    numero: "45",
    bairro: "Liberdade",
    municipio: "Salvador",
    uf: "BA",
    telefone: "(71) 98765-4321",
    outroContato: "(71) 98123-4567 (Irmã Cláudia)",
    latitude: -12.9720,
    longitude: -38.4980,
    moradia: {
      tipo: "Alvenaria sem Revestimento",
      abastecimentoAgua: "Rede Geral",
      escoamentoSanitario: "Fossa Rudimentar",
      coletaLixo: "Coletado",
      energiaEletrica: "Com Medidor"
    },
    vulnerabilidades: [
      "Extrema Pobreza",
      "Habitação Precária",
      "Crianças fora da escola",
      "Mãe / Pai Solo"
    ],
    membros: [
      { id: "mem-01-1", nome: "Maria das Dores Santos", parentesco: "Responsável", dataNascimento: "1988-04-12", idade: 38, cpf: "123.456.789-01", nis: "1.234.567.890-1", rg: "12.345.678-90", renda: 150.00, escolaridade: "Ensino Fundamental Incompleto", profissao: "Autônoma (Diarista)", programaGoverno: "Bolsa Família" },
      { id: "mem-01-2", nome: "Lucas Santos Oliveira", parentesco: "Filho", dataNascimento: "2014-07-20", idade: 12, cpf: "987.654.321-02", nis: "2.123.456.789-2", rg: "21.987.654-32", renda: 0.00, escolaridade: "Ensino Fundamental cursando", profissao: "Estudante", programaGoverno: "Bolsa Família" },
      { id: "mem-01-3", nome: "Ana Clara Santos Oliveira", parentesco: "Filha", dataNascimento: "2018-09-05", idade: 8, cpf: "456.789.123-03", nis: "3.123.456.789-3", rg: "32.456.789-01", renda: 0.00, escolaridade: "Ensino Fundamental cursando", profissao: "Estudante", programaGoverno: "Bolsa Família" }
    ],
    historicoAtendimentos: [
      { id: "at-01-1", data: "2026-05-10", tecnico: "Fernanda Lima (Assistente Social)", tipo: "Acolhida/Cadastramento", relato: "Família compareceu para atualização cadastral e solicitação de cesta básica devido ao desemprego da responsável. Relata dificuldades para comprar gás e comida.", encaminhamento: "Inserção no PAIF, encaminhamento para o CRAS Móvel de alimentação." },
      { id: "at-01-2", data: "2026-06-15", tecnico: "Claudio Rocha (Psicólogo)", tipo: "Visita Domiciliar", relato: "Visita realizada para verificar condições habitacionais. Casa de alvenaria inacabada, sem revestimento, fossa sanitária aberta. Crianças saudáveis porém mãe relata falta de vagas em creche local para o filho mais novo no passado. Atualmente matriculados na escola.", encaminhamento: "Articulação com a Secretaria de Habitação e solicitação de benefício eventual de alimentação." }
    ],
    beneficiosConcedidos: [
      { id: "ben-01-1", data: "2026-05-10", tipo: "Cesta Básica", status: "Entregue", observacao: "Concessão emergencial." },
      { id: "ben-01-2", data: "2026-06-16", tipo: "Cesta Básica", status: "Entregue", observacao: "Acompanhamento PAIF." }
    ],
    acompanhamentoPAIF: {
      ativo: true,
      dataInicio: "2026-05-10",
      metas: "Garantir a alimentação básica da família; Inserir a responsável em oficinas produtivas de costura; Acompanhar a frequência escolar das crianças.",
      evolucao: "Família demonstra engajamento. Maria iniciou a oficina de costura do CRAS neste mês. Crianças com frequência escolar regular."
    }
  },
  {
    id: "fam-02",
    codFamiliar: "40581928",
    responsavel: "Sebastião Souza Ramos",
    cpfResponsavel: "234.567.890-12",
    nisResponsavel: "1.345.678.901-2",
    logradouro: "Beco da Paz",
    numero: "12B",
    bairro: "Pero Vaz",
    municipio: "Salvador",
    uf: "BA",
    telefone: "(71) 99122-3344",
    outroContato: "(71) 98888-2211 (Vizinha Helena)",
    latitude: -12.9690,
    longitude: -38.4950,
    moradia: {
      tipo: "Madeira/Taipa",
      abastecimentoAgua: "Poço/Nascente",
      escoamentoSanitario: "Céu Aberto",
      coletaLixo: "Não Coletado",
      energiaEletrica: "Sem Medidor (Ligação Direta)"
    },
    vulnerabilidades: [
      "Extrema Pobreza",
      "Ausência de Saneamento",
      "Membro com Deficiência (PcD)",
      "Analfabetismo",
      "Família Atípica (Membro Neurodivergente/PCD)"
    ],
    membros: [
      { id: "mem-02-1", nome: "Sebastião Souza Ramos", parentesco: "Responsável", dataNascimento: "1964-03-10", idade: 62, cpf: "234.567.890-12", nis: "1.345.678.901-2", rg: "15.456.789-02", renda: 0.00, escolaridade: "Analfabeto", profissao: "Aposentado/Bicos", programaGoverno: "Nenhum" },
      { id: "mem-02-2", nome: "Juliana Ramos Souza", parentesco: "Esposa", dataNascimento: "1968-11-22", idade: 58, cpf: "876.543.210-34", nis: "4.123.456.789-4", rg: "16.876.543-21", renda: 0.00, escolaridade: "Ensino Fundamental Incompleto", profissao: "Dona de Casa", programaGoverno: "Nenhum" },
      { id: "mem-02-3", nome: "Carlos Eduardo Ramos", parentesco: "Filho", dataNascimento: "2001-05-15", idade: 25, cpf: "345.678.901-45", nis: "5.123.456.789-5", rg: "20.345.678-90", renda: 200.00, escolaridade: "Ensino Fundamental Incompleto", profissao: "Desempregado", programaGoverno: "BPC (Benefício de Prestação Continuada)", observacao: "Pessoa com Deficiência Intelectual" }
    ],
    historicoAtendimentos: [
      { id: "at-02-1", data: "2026-04-20", tecnico: "Fernanda Lima (Assistente Social)", tipo: "Atendimento Individual", relato: "Sebastião relata que a família não tem renda fixa, apenas pequenos bicos do Carlos Eduardo. Solicita orientação para conseguir benefício para o filho deficiente (BPC).", encaminhamento: "Orientações sobre documentação e laudo médico para requerimento do BPC. Agendamento com o setor de Cadastro Único." },
      { id: "at-02-2", data: "2026-06-02", tecnico: "Fernanda Lima (Assistente Social)", tipo: "Atendimento Individual", relato: "Retorno da família com os documentos e laudo médico exigidos. Realizado o preenchimento do formulário do INSS e agendamento da perícia médica.", encaminhamento: "Requerimento do BPC transmitido. Concedido benefício eventual de Cesta Básica enquanto aguardam análise do BPC." }
    ],
    beneficiosConcedidos: [
      { id: "ben-02-1", data: "2026-06-02", tipo: "Cesta Básica", status: "Entregue", observacao: "Apoio durante solicitação de BPC." }
    ],
    acompanhamentoPAIF: {
      ativo: true,
      dataInicio: "2026-04-20",
      metas: "Conclusão do requerimento do BPC para Carlos Eduardo; Inserção de Sebastião em programas de alfabetização de adultos (EJA); Melhoria nas condições sanitárias da moradia.",
      evolucao: "Requerimento BPC protocolado. Sebastião foi matriculado na turma de EJA da escola parceira."
    }
  },
  {
    id: "fam-03",
    codFamiliar: "50123491",
    responsavel: "Gisele Barbosa Melo",
    cpfResponsavel: "345.678.901-23",
    nisResponsavel: "1.456.789.012-3",
    logradouro: "Avenida Peixe",
    numero: "900",
    bairro: "Caixa d'Água",
    municipio: "Salvador",
    uf: "BA",
    telefone: "(71) 98877-6655",
    outroContato: "(71) 98777-6611 (Mãe Socorro)",
    latitude: -12.9660,
    longitude: -38.4900,
    moradia: {
      tipo: "Alvenaria com Revestimento",
      abastecimentoAgua: "Rede Geral",
      escoamentoSanitario: "Rede Geral",
      coletaLixo: "Coletado",
      energiaEletrica: "Com Medidor"
    },
    vulnerabilidades: [
      "Mãe / Pai Solo",
      "Desemprego"
    ],
    membros: [
      { id: "mem-03-1", nome: "Gisele Barbosa Melo", parentesco: "Responsável", dataNascimento: "2002-09-08", idade: 24, cpf: "345.678.901-23", nis: "1.456.789.012-3", rg: "18.345.678-03", renda: 0.00, escolaridade: "Ensino Médio Completo", profissao: "Recepcionista (Desempregada)", programaGoverno: "Bolsa Família" },
      { id: "mem-03-2", nome: "Alice Melo Silva", parentesco: "Filha", dataNascimento: "2024-01-30", idade: 2, cpf: "765.432.109-87", nis: "6.123.456.789-6", rg: "Sem Registro", renda: 0.00, escolaridade: "Não Cursando", profissao: "Nenhuma (Bebê)", programaGoverno: "Bolsa Família" }
    ],
    historicoAtendimentos: [
      { id: "at-03-1", data: "2026-06-10", tecnico: "Claudio Rocha (Psicólogo)", tipo: "Atendimento Individual", relato: "Gisele relata sofrimento psíquico decorrente de isolamento social e desemprego recente. É mãe solo, sem rede de apoio familiar na cidade. Deseja orientação profissional.", encaminhamento: "Acolhimento psicológico, inserção no grupo de apoio a mães solo do CRAS, encaminhamento para o SineBahia." }
    ],
    beneficiosConcedidos: [
      { id: "ben-03-1", data: "2026-06-10", tipo: "Enxoval de Bebê / Auxílio Natalidade", status: "Entregue", observacao: "Kit de apoio à infância." }
    ],
    acompanhamentoPAIF: {
      ativo: false,
      dataInicio: "",
      metas: "",
      evolucao: ""
    }
  },
  {
    id: "fam-04",
    codFamiliar: "60293847",
    responsavel: "Francisca das Chagas Silva",
    cpfResponsavel: "456.789.012-34",
    nisResponsavel: "1.567.890.123-4",
    logradouro: "Rua Direta da Palestina",
    numero: "150",
    bairro: "Palestina",
    municipio: "Salvador",
    uf: "BA",
    telefone: "(71) 98111-2222",
    outroContato: "(71) 98222-3333 (Irmã Antônia)",
    latitude: -12.9100,
    longitude: -38.4300,
    moradia: {
      tipo: "Alvenaria sem Revestimento",
      abastecimentoAgua: "Rede Geral",
      escoamentoSanitario: "Fossa Séptica",
      coletaLixo: "Coletado",
      energiaEletrica: "Com Medidor"
    },
    vulnerabilidades: [
      "Extrema Pobreza",
      "Violência Doméstica Relatada",
      "Mãe / Pai Solo",
      "Família Atípica (Membro Neurodivergente/PCD)"
    ],
    membros: [
      { id: "mem-04-1", nome: "Francisca das Chagas Silva", parentesco: "Responsável", dataNascimento: "1984-05-20", idade: 42, cpf: "456.789.012-34", nis: "1.567.890.123-4", rg: "14.567.890-12", renda: 120.00, escolaridade: "Ensino Fundamental Incompleto", profissao: "Autônoma (Costureira)", programaGoverno: "Bolsa Família" },
      { id: "mem-04-2", nome: "Vitor Silva de Sousa", parentesco: "Filho", dataNascimento: "2011-02-14", idade: 15, cpf: "654.321.098-76", nis: "7.123.456.789-7", rg: "21.654.321-09", renda: 0.00, escolaridade: "Ensino Fundamental cursando", profissao: "Estudante", programaGoverno: "Bolsa Família" },
      { id: "mem-04-3", nome: "Gabriela Silva de Sousa", parentesco: "Filha", dataNascimento: "2016-10-18", idade: 10, cpf: "543.210.987-65", nis: "8.123.456.789-8", rg: "22.543.210-98", renda: 0.00, escolaridade: "Ensino Fundamental cursando", profissao: "Estudante (Acompanhamento por TDAH)", programaGoverno: "Bolsa Família" }
    ],
    historicoAtendimentos: [
      { id: "at-04-1", data: "2026-03-12", tecnico: "Fernanda Lima (Assistente Social)", tipo: "Acolhida", relato: "Francisca comparece encaminhada pelo Centro de Referência de Atenção à Mulher (CRAM). Sofreu agressão física do ex-companheiro e possui medida protetiva. Está residindo temporariamente com a irmã, em situação precária.", encaminhamento: "Articulação de acolhimento emergencial, inserção no Aluguel Social, acompanhamento familiar e apoio psicológico para as crianças." },
      { id: "at-04-2", data: "2026-05-20", tecnico: "Claudio Rocha (Psicólogo)", tipo: "Atendimento Individual", relato: "Sessão de escuta qualificada. Francisca demonstra melhora em seu estado emocional, informa que está conseguindo reestruturar sua rotina e que os filhos estão frequentando a escola.", encaminhamento: "Encaminhar para o programa municipal de qualificação profissional." }
    ],
    beneficiosConcedidos: [
      { id: "ben-04-1", data: "2026-03-15", tipo: "Aluguel Social", status: "Entregue", observacao: "Auxílio vulnerabilidade decorrente de violência doméstica." },
      { id: "ben-04-2", data: "2026-04-15", tipo: "Aluguel Social", status: "Entregue", observacao: "Parcela 2." },
      { id: "ben-04-3", data: "2026-05-15", tipo: "Aluguel Social", status: "Entregue", observacao: "Parcela 3." },
      { id: "ben-04-4", data: "2026-06-15", tipo: "Aluguel Social", status: "Entregue", observacao: "Parcela 4." }
    ],
    acompanhamentoPAIF: {
      ativo: true,
      dataInicio: "2026-03-12",
      metas: "Superação da situação de violência; Acesso à moradia autônoma e segura; Inserção escolar e comunitária dos dependentes.",
      evolucao: "Francisca reside em casa alugada por meio do Aluguel Social, mantendo-se segura do agressor. Crianças em acompanhamento psicológico escolar."
    }
  }
];

const initialGroups = [
  {
    id: "grp-01",
    nome: "Grupo de Idosos - Viver Melhor",
    tecnicoResponsavel: "Fernanda Lima (Assistente Social)",
    horario: "Quartas-feiras, 14:00 às 16:00",
    descricao: "Atividades de integração, palestras sobre direitos dos idosos e dinâmicas físicas leves.",
    participantes: [
      { membroId: "mem-02-1", nome: "Sebastião Souza Ramos", familiaId: "fam-02" }
    ],
    presencas: [
      { data: "2026-06-10", presentes: ["mem-02-1"] },
      { data: "2026-06-17", presentes: ["mem-02-1"] },
      { data: "2026-06-24", presentes: [] }
    ]
  },
  {
    id: "grp-02",
    nome: "Oficina de Costura e Geração de Renda",
    tecnicoResponsavel: "Parceria SENAI / Coordenação CRAS",
    horario: "Terças e Quintas, 09:00 às 11:30",
    descricao: "Capacitação profissional em corte e costura industrial para chefes de famílias em acompanhamento do PAIF.",
    participantes: [
      { membroId: "mem-01-1", nome: "Maria das Dores Santos", familiaId: "fam-01" },
      { membroId: "mem-03-1", nome: "Gisele Barbosa Melo", familiaId: "fam-03" }
    ],
    presencas: [
      { data: "2026-06-09", presentes: ["mem-01-1", "mem-03-1"] },
      { data: "2026-06-11", presentes: ["mem-01-1"] },
      { data: "2026-06-16", presentes: ["mem-01-1", "mem-03-1"] },
      { data: "2026-06-18", presentes: ["mem-01-1", "mem-03-1"] }
    ]
  }
];

const initialReferrals = [
  {
    id: "ref-01",
    familiaId: "fam-01",
    beneficiario: "Lucas Santos Oliveira",
    destino: "Secretaria Municipal de Educação (SME)",
    motivo: "Transferência escolar por mudança de domicílio da mãe.",
    dataEnvio: "2026-05-12",
    status: "Respondido",
    tecnico: "Fernanda Lima (Assistente Social)",
    resposta: "Vaga disponibilizada na Escola Municipal Liberdade em 18/05/2026."
  },
  {
    id: "ref-02",
    familiaId: "fam-02",
    beneficiario: "Carlos Eduardo Ramos",
    destino: "Centro de Reabilitação do Município",
    motivo: "Necessidade de avaliação fisioterapêutica e neurológica para laudo BPC.",
    dataEnvio: "2026-04-22",
    status: "Respondido",
    tecnico: "Fernanda Lima (Assistente Social)",
    resposta: "Consulta realizada em 08/05/2026. Laudo emitido e entregue ao beneficiário."
  },
  {
    id: "ref-03",
    familiaId: "fam-04",
    beneficiario: "Francisca das Chagas Silva",
    destino: "CREAS (Proteção Especial)",
    motivo: "Acompanhamento especializado devido a situação de violência doméstica e risco pessoal.",
    dataEnvio: "2026-03-13",
    status: "Pendente",
    tecnico: "Fernanda Lima (Assistente Social)",
    resposta: ""
  }
];

// Agenda técnica
const initialAgenda = [
  {
    id: "ag-01",
    data: "2026-06-29",
    hora: "09:30",
    tipo: "Visita Domiciliar",
    familiaId: "fam-01",
    responsavel: "Maria das Dores Santos",
    tecnico: "Fernanda Lima (Assistente Social)",
    descricao: "Realizar vistoria e verificar frequência escolar pós-inclusão no PAIF.",
    status: "Agendado"
  },
  {
    id: "ag-02",
    data: "2026-06-30",
    hora: "14:00",
    tipo: "Atendimento Individual",
    familiaId: "fam-02",
    responsavel: "Sebastião Souza Ramos",
    tecnico: "Claudio Rocha (Psicólogo)",
    descricao: "Escuta qualificada continuada e avaliação de vulnerabilidade psicossocial.",
    status: "Agendado"
  }
];

// Almoxarifado
const initialStock = [
  { tipo: "Cesta Básica", saldo: 40, unidade: "Unidades" },
  { tipo: "Enxoval de Bebê / Auxílio Natalidade", saldo: 15, unidade: "Kits" },
  { tipo: "Auxílio Funeral", saldo: 5, unidade: "Ordens" },
  { tipo: "Aluguel Social", saldo: 10, unidade: "Vagas/Beneficiários" }
];

// Configurações padrão
const defaultSettings = {
  municipio: "Prefeitura Municipal de Salvador",
  secretaria: "Secretaria de Assistência Social e Combate à Pobreza",
  crasUnidade: "CRAS Liberdade / Pero Vaz",
  endereco: "Rua Direta da Liberdade, nº 140, Liberdade, Salvador - BA",
  telefone: "(71) 3202-7777",
  email: "cras.liberdade@salvador.ba.gov.br",
  logoUrl: "https://www.ba.gov.br/wp-content/themes/governo-da-bahia/images/logo.png"
};

// Sempre sincronizar com localStorage sobrescrevendo se houver dados antigos
// (Como estamos atualizando o schema, forçamos a reinicialização para garantir a coerência do schema de dados no teste do usuário)
localStorage.setItem("cras_families", JSON.stringify(initialFamilies));
localStorage.setItem("cras_groups", JSON.stringify(initialGroups));
localStorage.setItem("cras_referrals", JSON.stringify(initialReferrals));
localStorage.setItem("cras_agenda", JSON.stringify(initialAgenda));
localStorage.setItem("cras_stock", JSON.stringify(initialStock));
localStorage.setItem("cras_settings", JSON.stringify(defaultSettings));

console.log("Mock database schemas updated to include RG, DOB, Secondary Contact, and typical/atypical vulnerability states.");
