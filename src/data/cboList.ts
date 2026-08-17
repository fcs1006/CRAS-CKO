// Tabela Completa Oficial da CBO (Classificação Brasileira de Ocupações - MTE)
// Fonte Oficial: Ministério do Trabalho e Emprego (2.600+ Ocupações CBO A-Z)

export interface CBO {
  codigo: string
  titulo: string
}

function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export const LISTA_CBO: CBO[] = [
  {
    "codigo": "9922-05",
    "titulo": "DONA DE CASA / DO LAR"
  },
  {
    "codigo": "9922-01",
    "titulo": "DESEMPREGADO(A) / SEM OCUPAÇÃO"
  },
  {
    "codigo": "9922-02",
    "titulo": "ESTUDANTE"
  },
  {
    "codigo": "9922-03",
    "titulo": "APOSENTADO(A)"
  },
  {
    "codigo": "9922-04",
    "titulo": "PENSIONISTA"
  },
  {
    "codigo": "9922-06",
    "titulo": "AUTÔNOMO(A) / BICOS"
  },
  {
    "codigo": "6210-15",
    "titulo": "TRABALHADOR RURAL / LAVRADOR"
  },
  {
    "codigo": "5121-05",
    "titulo": "EMPREGADO(A) DOMÉSTICO(A) / DIARISTA"
  },
  {
    "codigo": "0101-05",
    "titulo": "OFICIAL GENERAL DA AERONÁUTICA"
  },
  {
    "codigo": "0101-10",
    "titulo": "OFICIAL GENERAL DO EXÉRCITO"
  },
  {
    "codigo": "0101-15",
    "titulo": "OFICIAL GENERAL DA MARINHA"
  },
  {
    "codigo": "0102-05",
    "titulo": "OFICIAL DA AERONÁUTICA"
  },
  {
    "codigo": "0102-10",
    "titulo": "OFICIAL DO EXÉRCITO"
  },
  {
    "codigo": "0102-15",
    "titulo": "OFICIAL DA MARINHA"
  },
  {
    "codigo": "0103-05",
    "titulo": "PRAÇA DA AERONÁUTICA"
  },
  {
    "codigo": "0103-10",
    "titulo": "PRAÇA DO EXÉRCITO"
  },
  {
    "codigo": "0103-15",
    "titulo": "PRAÇA DA MARINHA"
  },
  {
    "codigo": "0201-05",
    "titulo": "CORONEL DA POLÍCIA MILITAR"
  },
  {
    "codigo": "0201-10",
    "titulo": "TENENTE-CORONEL DA POLÍCIA MILITAR"
  },
  {
    "codigo": "0201-15",
    "titulo": "MAJOR DA POLÍCIA MILITAR"
  },
  {
    "codigo": "0202-05",
    "titulo": "CAPITÃO DA POLÍCIA MILITAR"
  },
  {
    "codigo": "0203-05",
    "titulo": "PRIMEIRO TENENTE DE POLÍCIA MILITAR"
  },
  {
    "codigo": "0203-10",
    "titulo": "SEGUNDO TENENTE DE POLÍCIA MILITAR"
  },
  {
    "codigo": "0211-05",
    "titulo": "SUBTENENTE DA POLICIA MILITAR"
  },
  {
    "codigo": "0211-10",
    "titulo": "SARGENTO DA POLICIA MILITAR"
  },
  {
    "codigo": "0212-05",
    "titulo": "CABO DA POLÍCIA MILITAR"
  },
  {
    "codigo": "0212-10",
    "titulo": "SOLDADO DA POLÍCIA MILITAR"
  },
  {
    "codigo": "0301-05",
    "titulo": "CORONEL BOMBEIRO MILITAR"
  },
  {
    "codigo": "0301-10",
    "titulo": "MAJOR BOMBEIRO MILITAR"
  },
  {
    "codigo": "0301-15",
    "titulo": "TENENTE-CORONEL BOMBEIRO MILITAR"
  },
  {
    "codigo": "0302-05",
    "titulo": "CAPITÃO BOMBEIRO MILITAR"
  },
  {
    "codigo": "0303-05",
    "titulo": "TENENTE DO CORPO DE BOMBEIROS MILITAR"
  },
  {
    "codigo": "0311-05",
    "titulo": "SUBTENENTE BOMBEIRO MILITAR"
  },
  {
    "codigo": "0311-10",
    "titulo": "SARGENTO BOMBEIRO MILITAR"
  },
  {
    "codigo": "0312-05",
    "titulo": "CABO BOMBEIRO MILITAR"
  },
  {
    "codigo": "0312-10",
    "titulo": "SOLDADO BOMBEIRO MILITAR"
  },
  {
    "codigo": "1111-05",
    "titulo": "SENADOR"
  },
  {
    "codigo": "1111-10",
    "titulo": "DEPUTADO FEDERAL"
  },
  {
    "codigo": "1111-15",
    "titulo": "DEPUTADO ESTADUAL E DISTRITAL"
  },
  {
    "codigo": "1111-20",
    "titulo": "VEREADOR"
  },
  {
    "codigo": "1112-05",
    "titulo": "PRESIDENTE DA REPÚBLICA"
  },
  {
    "codigo": "1112-10",
    "titulo": "VICE-PRESIDENTE DA REPÚBLICA"
  },
  {
    "codigo": "1112-15",
    "titulo": "MINISTRO DE ESTADO"
  },
  {
    "codigo": "1112-20",
    "titulo": "SECRETÁRIO - EXECUTIVO"
  },
  {
    "codigo": "1112-25",
    "titulo": "MEMBRO SUPERIOR DO PODER EXECUTIVO"
  },
  {
    "codigo": "1112-30",
    "titulo": "GOVERNADOR DE ESTADO"
  },
  {
    "codigo": "1112-35",
    "titulo": "GOVERNADOR DO DISTRITO FEDERAL"
  },
  {
    "codigo": "1112-40",
    "titulo": "VICE-GOVERNADOR DE ESTADO"
  },
  {
    "codigo": "1112-45",
    "titulo": "VICE-GOVERNADOR DO DISTRITO FEDERAL"
  },
  {
    "codigo": "1112-50",
    "titulo": "PREFEITO"
  },
  {
    "codigo": "1112-55",
    "titulo": "VICE-PREFEITO"
  },
  {
    "codigo": "1113-05",
    "titulo": "MINISTRO DO SUPREMO TRIBUNAL FEDERAL"
  },
  {
    "codigo": "1113-10",
    "titulo": "MINISTRO DO SUPERIOR TRIBUNAL DE JUSTIÇA"
  },
  {
    "codigo": "1113-15",
    "titulo": "MINISTRO DO SUPERIOR TRIBUNAL MILITAR"
  },
  {
    "codigo": "1113-20",
    "titulo": "MINISTRO DO SUPERIOR TRIBUNAL DO TRABALHO"
  },
  {
    "codigo": "1113-25",
    "titulo": "JUIZ DE DIREITO"
  },
  {
    "codigo": "1113-30",
    "titulo": "JUIZ FEDERAL"
  },
  {
    "codigo": "1113-35",
    "titulo": "JUIZ AUDITOR FEDERAL - JUSTIÇA MILITAR"
  },
  {
    "codigo": "1113-40",
    "titulo": "JUIZ AUDITOR ESTADUAL - JUSTIÇA MILITAR"
  },
  {
    "codigo": "1113-45",
    "titulo": "JUIZ DO TRABALHO"
  },
  {
    "codigo": "1114-05",
    "titulo": "DIRIGENTE DO SERVIÇO PÚBLICO FEDERAL"
  },
  {
    "codigo": "1114-10",
    "titulo": "DIRIGENTE DO SERVIÇO PÚBLICO ESTADUAL E DISTRITAL"
  },
  {
    "codigo": "1114-15",
    "titulo": "DIRIGENTE DO SERVIÇO PÚBLICO MUNICIPAL"
  },
  {
    "codigo": "1115-05",
    "titulo": "ESPECIALISTA DE POLÍTICAS PÚBLICAS E GESTÃO GOVERNAMENTAL - EPPGG"
  },
  {
    "codigo": "1115-10",
    "titulo": "ANALISTA DE PLANEJAMENTO E ORÇAMENTO - APO"
  },
  {
    "codigo": "1130-05",
    "titulo": "CACIQUE"
  },
  {
    "codigo": "1130-10",
    "titulo": "LÍDER DE COMUNIDADE CAIÇARA"
  },
  {
    "codigo": "1130-15",
    "titulo": "MEMBRO DE LIDERANÇA QUILOMBOLA"
  },
  {
    "codigo": "1141-05",
    "titulo": "DIRIGENTE DE PARTIDO POLÍTICO"
  },
  {
    "codigo": "1142-05",
    "titulo": "DIRIGENTES DE ENTIDADES DE TRABALHADORES"
  },
  {
    "codigo": "1142-10",
    "titulo": "DIRIGENTES DE ENTIDADES PATRONAIS"
  },
  {
    "codigo": "1143-05",
    "titulo": "DIRIGENTE E ADMINISTRADOR DE ORGANIZAÇÃO RELIGIOSA"
  },
  {
    "codigo": "1144-05",
    "titulo": "DIRIGENTE E ADMINISTRADOR DE ORGANIZAÇÃO DA SOCIEDADE CIVIL SEM FINS LUCRATIVOS"
  },
  {
    "codigo": "1210-05",
    "titulo": "DIRETOR DE PLANEJAMENTO ESTRATÉGICO"
  },
  {
    "codigo": "1210-10",
    "titulo": "DIRETOR GERAL DE EMPRESA E ORGANIZAÇÕES (EXCETO DE INTERESSE PÚBLICO)"
  },
  {
    "codigo": "1221-05",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES EM EMPRESA AGROPECUÁRIA"
  },
  {
    "codigo": "1221-10",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES EM EMPRESA AQÜÍCOLA"
  },
  {
    "codigo": "1221-15",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES EM EMPRESA FLORESTAL"
  },
  {
    "codigo": "1221-20",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES EM EMPRESA PESQUEIRA"
  },
  {
    "codigo": "1222-05",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES DA INDÚSTRIA DE TRANSFORMAÇÃO, EXTRAÇÃO MINERAL E UTILIDADES"
  },
  {
    "codigo": "1223-05",
    "titulo": "DIRETOR DE OPERAÇÕES DE OBRAS PÚBLICA E CIVIL"
  },
  {
    "codigo": "1224-05",
    "titulo": "DIRETOR DE OPERAÇÕES COMERCIAIS (COMÉRCIO ATACADISTA E VAREJISTA)"
  },
  {
    "codigo": "1225-05",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES DE ALIMENTAÇÃO"
  },
  {
    "codigo": "1225-10",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES DE HOTEL"
  },
  {
    "codigo": "1225-15",
    "titulo": "DIRETOR DE PRODUÇÃO E OPERAÇÕES DE TURISMO"
  },
  {
    "codigo": "1226-05",
    "titulo": "DIRETOR DE OPERAÇÕES DE CORREIOS"
  },
  {
    "codigo": "1226-10",
    "titulo": "DIRETOR DE OPERAÇÕES DE SERVIÇOS DE ARMAZENAMENTO"
  },
  {
    "codigo": "1226-15",
    "titulo": "DIRETOR DE OPERAÇÕES DE SERVIÇOS DE TELECOMUNICAÇÕES"
  },
  {
    "codigo": "1226-20",
    "titulo": "DIRETOR DE OPERAÇÕES DE SERVIÇOS DE TRANSPORTE"
  },
  {
    "codigo": "1227-05",
    "titulo": "DIRETOR COMERCIAL EM OPERAÇÕES DE INTERMEDIAÇÃO FINANCEIRA"
  },
  {
    "codigo": "1227-10",
    "titulo": "DIRETOR DE PRODUTOS BANCÁRIOS"
  },
  {
    "codigo": "1227-15",
    "titulo": "DIRETOR DE CRÉDITO RURAL"
  },
  {
    "codigo": "1227-20",
    "titulo": "DIRETOR DE CÂMBIO E COMÉRCIO EXTERIOR"
  },
  {
    "codigo": "1227-25",
    "titulo": "DIRETOR DE COMPLIANCE"
  },
  {
    "codigo": "1227-30",
    "titulo": "DIRETOR DE CRÉDITO (EXCETO CRÉDITO IMOBILIÁRIO)"
  },
  {
    "codigo": "1227-35",
    "titulo": "DIRETOR DE CRÉDITO IMOBILIÁRIO"
  },
  {
    "codigo": "1227-40",
    "titulo": "DIRETOR DE LEASING"
  },
  {
    "codigo": "1227-45",
    "titulo": "DIRETOR DE MERCADO DE CAPITAIS"
  },
  {
    "codigo": "1227-50",
    "titulo": "DIRETOR DE RECUPERAÇÃO DE CRÉDITOS EM OPERAÇÕES DE INTERMEDIAÇÃO FINANCEIRA"
  },
  {
    "codigo": "1227-55",
    "titulo": "DIRETOR DE RISCOS DE MERCADO"
  },
  {
    "codigo": "1231-05",
    "titulo": "DIRETOR ADMINISTRATIVO"
  },
  {
    "codigo": "1231-10",
    "titulo": "DIRETOR ADMINISTRATIVO E FINANCEIRO"
  },
  {
    "codigo": "1231-15",
    "titulo": "DIRETOR FINANCEIRO"
  },
  {
    "codigo": "1232-05",
    "titulo": "DIRETOR DE RECURSOS HUMANOS"
  },
  {
    "codigo": "1232-10",
    "titulo": "DIRETOR DE RELAÇÕES DE TRABALHO"
  },
  {
    "codigo": "1233-05",
    "titulo": "DIRETOR COMERCIAL"
  },
  {
    "codigo": "1233-10",
    "titulo": "DIRETOR DE MARKETING"
  },
  {
    "codigo": "1234-05",
    "titulo": "DIRETOR DE SUPRIMENTOS"
  },
  {
    "codigo": "1234-10",
    "titulo": "DIRETOR DE SUPRIMENTOS NO SERVIÇO PÚBLICO"
  },
  {
    "codigo": "1236-05",
    "titulo": "DIRETOR DE SERVIÇOS DE INFORMÁTICA"
  },
  {
    "codigo": "1237-05",
    "titulo": "DIRETOR DE PESQUISA E DESENVOLVIMENTO (P&D)"
  },
  {
    "codigo": "1238-05",
    "titulo": "DIRETOR DE MANUTENÇÃO"
  },
  {
    "codigo": "1311-05",
    "titulo": "DIRETOR DE SERVIÇOS CULTURAIS"
  },
  {
    "codigo": "1311-10",
    "titulo": "DIRETOR DE SERVIÇOS SOCIAIS"
  },
  {
    "codigo": "1311-15",
    "titulo": "GERENTE DE SERVIÇOS CULTURAIS"
  },
  {
    "codigo": "1311-20",
    "titulo": "GERENTE DE SERVIÇOS SOCIAIS"
  },
  {
    "codigo": "1312-05",
    "titulo": "DIRETOR DE SERVIÇOS DE SAÚDE"
  },
  {
    "codigo": "1312-10",
    "titulo": "GERENTE DE SERVIÇOS DE SAÚDE"
  },
  {
    "codigo": "1313-05",
    "titulo": "DIRETOR DE INSTITUIÇÃO EDUCACIONAL DA ÁREA PRIVADA"
  },
  {
    "codigo": "1313-10",
    "titulo": "DIRETOR DE INSTITUIÇÃO EDUCACIONAL PÚBLICA"
  },
  {
    "codigo": "1313-15",
    "titulo": "GERENTE DE INSTITUIÇÃO EDUCACIONAL DA ÁREA PRIVADA"
  },
  {
    "codigo": "1313-20",
    "titulo": "GERENTE DE SERVIÇOS EDUCACIONAIS DA ÁREA PÚBLICA"
  },
  {
    "codigo": "1411-05",
    "titulo": "GERENTE DE PRODUÇÃO E OPERAÇÕES AQÜÍCOLAS"
  },
  {
    "codigo": "1411-10",
    "titulo": "GERENTE DE PRODUÇÃO E OPERAÇÕES FLORESTAIS"
  },
  {
    "codigo": "1411-15",
    "titulo": "GERENTE DE PRODUÇÃO E OPERAÇÕES AGROPECUÁRIAS"
  },
  {
    "codigo": "1411-20",
    "titulo": "GERENTE DE PRODUÇÃO E OPERAÇÕES PESQUEIRAS"
  },
  {
    "codigo": "1412-05",
    "titulo": "GERENTE DE PRODUÇÃO E OPERAÇÕES"
  },
  {
    "codigo": "1413-05",
    "titulo": "GERENTE DE PRODUÇÃO E OPERAÇÕES DA CONSTRUÇÃO CIVIL E OBRAS PÚBLICAS"
  },
  {
    "codigo": "1414-05",
    "titulo": "COMERCIANTE ATACADISTA"
  },
  {
    "codigo": "1414-10",
    "titulo": "COMERCIANTE VAREJISTA"
  },
  {
    "codigo": "1414-15",
    "titulo": "GERENTE DE LOJA E SUPERMERCADO"
  },
  {
    "codigo": "1414-20",
    "titulo": "GERENTE DE OPERAÇÕES DE SERVIÇOS DE ASSISTÊNCIA TÉCNICA"
  },
  {
    "codigo": "1415-05",
    "titulo": "GERENTE DE HOTEL"
  },
  {
    "codigo": "1415-10",
    "titulo": "GERENTE DE RESTAURANTE"
  },
  {
    "codigo": "1415-15",
    "titulo": "GERENTE DE BAR"
  },
  {
    "codigo": "1415-20",
    "titulo": "GERENTE DE PENSÃO"
  },
  {
    "codigo": "1416-05",
    "titulo": "GERENTE DE OPERAÇÕES DE TRANSPORTES"
  },
  {
    "codigo": "1416-10",
    "titulo": "GERENTE DE OPERAÇÕES DE CORREIOS E TELECOMUNICAÇÕES"
  },
  {
    "codigo": "1416-15",
    "titulo": "GERENTE DE LOGÍSTICA (ARMAZENAGEM E DISTRIBUIÇÃO)"
  },
  {
    "codigo": "1417-05",
    "titulo": "GERENTE DE PRODUTOS BANCÁRIOS"
  },
  {
    "codigo": "1417-10",
    "titulo": "GERENTE DE AGÊNCIA"
  },
  {
    "codigo": "1417-15",
    "titulo": "GERENTE DE CÂMBIO E COMÉRCIO EXTERIOR"
  },
  {
    "codigo": "1417-20",
    "titulo": "GERENTE DE CRÉDITO E COBRANÇA"
  },
  {
    "codigo": "1417-25",
    "titulo": "GERENTE DE CRÉDITO IMOBILIÁRIO"
  },
  {
    "codigo": "1417-30",
    "titulo": "GERENTE DE CRÉDITO RURAL"
  },
  {
    "codigo": "1417-35",
    "titulo": "GERENTE DE RECUPERAÇÃO DE CRÉDITO"
  },
  {
    "codigo": "1421-05",
    "titulo": "GERENTE ADMINISTRATIVO"
  },
  {
    "codigo": "1421-10",
    "titulo": "GERENTE DE RISCOS"
  },
  {
    "codigo": "1421-15",
    "titulo": "GERENTE FINANCEIRO"
  },
  {
    "codigo": "1422-05",
    "titulo": "GERENTE DE RECURSOS HUMANOS"
  },
  {
    "codigo": "1422-10",
    "titulo": "GERENTE DE DEPARTAMENTO PESSOAL"
  },
  {
    "codigo": "1423-05",
    "titulo": "GERENTE COMERCIAL"
  },
  {
    "codigo": "1423-10",
    "titulo": "GERENTE DE COMUNICAÇÃO"
  },
  {
    "codigo": "1423-15",
    "titulo": "GERENTE DE MARKETING"
  },
  {
    "codigo": "1423-20",
    "titulo": "GERENTE DE VENDAS"
  },
  {
    "codigo": "1424-05",
    "titulo": "GERENTE DE COMPRAS"
  },
  {
    "codigo": "1424-10",
    "titulo": "GERENTE DE SUPRIMENTOS"
  },
  {
    "codigo": "1424-15",
    "titulo": "GERENTE DE ALMOXARIFADO"
  },
  {
    "codigo": "1425-05",
    "titulo": "GERENTE DE REDE"
  },
  {
    "codigo": "1425-10",
    "titulo": "GERENTE DE DESENVOLVIMENTO DE SISTEMAS"
  },
  {
    "codigo": "1425-15",
    "titulo": "GERENTE DE PRODUÇÃO DE TECNOLOGIA DA INFORMAÇÃO"
  },
  {
    "codigo": "1425-20",
    "titulo": "GERENTE DE PROJETOS DE TECNOLOGIA DA INFORMAÇÃO"
  },
  {
    "codigo": "1425-25",
    "titulo": "GERENTE DE SEGURANÇA DE TECNOLOGIA DA INFORMAÇÃO"
  },
  {
    "codigo": "1425-30",
    "titulo": "GERENTE DE SUPORTE TÉCNICO DE TECNOLOGIA DA INFORMAÇÃO"
  },
  {
    "codigo": "1426-05",
    "titulo": "GERENTE DE PESQUISA E DESENVOLVIMENTO (P&D)"
  },
  {
    "codigo": "1426-10",
    "titulo": "ESPECIALISTA EM DESENVOLVIMENTO DE CIGARROS"
  },
  {
    "codigo": "1427-05",
    "titulo": "GERENTE DE PROJETOS E SERVIÇOS DE MANUTENÇÃO"
  },
  {
    "codigo": "2011-05",
    "titulo": "BIOENGENHEIRO"
  },
  {
    "codigo": "2011-10",
    "titulo": "BIOTECNOLOGISTA"
  },
  {
    "codigo": "2011-15",
    "titulo": "GENETICISTA"
  },
  {
    "codigo": "2012-05",
    "titulo": "PESQUISADOR EM METROLOGIA"
  },
  {
    "codigo": "2012-10",
    "titulo": "ESPECIALISTA EM CALIBRAÇÕES METROLÓGICAS"
  },
  {
    "codigo": "2012-15",
    "titulo": "ESPECIALISTA EM ENSAIOS METROLÓGICOS"
  },
  {
    "codigo": "2012-20",
    "titulo": "ESPECIALISTA EM INSTRUMENTAÇÃO METROLÓGICA"
  },
  {
    "codigo": "2012-25",
    "titulo": "ESPECIALISTA EM MATERIAIS DE REFERÊNCIA METROLÓGICA"
  },
  {
    "codigo": "2021-05",
    "titulo": "ENGENHEIRO MECATRÔNICO"
  },
  {
    "codigo": "2030-05",
    "titulo": "PESQUISADOR EM BIOLOGIA AMBIENTAL"
  },
  {
    "codigo": "2030-10",
    "titulo": "PESQUISADOR EM BIOLOGIA ANIMAL"
  },
  {
    "codigo": "2030-15",
    "titulo": "PESQUISADOR EM BIOLOGIA DE MICROORGANISMOS E PARASITAS"
  },
  {
    "codigo": "2030-20",
    "titulo": "PESQUISADOR EM BIOLOGIA HUMANA"
  },
  {
    "codigo": "2030-25",
    "titulo": "PESQUISADOR EM BIOLOGIA VEGETAL"
  },
  {
    "codigo": "2031-05",
    "titulo": "PESQUISADOR EM CIÊNCIAS DA COMPUTAÇÃO E INFORMÁTICA"
  },
  {
    "codigo": "2031-10",
    "titulo": "PESQUISADOR EM CIÊNCIAS DA TERRA E MEIO AMBIENTE"
  },
  {
    "codigo": "2031-15",
    "titulo": "PESQUISADOR EM FÍSICA"
  },
  {
    "codigo": "2031-20",
    "titulo": "PESQUISADOR EM MATEMÁTICA"
  },
  {
    "codigo": "2031-25",
    "titulo": "PESQUISADOR EM QUÍMICA"
  },
  {
    "codigo": "2032-05",
    "titulo": "PESQUISADOR DE ENGENHARIA CIVIL"
  },
  {
    "codigo": "2032-10",
    "titulo": "PESQUISADOR DE ENGENHARIA E TECNOLOGIA (OUTRAS ÁREAS DA ENGENHARIA)"
  },
  {
    "codigo": "2032-15",
    "titulo": "PESQUISADOR DE ENGENHARIA ELÉTRICA E ELETRÔNICA"
  },
  {
    "codigo": "2032-20",
    "titulo": "PESQUISADOR DE ENGENHARIA MECÂNICA"
  },
  {
    "codigo": "2032-25",
    "titulo": "PESQUISADOR DE ENGENHARIA METALÚRGICA, DE MINAS E DE MATERIAIS"
  },
  {
    "codigo": "2032-30",
    "titulo": "PESQUISADOR DE ENGENHARIA QUÍMICA"
  },
  {
    "codigo": "2033-05",
    "titulo": "PESQUISADOR DE CLÍNICA MÉDICA"
  },
  {
    "codigo": "2033-10",
    "titulo": "PESQUISADOR DE MEDICINA BÁSICA"
  },
  {
    "codigo": "2033-15",
    "titulo": "PESQUISADOR EM MEDICINA VETERINÁRIA"
  },
  {
    "codigo": "2033-20",
    "titulo": "PESQUISADOR EM SAÚDE COLETIVA"
  },
  {
    "codigo": "2034-05",
    "titulo": "PESQUISADOR EM CIÊNCIAS AGRONÔMICAS"
  },
  {
    "codigo": "2034-10",
    "titulo": "PESQUISADOR EM CIÊNCIAS DA PESCA E AQÜICULTURA"
  },
  {
    "codigo": "2034-15",
    "titulo": "PESQUISADOR EM CIÊNCIAS DA ZOOTECNIA"
  },
  {
    "codigo": "2034-20",
    "titulo": "PESQUISADOR EM CIÊNCIAS FLORESTAIS"
  },
  {
    "codigo": "2035-05",
    "titulo": "PESQUISADOR EM CIÊNCIAS SOCIAIS E HUMANAS"
  },
  {
    "codigo": "2035-10",
    "titulo": "PESQUISADOR EM ECONOMIA"
  },
  {
    "codigo": "2035-15",
    "titulo": "PESQUISADOR EM CIÊNCIAS DA EDUCAÇÃO"
  },
  {
    "codigo": "2035-20",
    "titulo": "PESQUISADOR EM HISTÓRIA"
  },
  {
    "codigo": "2035-25",
    "titulo": "PESQUISADOR EM PSICOLOGIA"
  },
  {
    "codigo": "2041-05",
    "titulo": "PERITO CRIMINAL"
  },
  {
    "codigo": "2111-05",
    "titulo": "ATUÁRIO"
  },
  {
    "codigo": "2111-10",
    "titulo": "ESPECIALISTA EM PESQUISA OPERACIONAL"
  },
  {
    "codigo": "2111-15",
    "titulo": "MATEMÁTICO"
  },
  {
    "codigo": "2111-20",
    "titulo": "MATEMÁTICO APLICADO"
  },
  {
    "codigo": "2112-05",
    "titulo": "ESTATÍSTICO"
  },
  {
    "codigo": "2112-10",
    "titulo": "ESTATÍSTICO (ESTATÍSTICA APLICADA)"
  },
  {
    "codigo": "2112-15",
    "titulo": "ESTATÍSTICO TEÓRICO"
  },
  {
    "codigo": "2122-05",
    "titulo": "ENGENHEIRO DE APLICATIVOS EM COMPUTAÇÃO"
  },
  {
    "codigo": "2122-10",
    "titulo": "ENGENHEIRO DE EQUIPAMENTOS EM COMPUTAÇÃO"
  },
  {
    "codigo": "2122-15",
    "titulo": "ENGENHEIROS DE SISTEMAS OPERACIONAIS EM COMPUTAÇÃO"
  },
  {
    "codigo": "2123-05",
    "titulo": "ADMINISTRADOR DE BANCO DE DADOS"
  },
  {
    "codigo": "2123-10",
    "titulo": "ADMINISTRADOR DE REDES"
  },
  {
    "codigo": "2123-15",
    "titulo": "ADMINISTRADOR DE SISTEMAS OPERACIONAIS"
  },
  {
    "codigo": "2124-05",
    "titulo": "ANALISTA DE DESENVOLVIMENTO DE SISTEMAS"
  },
  {
    "codigo": "2124-10",
    "titulo": "ANALISTA DE REDES E DE COMUNICAÇÃO DE DADOS"
  },
  {
    "codigo": "2124-15",
    "titulo": "ANALISTA DE SISTEMAS DE AUTOMAÇÃO"
  },
  {
    "codigo": "2124-20",
    "titulo": "ANALISTA DE SUPORTE COMPUTACIONAL"
  },
  {
    "codigo": "2131-05",
    "titulo": "FÍSICO"
  },
  {
    "codigo": "2131-10",
    "titulo": "FÍSICO (ACÚSTICA)"
  },
  {
    "codigo": "2131-15",
    "titulo": "FÍSICO (ATÔMICA E MOLECULAR)"
  },
  {
    "codigo": "2131-20",
    "titulo": "FÍSICO (COSMOLOGIA)"
  },
  {
    "codigo": "2131-25",
    "titulo": "FÍSICO (ESTATÍSTICA E MATEMÁTICA)"
  },
  {
    "codigo": "2131-30",
    "titulo": "FÍSICO (FLUIDOS)"
  },
  {
    "codigo": "2131-35",
    "titulo": "FÍSICO (INSTRUMENTAÇÃO)"
  },
  {
    "codigo": "2131-40",
    "titulo": "FÍSICO (MATÉRIA CONDENSADA)"
  },
  {
    "codigo": "2131-45",
    "titulo": "FÍSICO (MATERIAIS)"
  },
  {
    "codigo": "2131-50",
    "titulo": "FÍSICO (MEDICINA)"
  },
  {
    "codigo": "2131-55",
    "titulo": "FÍSICO (NUCLEAR E REATORES)"
  },
  {
    "codigo": "2131-60",
    "titulo": "FÍSICO (ÓPTICA)"
  },
  {
    "codigo": "2131-65",
    "titulo": "FÍSICO (PARTÍCULAS E CAMPOS)"
  },
  {
    "codigo": "2131-70",
    "titulo": "FÍSICO (PLASMA)"
  },
  {
    "codigo": "2131-75",
    "titulo": "FÍSICO (TÉRMICA)"
  },
  {
    "codigo": "2132-05",
    "titulo": "QUÍMICO"
  },
  {
    "codigo": "2132-10",
    "titulo": "QUÍMICO INDUSTRIAL"
  },
  {
    "codigo": "2133-05",
    "titulo": "ASTRÔNOMO"
  },
  {
    "codigo": "2133-10",
    "titulo": "GEOFÍSICO ESPACIAL"
  },
  {
    "codigo": "2133-15",
    "titulo": "METEOROLOGISTA"
  },
  {
    "codigo": "2134-05",
    "titulo": "GEÓLOGO"
  },
  {
    "codigo": "2134-10",
    "titulo": "GEÓLOGO DE ENGENHARIA"
  },
  {
    "codigo": "2134-15",
    "titulo": "GEOFÍSICO"
  },
  {
    "codigo": "2134-20",
    "titulo": "GEOQUÍMICO"
  },
  {
    "codigo": "2134-25",
    "titulo": "HIDROGEÓLOGO"
  },
  {
    "codigo": "2134-30",
    "titulo": "PALEONTÓLOGO"
  },
  {
    "codigo": "2134-35",
    "titulo": "PETRÓGRAFO"
  },
  {
    "codigo": "2134-40",
    "titulo": "OCEANÓGRAFO"
  },
  {
    "codigo": "2141-05",
    "titulo": "ARQUITETO DE EDIFICAÇÕES"
  },
  {
    "codigo": "2141-10",
    "titulo": "ARQUITETO DE INTERIORES"
  },
  {
    "codigo": "2141-15",
    "titulo": "ARQUITETO DE PATRIMÔNIO"
  },
  {
    "codigo": "2141-20",
    "titulo": "ARQUITETO PAISAGISTA"
  },
  {
    "codigo": "2141-25",
    "titulo": "ARQUITETO URBANISTA"
  },
  {
    "codigo": "2141-30",
    "titulo": "URBANISTA"
  },
  {
    "codigo": "2142-05",
    "titulo": "ENGENHEIRO CIVIL"
  },
  {
    "codigo": "2142-10",
    "titulo": "ENGENHEIRO CIVIL (AEROPORTOS)"
  },
  {
    "codigo": "2142-15",
    "titulo": "ENGENHEIRO CIVIL (EDIFICAÇÕES)"
  },
  {
    "codigo": "2142-20",
    "titulo": "ENGENHEIRO CIVIL (ESTRUTURAS METÁLICAS)"
  },
  {
    "codigo": "2142-25",
    "titulo": "ENGENHEIRO CIVIL (FERROVIAS E METROVIAS)"
  },
  {
    "codigo": "2142-30",
    "titulo": "ENGENHEIRO CIVIL (GEOTÉCNIA)"
  },
  {
    "codigo": "2142-35",
    "titulo": "ENGENHEIRO CIVIL (HIDROLOGIA)"
  },
  {
    "codigo": "2142-40",
    "titulo": "ENGENHEIRO CIVIL (HIDRÁULICA)"
  },
  {
    "codigo": "2142-45",
    "titulo": "ENGENHEIRO CIVIL (PONTES E VIADUTOS)"
  },
  {
    "codigo": "2142-50",
    "titulo": "ENGENHEIRO CIVIL (PORTOS E VIAS NAVEGÁVEIS)"
  },
  {
    "codigo": "2142-55",
    "titulo": "ENGENHEIRO CIVIL (RODOVIAS)"
  },
  {
    "codigo": "2142-60",
    "titulo": "ENGENHEIRO CIVIL (SANEAMENTO)"
  },
  {
    "codigo": "2142-65",
    "titulo": "ENGENHEIRO CIVIL (TÚNEIS)"
  },
  {
    "codigo": "2142-70",
    "titulo": "ENGENHEIRO CIVIL (TRANSPORTES E TRÂNSITO)"
  },
  {
    "codigo": "2142-75",
    "titulo": "ENGENHEIRO AMBIENTAL"
  },
  {
    "codigo": "2143-05",
    "titulo": "ENGENHEIRO ELETRICISTA"
  },
  {
    "codigo": "2143-10",
    "titulo": "ENGENHEIRO ELETRÔNICO"
  },
  {
    "codigo": "2143-15",
    "titulo": "ENGENHEIRO ELETRICISTA DE MANUTENÇÃO"
  },
  {
    "codigo": "2143-20",
    "titulo": "ENGENHEIRO ELETRICISTA DE PROJETOS"
  },
  {
    "codigo": "2143-25",
    "titulo": "ENGENHEIRO ELETRÔNICO DE MANUTENÇÃO"
  },
  {
    "codigo": "2143-30",
    "titulo": "ENGENHEIRO ELETRÔNICO DE PROJETOS"
  },
  {
    "codigo": "2143-35",
    "titulo": "ENGENHEIRO DE MANUTENÇÃO DE TELECOMUNICAÇÕES"
  },
  {
    "codigo": "2143-40",
    "titulo": "ENGENHEIRO DE TELECOMUNICAÇÕES"
  },
  {
    "codigo": "2143-45",
    "titulo": "ENGENHEIRO PROJETISTA DE TELECOMUNICAÇÕES"
  },
  {
    "codigo": "2143-50",
    "titulo": "ENGENHEIRO DE REDES DE COMUNICAÇÃO"
  },
  {
    "codigo": "2143-55",
    "titulo": "ENGENHEIRO DE CONTROLE E AUTOMAÇÃO"
  },
  {
    "codigo": "2143-60",
    "titulo": "TECNÓLOGO EM ELETRICIDADE"
  },
  {
    "codigo": "2143-65",
    "titulo": "TECNÓLOGO EM ELETRÔNICA"
  },
  {
    "codigo": "2144-05",
    "titulo": "ENGENHEIRO MECÂNICO"
  },
  {
    "codigo": "2144-10",
    "titulo": "ENGENHEIRO MECÂNICO AUTOMOTIVO"
  },
  {
    "codigo": "2144-15",
    "titulo": "ENGENHEIRO MECÂNICO (ENERGIA NUCLEAR)"
  },
  {
    "codigo": "2144-20",
    "titulo": "ENGENHEIRO MECÂNICO INDUSTRIAL"
  },
  {
    "codigo": "2144-25",
    "titulo": "ENGENHEIRO AERONÁUTICO"
  },
  {
    "codigo": "2144-30",
    "titulo": "ENGENHEIRO NAVAL"
  },
  {
    "codigo": "2145-05",
    "titulo": "ENGENHEIRO QUÍMICO"
  },
  {
    "codigo": "2145-10",
    "titulo": "ENGENHEIRO QUÍMICO (INDÚSTRIA QUÍMICA)"
  },
  {
    "codigo": "2145-15",
    "titulo": "ENGENHEIRO QUÍMICO (MINERAÇÃO, METALURGIA, SIDERURGIA, CIMENTEIRA E CERÂMICA)"
  },
  {
    "codigo": "2145-20",
    "titulo": "ENGENHEIRO QUÍMICO (PAPEL E CELULOSE)"
  },
  {
    "codigo": "2145-25",
    "titulo": "ENGENHEIRO QUÍMICO (PETRÓLEO E BORRACHA)"
  },
  {
    "codigo": "2145-30",
    "titulo": "ENGENHEIRO QUÍMICO (UTILIDADES E MEIO AMBIENTE)"
  },
  {
    "codigo": "2146-05",
    "titulo": "ENGENHEIRO DE MATERIAIS"
  },
  {
    "codigo": "2146-10",
    "titulo": "ENGENHEIRO METALURGISTA"
  },
  {
    "codigo": "2147-05",
    "titulo": "ENGENHEIRO DE MINAS"
  },
  {
    "codigo": "2147-10",
    "titulo": "ENGENHEIRO DE MINAS (BENEFICIAMENTO)"
  },
  {
    "codigo": "2147-15",
    "titulo": "ENGENHEIRO DE MINAS (LAVRA A CÉU ABERTO)"
  },
  {
    "codigo": "2147-20",
    "titulo": "ENGENHEIRO DE MINAS (LAVRA SUBTERRÂNEA)"
  },
  {
    "codigo": "2147-25",
    "titulo": "ENGENHEIRO DE MINAS (PESQUISA MINERAL)"
  },
  {
    "codigo": "2147-30",
    "titulo": "ENGENHEIRO DE MINAS (PLANEJAMENTO)"
  },
  {
    "codigo": "2147-35",
    "titulo": "ENGENHEIRO DE MINAS (PROCESSO)"
  },
  {
    "codigo": "2147-40",
    "titulo": "ENGENHEIRO DE MINAS (PROJETO)"
  },
  {
    "codigo": "2148-05",
    "titulo": "ENGENHEIRO AGRIMENSOR"
  },
  {
    "codigo": "2148-10",
    "titulo": "ENGENHEIRO CARTÓGRAFO"
  },
  {
    "codigo": "2149-05",
    "titulo": "ENGENHEIRO DE PRODUÇÃO"
  },
  {
    "codigo": "2149-10",
    "titulo": "ENGENHEIRO DE CONTROLE DE QUALIDADE"
  },
  {
    "codigo": "2149-15",
    "titulo": "ENGENHEIRO DE SEGURANÇA DO TRABALHO"
  },
  {
    "codigo": "2149-20",
    "titulo": "ENGENHEIRO DE RISCOS"
  },
  {
    "codigo": "2149-25",
    "titulo": "ENGENHEIRO DE TEMPOS E MOVIMENTOS"
  },
  {
    "codigo": "2151-05",
    "titulo": "AGENTE DE MANOBRA E DOCAGEM"
  },
  {
    "codigo": "2151-10",
    "titulo": "CAPITÃO DE MANOBRA DA MARINHA MERCANTE"
  },
  {
    "codigo": "2151-15",
    "titulo": "COMANDANTE DA MARINHA MERCANTE"
  },
  {
    "codigo": "2151-20",
    "titulo": "COORDENADOR DE OPERAÇÕES DE COMBATE À POLUIÇÃO NO MEIO AQUAVIÁRIO"
  },
  {
    "codigo": "2151-25",
    "titulo": "IMEDIATO DA MARINHA MERCANTE"
  },
  {
    "codigo": "2151-30",
    "titulo": "INSPETOR DE TERMINAL"
  },
  {
    "codigo": "2151-35",
    "titulo": "INSPETOR NAVAL"
  },
  {
    "codigo": "2151-40",
    "titulo": "OFICIAL DE QUARTO DE NAVEGAÇÃO DA MARINHA MERCANTE"
  },
  {
    "codigo": "2151-45",
    "titulo": "PRÁTICO DE PORTOS DA MARINHA MERCANTE"
  },
  {
    "codigo": "2151-50",
    "titulo": "VISTORIADOR NAVAL"
  },
  {
    "codigo": "2152-05",
    "titulo": "OFICIAL SUPERIOR DE MÁQUINAS DA MARINHA MERCANTE"
  },
  {
    "codigo": "2152-10",
    "titulo": "PRIMEIRO OFICIAL DE MÁQUINAS DA MARINHA MERCANTE"
  },
  {
    "codigo": "2152-15",
    "titulo": "SEGUNDO OFICIAL DE MÁQUINAS DA MARINHA MERCANTE"
  },
  {
    "codigo": "2152-20",
    "titulo": "SUPERINTENDENTE TÉCNICO NO TRANSPORTE AQUAVIÁRIO"
  },
  {
    "codigo": "2153-05",
    "titulo": "PILOTO DE AERONAVES"
  },
  {
    "codigo": "2153-10",
    "titulo": "PILOTO DE ENSAIOS EM VÔO"
  },
  {
    "codigo": "2153-15",
    "titulo": "INSTRUTOR DE VÔO"
  },
  {
    "codigo": "2211-05",
    "titulo": "BIÓLOGO"
  },
  {
    "codigo": "2212-05",
    "titulo": "BIOMÉDICO"
  },
  {
    "codigo": "2221-05",
    "titulo": "ENGENHEIRO AGRÍCOLA"
  },
  {
    "codigo": "2221-10",
    "titulo": "ENGENHEIRO AGRÔNOMO"
  },
  {
    "codigo": "2221-15",
    "titulo": "ENGENHEIRO DE PESCA"
  },
  {
    "codigo": "2221-20",
    "titulo": "ENGENHEIRO FLORESTAL"
  },
  {
    "codigo": "2231-01",
    "titulo": "MÉDICO ACUPUNTURISTA"
  },
  {
    "codigo": "2231-02",
    "titulo": "MÉDICO ALERGISTA E IMUNOLOGISTA"
  },
  {
    "codigo": "2231-03",
    "titulo": "MÉDICO ANATOMOPATOLOGISTA"
  },
  {
    "codigo": "2231-04",
    "titulo": "MÉDICO ANESTESIOLOGISTA"
  },
  {
    "codigo": "2231-05",
    "titulo": "MÉDICO ANGIOLOGISTA"
  },
  {
    "codigo": "2231-06",
    "titulo": "MÉDICO CARDIOLOGISTA"
  },
  {
    "codigo": "2231-07",
    "titulo": "MÉDICO CIRURGIÃO CARDIOVASCULAR"
  },
  {
    "codigo": "2231-08",
    "titulo": "MÉDICO CIRURGIÃO DE CABEÇA E PESCOÇO"
  },
  {
    "codigo": "2231-09",
    "titulo": "MÉDICO CIRURGIÃO DO APARELHO DIGESTIVO"
  },
  {
    "codigo": "2231-10",
    "titulo": "MÉDICO CIRURGIÃO GERAL"
  },
  {
    "codigo": "2231-11",
    "titulo": "MÉDICO CIRURGIÃO PEDIÁTRICO"
  },
  {
    "codigo": "2231-12",
    "titulo": "MÉDICO CIRURGIÃO PLÁSTICO"
  },
  {
    "codigo": "2231-13",
    "titulo": "MÉDICO CIRURGIÃO TORÁCICO"
  },
  {
    "codigo": "2231-14",
    "titulo": "MÉDICO CITOPATOLOGISTA"
  },
  {
    "codigo": "2231-15",
    "titulo": "MÉDICO CLÍNICO"
  },
  {
    "codigo": "2231-16",
    "titulo": "MÉDICO DE SAÚDE DA FAMÍLIA"
  },
  {
    "codigo": "2231-17",
    "titulo": "MÉDICO DERMATOLOGISTA"
  },
  {
    "codigo": "2231-18",
    "titulo": "MÉDICO DO TRABALHO"
  },
  {
    "codigo": "2231-19",
    "titulo": "MÉDICO EM ELETROENCEFALOGRAFIA"
  },
  {
    "codigo": "2231-20",
    "titulo": "MÉDICO EM ENDOSCOPIA"
  },
  {
    "codigo": "2231-21",
    "titulo": "MÉDICO EM MEDICINA DE TRÁFEGO"
  },
  {
    "codigo": "2231-22",
    "titulo": "MÉDICO EM MEDICINA INTENSIVA"
  },
  {
    "codigo": "2231-23",
    "titulo": "MÉDICO EM MEDICINA NUCLEAR"
  },
  {
    "codigo": "2231-24",
    "titulo": "MÉDICO EM RADIOLOGIA E DIAGNÓSTICO POR IMAGEM"
  },
  {
    "codigo": "2231-25",
    "titulo": "MÉDICO ENDOCRINOLOGISTA E METABOLOGISTA"
  },
  {
    "codigo": "2231-26",
    "titulo": "MÉDICO FISIATRA"
  },
  {
    "codigo": "2231-27",
    "titulo": "MÉDICO FONIATRA"
  },
  {
    "codigo": "2231-28",
    "titulo": "MÉDICO GASTROENTEROLOGISTA"
  },
  {
    "codigo": "2231-29",
    "titulo": "MÉDICO GENERALISTA"
  },
  {
    "codigo": "2231-30",
    "titulo": "MÉDICO GENETICISTA"
  },
  {
    "codigo": "2231-31",
    "titulo": "MÉDICO GERIATRA"
  },
  {
    "codigo": "2231-32",
    "titulo": "MÉDICO GINECOLOGISTA E OBSTETRA"
  },
  {
    "codigo": "2231-33",
    "titulo": "MÉDICO HEMATOLOGISTA"
  },
  {
    "codigo": "2231-34",
    "titulo": "MÉDICO HEMOTERAPEUTA"
  },
  {
    "codigo": "2231-35",
    "titulo": "MÉDICO HOMEOPATA"
  },
  {
    "codigo": "2231-36",
    "titulo": "MÉDICO INFECTOLOGISTA"
  },
  {
    "codigo": "2231-37",
    "titulo": "MÉDICO LEGISTA"
  },
  {
    "codigo": "2231-38",
    "titulo": "MÉDICO MASTOLOGISTA"
  },
  {
    "codigo": "2231-39",
    "titulo": "MÉDICO NEFROLOGISTA"
  },
  {
    "codigo": "2231-40",
    "titulo": "MÉDICO NEUROCIRURGIÃO"
  },
  {
    "codigo": "2231-41",
    "titulo": "MÉDICO NEUROFISIOLOGISTA"
  },
  {
    "codigo": "2231-42",
    "titulo": "MÉDICO NEUROLOGISTA"
  },
  {
    "codigo": "2231-43",
    "titulo": "MÉDICO NUTROLOGISTA"
  },
  {
    "codigo": "2231-44",
    "titulo": "MÉDICO OFTALMOLOGISTA"
  },
  {
    "codigo": "2231-45",
    "titulo": "MÉDICO ONCOLOGISTA"
  },
  {
    "codigo": "2231-46",
    "titulo": "MÉDICO ORTOPEDISTA E TRAUMATOLOGISTA"
  },
  {
    "codigo": "2231-47",
    "titulo": "MÉDICO OTORRINOLARINGOLOGISTA"
  },
  {
    "codigo": "2231-48",
    "titulo": "MÉDICO PATOLOGISTA CLÍNICO"
  },
  {
    "codigo": "2231-49",
    "titulo": "MÉDICO PEDIATRA"
  },
  {
    "codigo": "2231-50",
    "titulo": "MÉDICO PERITO"
  },
  {
    "codigo": "2231-51",
    "titulo": "MÉDICO PNEUMOLOGISTA"
  },
  {
    "codigo": "2231-52",
    "titulo": "MÉDICO PROCTOLOGISTA"
  },
  {
    "codigo": "2231-53",
    "titulo": "MÉDICO PSIQUIATRA"
  },
  {
    "codigo": "2231-54",
    "titulo": "MÉDICO RADIOTERAPEUTA"
  },
  {
    "codigo": "2231-55",
    "titulo": "MÉDICO REUMATOLOGISTA"
  },
  {
    "codigo": "2231-56",
    "titulo": "MÉDICO SANITARISTA"
  },
  {
    "codigo": "2231-57",
    "titulo": "MÉDICO UROLOGISTA"
  },
  {
    "codigo": "2232-04",
    "titulo": "CIRURGIÃO DENTISTA - AUDITOR"
  },
  {
    "codigo": "2232-08",
    "titulo": "CIRURGIÃO DENTISTA - CLÍNICO GERAL"
  },
  {
    "codigo": "2232-12",
    "titulo": "CIRURGIÃO DENTISTA - ENDODONTISTA"
  },
  {
    "codigo": "2232-16",
    "titulo": "CIRURGIÃO DENTISTA - EPIDEMIOLOGISTA"
  },
  {
    "codigo": "2232-20",
    "titulo": "CIRURGIÃO DENTISTA - ESTOMATOLOGISTA"
  },
  {
    "codigo": "2232-24",
    "titulo": "CIRURGIÃO DENTISTA - IMPLANTODONTISTA"
  },
  {
    "codigo": "2232-28",
    "titulo": "CIRURGIÃO DENTISTA - ODONTOGERIATRA"
  },
  {
    "codigo": "2232-32",
    "titulo": "CIRURGIÃO DENTISTA - ODONTOLOGISTA LEGAL"
  },
  {
    "codigo": "2232-36",
    "titulo": "CIRURGIÃO DENTISTA - ODONTOPEDIATRA"
  },
  {
    "codigo": "2232-40",
    "titulo": "CIRURGIÃO DENTISTA - ORTOPEDISTA E ORTODONTISTA"
  },
  {
    "codigo": "2232-44",
    "titulo": "CIRURGIÃO DENTISTA - PATOLOGISTA BUCAL"
  },
  {
    "codigo": "2232-48",
    "titulo": "CIRURGIÃO DENTISTA - PERIODONTISTA"
  },
  {
    "codigo": "2232-52",
    "titulo": "CIRURGIÃO DENTISTA - PROTESIÓLOGO BUCOMAXILOFACIAL"
  },
  {
    "codigo": "2232-56",
    "titulo": "CIRURGIÃO DENTISTA - PROTESISTA"
  },
  {
    "codigo": "2232-60",
    "titulo": "CIRURGIÃO DENTISTA - RADIOLOGISTA"
  },
  {
    "codigo": "2232-64",
    "titulo": "CIRURGIÃO DENTISTA - REABILITADOR ORAL"
  },
  {
    "codigo": "2232-68",
    "titulo": "CIRURGIÃO DENTISTA - TRAUMATOLOGISTA BUCOMAXILOFACIAL"
  },
  {
    "codigo": "2232-72",
    "titulo": "CIRURGIÃO DENTISTA DE SAÚDE COLETIVA"
  },
  {
    "codigo": "2232-76",
    "titulo": "CIRURGIÃO DENTISTA - ODONTOLOGIA DO TRABALHO"
  },
  {
    "codigo": "2232-80",
    "titulo": "CIRURGIÃO DENTISTA - DENTÍSTICA"
  },
  {
    "codigo": "2232-84",
    "titulo": "CIRURGIÃO DENTISTA - DISFUNÇÃO TEMPOROMANDIBULAR E DOR OROFACIAL"
  },
  {
    "codigo": "2232-88",
    "titulo": "CIRURGIÃO DENTISTA - ODONTOLOGIA PARA PACIENTES COM NECESSIDADES ESPECIAIS"
  },
  {
    "codigo": "2233-05",
    "titulo": "MÉDICO VETERINÁRIO"
  },
  {
    "codigo": "2233-10",
    "titulo": "ZOOTECNISTA"
  },
  {
    "codigo": "2234-05",
    "titulo": "FARMACÊUTICO"
  },
  {
    "codigo": "2234-10",
    "titulo": "FARMACÊUTICO BIOQUÍMICO"
  },
  {
    "codigo": "2235-05",
    "titulo": "ENFERMEIRO"
  },
  {
    "codigo": "2235-10",
    "titulo": "ENFERMEIRO AUDITOR"
  },
  {
    "codigo": "2235-15",
    "titulo": "ENFERMEIRO DE BORDO"
  },
  {
    "codigo": "2235-20",
    "titulo": "ENFERMEIRO DE CENTRO CIRÚRGICO"
  },
  {
    "codigo": "2235-25",
    "titulo": "ENFERMEIRO DE TERAPIA INTENSIVA"
  },
  {
    "codigo": "2235-30",
    "titulo": "ENFERMEIRO DO TRABALHO"
  },
  {
    "codigo": "2235-35",
    "titulo": "ENFERMEIRO NEFROLOGISTA"
  },
  {
    "codigo": "2235-40",
    "titulo": "ENFERMEIRO NEONATOLOGISTA"
  },
  {
    "codigo": "2235-45",
    "titulo": "ENFERMEIRO OBSTÉTRICO"
  },
  {
    "codigo": "2235-50",
    "titulo": "ENFERMEIRO PSIQUIÁTRICO"
  },
  {
    "codigo": "2235-55",
    "titulo": "ENFERMEIRO PUERICULTOR E PEDIÁTRICO"
  },
  {
    "codigo": "2235-60",
    "titulo": "ENFERMEIRO SANITARISTA"
  },
  {
    "codigo": "2236-05",
    "titulo": "FISIOTERAPEUTA GERAL"
  },
  {
    "codigo": "2236-25",
    "titulo": "FISIOTERAPEUTA RESPIRATÓRIA"
  },
  {
    "codigo": "2236-30",
    "titulo": "FISIOTERAPEUTA NEUROFUNCIONAL"
  },
  {
    "codigo": "2236-35",
    "titulo": "FISIOTERAPEUTA TRAUMATO-ORTOPÉDICA FUNCIONAL"
  },
  {
    "codigo": "2236-40",
    "titulo": "FISIOTERAPEUTA OSTEOPATA"
  },
  {
    "codigo": "2236-45",
    "titulo": "FISIOTERAPEUTA QUIROPRAXISTA"
  },
  {
    "codigo": "2236-50",
    "titulo": "FISIOTERAPEUTA ACUPUNTURISTA"
  },
  {
    "codigo": "2236-55",
    "titulo": "FISIOTERAPEUTA ESPORTIVO"
  },
  {
    "codigo": "2236-60",
    "titulo": "FISIOTERAPEUTA DO TRABALHO"
  },
  {
    "codigo": "2237-05",
    "titulo": "DIETISTA"
  },
  {
    "codigo": "2237-10",
    "titulo": "NUTRICIONISTA"
  },
  {
    "codigo": "2238-10",
    "titulo": "FONOAUDIÓLOGO"
  },
  {
    "codigo": "2239-05",
    "titulo": "TERAPEUTA OCUPACIONAL"
  },
  {
    "codigo": "2239-10",
    "titulo": "ORTOPTISTA"
  },
  {
    "codigo": "2241-05",
    "titulo": "AVALIADOR FÍSICO"
  },
  {
    "codigo": "2241-10",
    "titulo": "LUDOMOTRICISTA"
  },
  {
    "codigo": "2241-15",
    "titulo": "PREPARADOR DE ATLETA"
  },
  {
    "codigo": "2241-20",
    "titulo": "PREPARADOR FÍSICO"
  },
  {
    "codigo": "2241-25",
    "titulo": "TÉCNICO DE DESPORTO INDIVIDUAL E COLETIVO (EXCETO FUTEBOL)"
  },
  {
    "codigo": "2241-30",
    "titulo": "TÉCNICO DE LABORATÓRIO E FISCALIZAÇÃO DESPORTIVA"
  },
  {
    "codigo": "2241-35",
    "titulo": "TREINADOR PROFISSIONAL DE FUTEBOL"
  },
  {
    "codigo": "2311-05",
    "titulo": "PROFESSOR DE NÍVEL SUPERIOR NA EDUCAÇÃO INFANTIL (QUATRO A SEIS ANOS)"
  },
  {
    "codigo": "2311-10",
    "titulo": "PROFESSOR DE NÍVEL SUPERIOR NA EDUCAÇÃO INFANTIL (ZERO A TRÊS ANOS)"
  },
  {
    "codigo": "2312-05",
    "titulo": "PROFESSOR DA EDUCAÇÃO DE JOVENS E ADULTOS DO ENSINO FUNDAMENTAL (PRIMEIRA A QUARTA SÉRIE)"
  },
  {
    "codigo": "2312-10",
    "titulo": "PROFESSOR DE NÍVEL SUPERIOR DO ENSINO FUNDAMENTAL (PRIMEIRA A QUARTA SÉRIE)"
  },
  {
    "codigo": "2313-05",
    "titulo": "PROFESSOR DE CIÊNCIAS EXATAS E NATURAIS DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-10",
    "titulo": "PROFESSOR DE EDUCAÇÃO ARTÍSTICA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-15",
    "titulo": "PROFESSOR DE EDUCAÇÃO FÍSICA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-20",
    "titulo": "PROFESSOR DE GEOGRAFIA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-25",
    "titulo": "PROFESSOR DE HISTÓRIA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-30",
    "titulo": "PROFESSOR DE LÍNGUA ESTRANGEIRA MODERNA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-35",
    "titulo": "PROFESSOR DE LÍNGUA PORTUGUESA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2313-40",
    "titulo": "PROFESSOR DE MATEMÁTICA DO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "2321-05",
    "titulo": "PROFESSOR DE ARTES NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-10",
    "titulo": "PROFESSOR DE BIOLOGIA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-15",
    "titulo": "PROFESSOR DE DISCIPLINAS PEDAGÓGICAS NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-20",
    "titulo": "PROFESSOR DE EDUCAÇÃO FÍSICA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-25",
    "titulo": "PROFESSOR DE FILOSOFIA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-30",
    "titulo": "PROFESSOR DE FÍSICA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-35",
    "titulo": "PROFESSOR DE GEOGRAFIA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-40",
    "titulo": "PROFESSOR DE HISTÓRIA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-45",
    "titulo": "PROFESSOR DE LÍNGUA E LITERATURA BRASILEIRA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-50",
    "titulo": "PROFESSOR DE LÍNGUA ESTRANGEIRA MODERNA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-55",
    "titulo": "PROFESSOR DE MATEMÁTICA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-60",
    "titulo": "PROFESSOR DE PSICOLOGIA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-65",
    "titulo": "PROFESSOR DE QUÍMICA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2321-70",
    "titulo": "PROFESSOR DE SOCIOLOGIA NO ENSINO MÉDIO"
  },
  {
    "codigo": "2331-05",
    "titulo": "PROFESSOR DA ÁREA DE MEIO AMBIENTE"
  },
  {
    "codigo": "2331-10",
    "titulo": "PROFESSOR DE DESENHO TÉCNICO"
  },
  {
    "codigo": "2331-15",
    "titulo": "PROFESSOR DE TÉCNICAS AGRÍCOLAS"
  },
  {
    "codigo": "2331-20",
    "titulo": "PROFESSOR DE TÉCNICAS COMERCIAIS E SECRETARIAIS"
  },
  {
    "codigo": "2331-25",
    "titulo": "PROFESSOR DE TÉCNICAS DE ENFERMAGEM"
  },
  {
    "codigo": "2331-30",
    "titulo": "PROFESSOR DE TÉCNICAS INDUSTRIAIS"
  },
  {
    "codigo": "2331-35",
    "titulo": "PROFESSOR DE TECNOLOGIA E CÁLCULO TÉCNICO"
  },
  {
    "codigo": "2332-05",
    "titulo": "INSTRUTOR DE APRENDIZAGEM E TREINAMENTO AGROPECUÁRIO"
  },
  {
    "codigo": "2332-10",
    "titulo": "INSTRUTOR DE APRENDIZAGEM E TREINAMENTO INDUSTRIAL"
  },
  {
    "codigo": "2332-15",
    "titulo": "PROFESSOR DE APRENDIZAGEM E TREINAMENTO COMERCIAL"
  },
  {
    "codigo": "2332-20",
    "titulo": "PROFESSOR INSTRUTOR DE ENSINO E APRENDIZAGEM AGROFLORESTAL"
  },
  {
    "codigo": "2332-25",
    "titulo": "PROFESSOR INSTRUTOR DE ENSINO E APRENDIZAGEM EM SERVIÇOS"
  },
  {
    "codigo": "2341-05",
    "titulo": "PROFESSOR DE MATEMÁTICA APLICADA (NO ENSINO SUPERIOR)"
  },
  {
    "codigo": "2341-10",
    "titulo": "PROFESSOR DE MATEMÁTICA PURA (NO ENSINO SUPERIOR)"
  },
  {
    "codigo": "2341-15",
    "titulo": "PROFESSOR DE ESTATÍSTICA (NO ENSINO SUPERIOR)"
  },
  {
    "codigo": "2341-20",
    "titulo": "PROFESSOR DE COMPUTAÇÃO (NO ENSINO SUPERIOR)"
  },
  {
    "codigo": "2341-25",
    "titulo": "PROFESSOR DE PESQUISA OPERACIONAL (NO ENSINO SUPERIOR)"
  },
  {
    "codigo": "2342-05",
    "titulo": "PROFESSOR DE FÍSICA (ENSINO SUPERIOR)"
  },
  {
    "codigo": "2342-10",
    "titulo": "PROFESSOR DE QUÍMICA (ENSINO SUPERIOR)"
  },
  {
    "codigo": "2342-15",
    "titulo": "PROFESSOR DE ASTRONOMIA (ENSINO SUPERIOR)"
  },
  {
    "codigo": "2343-05",
    "titulo": "PROFESSOR DE ARQUITETURA"
  },
  {
    "codigo": "2343-10",
    "titulo": "PROFESSOR DE ENGENHARIA"
  },
  {
    "codigo": "2343-15",
    "titulo": "PROFESSOR DE GEOFÍSICA"
  },
  {
    "codigo": "2343-20",
    "titulo": "PROFESSOR DE GEOLOGIA"
  },
  {
    "codigo": "2344-05",
    "titulo": "PROFESSOR DE CIÊNCIAS BIOLÓGICAS DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2344-10",
    "titulo": "PROFESSOR DE EDUCAÇÃO FÍSICA NO ENSINO SUPERIOR"
  },
  {
    "codigo": "2344-15",
    "titulo": "PROFESSOR DE ENFERMAGEM DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2344-20",
    "titulo": "PROFESSOR DE FARMÁCIA E BIOQUÍMICA"
  },
  {
    "codigo": "2344-25",
    "titulo": "PROFESSOR DE FISIOTERAPIA"
  },
  {
    "codigo": "2344-30",
    "titulo": "PROFESSOR DE FONOAUDIOLOGIA"
  },
  {
    "codigo": "2344-35",
    "titulo": "PROFESSOR DE MEDICINA"
  },
  {
    "codigo": "2344-40",
    "titulo": "PROFESSOR DE MEDICINA VETERINÁRIA"
  },
  {
    "codigo": "2344-45",
    "titulo": "PROFESSOR DE NUTRIÇÃO"
  },
  {
    "codigo": "2344-50",
    "titulo": "PROFESSOR DE ODONTOLOGIA"
  },
  {
    "codigo": "2344-55",
    "titulo": "PROFESSOR DE TERAPIA OCUPACIONAL"
  },
  {
    "codigo": "2344-60",
    "titulo": "PROFESSOR DE ZOOTECNIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2345-05",
    "titulo": "PROFESSOR DE ENSINO SUPERIOR NA ÁREA DE DIDÁTICA"
  },
  {
    "codigo": "2345-10",
    "titulo": "PROFESSOR DE ENSINO SUPERIOR NA ÁREA DE ORIENTAÇÃO EDUCACIONAL"
  },
  {
    "codigo": "2345-15",
    "titulo": "PROFESSOR DE ENSINO SUPERIOR NA ÁREA DE PESQUISA EDUCACIONAL"
  },
  {
    "codigo": "2345-20",
    "titulo": "PROFESSOR DE ENSINO SUPERIOR NA ÁREA DE PRÁTICA DE ENSINO"
  },
  {
    "codigo": "2346-04",
    "titulo": "PROFESSOR DE LÍNGUA ALEMÃ"
  },
  {
    "codigo": "2346-08",
    "titulo": "PROFESSOR DE LÍNGUA ITALIANA"
  },
  {
    "codigo": "2346-12",
    "titulo": "PROFESSOR DE LÍNGUA FRANCESA"
  },
  {
    "codigo": "2346-16",
    "titulo": "PROFESSOR DE LÍNGUA INGLESA"
  },
  {
    "codigo": "2346-20",
    "titulo": "PROFESSOR DE LÍNGUA ESPANHOLA"
  },
  {
    "codigo": "2346-24",
    "titulo": "PROFESSOR DE LÍNGUA PORTUGUESA"
  },
  {
    "codigo": "2346-28",
    "titulo": "PROFESSOR DE LITERATURA BRASILEIRA"
  },
  {
    "codigo": "2346-32",
    "titulo": "PROFESSOR DE LITERATURA PORTUGUESA"
  },
  {
    "codigo": "2346-36",
    "titulo": "PROFESSOR DE LITERATURA ALEMÃ"
  },
  {
    "codigo": "2346-40",
    "titulo": "PROFESSOR DE LITERATURA COMPARADA"
  },
  {
    "codigo": "2346-44",
    "titulo": "PROFESSOR DE LITERATURA ESPANHOLA"
  },
  {
    "codigo": "2346-48",
    "titulo": "PROFESSOR DE LITERATURA FRANCESA"
  },
  {
    "codigo": "2346-52",
    "titulo": "PROFESSOR DE LITERATURA INGLESA"
  },
  {
    "codigo": "2346-56",
    "titulo": "PROFESSOR DE LITERATURA ITALIANA"
  },
  {
    "codigo": "2346-60",
    "titulo": "PROFESSOR DE LITERATURA DE LÍNGUAS ESTRANGEIRAS MODERNAS"
  },
  {
    "codigo": "2346-64",
    "titulo": "PROFESSOR DE OUTRAS LÍNGUAS E LITERATURAS"
  },
  {
    "codigo": "2346-68",
    "titulo": "PROFESSOR DE LÍNGUAS ESTRANGEIRAS MODERNAS"
  },
  {
    "codigo": "2346-72",
    "titulo": "PROFESSOR DE LINGÜÍSTICA E LINGÜÍSTICA APLICADA"
  },
  {
    "codigo": "2346-76",
    "titulo": "PROFESSOR DE FILOLOGIA E CRÍTICA TEXTUAL"
  },
  {
    "codigo": "2346-80",
    "titulo": "PROFESSOR DE SEMIÓTICA"
  },
  {
    "codigo": "2346-84",
    "titulo": "PROFESSOR DE TEORIA DA LITERATURA"
  },
  {
    "codigo": "2347-05",
    "titulo": "PROFESSOR DE ANTROPOLOGIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-10",
    "titulo": "PROFESSOR DE ARQUIVOLOGIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-15",
    "titulo": "PROFESSOR DE BIBLIOTECONOMIA DO ENSIO SUPERIOR"
  },
  {
    "codigo": "2347-20",
    "titulo": "PROFESSOR DE CIÊNCIA POLÍTICA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-25",
    "titulo": "PROFESSOR DE COMUNICAÇÃO SOCIAL DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-30",
    "titulo": "PROFESSOR DE DIREITO DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-35",
    "titulo": "PROFESSOR DE FILOSOFIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-40",
    "titulo": "PROFESSOR DE GEOGRAFIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-45",
    "titulo": "PROFESSOR DE HISTÓRIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-50",
    "titulo": "PROFESSOR DE JORNALISMO"
  },
  {
    "codigo": "2347-55",
    "titulo": "PROFESSOR DE MUSEOLOGIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-60",
    "titulo": "PROFESSOR DE PSICOLOGIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-65",
    "titulo": "PROFESSOR DE SERVIÇO SOCIAL DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2347-70",
    "titulo": "PROFESSOR DE SOCIOLOGIA DO ENSINO SUPERIOR"
  },
  {
    "codigo": "2348-05",
    "titulo": "PROFESSOR DE ECONOMIA"
  },
  {
    "codigo": "2348-10",
    "titulo": "PROFESSOR DE ADMINISTRAÇÃO"
  },
  {
    "codigo": "2348-15",
    "titulo": "PROFESSOR DE CONTABILIDADE"
  },
  {
    "codigo": "2349-05",
    "titulo": "PROFESSOR DE ARTES DO ESPETÁCULO NO ENSINO SUPERIOR"
  },
  {
    "codigo": "2349-10",
    "titulo": "PROFESSOR DE ARTES VISUAIS NO ENSINO SUPERIOR (ARTES PLÁSTICAS E MULTIMÍDIA)"
  },
  {
    "codigo": "2349-15",
    "titulo": "PROFESSOR DE MÚSICA NO ENSINO SUPERIOR"
  },
  {
    "codigo": "2392-05",
    "titulo": "PROFESSOR DE ALUNOS COM DEFICIÊNCIA AUDITIVA E SURDOS"
  },
  {
    "codigo": "2392-10",
    "titulo": "PROFESSOR DE ALUNOS COM DEFICIÊNCIA FÍSICA"
  },
  {
    "codigo": "2392-15",
    "titulo": "PROFESSOR DE ALUNOS COM DEFICIÊNCIA MENTAL"
  },
  {
    "codigo": "2392-20",
    "titulo": "PROFESSOR DE ALUNOS COM DEFICIÊNCIA MÚLTIPLA"
  },
  {
    "codigo": "2392-25",
    "titulo": "PROFESSOR DE ALUNOS COM DEFICIÊNCIA VISUAL"
  },
  {
    "codigo": "2394-05",
    "titulo": "COORDENADOR PEDAGÓGICO"
  },
  {
    "codigo": "2394-10",
    "titulo": "ORIENTADOR EDUCACIONAL"
  },
  {
    "codigo": "2394-15",
    "titulo": "PEDAGOGO"
  },
  {
    "codigo": "2394-20",
    "titulo": "PROFESSOR DE TÉCNICAS E RECURSOS AUDIOVISUAIS"
  },
  {
    "codigo": "2394-25",
    "titulo": "PSICOPEDAGOGO"
  },
  {
    "codigo": "2394-30",
    "titulo": "SUPERVISOR DE ENSINO"
  },
  {
    "codigo": "2394-35",
    "titulo": "DESIGNER EDUCACIONAL"
  },
  {
    "codigo": "2410-05",
    "titulo": "ADVOGADO"
  },
  {
    "codigo": "2410-10",
    "titulo": "ADVOGADO DE EMPRESA"
  },
  {
    "codigo": "2410-15",
    "titulo": "ADVOGADO (DIREITO CIVIL)"
  },
  {
    "codigo": "2410-20",
    "titulo": "ADVOGADO (DIREITO PÚBLICO)"
  },
  {
    "codigo": "2410-25",
    "titulo": "ADVOGADO (DIREITO PENAL)"
  },
  {
    "codigo": "2410-30",
    "titulo": "ADVOGADO (ÁREAS ESPECIAIS)"
  },
  {
    "codigo": "2410-35",
    "titulo": "ADVOGADO (DIREITO DO TRABALHO)"
  },
  {
    "codigo": "2410-40",
    "titulo": "CONSULTOR JURÍDICO"
  },
  {
    "codigo": "2412-05",
    "titulo": "ADVOGADO DA UNIÃO"
  },
  {
    "codigo": "2412-10",
    "titulo": "PROCURADOR AUTÁRQUICO"
  },
  {
    "codigo": "2412-15",
    "titulo": "PROCURADOR DA FAZENDA NACIONAL"
  },
  {
    "codigo": "2412-20",
    "titulo": "PROCURADOR DO ESTADO"
  },
  {
    "codigo": "2412-25",
    "titulo": "PROCURADOR DO MUNICÍPIO"
  },
  {
    "codigo": "2412-30",
    "titulo": "PROCURADOR FEDERAL"
  },
  {
    "codigo": "2412-35",
    "titulo": "PROCURADOR FUNDACIONAL"
  },
  {
    "codigo": "2413-05",
    "titulo": "OFICIAL DE REGISTRO DE CONTRATOS MARÍTIMOS"
  },
  {
    "codigo": "2413-10",
    "titulo": "OFICIAL DO REGISTRO CIVIL DE PESSOAS JURIDICAS"
  },
  {
    "codigo": "2413-15",
    "titulo": "OFICIAL DO REGISTRO CIVIL DE PESSOAS NATURAIS"
  },
  {
    "codigo": "2413-20",
    "titulo": "OFICIAL DO REGISTRO DE DISTRIBUIÇÕES"
  },
  {
    "codigo": "2413-25",
    "titulo": "OFICIAL DO REGISTRO DE IMÓVEIS"
  },
  {
    "codigo": "2413-30",
    "titulo": "OFICIAL DO REGISTRO DE TÍTULOS E DOCUMENTOS"
  },
  {
    "codigo": "2413-35",
    "titulo": "TABELIÃO DE NOTAS"
  },
  {
    "codigo": "2413-40",
    "titulo": "TABELIÃO DE PROTESTOS"
  },
  {
    "codigo": "2422-05",
    "titulo": "PROCURADOR DA REPÚBLICA"
  },
  {
    "codigo": "2422-10",
    "titulo": "PROCURADOR DE JUSTIÇA"
  },
  {
    "codigo": "2422-15",
    "titulo": "PROCURADOR DE JUSTIÇA MILITAR"
  },
  {
    "codigo": "2422-20",
    "titulo": "PROCURADOR DO TRABALHO"
  },
  {
    "codigo": "2422-25",
    "titulo": "PROCURADOR REGIONAL DA REPÚBLICA"
  },
  {
    "codigo": "2422-30",
    "titulo": "PROCURADOR REGIONAL DO TRABALHO"
  },
  {
    "codigo": "2422-35",
    "titulo": "PROMOTOR DE JUSTIÇA"
  },
  {
    "codigo": "2422-40",
    "titulo": "SUBPROCURADOR DE JUSTIÇA MILITAR"
  },
  {
    "codigo": "2422-45",
    "titulo": "SUBPROCURADOR-GERAL DA REPÚBLICA"
  },
  {
    "codigo": "2422-50",
    "titulo": "SUBPROCURADOR-GERAL DO TRABALHO"
  },
  {
    "codigo": "2423-05",
    "titulo": "DELEGADO DE POLÍCIA"
  },
  {
    "codigo": "2424-05",
    "titulo": "DEFENSOR PÚBLICO"
  },
  {
    "codigo": "2424-10",
    "titulo": "PROCURADOR DA ASSISTÊNCIA JUDICIÁRIA"
  },
  {
    "codigo": "2511-05",
    "titulo": "ANTROPÓLOGO"
  },
  {
    "codigo": "2511-10",
    "titulo": "ARQUEÓLOGO"
  },
  {
    "codigo": "2511-15",
    "titulo": "CIENTISTA POLÍTICO"
  },
  {
    "codigo": "2511-20",
    "titulo": "SOCIÓLOGO"
  },
  {
    "codigo": "2512-05",
    "titulo": "ECONOMISTA"
  },
  {
    "codigo": "2512-10",
    "titulo": "ECONOMISTA AGROINDUSTRIAL"
  },
  {
    "codigo": "2512-15",
    "titulo": "ECONOMISTA FINANCEIRO"
  },
  {
    "codigo": "2512-20",
    "titulo": "ECONOMISTA INDUSTRIAL"
  },
  {
    "codigo": "2512-25",
    "titulo": "ECONOMISTA DO SETOR PÚBLICO"
  },
  {
    "codigo": "2512-30",
    "titulo": "ECONOMISTA AMBIENTAL"
  },
  {
    "codigo": "2512-35",
    "titulo": "ECONOMISTA REGIONAL E URBANO"
  },
  {
    "codigo": "2513-05",
    "titulo": "GEÓGRAFO"
  },
  {
    "codigo": "2514-05",
    "titulo": "FILÓSOFO"
  },
  {
    "codigo": "2515-05",
    "titulo": "PSICÓLOGO EDUCACIONAL"
  },
  {
    "codigo": "2515-10",
    "titulo": "PSICÓLOGO CLÍNICO"
  },
  {
    "codigo": "2515-15",
    "titulo": "PSICÓLOGO DO ESPORTE"
  },
  {
    "codigo": "2515-20",
    "titulo": "PSICÓLOGO HOSPITALAR"
  },
  {
    "codigo": "2515-25",
    "titulo": "PSICÓLOGO JURÍDICO"
  },
  {
    "codigo": "2515-30",
    "titulo": "PSICÓLOGO SOCIAL"
  },
  {
    "codigo": "2515-35",
    "titulo": "PSICÓLOGO DO TRÂNSITO"
  },
  {
    "codigo": "2515-40",
    "titulo": "PSICÓLOGO DO TRABALHO"
  },
  {
    "codigo": "2515-45",
    "titulo": "NEUROPSICÓLOGO"
  },
  {
    "codigo": "2515-50",
    "titulo": "PSICANALISTA"
  },
  {
    "codigo": "2516-05",
    "titulo": "ASSISTENTE SOCIAL"
  },
  {
    "codigo": "2516-10",
    "titulo": "ECONOMISTA DOMÉSTICO"
  },
  {
    "codigo": "2521-05",
    "titulo": "ADMINISTRADOR"
  },
  {
    "codigo": "2522-05",
    "titulo": "AUDITOR (CONTADORES E AFINS)"
  },
  {
    "codigo": "2522-10",
    "titulo": "CONTADOR"
  },
  {
    "codigo": "2522-15",
    "titulo": "PERITO CONTÁBIL"
  },
  {
    "codigo": "2523-05",
    "titulo": "SECRETÁRIA EXECUTIVA"
  },
  {
    "codigo": "2523-10",
    "titulo": "SECRETÁRIO BILÍNGÜE"
  },
  {
    "codigo": "2523-15",
    "titulo": "SECRETÁRIA TRILÍNGÜE"
  },
  {
    "codigo": "2524-05",
    "titulo": "ANALISTA DE RECURSOS HUMANOS"
  },
  {
    "codigo": "2525-05",
    "titulo": "ADMINISTRADOR DE FUNDOS E CARTEIRAS DE INVESTIMENTO"
  },
  {
    "codigo": "2525-10",
    "titulo": "ANALISTA DE CÂMBIO"
  },
  {
    "codigo": "2525-15",
    "titulo": "ANALISTA DE COBRANÇA (INSTITUIÇÕES FINANCEIRAS)"
  },
  {
    "codigo": "2525-25",
    "titulo": "ANALISTA DE CRÉDITO (INSTITUIÇÕES FINANCEIRAS)"
  },
  {
    "codigo": "2525-30",
    "titulo": "ANALISTA DE CRÉDITO RURAL"
  },
  {
    "codigo": "2525-35",
    "titulo": "ANALISTA DE LEASING"
  },
  {
    "codigo": "2525-40",
    "titulo": "ANALISTA DE PRODUTOS BANCÁRIOS"
  },
  {
    "codigo": "2525-45",
    "titulo": "ANALISTA FINANCEIRO (INSTITUIÇÕES FINANCEIRAS)"
  },
  {
    "codigo": "2531-05",
    "titulo": "RELAÇÕES PÚBLICAS"
  },
  {
    "codigo": "2531-10",
    "titulo": "REDATOR DE PUBLICIDADE"
  },
  {
    "codigo": "2531-15",
    "titulo": "AGENTE PUBLICITÁRIO"
  },
  {
    "codigo": "2531-20",
    "titulo": "ANALISTA DE NEGÓCIOS"
  },
  {
    "codigo": "2531-25",
    "titulo": "ANALISTA DE PESQUISA DE MERCADO"
  },
  {
    "codigo": "2532-05",
    "titulo": "GERENTE DE CAPTAÇÃO (FUNDOS E INVESTIMENTOS INSTITUCIONAIS)"
  },
  {
    "codigo": "2532-10",
    "titulo": "GERENTE DE CLIENTES ESPECIAIS (PRIVATE)"
  },
  {
    "codigo": "2532-15",
    "titulo": "GERENTE DE CONTAS - PESSOA FÍSICA E JURÍDICA"
  },
  {
    "codigo": "2532-20",
    "titulo": "GERENTE DE GRANDES CONTAS (CORPORATE)"
  },
  {
    "codigo": "2532-25",
    "titulo": "OPERADOR DE NEGÓCIOS"
  },
  {
    "codigo": "2533-05",
    "titulo": "CORRETOR DE VALORES, ATIVOS FINANCEIROS, MERCADORIAS E DERIVATIVOS"
  },
  {
    "codigo": "2541-05",
    "titulo": "AUDITOR-FISCAL DA RECEITA FEDERAL"
  },
  {
    "codigo": "2541-10",
    "titulo": "TÉCNICO DA RECEITA FEDERAL"
  },
  {
    "codigo": "2542-05",
    "titulo": "AUDITOR-FISCAL DA PREVIDÊNCIA SOCIAL"
  },
  {
    "codigo": "2543-05",
    "titulo": "AUDITOR-FISCAL DO TRABALHO"
  },
  {
    "codigo": "2543-10",
    "titulo": "AGENTE DE HIGIENE E SEGURANÇA"
  },
  {
    "codigo": "2544-05",
    "titulo": "FISCAL DE TRIBUTOS ESTADUAL"
  },
  {
    "codigo": "2544-10",
    "titulo": "FISCAL DE TRIBUTOS MUNICIPAL"
  },
  {
    "codigo": "2544-15",
    "titulo": "TÉCNICO DE TRIBUTOS ESTADUAL"
  },
  {
    "codigo": "2544-20",
    "titulo": "TÉCNICO DE TRIBUTOS MUNICIPAL"
  },
  {
    "codigo": "2611-05",
    "titulo": "ARQUIVISTA PESQUISADOR (JORNALISMO)"
  },
  {
    "codigo": "2611-10",
    "titulo": "ASSESSOR DE IMPRENSA"
  },
  {
    "codigo": "2611-15",
    "titulo": "DIRETOR DE REDAÇ��O"
  },
  {
    "codigo": "2611-20",
    "titulo": "EDITOR"
  },
  {
    "codigo": "2611-25",
    "titulo": "JORNALISTA"
  },
  {
    "codigo": "2611-30",
    "titulo": "PRODUTOR DE TEXTO"
  },
  {
    "codigo": "2611-35",
    "titulo": "REPÓRTER (EXCLUSIVE RÁDIO E TELEVISÃO)"
  },
  {
    "codigo": "2611-40",
    "titulo": "REVISOR DE TEXTO"
  },
  {
    "codigo": "2612-05",
    "titulo": "BIBLIOTECÁRIO"
  },
  {
    "codigo": "2612-10",
    "titulo": "DOCUMENTALISTA"
  },
  {
    "codigo": "2612-15",
    "titulo": "ANALISTA DE INFORMAÇÕES (PESQUISADOR DE INFORMAÇÕES DE REDE)"
  },
  {
    "codigo": "2613-05",
    "titulo": "ARQUIVISTA"
  },
  {
    "codigo": "2613-10",
    "titulo": "MUSEÓLOGO"
  },
  {
    "codigo": "2614-05",
    "titulo": "FILÓLOGO"
  },
  {
    "codigo": "2614-10",
    "titulo": "INTÉRPRETE"
  },
  {
    "codigo": "2614-15",
    "titulo": "LINGÜISTA"
  },
  {
    "codigo": "2614-20",
    "titulo": "TRADUTOR"
  },
  {
    "codigo": "2614-25",
    "titulo": "INTÉRPRETE DE LÍNGUA DE SINAIS"
  },
  {
    "codigo": "2615-05",
    "titulo": "AUTOR-ROTEIRISTA"
  },
  {
    "codigo": "2615-10",
    "titulo": "CRÍTICO"
  },
  {
    "codigo": "2615-15",
    "titulo": "ESCRITOR DE FICÇÃO"
  },
  {
    "codigo": "2615-20",
    "titulo": "ESCRITOR DE NÃO FICÇÃO"
  },
  {
    "codigo": "2615-25",
    "titulo": "POETA"
  },
  {
    "codigo": "2615-30",
    "titulo": "REDATOR DE TEXTOS TÉCNICOS"
  },
  {
    "codigo": "2616-05",
    "titulo": "EDITOR DE JORNAL"
  },
  {
    "codigo": "2616-10",
    "titulo": "EDITOR DE LIVRO"
  },
  {
    "codigo": "2616-15",
    "titulo": "EDITOR DE MÍDIA ELETRÔNICA"
  },
  {
    "codigo": "2616-20",
    "titulo": "EDITOR DE REVISTA"
  },
  {
    "codigo": "2616-25",
    "titulo": "EDITOR DE REVISTA CIENTÍFICA"
  },
  {
    "codigo": "2617-10",
    "titulo": "COMENTARISTA DE RÁDIO E TELEVISÃO"
  },
  {
    "codigo": "2617-15",
    "titulo": "LOCUTOR DE RÁDIO E TELEVISÃO"
  },
  {
    "codigo": "2617-20",
    "titulo": "LOCUTOR PUBLICITÁRIO DE RÁDIO E TELEVISÃO"
  },
  {
    "codigo": "2617-25",
    "titulo": "NARRADOR EM PROGRAMAS DE RÁDIO E TELEVISÃO"
  },
  {
    "codigo": "2617-30",
    "titulo": "REPÓRTER DE RÁDIO E TELEVISÃO"
  },
  {
    "codigo": "2618-05",
    "titulo": "FOTÓGRAFO"
  },
  {
    "codigo": "2618-10",
    "titulo": "FOTÓGRAFO PUBLICITÁRIO"
  },
  {
    "codigo": "2618-15",
    "titulo": "FOTÓGRAFO RETRATISTA"
  },
  {
    "codigo": "2618-20",
    "titulo": "REPÓTER FOTOGRÁFICO"
  },
  {
    "codigo": "2621-05",
    "titulo": "EMPRESÁRIO DE ESPETÁCULO"
  },
  {
    "codigo": "2621-10",
    "titulo": "PRODUTOR CINEMATOGRÁFICO"
  },
  {
    "codigo": "2621-15",
    "titulo": "PRODUTOR DE RÁDIO"
  },
  {
    "codigo": "2621-20",
    "titulo": "PRODUTOR DE TEATRO"
  },
  {
    "codigo": "2621-25",
    "titulo": "PRODUTOR DE TELEVISÃO"
  },
  {
    "codigo": "2622-05",
    "titulo": "DIRETOR DE CINEMA"
  },
  {
    "codigo": "2622-10",
    "titulo": "DIRETOR DE PROGRAMAS DE RÁDIO"
  },
  {
    "codigo": "2622-15",
    "titulo": "DIRETOR DE PROGRAMAS DE TELEVISÃO"
  },
  {
    "codigo": "2622-20",
    "titulo": "DIRETOR TEATRAL"
  },
  {
    "codigo": "2623-05",
    "titulo": "CENÓGRAFO CARNAVALESCO E FESTAS POPULARES"
  },
  {
    "codigo": "2623-10",
    "titulo": "CENÓGRAFO DE CINEMA"
  },
  {
    "codigo": "2623-15",
    "titulo": "CENÓGRAFO DE EVENTOS"
  },
  {
    "codigo": "2623-20",
    "titulo": "CENÓGRAFO DE TEATRO"
  },
  {
    "codigo": "2623-25",
    "titulo": "CENÓGRAFO DE TV"
  },
  {
    "codigo": "2623-30",
    "titulo": "DIRETOR DE ARTE"
  },
  {
    "codigo": "2624-05",
    "titulo": "ARTISTA (ARTES VISUAIS)"
  },
  {
    "codigo": "2624-10",
    "titulo": "DESENHISTA INDUSTRIAL (DESIGNER)"
  },
  {
    "codigo": "2624-15",
    "titulo": "CONSERVADOR-RESTAURADOR DE BENS CULTURAIS"
  },
  {
    "codigo": "2625-05",
    "titulo": "ATOR"
  },
  {
    "codigo": "2626-05",
    "titulo": "COMPOSITOR"
  },
  {
    "codigo": "2626-10",
    "titulo": "MÚSICO ARRANJADOR"
  },
  {
    "codigo": "2626-15",
    "titulo": "MÚSICO REGENTE"
  },
  {
    "codigo": "2626-20",
    "titulo": "MUSICÓLOGO"
  },
  {
    "codigo": "2627-05",
    "titulo": "MÚSICO INTÉRPRETE CANTOR"
  },
  {
    "codigo": "2627-10",
    "titulo": "MÚSICO INTÉRPRETE INSTRUMENTISTA"
  },
  {
    "codigo": "2628-05",
    "titulo": "ASSISTENTE DE COREOGRAFIA"
  },
  {
    "codigo": "2628-10",
    "titulo": "BAILARINO (EXCETO DANÇAS POPULARES)"
  },
  {
    "codigo": "2628-15",
    "titulo": "COREÓGRAFO"
  },
  {
    "codigo": "2628-20",
    "titulo": "DRAMATURGO DE DANÇA"
  },
  {
    "codigo": "2628-25",
    "titulo": "ENSAIADOR DE DANÇA"
  },
  {
    "codigo": "2628-30",
    "titulo": "PROFESSOR DE DANÇA"
  },
  {
    "codigo": "2629-05",
    "titulo": "DECORADOR DE INTERIORES DE NÍVEL SUPERIOR"
  },
  {
    "codigo": "2631-05",
    "titulo": "MINISTRO DE CULTO RELIGIOSO"
  },
  {
    "codigo": "2631-10",
    "titulo": "MISSIONÁRIO"
  },
  {
    "codigo": "2631-15",
    "titulo": "TEÓLOGO"
  },
  {
    "codigo": "3001-05",
    "titulo": "TÉCNICO EM MECATRÔNICA - AUTOMAÇÃO DA MANUFATURA"
  },
  {
    "codigo": "3001-10",
    "titulo": "TÉCNICO EM MECATRÔNICA - ROBÓTICA"
  },
  {
    "codigo": "3003-05",
    "titulo": "TÉCNICO EM ELETROMECÂNICA"
  },
  {
    "codigo": "3011-05",
    "titulo": "TÉCNICO DE LABORATÓRIO INDUSTRIAL"
  },
  {
    "codigo": "3011-10",
    "titulo": "TÉCNICO DE LABORATÓRIO DE ANÁLISES FÍSICO-QUÍMICAS (MATERIAIS DE CONSTRUÇÃO)"
  },
  {
    "codigo": "3011-15",
    "titulo": "TÉCNICO QUÍMICO DE PETRÓLEO"
  },
  {
    "codigo": "3012-05",
    "titulo": "TÉCNICO DE APOIO À BIOENGENHARIA"
  },
  {
    "codigo": "3111-05",
    "titulo": "TÉCNICO QUÍMICO"
  },
  {
    "codigo": "3111-10",
    "titulo": "TÉCNICO DE CELULOSE E PAPEL"
  },
  {
    "codigo": "3111-15",
    "titulo": "TÉCNICO EM CURTIMENTO"
  },
  {
    "codigo": "3112-05",
    "titulo": "TÉCNICO EM PETROQUÍMICA"
  },
  {
    "codigo": "3113-05",
    "titulo": "TÉCNICO EM MATERIAIS, PRODUTOS CERÂMICOS E VIDROS"
  },
  {
    "codigo": "3114-05",
    "titulo": "TÉCNICO EM BORRACHA"
  },
  {
    "codigo": "3114-10",
    "titulo": "TÉCNICO EM PLÁSTICO"
  },
  {
    "codigo": "3115-05",
    "titulo": "TÉCNICO DE CONTROLE DE MEIO AMBIENTE"
  },
  {
    "codigo": "3115-10",
    "titulo": "TÉCNICO DE METEOROLOGIA"
  },
  {
    "codigo": "3115-15",
    "titulo": "TÉCNICO DE UTILIDADE (PRODUÇÃO E DISTRIBUIÇÃO DE VAPOR, GASES, ÓLEOS, COMBUSTÍVEIS, ENERGIA)"
  },
  {
    "codigo": "3115-20",
    "titulo": "TÉCNICO EM TRATAMENTO DE EFLUENTES"
  },
  {
    "codigo": "3116-05",
    "titulo": "TÉCNICO TÊXTIL"
  },
  {
    "codigo": "3116-10",
    "titulo": "TÉCNICO TÊXTIL (TRATAMENTOS QUÍMICOS)"
  },
  {
    "codigo": "3116-15",
    "titulo": "TÉCNICO TÊXTIL DE FIAÇÃO"
  },
  {
    "codigo": "3116-20",
    "titulo": "TÉCNICO TÊXTIL DE MALHARIA"
  },
  {
    "codigo": "3116-25",
    "titulo": "TÉCNICO TÊXTIL DE TECELAGEM"
  },
  {
    "codigo": "3117-05",
    "titulo": "COLORISTA DE PAPEL"
  },
  {
    "codigo": "3117-10",
    "titulo": "COLORISTA TÊXTIL"
  },
  {
    "codigo": "3117-15",
    "titulo": "PREPARADOR DE TINTAS"
  },
  {
    "codigo": "3117-20",
    "titulo": "PREPARADOR DE TINTAS (FÁBRICA DE TECIDOS)"
  },
  {
    "codigo": "3117-25",
    "titulo": "TINGIDOR DE COUROS E PELES"
  },
  {
    "codigo": "3121-05",
    "titulo": "TÉCNICO DE OBRAS CIVIS"
  },
  {
    "codigo": "3122-05",
    "titulo": "TÉCNICO DE ESTRADAS"
  },
  {
    "codigo": "3122-10",
    "titulo": "TÉCNICO DE SANEAMENTO"
  },
  {
    "codigo": "3123-05",
    "titulo": "TÉCNICO EM AGRIMENSURA"
  },
  {
    "codigo": "3123-10",
    "titulo": "TÉCNICO EM GEODÉSIA E CARTOGRAFIA"
  },
  {
    "codigo": "3123-15",
    "titulo": "TÉCNICO EM HIDROGRAFIA"
  },
  {
    "codigo": "3123-20",
    "titulo": "TOPÓGRAFO"
  },
  {
    "codigo": "3131-05",
    "titulo": "ELETROTÉCNICO"
  },
  {
    "codigo": "3131-10",
    "titulo": "ELETROTÉCNICO (PRODUÇÃO DE ENERGIA)"
  },
  {
    "codigo": "3131-15",
    "titulo": "ELETROTÉNICO NA FABRICAÇÃO, MONTAGEM E INSTALAÇÃO DE MÁQUINAS E EQUIPAMENTOS"
  },
  {
    "codigo": "3131-20",
    "titulo": "TÉCNICO DE MANUTENÇÃO ELÉTRICA"
  },
  {
    "codigo": "3131-25",
    "titulo": "TÉCNICO DE MANUTENÇÃO ELÉTRICA DE MÁQUINA"
  },
  {
    "codigo": "3131-30",
    "titulo": "TÉCNICO ELETRICISTA"
  },
  {
    "codigo": "3132-05",
    "titulo": "TÉCNICO DE MANUTENÇÃO ELETRÔNICA"
  },
  {
    "codigo": "3132-10",
    "titulo": "TÉCNICO DE MANUTENÇÃO ELETRÔNICA (CIRCUITOS DE MÁQUINAS COM COMANDO NUMÉRICO)"
  },
  {
    "codigo": "3132-15",
    "titulo": "TÉCNICO ELETRÔNICO"
  },
  {
    "codigo": "3132-20",
    "titulo": "TÉCNICO EM MANUTENÇÃO DE EQUIPAMENTOS DE INFORMÁTICA"
  },
  {
    "codigo": "3133-05",
    "titulo": "TÉCNICO DE COMUNICAÇÃO DE DADOS"
  },
  {
    "codigo": "3133-10",
    "titulo": "TÉCNICO DE REDE (TELECOMUNICAÇÕES)"
  },
  {
    "codigo": "3133-15",
    "titulo": "TÉCNICO DE TELECOMUNICAÇÕES (TELEFONIA)"
  },
  {
    "codigo": "3133-20",
    "titulo": "TÉCNICO DE TRANSMISSÃO (TELECOMUNICAÇÕES)"
  },
  {
    "codigo": "3134-05",
    "titulo": "TÉCNICO EM CALIBRAÇÃO"
  },
  {
    "codigo": "3134-10",
    "titulo": "TÉCNICO EM INSTRUMENTAÇÃO"
  },
  {
    "codigo": "3134-15",
    "titulo": "ENCARREGADO DE MANUTENÇÃO DE INSTRUMENTOS DE CONTROLE, MEDIÇÃO E SIMILARES"
  },
  {
    "codigo": "3135-05",
    "titulo": "TÉCNICO EM FOTÔNICA"
  },
  {
    "codigo": "3141-05",
    "titulo": "TÉCNICO EM MECÂNICA DE PRECISÃO"
  },
  {
    "codigo": "3141-10",
    "titulo": "TÉCNICO MECÂNICO"
  },
  {
    "codigo": "3141-15",
    "titulo": "TÉCNICO MECÂNICO (CALEFAÇÃO, VENTILAÇÃO E REFRIGERAÇÃO)"
  },
  {
    "codigo": "3141-20",
    "titulo": "TÉCNICO MECÂNICO (MÁQUINAS)"
  },
  {
    "codigo": "3141-25",
    "titulo": "TÉCNICO MECÂNICO (MOTORES)"
  },
  {
    "codigo": "3142-05",
    "titulo": "TÉCNICO MECÂNICO NA FABRICAÇÃO DE FERRAMENTAS"
  },
  {
    "codigo": "3142-10",
    "titulo": "TÉCNICO MECÂNICO NA MANUTENÇÃO DE FERRAMENTAS"
  },
  {
    "codigo": "3143-05",
    "titulo": "TÉCNICO EM AUTOMOBILÍSTICA"
  },
  {
    "codigo": "3143-10",
    "titulo": "TÉCNICO MECÂNICO (AERONAVES)"
  },
  {
    "codigo": "3143-15",
    "titulo": "TÉCNICO MECÂNICO (EMBARCAÇÕES)"
  },
  {
    "codigo": "3144-05",
    "titulo": "TÉCNICO DE MANUTENÇÃO DE SISTEMAS E INSTRUMENTOS"
  },
  {
    "codigo": "3144-10",
    "titulo": "TÉCNICO EM MANUTENÇÃO DE MÁQUINAS"
  },
  {
    "codigo": "3146-05",
    "titulo": "INSPETOR DE SOLDAGEM"
  },
  {
    "codigo": "3146-10",
    "titulo": "TÉCNICO EM CALDEIRARIA"
  },
  {
    "codigo": "3146-15",
    "titulo": "TÉCNICO EM ESTRUTURAS METÁLICAS"
  },
  {
    "codigo": "3146-20",
    "titulo": "TÉCNICO EM SOLDAGEM"
  },
  {
    "codigo": "3147-05",
    "titulo": "TÉCNICO DE ACABAMENTO EM SIDERURGIA"
  },
  {
    "codigo": "3147-10",
    "titulo": "TÉCNICO DE ACIARIA EM SIDERURGIA"
  },
  {
    "codigo": "3147-15",
    "titulo": "TÉCNICO DE FUNDIÇÃO EM SIDERURGIA"
  },
  {
    "codigo": "3147-20",
    "titulo": "TÉCNICO DE LAMINAÇÃO EM SIDERURGIA"
  },
  {
    "codigo": "3147-25",
    "titulo": "TÉCNICO DE REDUÇÃO NA SIDERURGIA (PRIMEIRA FUSÃO)"
  },
  {
    "codigo": "3147-30",
    "titulo": "TÉCNICO DE REFRATÁRIO EM SIDERURGIA"
  },
  {
    "codigo": "3161-05",
    "titulo": "TÉCNICO EM GEOFÍSICA"
  },
  {
    "codigo": "3161-10",
    "titulo": "TÉCNICO EM GEOLOGIA"
  },
  {
    "codigo": "3161-15",
    "titulo": "TÉCNICO EM GEOQUÍMICA"
  },
  {
    "codigo": "3161-20",
    "titulo": "TÉCNICO EM GEOTECNIA"
  },
  {
    "codigo": "3163-05",
    "titulo": "TÉCNICO DE MINERAÇÃO"
  },
  {
    "codigo": "3163-10",
    "titulo": "TÉCNICO DE MINERAÇÃO (ÓLEO E PETRÓLEO)"
  },
  {
    "codigo": "3163-15",
    "titulo": "TÉCNICO EM PROCESSAMENTO MINERAL (EXCETO PETRÓLEO)"
  },
  {
    "codigo": "3163-20",
    "titulo": "TÉCNICO EM PESQUISA MINERAL"
  },
  {
    "codigo": "3163-25",
    "titulo": "TÉCNICO DE PRODUÇÃO EM REFINO DE PETRÓLEO"
  },
  {
    "codigo": "3163-30",
    "titulo": "TÉCNICO EM PLANEJAMENTO DE LAVRA DE MINAS"
  },
  {
    "codigo": "3163-35",
    "titulo": "DESINCRUSTADOR (POÇOS DE PETRÓLEO)"
  },
  {
    "codigo": "3163-40",
    "titulo": "CIMENTADOR (POÇOS DE PETRÓLEO)"
  },
  {
    "codigo": "3171-05",
    "titulo": "PROGRAMADOR DE INTERNET"
  },
  {
    "codigo": "3171-10",
    "titulo": "PROGRAMADOR DE SISTEMAS DE INFORMAÇÃO"
  },
  {
    "codigo": "3171-15",
    "titulo": "PROGRAMADOR DE MÁQUINAS - FERRAMENTA COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "3171-20",
    "titulo": "PROGRAMADOR DE MULTIMÍDIA"
  },
  {
    "codigo": "3172-05",
    "titulo": "OPERADOR DE COMPUTADOR (INCLUSIVE MICROCOMPUTADOR)"
  },
  {
    "codigo": "3172-10",
    "titulo": "TÉCNICO DE APOIO AO USUÁRIO DE INFORMÁTICA (HELPDESK)"
  },
  {
    "codigo": "3180-05",
    "titulo": "DESENHISTA TÉCNICO"
  },
  {
    "codigo": "3180-10",
    "titulo": "DESENHISTA COPISTA"
  },
  {
    "codigo": "3180-15",
    "titulo": "DESENHISTA DETALHISTA"
  },
  {
    "codigo": "3181-05",
    "titulo": "DESENHISTA TÉCNICO (ARQUITETURA)"
  },
  {
    "codigo": "3181-10",
    "titulo": "DESENHISTA TÉCNICO (CARTOGRAFIA)"
  },
  {
    "codigo": "3181-15",
    "titulo": "DESENHISTA TÉCNICO (CONSTRUÇÃO CIVIL)"
  },
  {
    "codigo": "3181-20",
    "titulo": "DESENHISTA TÉCNICO (INSTALAÇÕES HIDROSSANITÁRIAS)"
  },
  {
    "codigo": "3182-05",
    "titulo": "DESENHISTA TÉCNICO MECÂNICO"
  },
  {
    "codigo": "3182-10",
    "titulo": "DESENHISTA TÉCNICO AERONÁUTICO"
  },
  {
    "codigo": "3182-15",
    "titulo": "DESENHISTA TÉCNICO NAVAL"
  },
  {
    "codigo": "3183-05",
    "titulo": "DESENHISTA TÉCNICO (ELETRICIDADE E ELETRÔNICA)"
  },
  {
    "codigo": "3183-10",
    "titulo": "DESENHISTA TÉCNICO (CALEFAÇÃO, VENTILAÇÃO E REFRIGERAÇÃO)"
  },
  {
    "codigo": "3184-05",
    "titulo": "DESENHISTA TÉCNICO (ARTES GRÁFICAS)"
  },
  {
    "codigo": "3184-10",
    "titulo": "DESENHISTA TÉCNICO (ILUSTRAÇÕES ARTÍSTICAS)"
  },
  {
    "codigo": "3184-15",
    "titulo": "DESENHISTA TÉCNICO (ILUSTRAÇÕES TÉCNICAS)"
  },
  {
    "codigo": "3184-20",
    "titulo": "DESENHISTA TÉCNICO (INDÚSTRIA TÊXTIL)"
  },
  {
    "codigo": "3184-25",
    "titulo": "DESENHISTA TÉCNICO (MOBILIÁRIO)"
  },
  {
    "codigo": "3184-30",
    "titulo": "DESENHISTA TÉCNICO DE EMBALAGENS, MAQUETES E LEIAUTES"
  },
  {
    "codigo": "3185-05",
    "titulo": "DESENHISTA PROJETISTA DE ARQUITETURA"
  },
  {
    "codigo": "3185-10",
    "titulo": "DESENHISTA PROJETISTA DE CONSTRUÇÃO CIVIL"
  },
  {
    "codigo": "3186-05",
    "titulo": "DESENHISTA PROJETISTA DE MÁQUINAS"
  },
  {
    "codigo": "3186-10",
    "titulo": "DESENHISTA PROJETISTA MECÂNICO"
  },
  {
    "codigo": "3187-05",
    "titulo": "DESENHISTA PROJETISTA DE ELETRICIDADE"
  },
  {
    "codigo": "3187-10",
    "titulo": "DESENHISTA PROJETISTA ELETRÔNICO"
  },
  {
    "codigo": "3188-05",
    "titulo": "PROJETISTA DE MÓVEIS"
  },
  {
    "codigo": "3188-10",
    "titulo": "MODELISTA DE ROUPAS"
  },
  {
    "codigo": "3188-15",
    "titulo": "MODELISTA DE CALÇADOS"
  },
  {
    "codigo": "3191-05",
    "titulo": "TÉCNICO EM CALÇADOS E ARTEFATOS DE COURO"
  },
  {
    "codigo": "3191-10",
    "titulo": "TÉCNICO EM CONFECÇÕES DO VESTUÁRIO"
  },
  {
    "codigo": "3192-05",
    "titulo": "TÉCNICO DO MOBILIÁRIO"
  },
  {
    "codigo": "3201-05",
    "titulo": "TÉCNICO EM BIOTERISMO"
  },
  {
    "codigo": "3201-10",
    "titulo": "TÉCNICO EM HISTOLOGIA"
  },
  {
    "codigo": "3211-05",
    "titulo": "TÉCNICO AGRÍCOLA"
  },
  {
    "codigo": "3211-10",
    "titulo": "TÉCNICO AGROPECUÁRIO"
  },
  {
    "codigo": "3212-05",
    "titulo": "TÉCNICO EM MADEIRA"
  },
  {
    "codigo": "3212-10",
    "titulo": "TÉCNICO FLORESTAL"
  },
  {
    "codigo": "3213-05",
    "titulo": "TÉCNICO EM PISCICULTURA"
  },
  {
    "codigo": "3213-10",
    "titulo": "TÉCNICO EM CARCINICULTURA"
  },
  {
    "codigo": "3213-15",
    "titulo": "TÉCNICO EM MITILICULTURA"
  },
  {
    "codigo": "3213-20",
    "titulo": "TÉCNICO EM RANICULTURA"
  },
  {
    "codigo": "3221-05",
    "titulo": "TÉCNICO EM ACUPUNTURA"
  },
  {
    "codigo": "3221-10",
    "titulo": "PODÓLOGO"
  },
  {
    "codigo": "3221-15",
    "titulo": "TÉCNICO EM QUIROPRAXIA"
  },
  {
    "codigo": "3221-20",
    "titulo": "MASSOTERAPEUTA"
  },
  {
    "codigo": "3221-25",
    "titulo": "TERAPEUTA HOLÍSTICO"
  },
  {
    "codigo": "3222-05",
    "titulo": "TÉCNICO DE ENFERMAGEM"
  },
  {
    "codigo": "3222-10",
    "titulo": "TÉCNICO DE ENFERMAGEM DE TERAPIA INTENSIVA"
  },
  {
    "codigo": "3222-15",
    "titulo": "TÉCNICO DE ENFERMAGEM DO TRABALHO"
  },
  {
    "codigo": "3222-20",
    "titulo": "TÉCNICO DE ENFERMAGEM PSIQUIÁTRICA"
  },
  {
    "codigo": "3222-25",
    "titulo": "INSTRUMENTADOR CIRÚRGICO"
  },
  {
    "codigo": "3222-30",
    "titulo": "AUXILIAR DE ENFERMAGEM"
  },
  {
    "codigo": "3222-35",
    "titulo": "AUXILIAR DE ENFERMAGEM DO TRABALHO"
  },
  {
    "codigo": "3222-40",
    "titulo": "AUXILIAR DE SAÚDE (NAVEGAÇÃO MARÍTIMA)"
  },
  {
    "codigo": "3223-05",
    "titulo": "TÉCNICO EM ÓPTICA E OPTOMETRIA"
  },
  {
    "codigo": "3224-05",
    "titulo": "TÉCNICO EM HIGIENE DENTAL"
  },
  {
    "codigo": "3224-10",
    "titulo": "PROTÉTICO DENTÁRIO"
  },
  {
    "codigo": "3224-15",
    "titulo": "ATENDENTE DE CONSULTÓRIO DENTÁRIO"
  },
  {
    "codigo": "3224-20",
    "titulo": "AUXILIAR DE PRÓTESE DENTÁRIA"
  },
  {
    "codigo": "3225-05",
    "titulo": "TÉCNICO DE ORTOPEDIA"
  },
  {
    "codigo": "3226-05",
    "titulo": "TÉCNICO DE IMOBILIZAÇÃO ORTOPÉDICA"
  },
  {
    "codigo": "3231-05",
    "titulo": "TÉCNICO EM PECUÁRIA"
  },
  {
    "codigo": "3241-05",
    "titulo": "TÉCNICO EM MÉTODOS ELETROGRÁFICOS EM ENCEFALOGRAFIA"
  },
  {
    "codigo": "3241-10",
    "titulo": "TÉCNICO EM MÉTODOS GRÁFICOS EM CARDIOLOGIA"
  },
  {
    "codigo": "3241-15",
    "titulo": "TÉCNICO EM RADIOLOGIA E IMAGENOLOGIA"
  },
  {
    "codigo": "3242-05",
    "titulo": "TÉCNICO EM PATOLOGIA CLÍNICA"
  },
  {
    "codigo": "3242-10",
    "titulo": "AUXILIAR TÉCNICO EM PATOLOGIA CLÍNICA"
  },
  {
    "codigo": "3250-05",
    "titulo": "ENÓLOGO"
  },
  {
    "codigo": "3250-10",
    "titulo": "AROMISTA"
  },
  {
    "codigo": "3250-15",
    "titulo": "PERFUMISTA"
  },
  {
    "codigo": "3251-05",
    "titulo": "AUXILIAR TÉCNICO EM LABORATÓRIO DE FARMÁCIA"
  },
  {
    "codigo": "3251-10",
    "titulo": "TÉCNICO EM LABORATÓRIO DE FARMÁCIA"
  },
  {
    "codigo": "3251-15",
    "titulo": "TÉCNICO EM FARMÁCIA"
  },
  {
    "codigo": "3252-05",
    "titulo": "TÉCNICO DE ALIMENTOS"
  },
  {
    "codigo": "3252-10",
    "titulo": "TÉCNICO EM NUTRIÇÃO E DIETÉTICA"
  },
  {
    "codigo": "3253-05",
    "titulo": "TÉCNICO EM BIOTECNOLOGIA"
  },
  {
    "codigo": "3253-10",
    "titulo": "TÉCNICO EM IMUNOBIOLÓGICOS"
  },
  {
    "codigo": "3281-05",
    "titulo": "EMBALSAMADOR"
  },
  {
    "codigo": "3281-10",
    "titulo": "TAXIDERMISTA"
  },
  {
    "codigo": "3311-05",
    "titulo": "PROFESSOR DE NÍVEL MÉDIO NA EDUCAÇÃO INFANTIL"
  },
  {
    "codigo": "3311-10",
    "titulo": "AUXILIAR DE DESENVOLVIMENTO INFANTIL"
  },
  {
    "codigo": "3312-05",
    "titulo": "PROFESSOR DE NÍVEL MÉDIO NO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "3313-05",
    "titulo": "PROFESSOR DE NÍVEL MÉDIO NO ENSINO PROFISSIONALIZANTE"
  },
  {
    "codigo": "3321-05",
    "titulo": "PROFESSOR LEIGO NO ENSINO FUNDAMENTAL"
  },
  {
    "codigo": "3322-05",
    "titulo": "PROFESSOR PRÁTICO NO ENSINO PROFISSIONALIZANTE"
  },
  {
    "codigo": "3331-05",
    "titulo": "INSTRUTOR DE AUTO-ESCOLA"
  },
  {
    "codigo": "3331-10",
    "titulo": "INSTRUTOR DE CURSOS LIVRES"
  },
  {
    "codigo": "3331-15",
    "titulo": "PROFESSORES DE CURSOS LIVRES"
  },
  {
    "codigo": "3341-05",
    "titulo": "INSPETOR DE ALUNOS DE ESCOLA PRIVADA"
  },
  {
    "codigo": "3341-10",
    "titulo": "INSPETOR DE ALUNOS DE ESCOLA PÚBLICA"
  },
  {
    "codigo": "3411-05",
    "titulo": "PILOTO COMERCIAL (EXCETO LINHAS AÉREAS)"
  },
  {
    "codigo": "3411-10",
    "titulo": "PILOTO COMERCIAL DE HELICÓPTERO (EXCETO LINHAS AÉREAS)"
  },
  {
    "codigo": "3411-15",
    "titulo": "MECÂNICO DE VÔO"
  },
  {
    "codigo": "3411-20",
    "titulo": "PILOTO AGRÍCOLA"
  },
  {
    "codigo": "3412-05",
    "titulo": "CONTRAMESTRE DE CABOTAGEM"
  },
  {
    "codigo": "3412-10",
    "titulo": "MESTRE DE CABOTAGEM"
  },
  {
    "codigo": "3412-15",
    "titulo": "MESTRE FLUVIAL"
  },
  {
    "codigo": "3412-20",
    "titulo": "PATRÃO DE PESCA DE ALTO-MAR"
  },
  {
    "codigo": "3412-25",
    "titulo": "PATRÃO DE PESCA NA NAVEGAÇÃO INTERIOR"
  },
  {
    "codigo": "3412-30",
    "titulo": "PILOTO FLUVIAL"
  },
  {
    "codigo": "3413-05",
    "titulo": "CONDUTOR MAQUINISTA FLUVIAL"
  },
  {
    "codigo": "3413-10",
    "titulo": "CONDUTOR MAQUINISTA MARÍTIMO"
  },
  {
    "codigo": "3413-15",
    "titulo": "ELETRICISTA DE BORDO"
  },
  {
    "codigo": "3421-05",
    "titulo": "ANALISTA DE TRANSPORTE EM COMÉRCIO EXTERIOR"
  },
  {
    "codigo": "3421-10",
    "titulo": "OPERADOR DE TRANSPORTE MULTIMODAL"
  },
  {
    "codigo": "3421-15",
    "titulo": "CONTROLADOR DE SERVIÇOS DE MÁQUINAS E VE��CULOS"
  },
  {
    "codigo": "3421-20",
    "titulo": "AFRETADOR"
  },
  {
    "codigo": "3422-05",
    "titulo": "AJUDANTE DE DESPACHANTE ADUANEIRO"
  },
  {
    "codigo": "3422-10",
    "titulo": "DESPACHANTE ADUANEIRO"
  },
  {
    "codigo": "3423-05",
    "titulo": "CHEFE DE SERVIÇO DE TRANSPORTE RODOVIÁRIO (PASSAGEIROS E CARGAS)"
  },
  {
    "codigo": "3423-10",
    "titulo": "INSPETOR DE SERVIÇOS DE TRANSPORTES RODOVIÁRIOS (PASSAGEIROS E CARGAS)"
  },
  {
    "codigo": "3423-15",
    "titulo": "SUPERVISOR DE CARGA E DESCARGA"
  },
  {
    "codigo": "3424-05",
    "titulo": "AGENTE DE ESTAÇÃO (FERROVIA E METRÔ)"
  },
  {
    "codigo": "3424-10",
    "titulo": "OPERADOR DE CENTRO DE CONTROLE (FERROVIA E METRÔ)"
  },
  {
    "codigo": "3425-05",
    "titulo": "CONTROLADOR DE TRÁFEGO AÉREO"
  },
  {
    "codigo": "3425-10",
    "titulo": "DESPACHANTE OPERACIONAL DE VÔO"
  },
  {
    "codigo": "3425-15",
    "titulo": "FISCAL DE AVIAÇÃO CIVIL (FAC)"
  },
  {
    "codigo": "3425-20",
    "titulo": "GERENTE DA ADMINISTRAÇÃO DE AEROPORTOS"
  },
  {
    "codigo": "3425-25",
    "titulo": "GERENTE DE EMPRESA AÉREA EM AEROPORTOS"
  },
  {
    "codigo": "3425-30",
    "titulo": "INSPETOR DE AVIAÇÃO CIVIL"
  },
  {
    "codigo": "3425-35",
    "titulo": "OPERADOR DE ATENDIMENTO AEROVIÁRIO"
  },
  {
    "codigo": "3425-40",
    "titulo": "SUPERVISOR DA ADMINISTRAÇÃO DE AEROPORTOS"
  },
  {
    "codigo": "3425-45",
    "titulo": "SUPERVISOR DE EMPRESA AÉREA EM AEROPORTOS"
  },
  {
    "codigo": "3426-05",
    "titulo": "CHEFE DE ESTAÇÃO PORTUÁRIA"
  },
  {
    "codigo": "3426-10",
    "titulo": "SUPERVISOR DE OPERAÇÕES PORTUÁRIAS"
  },
  {
    "codigo": "3511-05",
    "titulo": "TÉCNICO DE CONTABILIDADE"
  },
  {
    "codigo": "3511-10",
    "titulo": "CHEFE DE CONTABILIDADE (TÉCNICO)"
  },
  {
    "codigo": "3511-15",
    "titulo": "CONSULTOR CONTÁBIL (TÉCNICO)"
  },
  {
    "codigo": "3513-05",
    "titulo": "TÉCNICO EM ADMINISTRAÇÃO"
  },
  {
    "codigo": "3513-10",
    "titulo": "TÉCNICO EM ADMINISTRAÇÃO DE COMÉRCIO EXTERIOR"
  },
  {
    "codigo": "3513-15",
    "titulo": "AGENTE DE RECRUTAMENTO E SELEÇÃO"
  },
  {
    "codigo": "3514-05",
    "titulo": "ESCREVENTE"
  },
  {
    "codigo": "3514-10",
    "titulo": "ESCRIVÃO JUDICIAL"
  },
  {
    "codigo": "3514-15",
    "titulo": "ESCRIVÃO EXTRA - JUDICIAL"
  },
  {
    "codigo": "3514-20",
    "titulo": "ESCRIVÃO DE POLÍCIA"
  },
  {
    "codigo": "3514-25",
    "titulo": "OFICIAL DE JUSTIÇA"
  },
  {
    "codigo": "3514-30",
    "titulo": "AUXILIAR DE SERVIÇOS JURÍDICOS"
  },
  {
    "codigo": "3515-05",
    "titulo": "TÉCNICO EM SECRETARIADO"
  },
  {
    "codigo": "3515-10",
    "titulo": "TAQUÍGRAFO"
  },
  {
    "codigo": "3515-15",
    "titulo": "ESTENOTIPISTA"
  },
  {
    "codigo": "3516-05",
    "titulo": "TÉCNICO EM SEGURANÇA NO TRABALHO"
  },
  {
    "codigo": "3517-05",
    "titulo": "ANALISTA DE SEGUROS (TÉCNICO)"
  },
  {
    "codigo": "3517-10",
    "titulo": "ANALISTA DE SINISTROS"
  },
  {
    "codigo": "3517-15",
    "titulo": "ASSISTENTE COMERCIAL DE SEGUROS"
  },
  {
    "codigo": "3517-20",
    "titulo": "ASSISTENTE TÉCNICO DE SEGUROS"
  },
  {
    "codigo": "3517-25",
    "titulo": "INSPETOR DE RISCO"
  },
  {
    "codigo": "3517-30",
    "titulo": "INSPETOR DE SINISTROS"
  },
  {
    "codigo": "3517-35",
    "titulo": "TÉCNICO DE RESSEGUROS"
  },
  {
    "codigo": "3517-40",
    "titulo": "TÉCNICO DE SEGUROS"
  },
  {
    "codigo": "3518-05",
    "titulo": "DETETIVE PROFISSIONAL"
  },
  {
    "codigo": "3518-10",
    "titulo": "INVESTIGADOR DE POLÍCIA"
  },
  {
    "codigo": "3518-15",
    "titulo": "PAPILOSCOPISTA POLICIAL"
  },
  {
    "codigo": "3522-05",
    "titulo": "AGENTE DE DEFESA AMBIENTAL"
  },
  {
    "codigo": "3522-10",
    "titulo": "AGENTE DE SAÚDE PÚBLICA"
  },
  {
    "codigo": "3523-05",
    "titulo": "METROLOGISTA"
  },
  {
    "codigo": "3523-10",
    "titulo": "AGENTE FISCAL DE QUALIDADE"
  },
  {
    "codigo": "3523-15",
    "titulo": "AGENTE FISCAL METROLÓGICO"
  },
  {
    "codigo": "3523-20",
    "titulo": "AGENTE FISCAL TÊXTIL"
  },
  {
    "codigo": "3524-05",
    "titulo": "AGENTE DE DIREITOS AUTORAIS"
  },
  {
    "codigo": "3524-10",
    "titulo": "AVALIADOR DE PRODUTOS DO MEIO DE COMUNICAÇÃO"
  },
  {
    "codigo": "3524-15",
    "titulo": "OUVIDOR (OMBUDSMAN) DO MEIO DE COMUNICAÇÃO"
  },
  {
    "codigo": "3524-20",
    "titulo": "TÉCNICO EM DIREITOS AUTORAIS"
  },
  {
    "codigo": "3532-05",
    "titulo": "TÉCNICO DE OPERAÇÕES E SERVIÇOS BANCÁRIOS - CÂMBIO"
  },
  {
    "codigo": "3532-10",
    "titulo": "TÉCNICO DE OPERAÇÕES E SERVIÇOS BANCÁRIOS - CRÉDITO IMOBILIÁRIO"
  },
  {
    "codigo": "3532-15",
    "titulo": "TÉCNICO DE OPERAÇÕES E SERVIÇOS BANCÁRIOS - CRÉDITO RURAL"
  },
  {
    "codigo": "3532-20",
    "titulo": "TÉCNICO DE OPERAÇÕES E SERVIÇOS BANCÁRIOS - LEASING"
  },
  {
    "codigo": "3532-25",
    "titulo": "TÉCNICO DE OPERAÇÕES E SERVIÇOS BANCÁRIOS - RENDA FIXA E VARIÁVEL"
  },
  {
    "codigo": "3532-30",
    "titulo": "TESOUREIRO DE BANCO"
  },
  {
    "codigo": "3532-35",
    "titulo": "CHEFE DE SERVIÇOS BANCÁRIOS"
  },
  {
    "codigo": "3541-10",
    "titulo": "AGENCIADOR DE PROPAGANDA"
  },
  {
    "codigo": "3541-20",
    "titulo": "AGENTE DE VENDAS DE SERVIÇOS"
  },
  {
    "codigo": "3541-25",
    "titulo": "ASSISTENTE DE VENDAS"
  },
  {
    "codigo": "3541-30",
    "titulo": "PROMOTOR DE VENDAS ESPECIALIZADO"
  },
  {
    "codigo": "3541-35",
    "titulo": "TÉCNICO DE VENDAS"
  },
  {
    "codigo": "3541-40",
    "titulo": "TÉCNICO EM ATENDIMENTO E VENDAS"
  },
  {
    "codigo": "3541-45",
    "titulo": "VENDEDOR PRACISTA"
  },
  {
    "codigo": "3542-05",
    "titulo": "COMPRADOR"
  },
  {
    "codigo": "3542-10",
    "titulo": "SUPERVISOR DE COMPRAS"
  },
  {
    "codigo": "3543-05",
    "titulo": "ANALISTA DE EXPORTAÇÃO E IMPORTAÇÃO"
  },
  {
    "codigo": "3544-05",
    "titulo": "LEILOEIRO"
  },
  {
    "codigo": "3544-10",
    "titulo": "AVALIADOR DE IMÓVEIS"
  },
  {
    "codigo": "3544-15",
    "titulo": "AVALIADOR DE BENS MÓVEIS"
  },
  {
    "codigo": "3545-05",
    "titulo": "CORRETOR DE SEGUROS"
  },
  {
    "codigo": "3546-05",
    "titulo": "CORRETOR DE IMÓVEIS"
  },
  {
    "codigo": "3547-05",
    "titulo": "REPRESENTANTE COMERCIAL AUTÔNOMO"
  },
  {
    "codigo": "3548-05",
    "titulo": "TÉCNICO EM TURISMO"
  },
  {
    "codigo": "3548-10",
    "titulo": "OPERADOR DE TURISMO"
  },
  {
    "codigo": "3548-15",
    "titulo": "AGENTE DE VIAGEM"
  },
  {
    "codigo": "3548-20",
    "titulo": "ORGANIZADOR DE EVENTO"
  },
  {
    "codigo": "3711-05",
    "titulo": "AUXILIAR DE BIBLIOTECA"
  },
  {
    "codigo": "3711-10",
    "titulo": "T��CNICO EM BIBLIOTECONOMIA"
  },
  {
    "codigo": "3712-05",
    "titulo": "COLECIONADOR DE SELOS E MOEDAS"
  },
  {
    "codigo": "3712-10",
    "titulo": "TÉCNICO EM MUSEOLOGIA"
  },
  {
    "codigo": "3713-05",
    "titulo": "TÉCNICO EM PROGRAMAÇÃO VISUAL"
  },
  {
    "codigo": "3713-10",
    "titulo": "TÉCNICO GRÁFICO"
  },
  {
    "codigo": "3714-05",
    "titulo": "RECREADOR DE ACANTONAMENTO"
  },
  {
    "codigo": "3714-10",
    "titulo": "RECREADOR"
  },
  {
    "codigo": "3721-05",
    "titulo": "DIRETOR DE FOTOGRAFIA"
  },
  {
    "codigo": "3721-10",
    "titulo": "ILUMINADOR (TELEVISÃO)"
  },
  {
    "codigo": "3721-15",
    "titulo": "OPERADOR DE CÂMERA DE TELEVISÃO"
  },
  {
    "codigo": "3722-05",
    "titulo": "OPERADOR DE REDE DE TELEPROCESSAMENTO"
  },
  {
    "codigo": "3722-10",
    "titulo": "RADIOTELEGRAFISTA"
  },
  {
    "codigo": "3731-05",
    "titulo": "OPERADOR DE ÁUDIO DE CONTINUIDADE (RÁDIO)"
  },
  {
    "codigo": "3731-10",
    "titulo": "OPERADOR DE CENTRAL DE RÁDIO"
  },
  {
    "codigo": "3731-15",
    "titulo": "OPERADOR DE EXTERNA (RÁDIO)"
  },
  {
    "codigo": "3731-20",
    "titulo": "OPERADOR DE GRAVAÇÃO DE RÁDIO"
  },
  {
    "codigo": "3731-25",
    "titulo": "OPERADOR DE TRANSMISSOR DE RÁDIO"
  },
  {
    "codigo": "3732-05",
    "titulo": "TÉCNICO EM OPERAÇÃO DE EQUIPAMENTOS DE PRODUÇÃO PARA TELEVISÃO E PRODUTORAS DE VÍDEO"
  },
  {
    "codigo": "3732-10",
    "titulo": "TÉCNICO EM OPERAÇÃO DE EQUIPAMENTO DE EXIBIÇÃO DE TELEVISÃO"
  },
  {
    "codigo": "3732-15",
    "titulo": "TÉCNICO EM OPERAÇÃO DE EQUIPAMENTOS DE TRANSMISSÃO/RECEPÇÃO DE TELEVISÃO"
  },
  {
    "codigo": "3732-20",
    "titulo": "SUPERVISOR TÉCNICO OPERACIONAL DE SISTEMAS DE TELEVISÃO E PRODUTORAS DE VÍDEO"
  },
  {
    "codigo": "3741-05",
    "titulo": "TÉCNICO EM GRAVAÇÃO DE ÁUDIO"
  },
  {
    "codigo": "3741-10",
    "titulo": "TÉCNICO EM INSTALAÇÃO DE EQUIPAMENTOS DE ÁUDIO"
  },
  {
    "codigo": "3741-15",
    "titulo": "TÉCNICO EM MASTERIZAÇÃO DE ÁUDIO"
  },
  {
    "codigo": "3741-20",
    "titulo": "PROJETISTA DE SOM"
  },
  {
    "codigo": "3741-25",
    "titulo": "TÉCNICO EM SONORIZAÇÃO"
  },
  {
    "codigo": "3741-30",
    "titulo": "TÉCNICO EM MIXAGEM DE ÁUDIO"
  },
  {
    "codigo": "3741-35",
    "titulo": "PROJETISTA DE SISTEMAS DE ÁUDIO"
  },
  {
    "codigo": "3741-40",
    "titulo": "MICROFONISTA"
  },
  {
    "codigo": "3742-05",
    "titulo": "CENOTÉCNICO (CINEMA, VÍDEO, TELEVISÃO, TEATRO E ESPETÁCULOS)"
  },
  {
    "codigo": "3742-10",
    "titulo": "MAQUINISTA DE CINEMA E VÍDEO"
  },
  {
    "codigo": "3742-15",
    "titulo": "MAQUINISTA DE TEATRO E ESPETÁCULOS"
  },
  {
    "codigo": "3743-05",
    "titulo": "OPERADOR DE PROJETOR CINEMATOGRÁFICO"
  },
  {
    "codigo": "3743-10",
    "titulo": "OPERADOR-MANTENEDOR DE PROJETOR CINEMATOGRÁFICO"
  },
  {
    "codigo": "3744-05",
    "titulo": "EDITOR DE TV E VÍDEO"
  },
  {
    "codigo": "3744-10",
    "titulo": "FINALIZADOR DE FILMES"
  },
  {
    "codigo": "3744-15",
    "titulo": "FINALIZADOR DE VÍDEO"
  },
  {
    "codigo": "3744-20",
    "titulo": "MONTADOR DE FILMES"
  },
  {
    "codigo": "3751-05",
    "titulo": "DESIGNER DE INTERIORES"
  },
  {
    "codigo": "3751-10",
    "titulo": "DESIGNER DE VITRINES"
  },
  {
    "codigo": "3751-15",
    "titulo": "VISUAL MERCHANDISER"
  },
  {
    "codigo": "3761-05",
    "titulo": "DANÇARINO TRADICIONAL"
  },
  {
    "codigo": "3761-10",
    "titulo": "DANÇARINO POPULAR"
  },
  {
    "codigo": "3762-05",
    "titulo": "ACROBATA"
  },
  {
    "codigo": "3762-10",
    "titulo": "ARTISTA AÉREO"
  },
  {
    "codigo": "3762-15",
    "titulo": "ARTISTA DE CIRCO (OUTROS)"
  },
  {
    "codigo": "3762-20",
    "titulo": "CONTORCIONISTA"
  },
  {
    "codigo": "3762-25",
    "titulo": "DOMADOR DE ANIMAIS (CIRCENSE)"
  },
  {
    "codigo": "3762-30",
    "titulo": "EQUILIBRISTA"
  },
  {
    "codigo": "3762-35",
    "titulo": "MÁGICO"
  },
  {
    "codigo": "3762-40",
    "titulo": "MALABARISTA"
  },
  {
    "codigo": "3762-45",
    "titulo": "PALHAÇO"
  },
  {
    "codigo": "3762-50",
    "titulo": "TITERITEIRO"
  },
  {
    "codigo": "3762-55",
    "titulo": "TRAPEZISTA"
  },
  {
    "codigo": "3763-05",
    "titulo": "APRESENTADOR DE EVENTOS"
  },
  {
    "codigo": "3763-10",
    "titulo": "APRESENTADOR DE FESTAS POPULARES"
  },
  {
    "codigo": "3763-15",
    "titulo": "APRESENTADOR DE PROGRAMAS DE RÁDIO"
  },
  {
    "codigo": "3763-20",
    "titulo": "APRESENTADOR DE PROGRAMAS DE TELEVISÃO"
  },
  {
    "codigo": "3763-25",
    "titulo": "APRESENTADOR DE CIRCO"
  },
  {
    "codigo": "3764-05",
    "titulo": "MODELO ARTÍSTICO"
  },
  {
    "codigo": "3764-10",
    "titulo": "MODELO DE MODAS"
  },
  {
    "codigo": "3764-15",
    "titulo": "MODELO PUBLICITÁRIO"
  },
  {
    "codigo": "3771-05",
    "titulo": "ATLETA PROFISSIONAL (OUTRAS MODALIDADES)"
  },
  {
    "codigo": "3771-10",
    "titulo": "ATLETA PROFISSIONAL DE FUTEBOL"
  },
  {
    "codigo": "3771-15",
    "titulo": "ATLETA PROFISSIONAL DE GOLFE"
  },
  {
    "codigo": "3771-20",
    "titulo": "ATLETA PROFISSIONAL DE LUTA"
  },
  {
    "codigo": "3771-25",
    "titulo": "ATLETA PROFISSIONAL DE TÊNIS"
  },
  {
    "codigo": "3771-30",
    "titulo": "JÓQUEI"
  },
  {
    "codigo": "3771-35",
    "titulo": "PILOTO DE COMPETIÇÃO AUTOMOBILÍSTICA"
  },
  {
    "codigo": "3771-40",
    "titulo": "PROFISSIONAL DE ATLETISMO"
  },
  {
    "codigo": "3771-45",
    "titulo": "PUGILISTA"
  },
  {
    "codigo": "3911-05",
    "titulo": "CRONOANALISTA"
  },
  {
    "codigo": "3911-10",
    "titulo": "CRONOMETRISTA"
  },
  {
    "codigo": "3911-15",
    "titulo": "CONTROLADOR DE ENTRADA E SAÍDA"
  },
  {
    "codigo": "3911-20",
    "titulo": "PLANEJISTA"
  },
  {
    "codigo": "3911-25",
    "titulo": "TÉCNICO DE PLANEJAMENTO DE PRODUÇÃO"
  },
  {
    "codigo": "3911-30",
    "titulo": "TÉCNICO DE PLANEJAMENTO E PROGRAMAÇÃO DA MANUTENÇÃO"
  },
  {
    "codigo": "3911-35",
    "titulo": "TÉCNICO DE MATÉRIA-PRIMA E MATERIAL"
  },
  {
    "codigo": "3912-05",
    "titulo": "INSPETOR DE QUALIDADE"
  },
  {
    "codigo": "3912-10",
    "titulo": "TÉCNICO DE GARANTIA DA QUALIDADE"
  },
  {
    "codigo": "3912-15",
    "titulo": "OPERADOR DE INSPEÇÃO DE QUALIDADE"
  },
  {
    "codigo": "3912-20",
    "titulo": "TÉCNICO DE PAINEL DE CONTROLE"
  },
  {
    "codigo": "3912-25",
    "titulo": "ESCOLHEDOR DE PAPEL"
  },
  {
    "codigo": "3912-30",
    "titulo": "TÉCNICO OPERACIONAL DE SERVIÇOS DE CORREIOS"
  },
  {
    "codigo": "3951-05",
    "titulo": "TÉCNICO DE APOIO EM PESQUISA E DESENVOLVIMENTO (EXCETO AGROPECUÁRIO E FLORESTAL)"
  },
  {
    "codigo": "3951-10",
    "titulo": "TÉCNICO DE APOIO EM PESQUISA E DESENVOLVIMENTO AGROPECUÁRIO FLORESTAL"
  },
  {
    "codigo": "4101-05",
    "titulo": "SUPERVISOR ADMINISTRATIVO"
  },
  {
    "codigo": "4102-05",
    "titulo": "SUPERVISOR DE ALMOXARIFADO"
  },
  {
    "codigo": "4102-10",
    "titulo": "SUPERVISOR DE CÂMBIO"
  },
  {
    "codigo": "4102-15",
    "titulo": "SUPERVISOR DE CONTAS A PAGAR"
  },
  {
    "codigo": "4102-20",
    "titulo": "SUPERVISOR DE CONTROLE PATRIMONIAL"
  },
  {
    "codigo": "4102-25",
    "titulo": "SUPERVISOR DE CRÉDITO E COBRANÇA"
  },
  {
    "codigo": "4102-30",
    "titulo": "SUPERVISOR DE ORÇAMENTO"
  },
  {
    "codigo": "4102-35",
    "titulo": "SUPERVISOR DE TESOURARIA"
  },
  {
    "codigo": "4110-05",
    "titulo": "AUXILIAR DE ESCRITÓRIO, EM GERAL"
  },
  {
    "codigo": "4110-10",
    "titulo": "ASSISTENTE ADMINISTRATIVO"
  },
  {
    "codigo": "4110-15",
    "titulo": "ATENDENTE DE JUDICIÁRIO"
  },
  {
    "codigo": "4110-20",
    "titulo": "AUXILIAR DE JUDICIÁRIO"
  },
  {
    "codigo": "4110-25",
    "titulo": "AUXILIAR DE CARTÓRIO"
  },
  {
    "codigo": "4110-30",
    "titulo": "AUXILIAR DE PESSOAL"
  },
  {
    "codigo": "4110-35",
    "titulo": "AUXILIAR DE ESTATÍSTICA"
  },
  {
    "codigo": "4110-40",
    "titulo": "AUXILIAR DE SEGUROS"
  },
  {
    "codigo": "4110-45",
    "titulo": "AUXILIAR DE SERVIÇOS DE IMPORTAÇÃO E EXPORTAÇÃO"
  },
  {
    "codigo": "4121-05",
    "titulo": "DATILÓGRAFO"
  },
  {
    "codigo": "4121-10",
    "titulo": "DIGITADOR"
  },
  {
    "codigo": "4121-15",
    "titulo": "OPERADOR DE MENSAGENS DE TELECOMUNICAÇÕES (CORREIOS)"
  },
  {
    "codigo": "4121-20",
    "titulo": "SUPERVISOR DE DIGITAÇÃO E OPERAÇÃO"
  },
  {
    "codigo": "4122-05",
    "titulo": "CONTÍNUO"
  },
  {
    "codigo": "4131-05",
    "titulo": "ANALISTA DE FOLHA DE PAGAMENTO"
  },
  {
    "codigo": "4131-10",
    "titulo": "AUXILIAR DE CONTABILIDADE"
  },
  {
    "codigo": "4131-15",
    "titulo": "AUXILIAR DE FATURAMENTO"
  },
  {
    "codigo": "4132-05",
    "titulo": "ATENDENTE DE AGÊNCIA"
  },
  {
    "codigo": "4132-10",
    "titulo": "CAIXA DE BANCO"
  },
  {
    "codigo": "4132-15",
    "titulo": "COMPENSADOR DE BANCO"
  },
  {
    "codigo": "4132-20",
    "titulo": "CONFERENTE DE SERVIÇOS BANCÁRIOS"
  },
  {
    "codigo": "4132-25",
    "titulo": "ESCRITURÁRIO DE BANCO"
  },
  {
    "codigo": "4132-30",
    "titulo": "OPERADOR DE COBRANÇA BANCÁRIA"
  },
  {
    "codigo": "4141-05",
    "titulo": "ALMOXARIFE"
  },
  {
    "codigo": "4141-10",
    "titulo": "ARMAZENISTA"
  },
  {
    "codigo": "4141-15",
    "titulo": "BALANCEIRO"
  },
  {
    "codigo": "4142-05",
    "titulo": "APONTADOR DE MÃO-DE-OBRA"
  },
  {
    "codigo": "4142-10",
    "titulo": "APONTADOR DE PRODUÇÃO"
  },
  {
    "codigo": "4142-15",
    "titulo": "CONFERENTE DE CARGA E DESCARGA"
  },
  {
    "codigo": "4151-05",
    "titulo": "ARQUIVISTA DE DOCUMENTOS"
  },
  {
    "codigo": "4151-15",
    "titulo": "CODIFICADOR DE DADOS"
  },
  {
    "codigo": "4151-20",
    "titulo": "FITOTECÁRIO"
  },
  {
    "codigo": "4151-25",
    "titulo": "KARDEXISTA"
  },
  {
    "codigo": "4151-30",
    "titulo": "OPERADOR DE MÁQUINA COPIADORA (EXCETO OPERADOR DE GRÁFICA RÁPIDA)"
  },
  {
    "codigo": "4152-05",
    "titulo": "CARTEIRO"
  },
  {
    "codigo": "4152-10",
    "titulo": "OPERADOR DE TRIAGEM E TRANSBORDO"
  },
  {
    "codigo": "4201-05",
    "titulo": "SUPERVISOR DE CAIXAS E BILHETEIROS (EXCETO CAIXA DE BANCO)"
  },
  {
    "codigo": "4201-10",
    "titulo": "SUPERVISOR DE COBRANÇA"
  },
  {
    "codigo": "4201-15",
    "titulo": "SUPERVISOR DE COLETADORES DE APOSTAS E DE JOGOS"
  },
  {
    "codigo": "4201-20",
    "titulo": "SUPERVISOR DE ENTREVISTADORES E RECENSEADORES"
  },
  {
    "codigo": "4201-25",
    "titulo": "SUPERVISOR DE RECEPCIONISTAS"
  },
  {
    "codigo": "4201-30",
    "titulo": "SUPERVISOR DE TELEFONISTAS"
  },
  {
    "codigo": "4201-35",
    "titulo": "SUPERVISOR DE TELEMARKETING E ATENDIMENTO"
  },
  {
    "codigo": "4211-05",
    "titulo": "ATENDENTE COMERCIAL (AGÊNCIA POSTAL)"
  },
  {
    "codigo": "4211-10",
    "titulo": "BILHETEIRO DE TRANSPORTES COLETIVOS"
  },
  {
    "codigo": "4211-15",
    "titulo": "BILHETEIRO NO SERVIÇO DE DIVERSÕES"
  },
  {
    "codigo": "4211-20",
    "titulo": "EMISSOR DE PASSAGENS"
  },
  {
    "codigo": "4211-25",
    "titulo": "OPERADOR DE CAIXA"
  },
  {
    "codigo": "4212-05",
    "titulo": "RECEBEDOR DE APOSTAS (LOTERIA)"
  },
  {
    "codigo": "4212-10",
    "titulo": "RECEBEDOR DE APOSTAS (TURFE)"
  },
  {
    "codigo": "4213-05",
    "titulo": "COBRADOR EXTERNO"
  },
  {
    "codigo": "4213-10",
    "titulo": "COBRADOR INTERNO"
  },
  {
    "codigo": "4213-15",
    "titulo": "LOCALIZADOR (COBRADOR)"
  },
  {
    "codigo": "4221-05",
    "titulo": "RECEPCIONISTA, EM GERAL"
  },
  {
    "codigo": "4221-10",
    "titulo": "RECEPCIONISTA DE CONSULTÓRIO MÉDICO OU DENTÁRIO"
  },
  {
    "codigo": "4221-15",
    "titulo": "RECEPCIONISTA DE SEGURO SAÚDE"
  },
  {
    "codigo": "4221-20",
    "titulo": "RECEPCIONISTA DE HOTEL"
  },
  {
    "codigo": "4221-25",
    "titulo": "RECEPCIONISTA DE BANCO"
  },
  {
    "codigo": "4222-05",
    "titulo": "TELEFONISTA"
  },
  {
    "codigo": "4222-10",
    "titulo": "TELEOPERADOR"
  },
  {
    "codigo": "4222-15",
    "titulo": "MONITOR DE TELEATENDIMENTO"
  },
  {
    "codigo": "4222-20",
    "titulo": "OPERADOR DE RÁDIO-CHAMADA"
  },
  {
    "codigo": "4223-05",
    "titulo": "OPERADOR DE TELEMARKETING ATIVO"
  },
  {
    "codigo": "4223-10",
    "titulo": "OPERADOR DE TELEMARKETING ATIVO E RECEPTIVO"
  },
  {
    "codigo": "4223-15",
    "titulo": "OPERADOR DE TELEMARKETING RECEPTIVO"
  },
  {
    "codigo": "4223-20",
    "titulo": "OPERADOR DE TELEMARKETING TÉCNICO"
  },
  {
    "codigo": "4231-05",
    "titulo": "DESPACHANTE DOCUMENTALISTA"
  },
  {
    "codigo": "4241-05",
    "titulo": "ENTREVISTADOR CENSITÁRIO E DE PESQUISAS AMOSTRAIS"
  },
  {
    "codigo": "4241-10",
    "titulo": "ENTREVISTADOR DE PESQUISA DE OPINIÃO E MÍDIA"
  },
  {
    "codigo": "4241-15",
    "titulo": "ENTREVISTADOR DE PESQUISAS DE MERCADO"
  },
  {
    "codigo": "4241-20",
    "titulo": "ENTREVISTADOR DE PREÇOS"
  },
  {
    "codigo": "4241-25",
    "titulo": "ESCRITURÁRIO EM ESTATÍSTICA"
  },
  {
    "codigo": "5101-05",
    "titulo": "SUPERVISOR DE TRANSPORTES"
  },
  {
    "codigo": "5101-10",
    "titulo": "ADMINISTRADOR DE EDIFÍCIOS"
  },
  {
    "codigo": "5101-15",
    "titulo": "SUPERVISOR DE ANDAR"
  },
  {
    "codigo": "5101-20",
    "titulo": "CHEFE DE PORTARIA DE HOTEL"
  },
  {
    "codigo": "5101-25",
    "titulo": "CHEFE DE COZINHA"
  },
  {
    "codigo": "5101-30",
    "titulo": "CHEFE DE BAR"
  },
  {
    "codigo": "5101-35",
    "titulo": "MAÎTRE"
  },
  {
    "codigo": "5102-05",
    "titulo": "SUPERVISOR DE LAVANDERIA"
  },
  {
    "codigo": "5103-05",
    "titulo": "SUPERVISOR DE BOMBEIROS"
  },
  {
    "codigo": "5103-10",
    "titulo": "SUPERVISOR DE VIGILANTES"
  },
  {
    "codigo": "5111-05",
    "titulo": "COMISSÁRIO DE VÔO"
  },
  {
    "codigo": "5111-10",
    "titulo": "COMISSÁRIO DE TREM"
  },
  {
    "codigo": "5111-15",
    "titulo": "TAIFEIRO (EXCETO MILITARES)"
  },
  {
    "codigo": "5112-05",
    "titulo": "FISCAL DE TRANSPORTES COLETIVOS (EXCETO TREM)"
  },
  {
    "codigo": "5112-10",
    "titulo": "DESPACHANTE DE TRANSPORTES COLETIVOS (EXCETO TREM)"
  },
  {
    "codigo": "5112-15",
    "titulo": "COBRADOR DE TRANSPORTES COLETIVOS (EXCETO TREM)"
  },
  {
    "codigo": "5112-20",
    "titulo": "BILHETEIRO (ESTAÇÕES DE METRÔ, FERROVIÁRIAS E ASSEMELHADAS)"
  },
  {
    "codigo": "5114-05",
    "titulo": "GUIA DE TURISMO"
  },
  {
    "codigo": "5121-10",
    "titulo": "EMPREGADO DOMÉSTICO ARRUMADOR"
  },
  {
    "codigo": "5121-15",
    "titulo": "EMPREGADO DOMÉSTICO FAXINEIRO"
  },
  {
    "codigo": "5121-20",
    "titulo": "EMPREGADO DOMÉSTICO DIARISTA"
  },
  {
    "codigo": "5131-05",
    "titulo": "MORDOMO DE RESIDÊNCIA"
  },
  {
    "codigo": "5131-10",
    "titulo": "MORDOMO DE HOTELARIA"
  },
  {
    "codigo": "5131-15",
    "titulo": "GOVERNANTA DE HOTELARIA"
  },
  {
    "codigo": "5132-05",
    "titulo": "COZINHEIRO GERAL"
  },
  {
    "codigo": "5132-10",
    "titulo": "COZINHEIRO DO SERVIÇO DOMÉSTICO"
  },
  {
    "codigo": "5132-15",
    "titulo": "COZINHEIRO INDUSTRIAL"
  },
  {
    "codigo": "5132-20",
    "titulo": "COZINHEIRO DE HOSPITAL"
  },
  {
    "codigo": "5132-25",
    "titulo": "COZINHEIRO DE EMBARCAÇÕES"
  },
  {
    "codigo": "5133-05",
    "titulo": "CAMAREIRA DE TEATRO"
  },
  {
    "codigo": "5133-10",
    "titulo": "CAMAREIRA DE TELEVISÃO"
  },
  {
    "codigo": "5133-15",
    "titulo": "CAMAREIRO DE HOTEL"
  },
  {
    "codigo": "5133-20",
    "titulo": "CAMAREIRO DE EMBARCAÇÕES"
  },
  {
    "codigo": "5133-25",
    "titulo": "GUARDA-ROUPEIRA DE CINEMA"
  },
  {
    "codigo": "5134-05",
    "titulo": "GARÇOM"
  },
  {
    "codigo": "5134-10",
    "titulo": "GARÇOM (SERVIÇOS DE VINHOS)"
  },
  {
    "codigo": "5134-15",
    "titulo": "CUMIM"
  },
  {
    "codigo": "5134-20",
    "titulo": "BARMAN"
  },
  {
    "codigo": "5134-25",
    "titulo": "COPEIRO"
  },
  {
    "codigo": "5134-30",
    "titulo": "COPEIRO DE HOSPITAL"
  },
  {
    "codigo": "5134-35",
    "titulo": "ATENDENTE DE LANCHONETE"
  },
  {
    "codigo": "5135-05",
    "titulo": "AUXILIAR NOS SERVIÇOS DE ALIMENTAÇÃO"
  },
  {
    "codigo": "5136-05",
    "titulo": "CHURRASQUEIRO"
  },
  {
    "codigo": "5136-10",
    "titulo": "PIZZAIOLO"
  },
  {
    "codigo": "5136-15",
    "titulo": "SUSHIMAN"
  },
  {
    "codigo": "5141-05",
    "titulo": "ASCENSORISTA"
  },
  {
    "codigo": "5141-10",
    "titulo": "GARAGISTA"
  },
  {
    "codigo": "5141-15",
    "titulo": "SACRISTÃO"
  },
  {
    "codigo": "5141-20",
    "titulo": "ZELADOR DE EDIFÍCIO"
  },
  {
    "codigo": "5142-05",
    "titulo": "COLETOR DE LIXO DOMICILIAR"
  },
  {
    "codigo": "5142-15",
    "titulo": "VARREDOR DE RUA"
  },
  {
    "codigo": "5142-25",
    "titulo": "TRABALHADOR DE SERVIÇOS DE LIMPEZA E CONSERVAÇÃO DE ÁREAS PÚBLICAS"
  },
  {
    "codigo": "5142-30",
    "titulo": "COLETOR DE RESÍDUOS SÓLIDOS DE SERVIÇOS DE SAÚDE"
  },
  {
    "codigo": "5143-05",
    "titulo": "LIMPADOR DE VIDROS"
  },
  {
    "codigo": "5143-10",
    "titulo": "AUXILIAR DE MANUTENÇÃO PREDIAL"
  },
  {
    "codigo": "5143-15",
    "titulo": "LIMPADOR DE FACHADAS"
  },
  {
    "codigo": "5143-20",
    "titulo": "FAXINEIRO"
  },
  {
    "codigo": "5143-25",
    "titulo": "TRABALHADOR DA MANUTENÇÃO DE EDIFICAÇÕES"
  },
  {
    "codigo": "5143-30",
    "titulo": "LIMPADOR DE PISCINAS"
  },
  {
    "codigo": "5151-05",
    "titulo": "AGENTE COMUNITÁRIO DE SAÚDE"
  },
  {
    "codigo": "5151-10",
    "titulo": "ATENDENTE DE ENFERMAGEM"
  },
  {
    "codigo": "5151-15",
    "titulo": "PARTEIRA LEIGA"
  },
  {
    "codigo": "5151-20",
    "titulo": "VISITADOR SANITÁRIO"
  },
  {
    "codigo": "5152-05",
    "titulo": "AUXILIAR DE BANCO DE SANGUE"
  },
  {
    "codigo": "5152-10",
    "titulo": "AUXILIAR DE FARMÁCIA DE MANIPULAÇÃO"
  },
  {
    "codigo": "5152-15",
    "titulo": "AUXILIAR DE LABORATÓRIO DE ANÁLISES CLÍNICAS"
  },
  {
    "codigo": "5152-20",
    "titulo": "AUXILIAR DE LABORATÓRIO DE IMUNOBIOLÓGICOS"
  },
  {
    "codigo": "5152-25",
    "titulo": "AUXILIAR DE PRODUÇÃO FARMACÊUTICA"
  },
  {
    "codigo": "5153-05",
    "titulo": "EDUCADOR SOCIAL"
  },
  {
    "codigo": "5153-10",
    "titulo": "AGENTE DE AÇÃO SOCIAL"
  },
  {
    "codigo": "5153-15",
    "titulo": "MONITOR DE DEPENDENTE QUÍMICO"
  },
  {
    "codigo": "5153-20",
    "titulo": "CONSELHEIRO TUTELAR"
  },
  {
    "codigo": "5161-05",
    "titulo": "BARBEIRO"
  },
  {
    "codigo": "5161-10",
    "titulo": "CABELEIREIRO"
  },
  {
    "codigo": "5161-15",
    "titulo": "ESTETICISTA"
  },
  {
    "codigo": "5161-20",
    "titulo": "MANICURE"
  },
  {
    "codigo": "5161-25",
    "titulo": "MAQUIADOR"
  },
  {
    "codigo": "5161-30",
    "titulo": "MAQUIADOR DE CARACTERIZAÇÃO"
  },
  {
    "codigo": "5161-40",
    "titulo": "PEDICURE"
  },
  {
    "codigo": "5162-05",
    "titulo": "BABÁ"
  },
  {
    "codigo": "5162-10",
    "titulo": "CUIDADOR DE IDOSOS"
  },
  {
    "codigo": "5162-15",
    "titulo": "MÃE SOCIAL"
  },
  {
    "codigo": "5163-05",
    "titulo": "LAVADEIRO, EM GERAL"
  },
  {
    "codigo": "5163-10",
    "titulo": "LAVADOR DE ROUPAS A MAQUINA"
  },
  {
    "codigo": "5163-15",
    "titulo": "LAVADOR DE ARTEFATOS DE TAPEÇARIA"
  },
  {
    "codigo": "5163-20",
    "titulo": "LIMPADOR A SECO, À MÁQUINA"
  },
  {
    "codigo": "5163-25",
    "titulo": "PASSADOR DE ROUPAS EM GERAL"
  },
  {
    "codigo": "5163-30",
    "titulo": "TINGIDOR DE ROUPAS"
  },
  {
    "codigo": "5163-35",
    "titulo": "CONFERENTE-EXPEDIDOR DE ROUPAS (LAVANDERIAS)"
  },
  {
    "codigo": "5163-40",
    "titulo": "ATENDENTE DE LAVANDERIA"
  },
  {
    "codigo": "5163-45",
    "titulo": "AUXILIAR DE LAVANDERIA"
  },
  {
    "codigo": "5164-05",
    "titulo": "LAVADOR DE ROUPAS"
  },
  {
    "codigo": "5164-10",
    "titulo": "LIMPADOR DE ROUPAS A SECO, À MÃO"
  },
  {
    "codigo": "5164-15",
    "titulo": "PASSADOR DE ROUPAS, À MÃO"
  },
  {
    "codigo": "5165-05",
    "titulo": "AGENTE FUNERÁRIO"
  },
  {
    "codigo": "5166-05",
    "titulo": "OPERADOR DE FORNO (SERVIÇOS FUNERÁRIOS)"
  },
  {
    "codigo": "5166-10",
    "titulo": "SEPULTADOR"
  },
  {
    "codigo": "5167-05",
    "titulo": "ASTRÓLOGO"
  },
  {
    "codigo": "5167-10",
    "titulo": "NUMERÓLOGO"
  },
  {
    "codigo": "5168-05",
    "titulo": "ESOTÉRICO"
  },
  {
    "codigo": "5168-10",
    "titulo": "PARANORMAL"
  },
  {
    "codigo": "5171-05",
    "titulo": "BOMBEIRO DE AERÓDROMO"
  },
  {
    "codigo": "5171-10",
    "titulo": "BOMBEIRO DE SEGURANÇA DO TRABALHO"
  },
  {
    "codigo": "5171-15",
    "titulo": "SALVA-VIDAS"
  },
  {
    "codigo": "5172-05",
    "titulo": "AGENTE DE POLÍCIA FEDERAL"
  },
  {
    "codigo": "5172-10",
    "titulo": "POLICIAL RODOVIÁRIO FEDERAL"
  },
  {
    "codigo": "5172-15",
    "titulo": "GUARDA-CIVIL MUNICIPAL"
  },
  {
    "codigo": "5172-20",
    "titulo": "AGENTE DE TRÂNSITO"
  },
  {
    "codigo": "5173-05",
    "titulo": "AGENTE DE PROTEÇÃO DE AEROPORTO"
  },
  {
    "codigo": "5173-10",
    "titulo": "AGENTE DE SEGURANÇA"
  },
  {
    "codigo": "5173-15",
    "titulo": "AGENTE DE SEGURANÇA PENITENCIÁRIA"
  },
  {
    "codigo": "5173-20",
    "titulo": "VIGIA FLORESTAL"
  },
  {
    "codigo": "5173-25",
    "titulo": "VIGIA PORTUÁRIO"
  },
  {
    "codigo": "5173-30",
    "titulo": "VIGILANTE"
  },
  {
    "codigo": "5174-05",
    "titulo": "PORTEIRO (HOTEL)"
  },
  {
    "codigo": "5174-10",
    "titulo": "PORTEIRO DE EDIFÍCIOS"
  },
  {
    "codigo": "5174-15",
    "titulo": "PORTEIRO DE LOCAIS DE DIVERSÃO"
  },
  {
    "codigo": "5174-20",
    "titulo": "VIGIA"
  },
  {
    "codigo": "5191-05",
    "titulo": "CICLISTA MENSAGEIRO"
  },
  {
    "codigo": "5191-10",
    "titulo": "MOTOCICLISTA NO TRANSPORTE DE DOCUMENTOS E PEQUENOS VOLUMES"
  },
  {
    "codigo": "5192-05",
    "titulo": "CATADOR DE MATERIAL RECICLÁVEL"
  },
  {
    "codigo": "5193-05",
    "titulo": "AUXILIAR DE VETERINÁRIO"
  },
  {
    "codigo": "5193-10",
    "titulo": "ESTETICISTA DE ANIMAIS DOMÉSTICOS"
  },
  {
    "codigo": "5193-15",
    "titulo": "BANHISTA DE ANIMAIS DOMÉSTICOS"
  },
  {
    "codigo": "5193-20",
    "titulo": "TOSADOR DE ANIMAIS DOMÉSTICOS"
  },
  {
    "codigo": "5198-05",
    "titulo": "PROFISSIONAL DO SEXO"
  },
  {
    "codigo": "5199-05",
    "titulo": "CARTAZEIRO"
  },
  {
    "codigo": "5199-10",
    "titulo": "CONTROLADOR DE PRAGAS"
  },
  {
    "codigo": "5199-15",
    "titulo": "ENGRAXATE"
  },
  {
    "codigo": "5199-20",
    "titulo": "GANDULA"
  },
  {
    "codigo": "5199-25",
    "titulo": "GUARDADOR DE VEÍCULOS"
  },
  {
    "codigo": "5199-30",
    "titulo": "LAVADOR DE GARRAFAS, VIDROS E OUTROS UTENSÍLIOS"
  },
  {
    "codigo": "5199-35",
    "titulo": "LAVADOR DE VEÍCULOS"
  },
  {
    "codigo": "5199-40",
    "titulo": "LEITURISTA"
  },
  {
    "codigo": "5199-45",
    "titulo": "RECEPCIONISTA DE CASAS DE ESPETÁCULOS"
  },
  {
    "codigo": "5201-05",
    "titulo": "SUPERVISOR DE VENDAS DE SERVIÇOS"
  },
  {
    "codigo": "5201-10",
    "titulo": "SUPERVISOR DE VENDAS COMERCIAL"
  },
  {
    "codigo": "5211-05",
    "titulo": "VENDEDOR EM COMÉRCIO ATACADISTA"
  },
  {
    "codigo": "5211-10",
    "titulo": "VENDEDOR DE COMÉRCIO VAREJISTA"
  },
  {
    "codigo": "5211-15",
    "titulo": "PROMOTOR DE VENDAS"
  },
  {
    "codigo": "5211-20",
    "titulo": "DEMONSTRADOR DE MERCADORIAS"
  },
  {
    "codigo": "5211-25",
    "titulo": "REPOSITOR DE MERCADORIAS"
  },
  {
    "codigo": "5211-30",
    "titulo": "ATENDENTE DE FARMÁCIA - BALCONISTA"
  },
  {
    "codigo": "5211-35",
    "titulo": "FRENTISTA"
  },
  {
    "codigo": "5231-05",
    "titulo": "INSTALADOR DE CORTINAS E PERSIANAS, PORTAS SANFONADAS E BOXE"
  },
  {
    "codigo": "5231-10",
    "titulo": "INSTALADOR DE SOM E ACESSÓRIOS DE VEÍCULOS"
  },
  {
    "codigo": "5231-15",
    "titulo": "CHAVEIRO"
  },
  {
    "codigo": "5241-05",
    "titulo": "VENDEDOR EM DOMICÍLIO"
  },
  {
    "codigo": "5242-05",
    "titulo": "FEIRANTE"
  },
  {
    "codigo": "5242-10",
    "titulo": "JORNALEIRO (EM BANCA DE JORNAL)"
  },
  {
    "codigo": "5242-15",
    "titulo": "VENDEDOR PERMISSIONÁRIO"
  },
  {
    "codigo": "5243-05",
    "titulo": "VENDEDOR AMBULANTE"
  },
  {
    "codigo": "5243-10",
    "titulo": "PIPOQUEIRO AMBULANTE"
  },
  {
    "codigo": "6110-05",
    "titulo": "PRODUTOR AGROPECUÁRIO, EM GERAL"
  },
  {
    "codigo": "6120-05",
    "titulo": "PRODUTOR AGRÍCOLA POLIVALENTE"
  },
  {
    "codigo": "6121-05",
    "titulo": "PRODUTOR DE ARROZ"
  },
  {
    "codigo": "6121-10",
    "titulo": "PRODUTOR DE CANA-DE-AÇÚCAR"
  },
  {
    "codigo": "6121-15",
    "titulo": "PRODUTOR DE CEREAIS DE INVERNO"
  },
  {
    "codigo": "6121-20",
    "titulo": "PRODUTOR DE GRAMÍNEAS FORRAGEIRAS"
  },
  {
    "codigo": "6121-25",
    "titulo": "PRODUTOR DE MILHO E SORGO"
  },
  {
    "codigo": "6122-05",
    "titulo": "PRODUTOR DE ALGODÃO"
  },
  {
    "codigo": "6122-10",
    "titulo": "PRODUTOR DE CURAUÁ"
  },
  {
    "codigo": "6122-15",
    "titulo": "PRODUTOR DE JUTA"
  },
  {
    "codigo": "6122-20",
    "titulo": "PRODUTOR DE RAMI"
  },
  {
    "codigo": "6122-25",
    "titulo": "PRODUTOR DE SISAL"
  },
  {
    "codigo": "6123-05",
    "titulo": "PRODUTOR NA OLERICULTURA DE LEGUMES"
  },
  {
    "codigo": "6123-10",
    "titulo": "PRODUTOR NA OLERICULTURA DE RAÍZES, BULBOS E TUBÉRCULOS"
  },
  {
    "codigo": "6123-15",
    "titulo": "PRODUTOR NA OLERICULTURA DE TALOS, FOLHAS E FLORES"
  },
  {
    "codigo": "6123-20",
    "titulo": "PRODUTOR NA OLERICULTURA DE FRUTOS E SEMENTES"
  },
  {
    "codigo": "6124-05",
    "titulo": "PRODUTOR DE FLORES DE CORTE"
  },
  {
    "codigo": "6124-10",
    "titulo": "PRODUTOR DE FLORES EM VASO"
  },
  {
    "codigo": "6124-15",
    "titulo": "PRODUTOR DE FORRAÇÕES"
  },
  {
    "codigo": "6124-20",
    "titulo": "PRODUTOR DE PLANTAS ORNAMENTAIS"
  },
  {
    "codigo": "6125-05",
    "titulo": "PRODUTOR DE ÁRVORES FRUTÍFERAS"
  },
  {
    "codigo": "6125-10",
    "titulo": "PRODUTOR DE ESPÉCIES FRUTÍFERAS RASTEIRAS"
  },
  {
    "codigo": "6125-15",
    "titulo": "PRODUTOR DE ESPÉCIES FRUTÍFERAS TREPADEIRAS"
  },
  {
    "codigo": "6126-05",
    "titulo": "CAFEICULTOR"
  },
  {
    "codigo": "6126-10",
    "titulo": "PRODUTOR DE CACAU"
  },
  {
    "codigo": "6126-15",
    "titulo": "PRODUTOR DE ERVA-MATE"
  },
  {
    "codigo": "6126-20",
    "titulo": "PRODUTOR DE FUMO"
  },
  {
    "codigo": "6126-25",
    "titulo": "PRODUTOR DE GUARANÁ"
  },
  {
    "codigo": "6127-05",
    "titulo": "PRODUTOR DA CULTURA DE AMENDOIM"
  },
  {
    "codigo": "6127-10",
    "titulo": "PRODUTOR DA CULTURA DE CANOLA"
  },
  {
    "codigo": "6127-15",
    "titulo": "PRODUTOR DA CULTURA DE COCO-DA-BAIA"
  },
  {
    "codigo": "6127-20",
    "titulo": "PRODUTOR DA CULTURA DE DENDÊ"
  },
  {
    "codigo": "6127-25",
    "titulo": "PRODUTOR DA CULTURA DE GIRASSOL"
  },
  {
    "codigo": "6127-30",
    "titulo": "PRODUTOR DA CULTURA DE LINHO"
  },
  {
    "codigo": "6127-35",
    "titulo": "PRODUTOR DA CULTURA DE MAMONA"
  },
  {
    "codigo": "6127-40",
    "titulo": "PRODUTOR DA CULTURA DE SOJA"
  },
  {
    "codigo": "6128-05",
    "titulo": "PRODUTOR DE ESPECIARIAS"
  },
  {
    "codigo": "6128-10",
    "titulo": "PRODUTOR DE PLANTAS AROMÁTICAS E MEDICINAIS"
  },
  {
    "codigo": "6130-05",
    "titulo": "CRIADOR EM PECUÁRIA POLIVALENTE"
  },
  {
    "codigo": "6130-10",
    "titulo": "CRIADOR DE ANIMAIS DOMÉSTICOS"
  },
  {
    "codigo": "6131-05",
    "titulo": "CRIADOR DE ASININOS E MUARES"
  },
  {
    "codigo": "6131-10",
    "titulo": "CRIADOR DE BOVINOS (CORTE)"
  },
  {
    "codigo": "6131-15",
    "titulo": "CRIADOR DE BOVINOS (LEITE)"
  },
  {
    "codigo": "6131-20",
    "titulo": "CRIADOR DE BUBALINOS (CORTE)"
  },
  {
    "codigo": "6131-25",
    "titulo": "CRIADOR DE BUBALINOS (LEITE)"
  },
  {
    "codigo": "6131-30",
    "titulo": "CRIADOR DE EQÜÍNOS"
  },
  {
    "codigo": "6132-05",
    "titulo": "CRIADOR DE CAPRINOS"
  },
  {
    "codigo": "6132-10",
    "titulo": "CRIADOR DE OVINOS"
  },
  {
    "codigo": "6132-15",
    "titulo": "CRIADOR DE SUÍNOS"
  },
  {
    "codigo": "6133-05",
    "titulo": "AVICULTOR"
  },
  {
    "codigo": "6133-10",
    "titulo": "CUNICULTOR"
  },
  {
    "codigo": "6134-05",
    "titulo": "APICULTOR"
  },
  {
    "codigo": "6134-10",
    "titulo": "CRIADOR DE ANIMAIS PRODUTORES DE VENENO"
  },
  {
    "codigo": "6134-15",
    "titulo": "MINHOCULTOR"
  },
  {
    "codigo": "6134-20",
    "titulo": "SERICULTOR"
  },
  {
    "codigo": "6201-05",
    "titulo": "SUPERVISOR DE EXPLORAÇÃO AGRÍCOLA"
  },
  {
    "codigo": "6201-10",
    "titulo": "SUPERVISOR DE EXPLORAÇÃO AGROPECUÁRIA"
  },
  {
    "codigo": "6201-15",
    "titulo": "SUPERVISOR DE EXPLORAÇÃO PECUÁRIA"
  },
  {
    "codigo": "6210-05",
    "titulo": "TRABALHADOR AGROPECUÁRIO EM GERAL"
  },
  {
    "codigo": "6220-05",
    "titulo": "CASEIRO (AGRICULTURA)"
  },
  {
    "codigo": "6220-10",
    "titulo": "JARDINEIRO"
  },
  {
    "codigo": "6220-15",
    "titulo": "TRABALHADOR NA PRODUÇÃO DE MUDAS E SEMENTES"
  },
  {
    "codigo": "6220-20",
    "titulo": "TRABALHADOR VOLANTE DA AGRICULTURA"
  },
  {
    "codigo": "6221-05",
    "titulo": "TRABALHADOR DA CULTURA DE ARROZ"
  },
  {
    "codigo": "6221-10",
    "titulo": "TRABALHADOR DA CULTURA DE CANA-DE-AÇÚCAR"
  },
  {
    "codigo": "6221-15",
    "titulo": "TRABALHADOR DA CULTURA DE MILHO E SORGO"
  },
  {
    "codigo": "6221-20",
    "titulo": "TRABALHADOR DA CULTURA DE TRIGO, AVEIA, CEVADA E TRITICALE"
  },
  {
    "codigo": "6222-05",
    "titulo": "TRABALHADOR DA CULTURA DE ALGODÃO"
  },
  {
    "codigo": "6222-10",
    "titulo": "TRABALHADOR DA CULTURA DE SISAL"
  },
  {
    "codigo": "6222-15",
    "titulo": "TRABALHADOR DA CULTURA DO RAMI"
  },
  {
    "codigo": "6223-05",
    "titulo": "TRABALHADOR NA OLERICULTURA (FRUTOS E SEMENTES)"
  },
  {
    "codigo": "6223-10",
    "titulo": "TRABALHADOR NA OLERICULTURA (LEGUMES)"
  },
  {
    "codigo": "6223-15",
    "titulo": "TRABALHADOR NA OLERICULTURA (RAÍZES, BULBOS E TUBÉRCULOS)"
  },
  {
    "codigo": "6223-20",
    "titulo": "TRABALHADOR NA OLERICULTURA (TALOS, FOLHAS E FLORES)"
  },
  {
    "codigo": "6224-05",
    "titulo": "TRABALHADOR NO CULTIVO DE FLORES E FOLHAGENS DE CORTE"
  },
  {
    "codigo": "6224-10",
    "titulo": "TRABALHADOR NO CULTIVO DE FLORES EM VASO"
  },
  {
    "codigo": "6224-15",
    "titulo": "TRABALHADOR NO CULTIVO DE FORRAÇÕES"
  },
  {
    "codigo": "6224-20",
    "titulo": "TRABALHADOR NO CULTIVO DE MUDAS"
  },
  {
    "codigo": "6224-25",
    "titulo": "TRABALHADOR NO CULTIVO DE PLANTAS ORNAMENTAIS"
  },
  {
    "codigo": "6225-05",
    "titulo": "TRABALHADOR NO CULTIVO DE ÁRVORES FRUTÍFERAS"
  },
  {
    "codigo": "6225-10",
    "titulo": "TRABALHADOR NO CULTIVO DE ESPÉCIES FRUTÍFERAS RASTEIRAS"
  },
  {
    "codigo": "6225-15",
    "titulo": "TRABALHADOR NO CULTIVO DE TREPADEIRAS FRUTÍFERAS"
  },
  {
    "codigo": "6226-05",
    "titulo": "TRABALHADOR DA CULTURA DE CACAU"
  },
  {
    "codigo": "6226-10",
    "titulo": "TRABALHADOR DA CULTURA DE CAFÉ"
  },
  {
    "codigo": "6226-15",
    "titulo": "TRABALHADOR DA CULTURA DE ERVA-MATE"
  },
  {
    "codigo": "6226-20",
    "titulo": "TRABALHADOR DA CULTURA DE FUMO"
  },
  {
    "codigo": "6226-25",
    "titulo": "TRABALHADOR DA CULTURA DE GUARANÁ"
  },
  {
    "codigo": "6227-05",
    "titulo": "TRABALHADOR NA CULTURA DE AMENDOIM"
  },
  {
    "codigo": "6227-10",
    "titulo": "TRABALHADOR NA CULTURA DE CANOLA"
  },
  {
    "codigo": "6227-15",
    "titulo": "TRABALHADOR NA CULTURA DE COCO-DA-BAÍA"
  },
  {
    "codigo": "6227-20",
    "titulo": "TRABALHADOR NA CULTURA DE DENDÊ"
  },
  {
    "codigo": "6227-25",
    "titulo": "TRABALHADOR NA CULTURA DE MAMONA"
  },
  {
    "codigo": "6227-30",
    "titulo": "TRABALHADOR NA CULTURA DE SOJA"
  },
  {
    "codigo": "6227-35",
    "titulo": "TRABALHADOR NA CULTURA DO GIRASSOL"
  },
  {
    "codigo": "6227-40",
    "titulo": "TRABALHADOR NA CULTURA DO LINHO"
  },
  {
    "codigo": "6228-05",
    "titulo": "TRABALHADOR DA CULTURA DE ESPECIARIAS"
  },
  {
    "codigo": "6228-10",
    "titulo": "TRABALHADOR DA CULTURA DE PLANTAS AROMÁTICAS E MEDICINAIS"
  },
  {
    "codigo": "6230-05",
    "titulo": "ADESTRADOR DE ANIMAIS"
  },
  {
    "codigo": "6230-10",
    "titulo": "INSEMINADOR"
  },
  {
    "codigo": "6230-15",
    "titulo": "TRABALHADOR DE PECUÁRIA POLIVALENTE"
  },
  {
    "codigo": "6230-20",
    "titulo": "TRATADOR DE ANIMAIS"
  },
  {
    "codigo": "6231-05",
    "titulo": "TRABALHADOR DA PECUÁRIA (ASININOS E MUARES)"
  },
  {
    "codigo": "6231-10",
    "titulo": "TRABALHADOR DA PECUÁRIA (BOVINOS CORTE)"
  },
  {
    "codigo": "6231-15",
    "titulo": "TRABALHADOR DA PECUÁRIA (BOVINOS LEITE)"
  },
  {
    "codigo": "6231-20",
    "titulo": "TRABALHADOR DA PECUÁRIA (BUBALINOS)"
  },
  {
    "codigo": "6231-25",
    "titulo": "TRABALHADOR DA PECUÁRIA (EQÜINOS)"
  },
  {
    "codigo": "6232-05",
    "titulo": "TRABALHADOR DA CAPRINOCULTURA"
  },
  {
    "codigo": "6232-10",
    "titulo": "TRABALHADOR DA OVINOCULTURA"
  },
  {
    "codigo": "6232-15",
    "titulo": "TRABALHADOR DA SUINOCULTURA"
  },
  {
    "codigo": "6233-05",
    "titulo": "TRABALHADOR DA AVICULTURA DE CORTE"
  },
  {
    "codigo": "6233-10",
    "titulo": "TRABALHADOR DA AVICULTURA DE POSTURA"
  },
  {
    "codigo": "6233-15",
    "titulo": "OPERADOR DE INCUBADORA"
  },
  {
    "codigo": "6233-20",
    "titulo": "TRABALHADOR DA CUNICULTURA"
  },
  {
    "codigo": "6233-25",
    "titulo": "SEXADOR"
  },
  {
    "codigo": "6234-05",
    "titulo": "TRABALHADOR EM CRIATÓRIOS DE ANIMAIS PRODUTORES DE VENENO"
  },
  {
    "codigo": "6234-10",
    "titulo": "TRABALHADOR NA APICULTURA"
  },
  {
    "codigo": "6234-15",
    "titulo": "TRABALHADOR NA MINHOCULTURA"
  },
  {
    "codigo": "6234-20",
    "titulo": "TRABALHADOR NA SERICICULTURA"
  },
  {
    "codigo": "6301-05",
    "titulo": "SUPERVISOR DA AQÜICULTURA"
  },
  {
    "codigo": "6301-10",
    "titulo": "SUPERVISOR DA ÁREA FLORESTAL"
  },
  {
    "codigo": "6310-05",
    "titulo": "CATADOR DE CARANGUEJOS E SIRIS"
  },
  {
    "codigo": "6310-10",
    "titulo": "CATADOR DE MARISCOS"
  },
  {
    "codigo": "6310-15",
    "titulo": "PESCADOR ARTESANAL DE LAGOSTAS"
  },
  {
    "codigo": "6310-20",
    "titulo": "PESCADOR ARTESANAL DE PEIXES E CAMARÕES"
  },
  {
    "codigo": "6311-05",
    "titulo": "PESCADOR ARTESANAL DE ÁGUA DOCE"
  },
  {
    "codigo": "6312-05",
    "titulo": "PESCADOR INDUSTRIAL"
  },
  {
    "codigo": "6312-10",
    "titulo": "PESCADOR PROFISSIONAL"
  },
  {
    "codigo": "6313-05",
    "titulo": "CRIADOR DE CAMARÕES"
  },
  {
    "codigo": "6313-10",
    "titulo": "CRIADOR DE JACARÉS"
  },
  {
    "codigo": "6313-15",
    "titulo": "CRIADOR DE MEXILHÕES"
  },
  {
    "codigo": "6313-20",
    "titulo": "CRIADOR DE OSTRAS"
  },
  {
    "codigo": "6313-25",
    "titulo": "CRIADOR DE PEIXES"
  },
  {
    "codigo": "6313-30",
    "titulo": "CRIADOR DE QUELÔNIOS"
  },
  {
    "codigo": "6313-35",
    "titulo": "CRIADOR DE RÃS"
  },
  {
    "codigo": "6314-05",
    "titulo": "GELADOR INDUSTRIAL"
  },
  {
    "codigo": "6314-10",
    "titulo": "GELADOR PROFISSIONAL"
  },
  {
    "codigo": "6314-15",
    "titulo": "PROEIRO"
  },
  {
    "codigo": "6314-20",
    "titulo": "REDEIRO (PESCA)"
  },
  {
    "codigo": "6320-05",
    "titulo": "GUIA FLORESTAL"
  },
  {
    "codigo": "6320-10",
    "titulo": "RAIZEIRO"
  },
  {
    "codigo": "6320-15",
    "titulo": "VIVEIRISTA FLORESTAL"
  },
  {
    "codigo": "6321-05",
    "titulo": "CLASSIFICADOR DE TORAS"
  },
  {
    "codigo": "6321-10",
    "titulo": "CUBADOR DE MADEIRA"
  },
  {
    "codigo": "6321-15",
    "titulo": "IDENTIFICADOR FLORESTAL"
  },
  {
    "codigo": "6321-20",
    "titulo": "OPERADOR DE MOTOSSERRA"
  },
  {
    "codigo": "6321-25",
    "titulo": "TRABALHADOR DE EXTRAÇÃO FLORESTAL, EM GERAL"
  },
  {
    "codigo": "6322-05",
    "titulo": "SERINGUEIRO"
  },
  {
    "codigo": "6322-10",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE ESPÉCIES PRODUTORAS DE GOMAS NÃO ELÁSTICAS"
  },
  {
    "codigo": "6322-15",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE RESINAS"
  },
  {
    "codigo": "6323-05",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE ANDIROBA"
  },
  {
    "codigo": "6323-10",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE BABAÇU"
  },
  {
    "codigo": "6323-15",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE BACABA"
  },
  {
    "codigo": "6323-20",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE BURITI"
  },
  {
    "codigo": "6323-25",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE CARNAÚBA"
  },
  {
    "codigo": "6323-30",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE COCO-DA-PRAIA"
  },
  {
    "codigo": "6323-35",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE COPAÍBA"
  },
  {
    "codigo": "6323-40",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE MALVA (PÃINA)"
  },
  {
    "codigo": "6323-45",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE MURUMURU"
  },
  {
    "codigo": "6323-50",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE OITICICA"
  },
  {
    "codigo": "6323-55",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE OURICURI"
  },
  {
    "codigo": "6323-60",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE PEQUI"
  },
  {
    "codigo": "6323-65",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE PIAÇAVA"
  },
  {
    "codigo": "6323-70",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE TUCUM"
  },
  {
    "codigo": "6324-05",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE AÇAÍ"
  },
  {
    "codigo": "6324-10",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE CASTANHA"
  },
  {
    "codigo": "6324-15",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE PINHÃO"
  },
  {
    "codigo": "6324-20",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE PUPUNHA"
  },
  {
    "codigo": "6325-05",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE ÁRVORES E ARBUSTOS PRODUTORES DE SUBSTÂNCIAS AROMÁT., MEDIC. E TÓXICAS"
  },
  {
    "codigo": "6325-10",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE CIPÓS PRODUTORES DE SUBSTÂNCIAS AROMÁTICAS, MEDICINAIS E TÓXICAS"
  },
  {
    "codigo": "6325-15",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE MADEIRAS TANANTES"
  },
  {
    "codigo": "6325-20",
    "titulo": "TRABALHADOR DA EXPLORAÇÃO DE RAÍZES PRODUTORAS DE SUBSTÂNCIAS AROMÁTICAS, MEDICINAIS E TÓXICAS"
  },
  {
    "codigo": "6325-25",
    "titulo": "TRABALHADOR DA EXTRAÇÃO DE SUBSTÂNCIAS AROMÁTICAS, MEDICINAIS E TÓXICAS, EM GERAL"
  },
  {
    "codigo": "6326-05",
    "titulo": "CARVOEIRO"
  },
  {
    "codigo": "6326-10",
    "titulo": "CARBONIZADOR"
  },
  {
    "codigo": "6326-15",
    "titulo": "AJUDANTE DE CARVOARIA"
  },
  {
    "codigo": "6410-05",
    "titulo": "OPERADOR DE COLHEITADEIRA"
  },
  {
    "codigo": "6410-10",
    "titulo": "OPERADOR DE MÁQUINAS DE BENEFICIAMENTO DE PRODUTOS AGRÍCOLAS"
  },
  {
    "codigo": "6410-15",
    "titulo": "TRATORISTA AGRÍCOLA"
  },
  {
    "codigo": "6420-05",
    "titulo": "OPERADOR DE COLHEDOR FLORESTAL"
  },
  {
    "codigo": "6420-10",
    "titulo": "OPERADOR DE MÁQUINAS FLORESTAIS ESTÁTICAS"
  },
  {
    "codigo": "6420-15",
    "titulo": "OPERADOR DE TRATOR FLORESTAL"
  },
  {
    "codigo": "6430-05",
    "titulo": "TRABALHADOR NA OPERAÇÃO DE SISTEMA DE IRRIGAÇÃO LOCALIZADA (MICROASPERSÃO E GOTEJAMENTO)"
  },
  {
    "codigo": "6430-10",
    "titulo": "TRABALHADOR NA OPERAÇÃO DE SISTEMA DE IRRIGAÇÃO POR ASPERSÃO (PIVÔ CENTRAL)"
  },
  {
    "codigo": "6430-15",
    "titulo": "TRABALHADOR NA OPERAÇÃO DE SISTEMAS CONVENCIONAIS DE IRRIGAÇÃO POR ASPERSÃO"
  },
  {
    "codigo": "6430-20",
    "titulo": "TRABALHADOR NA OPERAÇÃO DE SISTEMAS DE IRRIGAÇÃO E ASPERSÃO (ALTO PROPELIDO)"
  },
  {
    "codigo": "6430-25",
    "titulo": "TRABALHADOR NA OPERAÇÃO DE SISTEMAS DE IRRIGAÇÃO POR SUPERFÍCIE E DRENAGEM"
  },
  {
    "codigo": "7101-05",
    "titulo": "SUPERVISOR DE APOIO OPERACIONAL NA MINERAÇÃO"
  },
  {
    "codigo": "7101-10",
    "titulo": "SUPERVISOR DE EXTRAÇÃO DE SAL"
  },
  {
    "codigo": "7101-15",
    "titulo": "SUPERVISOR DE PERFURAÇÃO E DESMONTE"
  },
  {
    "codigo": "7101-20",
    "titulo": "SUPERVISOR DE PRODUÇÃO NA MINERAÇÃO"
  },
  {
    "codigo": "7101-25",
    "titulo": "SUPERVISOR DE TRANSPORTE NA MINERAÇÃO"
  },
  {
    "codigo": "7102-05",
    "titulo": "MESTRE (CONSTRUÇÃO CIVIL)"
  },
  {
    "codigo": "7102-10",
    "titulo": "MESTRE DE LINHAS (FERROVIAS)"
  },
  {
    "codigo": "7102-15",
    "titulo": "INSPETOR DE TERRAPLENAGEM"
  },
  {
    "codigo": "7102-20",
    "titulo": "SUPERVISOR DE USINA DE CONCRETO"
  },
  {
    "codigo": "7102-25",
    "titulo": "FISCAL DE PÁTIO DE USINA DE CONCRETO"
  },
  {
    "codigo": "7111-05",
    "titulo": "AMOSTRADOR DE MINÉRIOS"
  },
  {
    "codigo": "7111-10",
    "titulo": "CANTEIRO"
  },
  {
    "codigo": "7111-15",
    "titulo": "DESTROÇADOR DE PEDRA"
  },
  {
    "codigo": "7111-20",
    "titulo": "DETONADOR"
  },
  {
    "codigo": "7111-25",
    "titulo": "ESCORADOR DE MINAS"
  },
  {
    "codigo": "7111-30",
    "titulo": "MINEIRO"
  },
  {
    "codigo": "7112-05",
    "titulo": "OPERADOR DE CAMINHÃO (MINAS E PEDREIRAS)"
  },
  {
    "codigo": "7112-10",
    "titulo": "OPERADOR DE CARREGADEIRA"
  },
  {
    "codigo": "7112-15",
    "titulo": "OPERADOR DE MÁQUINA CORTADORA (MINAS E PEDREIRAS)"
  },
  {
    "codigo": "7112-20",
    "titulo": "OPERADOR DE MÁQUINA DE EXTRAÇÃO CONTÍNUA (MINAS DE CARVÃO)"
  },
  {
    "codigo": "7112-25",
    "titulo": "OPERADOR DE MÁQUINA PERFURADORA (MINAS E PEDREIRAS)"
  },
  {
    "codigo": "7112-30",
    "titulo": "OPERADOR DE MÁQUINA PERFURATRIZ"
  },
  {
    "codigo": "7112-35",
    "titulo": "OPERADOR DE MOTONIVELADORA (EXTRAÇÃO DE MINERAIS SÓLIDOS)"
  },
  {
    "codigo": "7112-40",
    "titulo": "OPERADOR DE SCHUTTHECAR"
  },
  {
    "codigo": "7112-45",
    "titulo": "OPERADOR DE TRATOR (MINAS E PEDREIRAS)"
  },
  {
    "codigo": "7113-05",
    "titulo": "OPERADOR DE SONDA DE PERCUSSÃO"
  },
  {
    "codigo": "7113-10",
    "titulo": "OPERADOR DE SONDA ROTATIVA"
  },
  {
    "codigo": "7113-15",
    "titulo": "SONDADOR (POÇOS DE PETRÓLEO E GÁS)"
  },
  {
    "codigo": "7113-20",
    "titulo": "SONDADOR DE POÇOS (EXCETO DE PETRÓLEO E GÁS)"
  },
  {
    "codigo": "7113-25",
    "titulo": "PLATAFORMISTA (PETRÓLEO)"
  },
  {
    "codigo": "7113-30",
    "titulo": "TORRISTA (PETRÓLEO)"
  },
  {
    "codigo": "7114-05",
    "titulo": "GARIMPEIRO"
  },
  {
    "codigo": "7114-10",
    "titulo": "OPERADOR DE SALINA (SAL MARINHO)"
  },
  {
    "codigo": "7121-05",
    "titulo": "MOLEIRO DE MINÉRIOS"
  },
  {
    "codigo": "7121-10",
    "titulo": "OPERADOR DE APARELHO DE FLOTAÇÃO"
  },
  {
    "codigo": "7121-15",
    "titulo": "OPERADOR DE APARELHO DE PRECIPITAÇÃO (MINAS DE OURO OU PRATA)"
  },
  {
    "codigo": "7121-20",
    "titulo": "OPERADOR DE BRITADOR DE MANDÍBULAS"
  },
  {
    "codigo": "7121-25",
    "titulo": "OPERADOR DE ESPESSADOR"
  },
  {
    "codigo": "7121-30",
    "titulo": "OPERADOR DE JIG (MINAS)"
  },
  {
    "codigo": "7121-35",
    "titulo": "OPERADOR DE PENEIRAS HIDRÁULICAS"
  },
  {
    "codigo": "7122-05",
    "titulo": "CORTADOR DE PEDRAS"
  },
  {
    "codigo": "7122-10",
    "titulo": "GRAVADOR DE INSCRIÇÕES EM PEDRA"
  },
  {
    "codigo": "7122-15",
    "titulo": "GRAVADOR DE RELEVOS EM PEDRA"
  },
  {
    "codigo": "7122-20",
    "titulo": "POLIDOR DE PEDRAS"
  },
  {
    "codigo": "7122-25",
    "titulo": "TORNEIRO (LAVRA DE PEDRA)"
  },
  {
    "codigo": "7122-30",
    "titulo": "TRAÇADOR DE PEDRAS"
  },
  {
    "codigo": "7151-05",
    "titulo": "OPERADOR DE BATE-ESTACAS"
  },
  {
    "codigo": "7151-10",
    "titulo": "OPERADOR DE COMPACTADORA DE SOLOS"
  },
  {
    "codigo": "7151-15",
    "titulo": "OPERADOR DE ESCAVADEIRA"
  },
  {
    "codigo": "7151-20",
    "titulo": "OPERADOR DE MÁQUINA DE ABRIR VALAS"
  },
  {
    "codigo": "7151-25",
    "titulo": "OPERADOR DE MÁQUINAS DE CONSTRUÇÃO CIVIL E MINERAÇÃO"
  },
  {
    "codigo": "7151-30",
    "titulo": "OPERADOR DE MOTONIVELADORA"
  },
  {
    "codigo": "7151-35",
    "titulo": "OPERADOR DE PÁ CARREGADEIRA"
  },
  {
    "codigo": "7151-40",
    "titulo": "OPERADOR DE PAVIMENTADORA (ASFALTO, CONCRETO E MATERIAIS SIMILARES)"
  },
  {
    "codigo": "7151-45",
    "titulo": "OPERADOR DE TRATOR DE LÂMINA"
  },
  {
    "codigo": "7152-05",
    "titulo": "CALCETEIRO"
  },
  {
    "codigo": "7152-10",
    "titulo": "PEDREIRO"
  },
  {
    "codigo": "7152-15",
    "titulo": "PEDREIRO (CHAMINÉS INDUSTRIAIS)"
  },
  {
    "codigo": "7152-20",
    "titulo": "PEDREIRO (MATERIAL REFRATÁRIO)"
  },
  {
    "codigo": "7152-25",
    "titulo": "PEDREIRO (MINERAÇÃO)"
  },
  {
    "codigo": "7152-30",
    "titulo": "PEDREIRO DE EDIFICAÇÕES"
  },
  {
    "codigo": "7153-05",
    "titulo": "ARMADOR DE ESTRUTURA DE CONCRETO"
  },
  {
    "codigo": "7153-10",
    "titulo": "MOLDADOR DE CORPOS DE PROVA EM USINAS DE CONCRETO"
  },
  {
    "codigo": "7153-15",
    "titulo": "ARMADOR DE ESTRUTURA DE CONCRETO ARMADO"
  },
  {
    "codigo": "7154-05",
    "titulo": "OPERADOR DE BETONEIRA"
  },
  {
    "codigo": "7154-10",
    "titulo": "OPERADOR DE BOMBA DE CONCRETO"
  },
  {
    "codigo": "7154-15",
    "titulo": "OPERADOR DE CENTRAL DE CONCRETO"
  },
  {
    "codigo": "7155-05",
    "titulo": "CARPINTEIRO"
  },
  {
    "codigo": "7155-10",
    "titulo": "CARPINTEIRO (ESQUADRIAS)"
  },
  {
    "codigo": "7155-15",
    "titulo": "CARPINTEIRO (CENÁRIOS)"
  },
  {
    "codigo": "7155-20",
    "titulo": "CARPINTEIRO (MINERAÇÃO)"
  },
  {
    "codigo": "7155-25",
    "titulo": "CARPINTEIRO DE OBRAS"
  },
  {
    "codigo": "7155-30",
    "titulo": "CARPINTEIRO (TELHADOS)"
  },
  {
    "codigo": "7155-35",
    "titulo": "CARPINTEIRO DE FÔRMAS PARA CONCRETO"
  },
  {
    "codigo": "7155-40",
    "titulo": "CARPINTEIRO DE OBRAS CIVIS DE ARTE (PONTES, TÚNEIS, BARRAGENS)"
  },
  {
    "codigo": "7155-45",
    "titulo": "MONTADOR DE ANDAIMES (EDIFICAÇÕES)"
  },
  {
    "codigo": "7156-05",
    "titulo": "ELETRICISTA DE INSTALAÇÕES (CENÁRIOS)"
  },
  {
    "codigo": "7156-10",
    "titulo": "ELETRICISTA DE INSTALAÇÕES (EDIFÍCIOS)"
  },
  {
    "codigo": "7156-15",
    "titulo": "ELETRICISTA DE INSTALAÇÕES"
  },
  {
    "codigo": "7157-05",
    "titulo": "APLICADOR DE ASFALTO IMPERMEABILIZANTE (COBERTURAS)"
  },
  {
    "codigo": "7157-10",
    "titulo": "INSTALADOR DE ISOLANTES ACÚSTICOS"
  },
  {
    "codigo": "7157-15",
    "titulo": "INSTALADOR DE ISOLANTES TÉRMICOS (REFRIGERAÇÃO E CLIMATIZAÇÃO)"
  },
  {
    "codigo": "7157-20",
    "titulo": "INSTALADOR DE ISOLANTES TÉRMICOS DE CALDEIRA E TUBULAÇÕES"
  },
  {
    "codigo": "7157-25",
    "titulo": "INSTALADOR DE MATERIAL ISOLANTE, A MÃO (EDIFICAÇÕES)"
  },
  {
    "codigo": "7157-30",
    "titulo": "INSTALADOR DE MATERIAL ISOLANTE, A MÁQUINA (EDIFICAÇÕES)"
  },
  {
    "codigo": "7161-05",
    "titulo": "ACABADOR DE SUPERFÍCIES DE CONCRETO"
  },
  {
    "codigo": "7161-10",
    "titulo": "REVESTIDOR DE SUPERFÍCIES DE CONCRETO"
  },
  {
    "codigo": "7162-05",
    "titulo": "TELHADOR (TELHAS DE ARGILA E MATERIAS SIMILARES)"
  },
  {
    "codigo": "7162-10",
    "titulo": "TELHADOR (TELHAS DE CIMENTO-AMIANTO)"
  },
  {
    "codigo": "7162-15",
    "titulo": "TELHADOR (TELHAS METÁLICAS)"
  },
  {
    "codigo": "7162-20",
    "titulo": "TELHADOR (TELHAS PLÁTICAS)"
  },
  {
    "codigo": "7163-05",
    "titulo": "VIDRACEIRO"
  },
  {
    "codigo": "7163-10",
    "titulo": "VIDRACEIRO (EDIFICAÇÕES)"
  },
  {
    "codigo": "7163-15",
    "titulo": "VIDRACEIRO (VITRAIS)"
  },
  {
    "codigo": "7164-05",
    "titulo": "GESSEIRO"
  },
  {
    "codigo": "7165-05",
    "titulo": "ASSOALHADOR"
  },
  {
    "codigo": "7165-10",
    "titulo": "LADRILHEIRO"
  },
  {
    "codigo": "7165-15",
    "titulo": "PASTILHEIRO"
  },
  {
    "codigo": "7165-20",
    "titulo": "LUSTRADOR DE PISO"
  },
  {
    "codigo": "7165-25",
    "titulo": "MARMORISTA (CONSTRUÇÃO)"
  },
  {
    "codigo": "7165-30",
    "titulo": "MOSAÍSTA"
  },
  {
    "codigo": "7165-35",
    "titulo": "TAQUEIRO"
  },
  {
    "codigo": "7166-05",
    "titulo": "CALAFETADOR"
  },
  {
    "codigo": "7166-10",
    "titulo": "PINTOR DE OBRAS"
  },
  {
    "codigo": "7166-15",
    "titulo": "REVESTIDOR DE INTERIORES (PAPEL, MATERIAL PLÁSTICO E EMBORRACHADOS)"
  },
  {
    "codigo": "7170-05",
    "titulo": "DEMOLIDOR DE EDIFICAÇÕES"
  },
  {
    "codigo": "7170-10",
    "titulo": "OPERADOR DE MARTELETE"
  },
  {
    "codigo": "7170-15",
    "titulo": "POCEIRO (EDIFICAÇÕES)"
  },
  {
    "codigo": "7170-20",
    "titulo": "SERVENTE DE OBRAS"
  },
  {
    "codigo": "7170-25",
    "titulo": "VIBRADORISTA"
  },
  {
    "codigo": "7201-05",
    "titulo": "MESTRE (AFIADOR DE FERRAMENTAS)"
  },
  {
    "codigo": "7201-10",
    "titulo": "MESTRE DE CALDEIRARIA"
  },
  {
    "codigo": "7201-15",
    "titulo": "MESTRE DE FERRAMENTARIA"
  },
  {
    "codigo": "7201-20",
    "titulo": "MESTRE DE FORJARIA"
  },
  {
    "codigo": "7201-25",
    "titulo": "MESTRE DE FUNDIÇÃO"
  },
  {
    "codigo": "7201-30",
    "titulo": "MESTRE DE GALVANOPLASTIA"
  },
  {
    "codigo": "7201-35",
    "titulo": "MESTRE DE PINTURA (TRATAMENTO DE SUPERFÍCIES)"
  },
  {
    "codigo": "7201-40",
    "titulo": "MESTRE DE SOLDAGEM"
  },
  {
    "codigo": "7201-45",
    "titulo": "MESTRE DE TREFILAÇÃO DE METAIS"
  },
  {
    "codigo": "7201-50",
    "titulo": "MESTRE DE USINAGEM"
  },
  {
    "codigo": "7201-55",
    "titulo": "MESTRE SERRALHEIRO"
  },
  {
    "codigo": "7201-60",
    "titulo": "SUPERVISOR DE CONTROLE DE TRATAMENTO TÉRMICO"
  },
  {
    "codigo": "7202-05",
    "titulo": "MESTRE (CONSTRUÇÃO NAVAL)"
  },
  {
    "codigo": "7202-10",
    "titulo": "MESTRE (INDÚSTRIA DE AUTOMOTORES E MATERIAL DE TRANSPORTES)"
  },
  {
    "codigo": "7202-15",
    "titulo": "MESTRE (INDÚSTRIA DE MÁQUINAS E OUTROS EQUIPAMENTOS MECÂNICOS)"
  },
  {
    "codigo": "7202-20",
    "titulo": "MESTRE DE CONSTRUÇÃO DE FORNOS"
  },
  {
    "codigo": "7211-05",
    "titulo": "FERRAMENTEIRO"
  },
  {
    "codigo": "7211-10",
    "titulo": "FERRAMENTEIRO DE MANDRIS, CALIBRADORES E OUTROS DISPOSITIVOS"
  },
  {
    "codigo": "7211-15",
    "titulo": "MODELADOR DE METAIS (FUNDIÇÃO)"
  },
  {
    "codigo": "7212-05",
    "titulo": "OPERADOR DE MÁQUINA DE ELETROEROSÃO"
  },
  {
    "codigo": "7212-10",
    "titulo": "OPERADOR DE MÁQUINAS OPERATRIZES"
  },
  {
    "codigo": "7212-15",
    "titulo": "OPERADOR DE MÁQUINAS-FERRAMENTA CONVENCIONAIS"
  },
  {
    "codigo": "7212-20",
    "titulo": "OPERADOR DE USINAGEM CONVENCIONAL POR ABRASÃO"
  },
  {
    "codigo": "7212-25",
    "titulo": "PREPARADOR DE MÁQUINAS-FERRAMENTA"
  },
  {
    "codigo": "7213-05",
    "titulo": "AFIADOR DE CARDAS"
  },
  {
    "codigo": "7213-10",
    "titulo": "AFIADOR DE CUTELARIA"
  },
  {
    "codigo": "7213-15",
    "titulo": "AFIADOR DE FERRAMENTAS"
  },
  {
    "codigo": "7213-20",
    "titulo": "AFIADOR DE SERRAS"
  },
  {
    "codigo": "7213-25",
    "titulo": "POLIDOR DE METAIS"
  },
  {
    "codigo": "7214-05",
    "titulo": "OPERADOR DE CENTRO DE USINAGEM COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "7214-10",
    "titulo": "OPERADOR DE FRESADORA COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "7214-15",
    "titulo": "OPERADOR DE MANDRILADORA COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "7214-20",
    "titulo": "OPERADOR DE MÁQUINA ELETROEROSÃO, À FIO, COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "7214-25",
    "titulo": "OPERADOR DE RETIFICADORA COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "7214-30",
    "titulo": "OPERADOR DE TORNO COM COMANDO NUMÉRICO"
  },
  {
    "codigo": "7221-05",
    "titulo": "FORJADOR"
  },
  {
    "codigo": "7221-10",
    "titulo": "FORJADOR A MARTELO"
  },
  {
    "codigo": "7221-15",
    "titulo": "FORJADOR PRENSISTA"
  },
  {
    "codigo": "7222-05",
    "titulo": "FUNDIDOR DE METAIS"
  },
  {
    "codigo": "7222-10",
    "titulo": "LINGOTADOR"
  },
  {
    "codigo": "7222-15",
    "titulo": "OPERADOR DE ACABAMENTO DE PEÇAS FUNDIDAS"
  },
  {
    "codigo": "7222-20",
    "titulo": "OPERADOR DE MÁQUINA CENTRIFUGADORA DE FUNDIÇÃO"
  },
  {
    "codigo": "7222-25",
    "titulo": "OPERADOR DE MÁQUINA DE FUNDIR SOB PRESSÃO"
  },
  {
    "codigo": "7222-30",
    "titulo": "OPERADOR DE VAZAMENTO (LINGOTAMENTO)"
  },
  {
    "codigo": "7222-35",
    "titulo": "PREPARADOR DE PANELAS (LINGOTAMENTO)"
  },
  {
    "codigo": "7223-05",
    "titulo": "MACHEIRO, A MÃO"
  },
  {
    "codigo": "7223-10",
    "titulo": "MACHEIRO, A MÁQUINA"
  },
  {
    "codigo": "7223-15",
    "titulo": "MOLDADOR, A MÃO"
  },
  {
    "codigo": "7223-20",
    "titulo": "MOLDADOR, A MÁQUINA"
  },
  {
    "codigo": "7223-25",
    "titulo": "OPERADOR DE EQUIPAMENTOS DE PREPARAÇÃO DE AREIA"
  },
  {
    "codigo": "7223-30",
    "titulo": "OPERADOR DE MÁQUINA DE MOLDAR AUTOMATIZADA"
  },
  {
    "codigo": "7224-05",
    "titulo": "CABLEADOR"
  },
  {
    "codigo": "7224-10",
    "titulo": "ESTIRADOR DE TUBOS DE METAL SEM COSTURA"
  },
  {
    "codigo": "7224-15",
    "titulo": "TREFILADOR DE METAIS, À MÁQUINA"
  },
  {
    "codigo": "7231-05",
    "titulo": "CEMENTADOR DE METAIS"
  },
  {
    "codigo": "7231-10",
    "titulo": "NORMALIZADOR DE METAIS E DE COMPÓSITOS"
  },
  {
    "codigo": "7231-15",
    "titulo": "OPERADOR DE EQUIPAMENTO PARA RESFRIAMENTO"
  },
  {
    "codigo": "7231-20",
    "titulo": "OPERADOR DE FORNO DE TRATAMENTO TÉRMICO DE METAIS"
  },
  {
    "codigo": "7231-25",
    "titulo": "TEMPERADOR DE METAIS E DE COMPÓSITOS"
  },
  {
    "codigo": "7232-05",
    "titulo": "DECAPADOR"
  },
  {
    "codigo": "7232-10",
    "titulo": "FOSFATIZADOR"
  },
  {
    "codigo": "7232-15",
    "titulo": "GALVANIZADOR"
  },
  {
    "codigo": "7232-20",
    "titulo": "METALIZADOR A PISTOLA"
  },
  {
    "codigo": "7232-25",
    "titulo": "METALIZADOR (BANHO QUENTE)"
  },
  {
    "codigo": "7232-30",
    "titulo": "OPERADOR DE MÁQUINA RECOBRIDORA DE ARAME"
  },
  {
    "codigo": "7232-35",
    "titulo": "OPERADOR DE ZINCAGEM (PROCESSO ELETROLÍTICO)"
  },
  {
    "codigo": "7232-40",
    "titulo": "OXIDADOR"
  },
  {
    "codigo": "7233-05",
    "titulo": "OPERADOR DE EQUIPAMENTO DE SECAGEM DE PINTURA"
  },
  {
    "codigo": "7233-10",
    "titulo": "PINTOR A PINCEL E ROLO (EXCETO OBRAS E ESTRUTURAS METÁLICAS)"
  },
  {
    "codigo": "7233-15",
    "titulo": "PINTOR DE ESTRUTURAS METÁLICAS"
  },
  {
    "codigo": "7233-20",
    "titulo": "PINTOR DE VEÍCULOS (FABRICAÇÃO)"
  },
  {
    "codigo": "7233-25",
    "titulo": "PINTOR POR IMERSÃO"
  },
  {
    "codigo": "7233-30",
    "titulo": "PINTOR, A PISTOLA (EXCETO OBRAS E ESTRUTURAS METÁLICAS)"
  },
  {
    "codigo": "7241-05",
    "titulo": "ASSENTADOR DE CANALIZAÇÃO (EDIFICAÇÕES)"
  },
  {
    "codigo": "7241-10",
    "titulo": "ENCANADOR"
  },
  {
    "codigo": "7241-15",
    "titulo": "INSTALADOR DE TUBULAÇÕES"
  },
  {
    "codigo": "7241-20",
    "titulo": "INSTALADOR DE TUBULAÇÕES (AERONAVES)"
  },
  {
    "codigo": "7241-25",
    "titulo": "INSTALADOR DE TUBULAÇÕES (EMBARCAÇÕES)"
  },
  {
    "codigo": "7241-30",
    "titulo": "INSTALADOR DE TUBULAÇÕES DE GÁS COMBUSTÍVEL (PRODUÇÃO E DISTRIBUIÇÃO)"
  },
  {
    "codigo": "7241-35",
    "titulo": "INSTALADOR DE TUBULAÇÕES DE VAPOR (PRODUÇÃO E DISTRIBUIÇÃO)"
  },
  {
    "codigo": "7242-05",
    "titulo": "MONTADOR DE ESTRUTURAS METÁLICAS"
  },
  {
    "codigo": "7242-10",
    "titulo": "MONTADOR DE ESTRUTURAS METÁLICAS DE EMBARCAÇÕES"
  },
  {
    "codigo": "7242-15",
    "titulo": "REBITADOR A MARTELO PNEUMÁTICO"
  },
  {
    "codigo": "7242-20",
    "titulo": "PREPARADOR DE ESTRUTURAS METÁLICAS"
  },
  {
    "codigo": "7242-25",
    "titulo": "RISCADOR DE ESTRUTURAS METÁLICAS"
  },
  {
    "codigo": "7242-30",
    "titulo": "REBITADOR, A MÃO"
  },
  {
    "codigo": "7243-05",
    "titulo": "BRASADOR"
  },
  {
    "codigo": "7243-10",
    "titulo": "OXICORTADOR A MÃO E A MÁQUINA"
  },
  {
    "codigo": "7243-15",
    "titulo": "SOLDADOR"
  },
  {
    "codigo": "7243-20",
    "titulo": "SOLDADOR A OXIGÁS"
  },
  {
    "codigo": "7243-25",
    "titulo": "SOLDADOR ELÉTRICO"
  },
  {
    "codigo": "7244-05",
    "titulo": "CALDEIREIRO (CHAPAS DE COBRE)"
  },
  {
    "codigo": "7244-10",
    "titulo": "CALDEIREIRO (CHAPAS DE FERRO E AÇO)"
  },
  {
    "codigo": "7244-15",
    "titulo": "CHAPEADOR"
  },
  {
    "codigo": "7244-20",
    "titulo": "CHAPEADOR DE CARROCERIAS METÁLICAS (FABRICAÇÃO)"
  },
  {
    "codigo": "7244-25",
    "titulo": "CHAPEADOR NAVAL"
  },
  {
    "codigo": "7244-30",
    "titulo": "CHAPEADOR DE AERONAVES"
  },
  {
    "codigo": "7244-35",
    "titulo": "FUNILEIRO INDUSTRIAL"
  },
  {
    "codigo": "7244-40",
    "titulo": "SERRALHEIRO"
  },
  {
    "codigo": "7245-05",
    "titulo": "OPERADOR DE MÁQUINA DE CILINDRAR CHAPAS"
  },
  {
    "codigo": "7245-10",
    "titulo": "OPERADOR DE MÁQUINA DE DOBRAR CHAPAS"
  },
  {
    "codigo": "7245-15",
    "titulo": "PRENSISTA (OPERADOR DE PRENSA)"
  },
  {
    "codigo": "7246-05",
    "titulo": "OPERADOR DE LAÇOS DE CABOS DE AÇO"
  },
  {
    "codigo": "7246-10",
    "titulo": "TRANÇADOR DE CABOS DE AÇO"
  },
  {
    "codigo": "7250-05",
    "titulo": "AJUSTADOR FERRAMENTEIRO"
  },
  {
    "codigo": "7250-10",
    "titulo": "AJUSTADOR MECÂNICO"
  },
  {
    "codigo": "7250-15",
    "titulo": "AJUSTADOR MECÂNICO (USINAGEM EM BANCADA E EM MÁQUINAS-FERRAMENTAS)"
  },
  {
    "codigo": "7250-20",
    "titulo": "AJUSTADOR MECÂNICO EM BANCADA"
  },
  {
    "codigo": "7250-25",
    "titulo": "AJUSTADOR NAVAL (REPARO E CONSTRUÇÃO)"
  },
  {
    "codigo": "7251-05",
    "titulo": "MONTADOR DE MÁQUINAS, MOTORES E ACESSÓRIOS (MONTAGEM EM SÉRIE)"
  },
  {
    "codigo": "7252-05",
    "titulo": "MONTADOR DE MÁQUINAS"
  },
  {
    "codigo": "7252-10",
    "titulo": "MONTADOR DE MÁQUINAS GRÁFICAS"
  },
  {
    "codigo": "7252-15",
    "titulo": "MONTADOR DE MÁQUINAS OPERATRIZES PARA MADEIRA"
  },
  {
    "codigo": "7252-20",
    "titulo": "MONTADOR DE MÁQUINAS TÊXTEIS"
  },
  {
    "codigo": "7252-25",
    "titulo": "MONTADOR DE MÁQUINAS-FERRAMENTAS (USINAGEM DE METAIS)"
  },
  {
    "codigo": "7253-05",
    "titulo": "MONTADOR DE EQUIPAMENTO DE LEVANTAMENTO"
  },
  {
    "codigo": "7253-10",
    "titulo": "MONTADOR DE MÁQUINAS AGRÍCOLAS"
  },
  {
    "codigo": "7253-15",
    "titulo": "MONTADOR DE MÁQUINAS DE MINAS E PEDREIRAS"
  },
  {
    "codigo": "7253-20",
    "titulo": "MONTADOR DE MÁQUINAS DE TERRAPLENAGEM"
  },
  {
    "codigo": "7254-05",
    "titulo": "MECÂNICO MONTADOR DE MOTORES DE AERONAVES"
  },
  {
    "codigo": "7254-10",
    "titulo": "MECÂNICO MONTADOR DE MOTORES DE EMBARCAÇÕES"
  },
  {
    "codigo": "7254-15",
    "titulo": "MECÂNICO MONTADOR DE MOTORES DE EXPLOSÃO E DIESEL"
  },
  {
    "codigo": "7254-20",
    "titulo": "MECÂNICO MONTADOR DE TURBOALIMENTADORES"
  },
  {
    "codigo": "7255-05",
    "titulo": "MONTADOR DE VEÍCULOS (LINHA DE MONTAGEM)"
  },
  {
    "codigo": "7255-10",
    "titulo": "OPERADOR DE TIME DE MONTAGEM"
  },
  {
    "codigo": "7256-05",
    "titulo": "MONTADOR DE ESTRUTURAS DE AERONAVES"
  },
  {
    "codigo": "7256-10",
    "titulo": "MONTADOR DE SISTEMAS DE COMBUSTÍVEL DE AERONAVES"
  },
  {
    "codigo": "7257-05",
    "titulo": "MECÂNICO DE REFRIGERAÇÃO"
  },
  {
    "codigo": "7301-05",
    "titulo": "SUPERVISOR DE MONTAGEM E INSTALAÇÃO ELETROELETRÔNICA"
  },
  {
    "codigo": "7311-05",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELETRÔNICOS (APARELHOS MÉDICOS)"
  },
  {
    "codigo": "7311-10",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELETRÔNICOS (COMPUTADORES E EQUIPAMENTOS AUXILIARES)"
  },
  {
    "codigo": "7311-15",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS (INSTRUMENTOS DE MEDIÇÃO)"
  },
  {
    "codigo": "7311-20",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS (APARELHOS ELETRODOMÉSTICOS)"
  },
  {
    "codigo": "7311-25",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS (CENTRAIS ELÉTRICAS)"
  },
  {
    "codigo": "7311-30",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS (MOTORES E DÍNAMOS)"
  },
  {
    "codigo": "7311-35",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS"
  },
  {
    "codigo": "7311-40",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELETRÔNICOS (INSTALAÇÕES DE SINALIZAÇÃO)"
  },
  {
    "codigo": "7311-45",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELETRÔNICOS (MÁQUINAS INDUSTRIAIS)"
  },
  {
    "codigo": "7311-50",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELETRÔNICOS"
  },
  {
    "codigo": "7311-55",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS (ELEVADORES E EQUIPAMENTOS SIMILARES)"
  },
  {
    "codigo": "7311-60",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELÉTRICOS (TRANSFORMADORES)"
  },
  {
    "codigo": "7311-65",
    "titulo": "BOBINADOR ELETRICISTA, À MÃO"
  },
  {
    "codigo": "7311-70",
    "titulo": "BOBINADOR ELETRICISTA, À MÁQUINA"
  },
  {
    "codigo": "7311-75",
    "titulo": "OPERADOR DE LINHA DE MONTAGEM (APARELHOS ELÉTRICOS)"
  },
  {
    "codigo": "7311-80",
    "titulo": "OPERADOR DE LINHA DE MONTAGEM (APARELHOS ELETRÔNICOS)"
  },
  {
    "codigo": "7312-05",
    "titulo": "MONTADOR DE EQUIPAMENTOS ELETRÔNICOS (ESTAÇÃO DE RÁDIO, TV E EQUIPAMENTOS DE RADAR)"
  },
  {
    "codigo": "7313-05",
    "titulo": "INSTALADOR-REPARADOR DE EQUIPAMENTOS DE COMUTAÇÃO EM TELEFONIA"
  },
  {
    "codigo": "7313-10",
    "titulo": "INSTALADOR-REPARADOR DE EQUIPAMENTOS DE ENERGIA EM TELEFONIA"
  },
  {
    "codigo": "7313-15",
    "titulo": "INSTALADOR-REPARADOR DE EQUIPAMENTOS DE TRANSMISSÃO EM TELEFONIA"
  },
  {
    "codigo": "7313-20",
    "titulo": "INSTALADOR-REPARADOR DE LINHAS E APARELHOS DE TELECOMUNICAÇÕES"
  },
  {
    "codigo": "7313-25",
    "titulo": "INSTALADOR-REPARADOR DE REDES E CABOS TELEFÔNICOS"
  },
  {
    "codigo": "7313-30",
    "titulo": "REPARADOR DE APARELHOS DE TELECOMUNICAÇÕES EM LABORATÓRIO"
  },
  {
    "codigo": "7321-05",
    "titulo": "ELETRICISTA DE MANUTENÇÃO DE LINHAS ELÉTRICAS, TELEFÔNICAS E DE COMUNICAÇÃO DE DADOS"
  },
  {
    "codigo": "7321-10",
    "titulo": "EMENDADOR DE CABOS ELÉTRICOS E TELEFÔNICOS (AÉREOS E SUBTERRÂNEOS)"
  },
  {
    "codigo": "7321-15",
    "titulo": "EXAMINADOR DE CABOS, LINHAS ELÉTRICAS E TELEFÔNICAS"
  },
  {
    "codigo": "7321-20",
    "titulo": "INSTALADOR DE LINHAS ELÉTRICAS DE ALTA E BAIXA - TENSÃO (REDE AÉREA E SUBTERRÂNEA)"
  },
  {
    "codigo": "7321-25",
    "titulo": "INSTALADOR ELETRICISTA (TRAÇÃO DE VEÍCULOS)"
  },
  {
    "codigo": "7321-30",
    "titulo": "INSTALADOR-REPARADOR DE REDES TELEFÔNICAS E DE COMUNICAÇÃO DE DADOS"
  },
  {
    "codigo": "7321-35",
    "titulo": "LIGADOR DE LINHAS TELEFÔNICAS"
  },
  {
    "codigo": "7401-05",
    "titulo": "SUPERVISOR DA MECÂNICA DE PRECISÃO"
  },
  {
    "codigo": "7401-10",
    "titulo": "SUPERVISOR DE FABRICAÇÃO DE INSTRUMENTOS MUSICAIS"
  },
  {
    "codigo": "7411-05",
    "titulo": "AJUSTADOR DE INSTRUMENTOS DE PRECISÃO"
  },
  {
    "codigo": "7411-10",
    "titulo": "MONTADOR DE INSTRUMENTOS DE ÓPTICA"
  },
  {
    "codigo": "7411-15",
    "titulo": "MONTADOR DE INSTRUMENTOS DE PRECISÃO"
  },
  {
    "codigo": "7411-20",
    "titulo": "RELOJOEIRO (FABRICAÇÃO)"
  },
  {
    "codigo": "7411-25",
    "titulo": "RELOJOEIRO (REPARAÇÃO)"
  },
  {
    "codigo": "7421-05",
    "titulo": "AFINADOR DE INSTRUMENTOS MUSICAIS"
  },
  {
    "codigo": "7421-10",
    "titulo": "CONFECCIONADOR DE ACORDEÃO"
  },
  {
    "codigo": "7421-15",
    "titulo": "CONFECCIONADOR DE INSTRUMENTOS DE CORDA"
  },
  {
    "codigo": "7421-20",
    "titulo": "CONFECCIONADOR DE INSTRUMENTOS DE PERCUSSÃO (PELE, COURO OU PLÁSTICO)"
  },
  {
    "codigo": "7421-25",
    "titulo": "CONFECCIONADOR DE INSTRUMENTOS DE SOPRO (MADEIRA)"
  },
  {
    "codigo": "7421-30",
    "titulo": "CONFECCIONADOR DE INSTRUMENTOS DE SOPRO (METAL)"
  },
  {
    "codigo": "7421-35",
    "titulo": "CONFECCIONADOR DE ÓRGÃO"
  },
  {
    "codigo": "7421-40",
    "titulo": "CONFECCIONADOR DE PIANO"
  },
  {
    "codigo": "7501-05",
    "titulo": "SUPERVISOR DE JOALHERIA"
  },
  {
    "codigo": "7502-05",
    "titulo": "SUPERVISOR DA INDÚSTRIA DE MINERAIS NÃO METÁLICOS (EXCETO OS DERIVADOS DE PETRÓLEO E CARVÃO)"
  },
  {
    "codigo": "7510-05",
    "titulo": "ENGASTADOR (JÓIAS)"
  },
  {
    "codigo": "7510-10",
    "titulo": "JOALHEIRO"
  },
  {
    "codigo": "7510-15",
    "titulo": "JOALHEIRO (REPARAÇÕES)"
  },
  {
    "codigo": "7510-20",
    "titulo": "LAPIDADOR (JÓIAS)"
  },
  {
    "codigo": "7511-05",
    "titulo": "BATE-FOLHA A MÁQUINA"
  },
  {
    "codigo": "7511-10",
    "titulo": "FUNDIDOR (JOALHERIA E OURIVESARIA)"
  },
  {
    "codigo": "7511-15",
    "titulo": "GRAVADOR (JOALHERIA E OURIVESARIA)"
  },
  {
    "codigo": "7511-20",
    "titulo": "LAMINADOR DE METAIS PRECIOSOS A MÃO"
  },
  {
    "codigo": "7511-25",
    "titulo": "OURIVES"
  },
  {
    "codigo": "7511-30",
    "titulo": "TREFILADOR (JOALHERIA E OURIVESARIA)"
  },
  {
    "codigo": "7521-05",
    "titulo": "ARTESÃO MODELADOR (VIDROS)"
  },
  {
    "codigo": "7521-10",
    "titulo": "MOLDADOR (VIDROS)"
  },
  {
    "codigo": "7521-15",
    "titulo": "SOPRADOR DE VIDRO"
  },
  {
    "codigo": "7521-20",
    "titulo": "TRANSFORMADOR DE TUBOS DE VIDRO"
  },
  {
    "codigo": "7522-05",
    "titulo": "APLICADOR SERIGRÁFICO EM VIDROS"
  },
  {
    "codigo": "7522-10",
    "titulo": "CORTADOR DE VIDRO"
  },
  {
    "codigo": "7522-15",
    "titulo": "GRAVADOR DE VIDRO A ÁGUA-FORTE"
  },
  {
    "codigo": "7522-20",
    "titulo": "GRAVADOR DE VIDRO A ESMERIL"
  },
  {
    "codigo": "7522-25",
    "titulo": "GRAVADOR DE VIDRO A JATO DE AREIA"
  },
  {
    "codigo": "7522-30",
    "titulo": "LAPIDADOR DE VIDROS E CRISTAIS"
  },
  {
    "codigo": "7522-35",
    "titulo": "SURFASSAGISTA"
  },
  {
    "codigo": "7523-05",
    "titulo": "CERAMISTA"
  },
  {
    "codigo": "7523-10",
    "titulo": "CERAMISTA (TORNO DE PEDAL E MOTOR)"
  },
  {
    "codigo": "7523-15",
    "titulo": "CERAMISTA (TORNO SEMI-AUTOMÁTICO)"
  },
  {
    "codigo": "7523-20",
    "titulo": "CERAMISTA MODELADOR"
  },
  {
    "codigo": "7523-25",
    "titulo": "CERAMISTA MOLDADOR"
  },
  {
    "codigo": "7523-30",
    "titulo": "CERAMISTA PRENSADOR"
  },
  {
    "codigo": "7524-05",
    "titulo": "DECORADOR DE CERÂMICA"
  },
  {
    "codigo": "7524-10",
    "titulo": "DECORADOR DE VIDRO"
  },
  {
    "codigo": "7524-15",
    "titulo": "DECORADOR DE VIDRO À PINCEL"
  },
  {
    "codigo": "7524-20",
    "titulo": "OPERADOR DE ESMALTADEIRA"
  },
  {
    "codigo": "7524-25",
    "titulo": "OPERADOR DE ESPELHAMENTO"
  },
  {
    "codigo": "7524-30",
    "titulo": "PINTOR DE CERÂMICA, A PINCEL"
  },
  {
    "codigo": "7601-05",
    "titulo": "CONTRAMESTRE DE ACABAMENTO (INDÚSTRIA TÊXTIL)"
  },
  {
    "codigo": "7601-10",
    "titulo": "CONTRAMESTRE DE FIAÇÃO (INDÚSTRIA TÊXTIL)"
  },
  {
    "codigo": "7601-15",
    "titulo": "CONTRAMESTRE DE MALHARIA (INDÚSTRIA TÊXTIL)"
  },
  {
    "codigo": "7601-20",
    "titulo": "CONTRAMESTRE DE TECELAGEM (INDÚSTRIA TÊXTIL)"
  },
  {
    "codigo": "7601-25",
    "titulo": "MESTRE (INDÚSTRIA TÊXTIL E DE CONFECÇÕES)"
  },
  {
    "codigo": "7602-05",
    "titulo": "SUPERVISOR DE CURTIMENTO"
  },
  {
    "codigo": "7603-05",
    "titulo": "ENCARREGADO DE CORTE NA CONFECÇÃO DO VESTUÁRIO"
  },
  {
    "codigo": "7603-10",
    "titulo": "ENCARREGADO DE COSTURA NA CONFECÇÃO DO VESTUÁRIO"
  },
  {
    "codigo": "7604-05",
    "titulo": "SUPERVISOR (INDÚSTRIA DE CALÇADOS E ARTEFATOS DE COURO)"
  },
  {
    "codigo": "7605-05",
    "titulo": "SUPERVISOR DA CONFECÇÃO DE ARTEFATOS DE TECIDOS, COUROS E AFINS"
  },
  {
    "codigo": "7606-05",
    "titulo": "SUPERVISOR DAS ARTES GRÁFICAS (INDÚSTRIA EDITORIAL E GRÁFICA)"
  },
  {
    "codigo": "7610-05",
    "titulo": "OPERADOR POLIVALENTE DA INDÚSTRIA TÊXTIL"
  },
  {
    "codigo": "7611-05",
    "titulo": "CLASSIFICADOR DE FIBRAS TÊXTEIS"
  },
  {
    "codigo": "7611-10",
    "titulo": "LAVADOR DE LÃ"
  },
  {
    "codigo": "7612-05",
    "titulo": "OPERADOR DE ABERTURA (FIAÇÃO)"
  },
  {
    "codigo": "7612-10",
    "titulo": "OPERADOR DE BINADEIRA"
  },
  {
    "codigo": "7612-15",
    "titulo": "OPERADOR DE BOBINADEIRA"
  },
  {
    "codigo": "7612-20",
    "titulo": "OPERADOR DE CARDAS"
  },
  {
    "codigo": "7612-25",
    "titulo": "OPERADOR DE CONICALEIRA"
  },
  {
    "codigo": "7612-30",
    "titulo": "OPERADOR DE FILATÓRIO"
  },
  {
    "codigo": "7612-35",
    "titulo": "OPERADOR DE LAMINADEIRA E REUNIDEIRA"
  },
  {
    "codigo": "7612-40",
    "titulo": "OPERADOR DE MAÇAROQUEIRA"
  },
  {
    "codigo": "7612-45",
    "titulo": "OPERADOR DE OPEN-END"
  },
  {
    "codigo": "7612-50",
    "titulo": "OPERADOR DE PASSADOR (FIAÇÃO)"
  },
  {
    "codigo": "7612-55",
    "titulo": "OPERADOR DE PENTEADEIRA"
  },
  {
    "codigo": "7612-60",
    "titulo": "OPERADOR DE RETORCEDEIRA"
  },
  {
    "codigo": "7613-03",
    "titulo": "TECELÃO (REDES)"
  },
  {
    "codigo": "7613-06",
    "titulo": "TECELÃO (RENDAS E BORDADOS)"
  },
  {
    "codigo": "7613-09",
    "titulo": "TECELÃO (TEAR AUTOMÁTICO)"
  },
  {
    "codigo": "7613-12",
    "titulo": "TECELÃO (TEAR JACQUARD)"
  },
  {
    "codigo": "7613-15",
    "titulo": "TECELÃO (TEAR MECÂNICO DE MAQUINETA)"
  },
  {
    "codigo": "7613-18",
    "titulo": "TECELÃO (TEAR MECÂNICO DE XADREZ)"
  },
  {
    "codigo": "7613-21",
    "titulo": "TECELÃO (TEAR MECÂNICO LISO)"
  },
  {
    "codigo": "7613-24",
    "titulo": "TECELÃO (TEAR MECÂNICO, EXCETO JACQUARD)"
  },
  {
    "codigo": "7613-27",
    "titulo": "TECELÃO DE MALHAS, A MÁQUINA"
  },
  {
    "codigo": "7613-30",
    "titulo": "TECELÃO DE MALHAS (MÁQUINA CIRCULAR)"
  },
  {
    "codigo": "7613-33",
    "titulo": "TECELÃO DE MALHAS (MÁQUINA RETILÍNEA)"
  },
  {
    "codigo": "7613-36",
    "titulo": "TECELÃO DE MEIAS, A MÁQUINA"
  },
  {
    "codigo": "7613-39",
    "titulo": "TECELÃO DE MEIAS (MÁQUINA CIRCULAR)"
  },
  {
    "codigo": "7613-42",
    "titulo": "TECELÃO DE MEIAS (MÁQUINA RETILÍNEA)"
  },
  {
    "codigo": "7613-45",
    "titulo": "TECELÃO DE TAPETES, A MÁQUINA"
  },
  {
    "codigo": "7613-48",
    "titulo": "OPERADOR DE ENGOMADEIRA DE URDUME"
  },
  {
    "codigo": "7613-51",
    "titulo": "OPERADOR DE ESPULADEIRA"
  },
  {
    "codigo": "7613-54",
    "titulo": "OPERADOR DE MÁQUINA DE CORDOALHA"
  },
  {
    "codigo": "7613-57",
    "titulo": "OPERADOR DE URDIDEIRA"
  },
  {
    "codigo": "7613-60",
    "titulo": "PASSAMANEIRO A MÁQUINA"
  },
  {
    "codigo": "7613-63",
    "titulo": "REMETEDOR DE FIOS"
  },
  {
    "codigo": "7613-66",
    "titulo": "PICOTADOR DE CARTÕES JACQUARD"
  },
  {
    "codigo": "7614-05",
    "titulo": "ALVEJADOR (TECIDOS)"
  },
  {
    "codigo": "7614-10",
    "titulo": "ESTAMPADOR DE TECIDO"
  },
  {
    "codigo": "7614-15",
    "titulo": "OPERADOR DE CALANDRAS (TECIDOS)"
  },
  {
    "codigo": "7614-20",
    "titulo": "OPERADOR DE CHAMUSCADEIRA DE TECIDOS"
  },
  {
    "codigo": "7614-25",
    "titulo": "OPERADOR DE IMPERMEABILIZADOR DE TECIDOS"
  },
  {
    "codigo": "7614-30",
    "titulo": "OPERADOR DE MÁQUINA DE LAVAR FIOS E TECIDOS"
  },
  {
    "codigo": "7614-35",
    "titulo": "OPERADOR DE RAMEUSE"
  },
  {
    "codigo": "7618-05",
    "titulo": "INSPETOR DE ESTAMPARIA (PRODUÇÃO TÊXTIL)"
  },
  {
    "codigo": "7618-10",
    "titulo": "REVISOR DE FIOS (PRODUÇÃO TÊXTIL)"
  },
  {
    "codigo": "7618-15",
    "titulo": "REVISOR DE TECIDOS ACABADOS"
  },
  {
    "codigo": "7618-20",
    "titulo": "REVISOR DE TECIDOS CRUS"
  },
  {
    "codigo": "7620-05",
    "titulo": "TRABALHADOR POLIVALENTE DO CURTIMENTO DE COUROS E PELES"
  },
  {
    "codigo": "7621-05",
    "titulo": "CLASSIFICADOR DE PELES"
  },
  {
    "codigo": "7621-10",
    "titulo": "DESCARNADOR DE COUROS E PELES, À MAQUINA"
  },
  {
    "codigo": "7621-15",
    "titulo": "ESTIRADOR DE COUROS E PELES (PREPARAÇÃO)"
  },
  {
    "codigo": "7621-20",
    "titulo": "FULONEIRO"
  },
  {
    "codigo": "7621-25",
    "titulo": "RACHADOR DE COUROS E PELES"
  },
  {
    "codigo": "7622-05",
    "titulo": "CURTIDOR (COUROS E PELES)"
  },
  {
    "codigo": "7622-10",
    "titulo": "CLASSIFICADOR DE COUROS"
  },
  {
    "codigo": "7622-15",
    "titulo": "ENXUGADOR DE COUROS"
  },
  {
    "codigo": "7622-20",
    "titulo": "REBAIXADOR DE COUROS"
  },
  {
    "codigo": "7623-05",
    "titulo": "ESTIRADOR DE COUROS E PELES (ACABAMENTO)"
  },
  {
    "codigo": "7623-10",
    "titulo": "FULONEIRO NO ACABAMENTO DE COUROS E PELES"
  },
  {
    "codigo": "7623-15",
    "titulo": "LIXADOR DE COUROS E PELES"
  },
  {
    "codigo": "7623-20",
    "titulo": "MATIZADOR DE COUROS E PELES"
  },
  {
    "codigo": "7623-25",
    "titulo": "OPERADOR DE MÁQUINAS DO ACABAMENTO DE COUROS E PELES"
  },
  {
    "codigo": "7623-30",
    "titulo": "PRENSADOR DE COUROS E PELES"
  },
  {
    "codigo": "7623-35",
    "titulo": "PALECIONADOR DE COUROS E PELES"
  },
  {
    "codigo": "7623-40",
    "titulo": "PREPARADOR DE COUROS CURTIDOS"
  },
  {
    "codigo": "7623-45",
    "titulo": "VAQUEADOR DE COUROS E PELES"
  },
  {
    "codigo": "7630-05",
    "titulo": "ALFAIATE"
  },
  {
    "codigo": "7630-10",
    "titulo": "COSTUREIRA DE PEÇAS SOB ENCOMENDA"
  },
  {
    "codigo": "7630-15",
    "titulo": "COSTUREIRA DE REPARAÇÃO DE ROUPAS"
  },
  {
    "codigo": "7630-20",
    "titulo": "COSTUREIRO DE ROUPA DE COURO E PELE"
  },
  {
    "codigo": "7631-05",
    "titulo": "AUXILIAR DE CORTE (PREPARAÇÃO DA CONFECÇÃO DE ROUPAS)"
  },
  {
    "codigo": "7631-10",
    "titulo": "CORTADOR DE ROUPAS"
  },
  {
    "codigo": "7631-15",
    "titulo": "ENFESTADOR DE ROUPAS"
  },
  {
    "codigo": "7631-20",
    "titulo": "RISCADOR DE ROUPAS"
  },
  {
    "codigo": "7631-25",
    "titulo": "AJUDANTE DE CONFECÇÃO"
  },
  {
    "codigo": "7632-05",
    "titulo": "COSTUREIRO DE ROUPAS DE COURO E PELE, A MÁQUINA NA CONFECÇÃO EM SÉRIE"
  },
  {
    "codigo": "7632-10",
    "titulo": "COSTUREIRO NA CONFECÇÃO EM SÉRIE"
  },
  {
    "codigo": "7632-15",
    "titulo": "COSTUREIRO, A MÁQUINA NA CONFECÇÃO EM SÉRIE"
  },
  {
    "codigo": "7633-05",
    "titulo": "ARREMATADEIRA"
  },
  {
    "codigo": "7633-10",
    "titulo": "BORDADOR, À MÁQUINA"
  },
  {
    "codigo": "7633-15",
    "titulo": "MARCADOR DE PEÇAS CONFECCIONADAS PARA BORDAR"
  },
  {
    "codigo": "7633-20",
    "titulo": "OPERADOR DE MÁQUINA DE COSTURA DE ACABAMENTO"
  },
  {
    "codigo": "7633-25",
    "titulo": "PASSADEIRA DE PEÇAS CONFECCIONADAS"
  },
  {
    "codigo": "7640-05",
    "titulo": "TRABALHADOR POLIVALENTE DA CONFECÇÃO DE CALÇADOS"
  },
  {
    "codigo": "7641-05",
    "titulo": "CORTADOR DE CALÇADOS, A MÁQUINA (EXCETO SOLAS E PALMILHAS)"
  },
  {
    "codigo": "7641-10",
    "titulo": "CORTADOR DE SOLAS E PALMILHAS, A MÁQUINA"
  },
  {
    "codigo": "7641-15",
    "titulo": "PREPARADOR DE CALÇADOS"
  },
  {
    "codigo": "7641-20",
    "titulo": "PREPARADOR DE SOLAS E PALMILHAS"
  },
  {
    "codigo": "7642-05",
    "titulo": "COSTURADOR DE CALÇADOS, A MÁQUINA"
  },
  {
    "codigo": "7642-10",
    "titulo": "MONTADOR DE CALÇADOS"
  },
  {
    "codigo": "7643-05",
    "titulo": "ACABADOR DE CALÇADOS"
  },
  {
    "codigo": "7650-05",
    "titulo": "CONFECCIONADOR DE ARTEFATOS DE COURO (EXCETO SAPATOS)"
  },
  {
    "codigo": "7650-10",
    "titulo": "CHAPELEIRO DE SENHORAS"
  },
  {
    "codigo": "7650-15",
    "titulo": "BONELEIRO"
  },
  {
    "codigo": "7651-05",
    "titulo": "CORTADOR DE ARTEFATOS DE COURO (EXCETO ROUPAS E CALÇADOS)"
  },
  {
    "codigo": "7651-10",
    "titulo": "CORTADOR DE TAPEÇARIA"
  },
  {
    "codigo": "7652-05",
    "titulo": "COLCHOEIRO (CONFECÇÃO DE COLCHÕES)"
  },
  {
    "codigo": "7652-15",
    "titulo": "CONFECCIONADOR DE BRINQUEDOS DE PANO"
  },
  {
    "codigo": "7652-25",
    "titulo": "CONFECCIONADOR DE VELAS NÁUTICAS, BARRACAS E TOLDOS"
  },
  {
    "codigo": "7652-30",
    "titulo": "ESTOFADOR DE AVIÕES"
  },
  {
    "codigo": "7652-35",
    "titulo": "ESTOFADOR DE MÓVEIS"
  },
  {
    "codigo": "7653-10",
    "titulo": "COSTURADOR DE ARTEFATOS DE COURO, A MÁQUINA (EXCETO ROUPAS E CALÇADOS)"
  },
  {
    "codigo": "7653-15",
    "titulo": "MONTADOR DE ARTEFATOS DE COURO (EXCETO ROUPAS E CALÇADOS)"
  },
  {
    "codigo": "7654-05",
    "titulo": "TRABALHADOR DO ACABAMENTO DE ARTEFATOS DE TECIDOS E COUROS"
  },
  {
    "codigo": "7661-05",
    "titulo": "COPIADOR DE CHAPA"
  },
  {
    "codigo": "7661-15",
    "titulo": "GRAVADOR DE MATRIZ PARA FLEXOGRAFIA (CLICHERISTA)"
  },
  {
    "codigo": "7661-20",
    "titulo": "EDITOR DE TEXTO E IMAGEM"
  },
  {
    "codigo": "7661-25",
    "titulo": "MONTADOR DE FOTOLITO (ANALÓGICO E DIGITAL)"
  },
  {
    "codigo": "7661-30",
    "titulo": "GRAVADOR DE MATRIZ PARA ROTOGRAVURA (ELETROMECÂNICO E QUÍMICO)"
  },
  {
    "codigo": "7661-35",
    "titulo": "GRAVADOR DE MATRIZ CALCOGRÁFICA"
  },
  {
    "codigo": "7661-40",
    "titulo": "GRAVADOR DE MATRIZ SERIGRÁFICA"
  },
  {
    "codigo": "7661-45",
    "titulo": "OPERADOR DE SISTEMAS DE PROVA (ANALÓGICO E DIGITAL)"
  },
  {
    "codigo": "7661-50",
    "titulo": "OPERADOR DE PROCESSO DE TRATAMENTO DE IMAGEM"
  },
  {
    "codigo": "7661-55",
    "titulo": "PROGRAMADOR VISUAL GRÁFICO"
  },
  {
    "codigo": "7662-05",
    "titulo": "IMPRESSOR (SERIGRAFIA)"
  },
  {
    "codigo": "7662-10",
    "titulo": "IMPRESSOR CALCOGRÁFICO"
  },
  {
    "codigo": "7662-15",
    "titulo": "IMPRESSOR DE OFSETE (PLANO E ROTATIVO)"
  },
  {
    "codigo": "7662-20",
    "titulo": "IMPRESSOR DE ROTATIVA"
  },
  {
    "codigo": "7662-25",
    "titulo": "IMPRESSOR DE ROTOGRAVURA"
  },
  {
    "codigo": "7662-30",
    "titulo": "IMPRESSOR DIGITAL"
  },
  {
    "codigo": "7662-35",
    "titulo": "IMPRESSOR FLEXOGRÁFICO"
  },
  {
    "codigo": "7662-40",
    "titulo": "IMPRESSOR LETTERSET"
  },
  {
    "codigo": "7662-45",
    "titulo": "IMPRESSOR TAMPOGRÁFICO"
  },
  {
    "codigo": "7662-50",
    "titulo": "IMPRESSOR TIPOGRÁFICO"
  },
  {
    "codigo": "7663-05",
    "titulo": "ACABADOR DE EMBALAGENS (FLEXÍVEIS E CARTOTÉCNICAS)"
  },
  {
    "codigo": "7663-10",
    "titulo": "IMPRESSOR DE CORTE E VINCO"
  },
  {
    "codigo": "7663-15",
    "titulo": "OPERADOR DE ACABAMENTO (INDÚSTRIA GRÁFICA)"
  },
  {
    "codigo": "7663-20",
    "titulo": "OPERADOR DE GUILHOTINA (CORTE DE PAPEL)"
  },
  {
    "codigo": "7663-25",
    "titulo": "PREPARADOR DE MATRIZES DE CORTE E VINCO"
  },
  {
    "codigo": "7664-05",
    "titulo": "LABORATORISTA FOTOGRÁFICO"
  },
  {
    "codigo": "7664-10",
    "titulo": "REVELADOR DE FILMES FOTOGRÁFICOS, EM PRETO E BRANCO"
  },
  {
    "codigo": "7664-15",
    "titulo": "REVELADOR DE FILMES FOTOGRÁFICOS, EM CORES"
  },
  {
    "codigo": "7664-20",
    "titulo": "AUXILIAR DE RADIOLOGIA (REVELAÇÃO FOTOGRÁFICA)"
  },
  {
    "codigo": "7681-05",
    "titulo": "TECELÃO (TEAR MANUAL)"
  },
  {
    "codigo": "7681-10",
    "titulo": "TECELÃO DE TAPETES, A MÃO"
  },
  {
    "codigo": "7681-15",
    "titulo": "TRICOTEIRO, À MÃO"
  },
  {
    "codigo": "7681-20",
    "titulo": "REDEIRO"
  },
  {
    "codigo": "7681-25",
    "titulo": "CHAPELEIRO (CHAPÉUS DE PALHA)"
  },
  {
    "codigo": "7681-30",
    "titulo": "CROCHETEIRO, A MÃO"
  },
  {
    "codigo": "7682-05",
    "titulo": "BORDADOR, A MÃO"
  },
  {
    "codigo": "7682-10",
    "titulo": "CERZIDOR"
  },
  {
    "codigo": "7683-05",
    "titulo": "ARTÍFICE DO COURO"
  },
  {
    "codigo": "7683-10",
    "titulo": "CORTADOR DE CALÇADOS, A MÃO (EXCETO SOLAS)"
  },
  {
    "codigo": "7683-15",
    "titulo": "COSTURADOR DE ARTEFATOS DE COURO, A MÃO (EXCETO ROUPAS E CALÇADOS)"
  },
  {
    "codigo": "7683-20",
    "titulo": "SAPATEIRO (CALÇADOS SOB MEDIDA)"
  },
  {
    "codigo": "7683-25",
    "titulo": "SELEIRO"
  },
  {
    "codigo": "7686-05",
    "titulo": "TIPÓGRAFO"
  },
  {
    "codigo": "7686-10",
    "titulo": "LINOTIPISTA"
  },
  {
    "codigo": "7686-15",
    "titulo": "MONOTIPISTA"
  },
  {
    "codigo": "7686-20",
    "titulo": "PAGINADOR"
  },
  {
    "codigo": "7686-25",
    "titulo": "PINTOR DE LETREIROS"
  },
  {
    "codigo": "7686-30",
    "titulo": "CONFECCIONADOR DE CARIMBOS DE BORRACHA"
  },
  {
    "codigo": "7687-05",
    "titulo": "GRAVADOR, À MÃO (ENCADERNAÇÃO)"
  },
  {
    "codigo": "7687-10",
    "titulo": "RESTAURADOR DE LIVROS"
  },
  {
    "codigo": "7701-05",
    "titulo": "MESTRE (INDÚSTRIA DE MADEIRA E MOBILIÁRIO)"
  },
  {
    "codigo": "7701-10",
    "titulo": "MESTRE CARPINTEIRO"
  },
  {
    "codigo": "7711-05",
    "titulo": "MARCENEIRO"
  },
  {
    "codigo": "7711-10",
    "titulo": "MODELADOR DE MADEIRA"
  },
  {
    "codigo": "7711-15",
    "titulo": "MAQUETISTA NA MARCENARIA"
  },
  {
    "codigo": "7711-20",
    "titulo": "TANOEIRO"
  },
  {
    "codigo": "7721-05",
    "titulo": "CLASSIFICADOR DE MADEIRA"
  },
  {
    "codigo": "7721-10",
    "titulo": "IMPREGNADOR DE MADEIRA"
  },
  {
    "codigo": "7721-15",
    "titulo": "SECADOR DE MADEIRA"
  },
  {
    "codigo": "7731-05",
    "titulo": "CORTADOR DE LAMINADOS DE MADEIRA"
  },
  {
    "codigo": "7731-10",
    "titulo": "OPERADOR DE SERRAS NO DESDOBRAMENTO DE MADEIRA"
  },
  {
    "codigo": "7731-15",
    "titulo": "SERRADOR DE BORDAS NO DESDOBRAMENTO DE MADEIRA"
  },
  {
    "codigo": "7731-20",
    "titulo": "SERRADOR DE MADEIRA"
  },
  {
    "codigo": "7731-25",
    "titulo": "SERRADOR DE MADEIRA (SERRA CIRCULAR MÚLTIPLA)"
  },
  {
    "codigo": "7731-30",
    "titulo": "SERRADOR DE MADEIRA (SERRA DE FITA MÚLTIPLA)"
  },
  {
    "codigo": "7732-05",
    "titulo": "OPERADOR DE MÁQUINA INTERCALADORA E PLACAS (COMPENSADOS)"
  },
  {
    "codigo": "7732-10",
    "titulo": "PRENSISTA DE AGLOMERADOS"
  },
  {
    "codigo": "7732-15",
    "titulo": "PRENSISTA DE COMPENSADOS"
  },
  {
    "codigo": "7732-20",
    "titulo": "PREPARADOR DE AGLOMERANTES"
  },
  {
    "codigo": "7733-05",
    "titulo": "OPERADOR DE DESEMPENADEIRA NA USINAGEM CONVENCIONAL DE MADEIRA"
  },
  {
    "codigo": "7733-10",
    "titulo": "OPERADOR DE ENTALHADEIRA (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-15",
    "titulo": "OPERADOR DE FRESADORA (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-20",
    "titulo": "OPERADOR DE LIXADEIRA (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-25",
    "titulo": "OPERADOR DE MÁQUINA DE USINAGEM MADEIRA, EM GERAL"
  },
  {
    "codigo": "7733-30",
    "titulo": "OPERADOR DE MOLDURADORA (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-35",
    "titulo": "OPERADOR DE PLAINA DESENGROSSADEIRA"
  },
  {
    "codigo": "7733-40",
    "titulo": "OPERADOR DE SERRAS (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-45",
    "titulo": "OPERADOR DE TORNO AUTOMÁTICO (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-50",
    "titulo": "OPERADOR DE TUPIA (USINAGEM DE MADEIRA)"
  },
  {
    "codigo": "7733-55",
    "titulo": "TORNEIRO NA USINAGEM CONVENCIONAL DE MADEIRA"
  },
  {
    "codigo": "7734-05",
    "titulo": "OPERADOR DE MÁQUINA BORDATRIZ"
  },
  {
    "codigo": "7734-10",
    "titulo": "OPERADOR DE MÁQUINA DE CORTINA D´ÁGUA (PRODUÇÃO DE MÓVEIS)"
  },
  {
    "codigo": "7734-15",
    "titulo": "OPERADOR DE MÁQUINA DE USINAGEM DE MADEIRA (PRODUÇÃO EM SÉRIE)"
  },
  {
    "codigo": "7734-20",
    "titulo": "OPERADOR DE PRENSA DE ALTA FREQÜÊNCIA NA USINAGEM DE MADEIRA"
  },
  {
    "codigo": "7735-05",
    "titulo": "OPERADOR DE CENTRO DE USINAGEM DE MADEIRA (CNC)"
  },
  {
    "codigo": "7735-10",
    "titulo": "OPERADOR DE MÁQUINAS DE USINAR MADEIRA (CNC)"
  },
  {
    "codigo": "7741-05",
    "titulo": "MONTADOR DE MÓVEIS E ARTEFATOS DE MADEIRA"
  },
  {
    "codigo": "7751-05",
    "titulo": "ENTALHADOR DE MADEIRA"
  },
  {
    "codigo": "7751-10",
    "titulo": "FOLHEADOR DE MÓVEIS DE MADEIRA"
  },
  {
    "codigo": "7751-15",
    "titulo": "LUSTRADOR DE PEÇAS DE MADEIRA"
  },
  {
    "codigo": "7751-20",
    "titulo": "MARCHETEIRO"
  },
  {
    "codigo": "7764-05",
    "titulo": "CESTEIRO"
  },
  {
    "codigo": "7764-10",
    "titulo": "CONFECCIONADOR DE ESCOVAS, PINCÉIS E PRODUTOS SIMILARES (A MÃO)"
  },
  {
    "codigo": "7764-15",
    "titulo": "CONFECCIONADOR DE ESCOVAS, PINCÉIS E PRODUTOS SIMILARES (A MÁQUINA)"
  },
  {
    "codigo": "7764-20",
    "titulo": "CONFECCIONADOR DE MÓVEIS DE VIME, JUNCO E BAMBU"
  },
  {
    "codigo": "7764-25",
    "titulo": "ESTEIREIRO"
  },
  {
    "codigo": "7764-30",
    "titulo": "VASSOUREIRO"
  },
  {
    "codigo": "7771-05",
    "titulo": "CARPINTEIRO NAVAL (CONSTRUÇÃO DE PEQUENAS EMBARCAÇÕES)"
  },
  {
    "codigo": "7771-10",
    "titulo": "CARPINTEIRO NAVAL (EMBARCAÇÕES)"
  },
  {
    "codigo": "7771-15",
    "titulo": "CARPINTEIRO NAVAL (ESTALEIROS)"
  },
  {
    "codigo": "7772-05",
    "titulo": "CARPINTEIRO DE CARRETAS"
  },
  {
    "codigo": "7772-10",
    "titulo": "CARPINTEIRO DE CARROCERIAS"
  },
  {
    "codigo": "7801-05",
    "titulo": "SUPERVISOR DE EMBALAGEM E ETIQUETAGEM"
  },
  {
    "codigo": "7811-05",
    "titulo": "CONDUTOR DE PROCESSOS ROBOTIZADOS DE PINTURA"
  },
  {
    "codigo": "7811-10",
    "titulo": "CONDUTOR DE PROCESSOS ROBOTIZADOS DE SOLDAGEM"
  },
  {
    "codigo": "7813-05",
    "titulo": "OPERADOR DE VEÍCULOS SUBAQUÁTICOS CONTROLADOS REMOTAMENTE"
  },
  {
    "codigo": "7817-05",
    "titulo": "MERGULHADOR PROFISSIONAL (RASO E PROFUNDO)"
  },
  {
    "codigo": "7821-05",
    "titulo": "OPERADOR DE DRAGA"
  },
  {
    "codigo": "7821-10",
    "titulo": "OPERADOR DE GUINDASTE (FIXO)"
  },
  {
    "codigo": "7821-15",
    "titulo": "OPERADOR DE GUINDASTE MÓVEL"
  },
  {
    "codigo": "7821-20",
    "titulo": "OPERADOR DE MÁQUINA RODOFERROVIÁRIA"
  },
  {
    "codigo": "7821-25",
    "titulo": "OPERADOR DE MONTA-CARGAS (CONSTRUÇÃO CIVIL)"
  },
  {
    "codigo": "7821-30",
    "titulo": "OPERADOR DE PONTE ROLANTE"
  },
  {
    "codigo": "7821-35",
    "titulo": "OPERADOR DE PÓRTICO ROLANTE"
  },
  {
    "codigo": "7821-40",
    "titulo": "OPERADOR DE TALHA ELÉTRICA"
  },
  {
    "codigo": "7821-45",
    "titulo": "SINALEIRO (PONTE-ROLANTE)"
  },
  {
    "codigo": "7822-05",
    "titulo": "GUINCHEIRO (CONSTRUÇÃO CIVIL)"
  },
  {
    "codigo": "7822-10",
    "titulo": "OPERADOR DE DOCAGEM"
  },
  {
    "codigo": "7822-20",
    "titulo": "OPERADOR DE EMPILHADEIRA"
  },
  {
    "codigo": "7823-05",
    "titulo": "MOTORISTA DE CARRO DE PASSEIO"
  },
  {
    "codigo": "7823-10",
    "titulo": "MOTORISTA DE FURGÃO OU VEÍCULO SIMILAR"
  },
  {
    "codigo": "7823-15",
    "titulo": "MOTORISTA DE TÁXI"
  },
  {
    "codigo": "7824-05",
    "titulo": "MOTORISTA DE ÔNIBUS RODOVIÁRIO"
  },
  {
    "codigo": "7824-10",
    "titulo": "MOTORISTA DE ÔNIBUS URBANO"
  },
  {
    "codigo": "7824-15",
    "titulo": "MOTORISTA DE TRÓLEBUS"
  },
  {
    "codigo": "7825-05",
    "titulo": "CAMINHONEIRO AUTÔNOMO (ROTAS REGIONAIS E INTERNACIONAIS)"
  },
  {
    "codigo": "7825-10",
    "titulo": "MOTORISTA DE CAMINHÃO (ROTAS REGIONAIS E INTERNACIONAIS)"
  },
  {
    "codigo": "7825-15",
    "titulo": "MOTORISTA OPERACIONAL DE GUINCHO"
  },
  {
    "codigo": "7826-05",
    "titulo": "OPERADOR DE TREM DE METRÔ"
  },
  {
    "codigo": "7826-10",
    "titulo": "MAQUINISTA DE TREM"
  },
  {
    "codigo": "7826-15",
    "titulo": "MAQUINISTA DE TREM METROPOLITANO"
  },
  {
    "codigo": "7826-20",
    "titulo": "MOTORNEIRO"
  },
  {
    "codigo": "7826-25",
    "titulo": "AUXILIAR DE MAQUINISTA DE TREM"
  },
  {
    "codigo": "7826-30",
    "titulo": "OPERADOR DE TELEFÉRICO (PASSAGEIROS)"
  },
  {
    "codigo": "7827-05",
    "titulo": "MARINHEIRO DE CONVÉS (MARÍTIMO E FLUVIÁRIO)"
  },
  {
    "codigo": "7827-10",
    "titulo": "MARINHEIRO DE MÁQUINAS"
  },
  {
    "codigo": "7827-15",
    "titulo": "MOÇO DE CONVÉS (MARÍTIMO E FLUVIÁRIO)"
  },
  {
    "codigo": "7827-20",
    "titulo": "MOÇO DE MÁQUINAS (MARÍTIMO E FLUVIÁRIO)"
  },
  {
    "codigo": "7827-25",
    "titulo": "MARINHEIRO DE ESPORTE E RECREIO"
  },
  {
    "codigo": "7828-05",
    "titulo": "CONDUTOR DE VEÍCULOS DE TRAÇÃO ANIMAL (RUAS E ESTRADAS)"
  },
  {
    "codigo": "7828-10",
    "titulo": "TROPEIRO"
  },
  {
    "codigo": "7828-15",
    "titulo": "BOIADEIRO"
  },
  {
    "codigo": "7828-20",
    "titulo": "CONDUTOR DE VEÍCULOS A PEDAIS"
  },
  {
    "codigo": "7831-05",
    "titulo": "AGENTE DE PÁTIO"
  },
  {
    "codigo": "7831-10",
    "titulo": "MANOBRADOR"
  },
  {
    "codigo": "7832-05",
    "titulo": "CARREGADOR (AERONAVES)"
  },
  {
    "codigo": "7832-10",
    "titulo": "CARREGADOR (ARMAZÉM)"
  },
  {
    "codigo": "7832-15",
    "titulo": "CARREGADOR (VEÍCULOS DE TRANSPORTES TERRESTRES)"
  },
  {
    "codigo": "7832-20",
    "titulo": "ESTIVADOR"
  },
  {
    "codigo": "7832-25",
    "titulo": "AJUDANTE DE MOTORISTA"
  },
  {
    "codigo": "7841-05",
    "titulo": "EMBALADOR, A MÃO"
  },
  {
    "codigo": "7841-10",
    "titulo": "EMBALADOR, A MÁQUINA"
  },
  {
    "codigo": "7841-15",
    "titulo": "OPERADOR DE MÁQUINA DE ETIQUETAR"
  },
  {
    "codigo": "7841-20",
    "titulo": "OPERADOR DE MÁQUINA DE ENVASAR LÍQUIDOS"
  },
  {
    "codigo": "7841-25",
    "titulo": "OPERADOR DE PRENSA DE ENFARDAMENTO"
  },
  {
    "codigo": "7842-05",
    "titulo": "ALIMENTADOR DE LINHA DE PRODUÇÃO"
  },
  {
    "codigo": "8101-05",
    "titulo": "MESTRE (INDÚSTRIA PETROQUÍMICA E CARBOQUÍMICA)"
  },
  {
    "codigo": "8101-10",
    "titulo": "MESTRE DE PRODUÇÃO QUÍMICA"
  },
  {
    "codigo": "8102-05",
    "titulo": "MESTRE (INDÚSTRIA DE BORRACHA E PLÁSTICO)"
  },
  {
    "codigo": "8103-05",
    "titulo": "MESTRE DE PRODUÇÃO FARMACÊUTICA"
  },
  {
    "codigo": "8110-05",
    "titulo": "OPERADOR DE PROCESSOS QUÍMICOS E PETROQUÍMICOS"
  },
  {
    "codigo": "8110-10",
    "titulo": "OPERADOR DE SALA DE CONTROLE DE INSTALAÇÕES QUÍMICAS, PETROQUÍMICAS E AFINS"
  },
  {
    "codigo": "8111-05",
    "titulo": "MOLEIRO (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8111-10",
    "titulo": "OPERADOR DE MÁQUINA MISTURADEIRA (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8111-15",
    "titulo": "OPERADOR DE BRITADEIRA (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8111-20",
    "titulo": "OPERADOR DE CONCENTRAÇÃO"
  },
  {
    "codigo": "8111-25",
    "titulo": "TRABALHADOR DA FABRICAÇÃO DE RESINAS E VERNIZES"
  },
  {
    "codigo": "8111-30",
    "titulo": "TRABALHADOR DE FABRICAÇÃO DE TINTAS"
  },
  {
    "codigo": "8112-05",
    "titulo": "OPERADOR DE CALCINAÇÃO (TRATAMENTO QUÍMICO E AFINS)"
  },
  {
    "codigo": "8112-15",
    "titulo": "OPERADOR DE TRATAMENTO QUÍMICO DE MATERIAIS RADIOATIVOS"
  },
  {
    "codigo": "8113-05",
    "titulo": "OPERADOR DE CENTRIFUGADORA (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8113-10",
    "titulo": "OPERADOR DE EXPLORAÇÃO DE PETRÓLEO"
  },
  {
    "codigo": "8113-15",
    "titulo": "OPERADOR DE FILTRO DE SECAGEM (MINERAÇÃO)"
  },
  {
    "codigo": "8113-20",
    "titulo": "OPERADOR DE FILTRO DE TAMBOR ROTATIVO (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8113-25",
    "titulo": "OPERADOR DE FILTRO-ESTEIRA (MINERAÇÃO)"
  },
  {
    "codigo": "8113-30",
    "titulo": "OPERADOR DE FILTRO-PRENSA (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8113-35",
    "titulo": "OPERADOR DE FILTROS DE PARAFINA (TRATAMENTOS QUÍMICOS E AFINS)"
  },
  {
    "codigo": "8114-05",
    "titulo": "DESTILADOR DE MADEIRA"
  },
  {
    "codigo": "8114-10",
    "titulo": "DESTILADOR DE PRODUTOS QUÍMICOS (EXCETO PETRÓLEO)"
  },
  {
    "codigo": "8114-15",
    "titulo": "OPERADOR DE ALAMBIQUE DE FUNCIONAMENTO CONTÍNUO (PRODUTOS QUÍMICOS, EXCETO PETRÓLEO)"
  },
  {
    "codigo": "8114-20",
    "titulo": "OPERADOR DE APARELHO DE REAÇÃO E CONVERSÃO (PRODUTOS QUÍMICOS, EXCETO PETRÓLEO)"
  },
  {
    "codigo": "8114-25",
    "titulo": "OPERADOR DE EQUIPAMENTO DE DESTILAÇÃO DE ÁLCOOL"
  },
  {
    "codigo": "8114-30",
    "titulo": "OPERADOR DE EVAPORADOR NA DESTILAÇÃO"
  },
  {
    "codigo": "8115-05",
    "titulo": "OPERADOR DE PAINEL DE CONTROLE (REFINAÇÃO DE PETRÓLEO)"
  },
  {
    "codigo": "8115-10",
    "titulo": "OPERADOR DE TRANSFERÊNCIA E ESTOCAGEM - NA REFINAÇÃO DO PETRÓLEO"
  },
  {
    "codigo": "8116-05",
    "titulo": "OPERADOR DE BRITADOR DE COQUE"
  },
  {
    "codigo": "8116-10",
    "titulo": "OPERADOR DE CARRO DE APAGAMENTO E COQUE"
  },
  {
    "codigo": "8116-15",
    "titulo": "OPERADOR DE DESTILAÇÃO E SUBPRODUTOS DE COQUE"
  },
  {
    "codigo": "8116-20",
    "titulo": "OPERADOR DE ENFORNAMENTO E DESENFORNAMENTO DE COQUE"
  },
  {
    "codigo": "8116-25",
    "titulo": "OPERADOR DE EXAUSTOR (COQUERIA)"
  },
  {
    "codigo": "8116-30",
    "titulo": "OPERADOR DE PAINEL DE CONTROLE"
  },
  {
    "codigo": "8116-35",
    "titulo": "OPERADOR DE PRESERVAÇÃO E CONTROLE TÉRMICO"
  },
  {
    "codigo": "8116-40",
    "titulo": "OPERADOR DE REATOR DE COQUE DE PETRÓLEO"
  },
  {
    "codigo": "8116-45",
    "titulo": "OPERADOR DE REFRIGERAÇÃO (COQUERIA)"
  },
  {
    "codigo": "8116-50",
    "titulo": "OPERADOR DE SISTEMA DE REVERSÃO (COQUERIA)"
  },
  {
    "codigo": "8117-05",
    "titulo": "BAMBURISTA"
  },
  {
    "codigo": "8117-10",
    "titulo": "CALANDRISTA DE BORRACHA"
  },
  {
    "codigo": "8117-15",
    "titulo": "CONFECCIONADOR DE PNEUMÁTICOS"
  },
  {
    "codigo": "8117-25",
    "titulo": "CONFECCIONADOR DE VELAS POR IMERSÃO"
  },
  {
    "codigo": "8117-35",
    "titulo": "CONFECCIONADOR DE VELAS POR MOLDAGEM"
  },
  {
    "codigo": "8117-45",
    "titulo": "LAMINADOR DE PLÁSTICO"
  },
  {
    "codigo": "8117-50",
    "titulo": "MOLDADOR DE BORRACHA POR COMPRESSÃO"
  },
  {
    "codigo": "8117-60",
    "titulo": "MOLDADOR DE PLÁSTICO POR COMPRESSÃO"
  },
  {
    "codigo": "8117-70",
    "titulo": "MOLDADOR DE PLÁSTICO POR INJEÇÃO"
  },
  {
    "codigo": "8117-75",
    "titulo": "TREFILADOR DE BORRACHA"
  },
  {
    "codigo": "8118-05",
    "titulo": "OPERADOR DE MÁQUINA DE PRODUTOS FARMACÊUTICOS"
  },
  {
    "codigo": "8118-10",
    "titulo": "DRAGEADOR (MEDICAMENTOS)"
  },
  {
    "codigo": "8118-15",
    "titulo": "OPERADOR DE MÁQUINA DE FABRICAÇÃO DE COSMÉTICOS"
  },
  {
    "codigo": "8118-20",
    "titulo": "OPERADOR DE MÁQUINA DE FABRICAÇÃO DE PRODUTOS DE HIGIENE E LIMPEZA (SABÃO, SABONETE, DETERGENTE,"
  },
  {
    "codigo": "8121-05",
    "titulo": "PIROTÉCNICO"
  },
  {
    "codigo": "8121-10",
    "titulo": "TRABALHADOR DA FABRICAÇÃO DE MUNIÇÃO E EXPLOSIVOS"
  },
  {
    "codigo": "8131-05",
    "titulo": "CILINDRISTA (PETROQUÍMICA E AFINS)"
  },
  {
    "codigo": "8131-10",
    "titulo": "OPERADOR DE CALANDRA (QUÍMICA, PETROQUÍMICA E AFINS)"
  },
  {
    "codigo": "8131-15",
    "titulo": "OPERADOR DE EXTRUSORA (QUÍMICA, PETROQUÍMICA E AFINS)"
  },
  {
    "codigo": "8131-20",
    "titulo": "OPERADOR DE PROCESSO (QUÍMICA, PETROQUÍMICA E AFINS)"
  },
  {
    "codigo": "8131-25",
    "titulo": "OPERADOR DE PRODUÇÃO (QUÍMICA, PETROQUÍMICA E AFINS)"
  },
  {
    "codigo": "8131-30",
    "titulo": "TÉCNICO DE OPERAÇÃO (QUÍMICA, PETROQUÍMICA E AFINS)"
  },
  {
    "codigo": "8181-05",
    "titulo": "ASSISTENTE DE LABORATÓRIO INDUSTRIAL"
  },
  {
    "codigo": "8181-10",
    "titulo": "AUXILIAR DE LABORATÓRIO DE ANÁLISES FÍSICO-QUÍMICAS"
  },
  {
    "codigo": "8201-05",
    "titulo": "MESTRE DE SIDERURGIA"
  },
  {
    "codigo": "8201-10",
    "titulo": "MESTRE DE ACIARIA"
  },
  {
    "codigo": "8201-15",
    "titulo": "MESTRE DE ALTO-FORNO"
  },
  {
    "codigo": "8201-20",
    "titulo": "MESTRE DE FORNO ELÉTRICO"
  },
  {
    "codigo": "8201-25",
    "titulo": "MESTRE DE LAMINAÇÃO"
  },
  {
    "codigo": "8202-05",
    "titulo": "SUPERVISOR DE FABRICAÇÃO DE PRODUTOS CERÂMICOS, PORCELANATOS E AFINS"
  },
  {
    "codigo": "8202-10",
    "titulo": "SUPERVISOR DE FABRICAÇÃO DE PRODUTOS DE VIDRO"
  },
  {
    "codigo": "8211-05",
    "titulo": "OPERADOR DE CENTRO DE CONTROLE"
  },
  {
    "codigo": "8211-10",
    "titulo": "OPERADOR DE MÁQUINA DE SINTERIZAR"
  },
  {
    "codigo": "8212-05",
    "titulo": "FORNEIRO E OPERADOR (ALTO-FORNO)"
  },
  {
    "codigo": "8212-10",
    "titulo": "FORNEIRO E OPERADOR (CONVERSOR A OXIGÊNIO)"
  },
  {
    "codigo": "8212-15",
    "titulo": "FORNEIRO E OPERADOR (FORNO ELÉTRICO)"
  },
  {
    "codigo": "8212-20",
    "titulo": "FORNEIRO E OPERADOR (REFINO DE METAIS NÃO-FERROSOS)"
  },
  {
    "codigo": "8212-25",
    "titulo": "FORNEIRO E OPERADOR DE FORNO DE REDUÇÃO DIRETA"
  },
  {
    "codigo": "8212-30",
    "titulo": "OPERADOR DE ACIARIA (BASCULAMENTO DE CONVERTEDOR)"
  },
  {
    "codigo": "8212-35",
    "titulo": "OPERADOR DE ACIARIA (DESSULFURAÇÃO DE GUSA)"
  },
  {
    "codigo": "8212-40",
    "titulo": "OPERADOR DE ACIARIA (RECEBIMENTO DE GUSA)"
  },
  {
    "codigo": "8212-45",
    "titulo": "OPERADOR DE ÁREA DE CORRIDA"
  },
  {
    "codigo": "8212-50",
    "titulo": "OPERADOR DE DESGASEIFICAÇÃO"
  },
  {
    "codigo": "8212-55",
    "titulo": "SOPRADOR DE CONVERTEDOR"
  },
  {
    "codigo": "8213-05",
    "titulo": "OPERADOR DE LAMINADOR"
  },
  {
    "codigo": "8213-10",
    "titulo": "OPERADOR DE LAMINADOR DE BARRAS A FRIO"
  },
  {
    "codigo": "8213-15",
    "titulo": "OPERADOR DE LAMINADOR DE BARRAS A QUENTE"
  },
  {
    "codigo": "8213-20",
    "titulo": "OPERADOR DE LAMINADOR DE METAIS NÃO-FERROSOS"
  },
  {
    "codigo": "8213-25",
    "titulo": "OPERADOR DE LAMINADOR DE TUBOS"
  },
  {
    "codigo": "8213-30",
    "titulo": "OPERADOR DE MONTAGEM DE CILINDROS E MANCAIS"
  },
  {
    "codigo": "8213-35",
    "titulo": "RECUPERADOR DE GUIAS E CILINDROS"
  },
  {
    "codigo": "8214-05",
    "titulo": "ENCARREGADO DE ACABAMENTO DE CHAPAS E METAIS (TÊMPERA)"
  },
  {
    "codigo": "8214-10",
    "titulo": "ESCARFADOR"
  },
  {
    "codigo": "8214-15",
    "titulo": "MARCADOR DE PRODUTOS (SIDERÚRGICO E METALÚRGICO)"
  },
  {
    "codigo": "8214-20",
    "titulo": "OPERADOR DE BOBINADEIRA DE TIRAS A QUENTE, NO ACABAMENTO DE CHAPAS E METAIS"
  },
  {
    "codigo": "8214-25",
    "titulo": "OPERADOR DE CABINE DE LAMINAÇÃO (FIO-MÁQUINA)"
  },
  {
    "codigo": "8214-30",
    "titulo": "OPERADOR DE ESCÓRIA E SUCATA"
  },
  {
    "codigo": "8214-35",
    "titulo": "OPERADOR DE JATO ABRASIVO"
  },
  {
    "codigo": "8214-40",
    "titulo": "OPERADOR DE TESOURA MECÂNICA E MÁQUINA DE CORTE, NO ACABAMENTO DE CHAPAS E METAIS"
  },
  {
    "codigo": "8214-45",
    "titulo": "PREPARADOR DE SUCATA E APARAS"
  },
  {
    "codigo": "8214-50",
    "titulo": "REBARBADOR DE METAL"
  },
  {
    "codigo": "8221-05",
    "titulo": "FORNEIRO DE CUBILÔ"
  },
  {
    "codigo": "8221-10",
    "titulo": "FORNEIRO DE FORNO-POÇO"
  },
  {
    "codigo": "8221-15",
    "titulo": "FORNEIRO DE FUNDIÇÃO (FORNO DE REDUÇÃO)"
  },
  {
    "codigo": "8221-20",
    "titulo": "FORNEIRO DE REAQUECIMENTO E TRATAMENTO TÉRMICO NA METALURGIA"
  },
  {
    "codigo": "8221-25",
    "titulo": "FORNEIRO DE REVÉRBERO"
  },
  {
    "codigo": "8231-05",
    "titulo": "PREPARADOR DE MASSA (FABRICAÇÃO DE ABRASIVOS)"
  },
  {
    "codigo": "8231-10",
    "titulo": "PREPARADOR DE MASSA (FABRICAÇÃO DE VIDRO)"
  },
  {
    "codigo": "8231-15",
    "titulo": "PREPARADOR DE MASSA DE ARGILA"
  },
  {
    "codigo": "8231-20",
    "titulo": "PREPARADOR DE BARBOTINA"
  },
  {
    "codigo": "8231-25",
    "titulo": "PREPARADOR DE ESMALTES (CERÂMICA)"
  },
  {
    "codigo": "8231-30",
    "titulo": "PREPARADOR DE ADITIVOS"
  },
  {
    "codigo": "8231-35",
    "titulo": "OPERADOR DE ATOMIZADOR"
  },
  {
    "codigo": "8232-10",
    "titulo": "EXTRUSOR DE FIOS OU FIBRAS DE VIDRO"
  },
  {
    "codigo": "8232-15",
    "titulo": "FORNEIRO NA FUNDIÇÃO DE VIDRO"
  },
  {
    "codigo": "8232-20",
    "titulo": "FORNEIRO NO RECOZIMENTO DE VIDRO"
  },
  {
    "codigo": "8232-30",
    "titulo": "MOLDADOR DE ABRASIVOS NA FABRICAÇÃO DE CERÂMICA, VIDRO E PORCELANA"
  },
  {
    "codigo": "8232-35",
    "titulo": "OPERADOR DE BANHO METÁLICO DE VIDRO POR FLUTUAÇÃO"
  },
  {
    "codigo": "8232-40",
    "titulo": "OPERADOR DE MÁQUINA DE SOPRAR VIDRO"
  },
  {
    "codigo": "8232-45",
    "titulo": "OPERADOR DE MÁQUINA EXTRUSORA DE VARETAS E TUBOS DE VIDRO"
  },
  {
    "codigo": "8232-50",
    "titulo": "OPERADOR DE PRENSA DE MOLDAR VIDRO"
  },
  {
    "codigo": "8232-55",
    "titulo": "TEMPERADOR DE VIDRO"
  },
  {
    "codigo": "8232-65",
    "titulo": "TRABALHADOR NA FABRICAÇÃO DE PRODUTOS ABRASIVOS"
  },
  {
    "codigo": "8233-05",
    "titulo": "CLASSIFICADOR E EMPILHADOR DE TIJOLOS REFRATÁRIOS"
  },
  {
    "codigo": "8233-15",
    "titulo": "FORNEIRO (MATERIAIS DE CONSTRUÇÃO)"
  },
  {
    "codigo": "8233-20",
    "titulo": "TRABALHADOR DA ELABORAÇÃO DE PRÉ-FABRICADOS (CIMENTO AMIANTO)"
  },
  {
    "codigo": "8233-25",
    "titulo": "TRABALHADOR DA ELABORAÇÃO DE PRÉ-FABRICADOS (CONCRETO ARMADO)"
  },
  {
    "codigo": "8233-30",
    "titulo": "TRABALHADOR DA FABRICAÇÃO DE PEDRAS ARTIFICIAIS"
  },
  {
    "codigo": "8281-05",
    "titulo": "OLEIRO (FABRICAÇÃO DE TELHAS)"
  },
  {
    "codigo": "8281-10",
    "titulo": "OLEIRO (FABRICAÇÃO DE TIJOLOS)"
  },
  {
    "codigo": "8301-05",
    "titulo": "MESTRE (INDÚSTRIA DE CELULOSE, PAPEL E PAPELÃO)"
  },
  {
    "codigo": "8311-05",
    "titulo": "CILINDREIRO NA PREPARAÇÃO DE PASTA PARA FABRICAÇÃO DE PAPEL"
  },
  {
    "codigo": "8311-10",
    "titulo": "OPERADOR DE BRANQUEADOR DE PASTA PARA FABRICAÇÃO DE PAPEL"
  },
  {
    "codigo": "8311-15",
    "titulo": "OPERADOR DE DIGESTOR DE PASTA PARA FABRICAÇÃO DE PAPEL"
  },
  {
    "codigo": "8311-20",
    "titulo": "OPERADOR DE LAVAGEM E DEPURAÇÃO DE PASTA PARA FABRICAÇÃO DE PAPEL"
  },
  {
    "codigo": "8311-25",
    "titulo": "OPERADOR DE MÁQUINA DE SECAR CELULOSE"
  },
  {
    "codigo": "8321-05",
    "titulo": "CALANDRISTA DE PAPEL"
  },
  {
    "codigo": "8321-10",
    "titulo": "OPERADOR DE CORTADEIRA DE PAPEL"
  },
  {
    "codigo": "8321-15",
    "titulo": "OPERADOR DE MÁQUINA DE FABRICAR PAPEL (FASE ÚMIDA)"
  },
  {
    "codigo": "8321-20",
    "titulo": "OPERADOR DE MÁQUINA DE FABRICAR PAPEL (FASE SECA)"
  },
  {
    "codigo": "8321-25",
    "titulo": "OPERADOR DE MÁQUINA DE FABRICAR PAPEL E PAPELÃO"
  },
  {
    "codigo": "8321-35",
    "titulo": "OPERADOR DE REBOBINADEIRA NA FABRICAÇÃO DE PAPEL E PAPELÃO"
  },
  {
    "codigo": "8331-05",
    "titulo": "CARTONAGEIRO, A MÁQUINA"
  },
  {
    "codigo": "8331-10",
    "titulo": "CONFECCIONADOR DE BOLSAS, SACOS E SACOLAS E PAPEL, A MÁQUINA"
  },
  {
    "codigo": "8331-15",
    "titulo": "CONFECCIONADOR DE SACOS DE CELOFANE, A MÁQUINA"
  },
  {
    "codigo": "8331-20",
    "titulo": "OPERADOR DE MÁQUINA DE CORTAR E DOBRAR PAPELÃO"
  },
  {
    "codigo": "8331-25",
    "titulo": "OPERADOR DE PRENSA DE EMBUTIR PAPELÃO"
  },
  {
    "codigo": "8332-05",
    "titulo": "CARTONAGEIRO, A MÃO (CAIXAS DE PAPELÃO)"
  },
  {
    "codigo": "8401-05",
    "titulo": "SUPERVISOR DE PRODUÇÃO DA INDÚSTRIA ALIMENTÍCIA"
  },
  {
    "codigo": "8401-10",
    "titulo": "SUPERVISOR DA INDÚSTRIA DE BEBIDAS"
  },
  {
    "codigo": "8401-15",
    "titulo": "SUPERVISOR DA INDÚSTRIA DE FUMO"
  },
  {
    "codigo": "8401-20",
    "titulo": "CHEFE DE CONFEITARIA"
  },
  {
    "codigo": "8411-05",
    "titulo": "MOLEIRO DE CEREAIS (EXCETO ARROZ)"
  },
  {
    "codigo": "8411-10",
    "titulo": "MOLEIRO DE ESPECIARIAS"
  },
  {
    "codigo": "8411-15",
    "titulo": "OPERADOR DE PROCESSO DE MOAGEM"
  },
  {
    "codigo": "8412-05",
    "titulo": "MOEDOR DE SAL"
  },
  {
    "codigo": "8412-10",
    "titulo": "REFINADOR DE SAL"
  },
  {
    "codigo": "8413-05",
    "titulo": "OPERADOR DE CRISTALIZAÇÃO NA REFINAÇÃO DE AÇUCAR"
  },
  {
    "codigo": "8413-10",
    "titulo": "OPERADOR DE EQUIPAMENTOS DE REFINAÇÃO DE AÇÚCAR (PROCESSO CONTÍNUO)"
  },
  {
    "codigo": "8413-15",
    "titulo": "OPERADOR DE MOENDA NA FABRICAÇÃO DE AÇÚCAR"
  },
  {
    "codigo": "8413-20",
    "titulo": "OPERADOR DE TRATAMENTO DE CALDA NA REFINAÇÃO DE AÇÚCAR"
  },
  {
    "codigo": "8414-08",
    "titulo": "COZINHADOR (CONSERVAÇÃO DE ALIMENTOS)"
  },
  {
    "codigo": "8414-16",
    "titulo": "COZINHADOR DE CARNES"
  },
  {
    "codigo": "8414-20",
    "titulo": "COZINHADOR DE FRUTAS E LEGUMES"
  },
  {
    "codigo": "8414-28",
    "titulo": "COZINHADOR DE PESCADO"
  },
  {
    "codigo": "8414-32",
    "titulo": "DESIDRATADOR DE ALIMENTOS"
  },
  {
    "codigo": "8414-40",
    "titulo": "ESTERILIZADOR DE ALIMENTOS"
  },
  {
    "codigo": "8414-44",
    "titulo": "HIDROGENADOR DE ÓLEOS E GORDURAS"
  },
  {
    "codigo": "8414-48",
    "titulo": "LAGAREIRO"
  },
  {
    "codigo": "8414-56",
    "titulo": "OPERADOR DE CÂMARAS FRIAS"
  },
  {
    "codigo": "8414-60",
    "titulo": "OPERADOR DE PREPARAÇÃO DE GRÃOS VEGETAIS (ÓLEOS E GORDURAS)"
  },
  {
    "codigo": "8414-64",
    "titulo": "PRENSADOR DE FRUTAS (EXCETO OLEAGINOSAS)"
  },
  {
    "codigo": "8414-68",
    "titulo": "PREPARADOR DE RAÇÕES"
  },
  {
    "codigo": "8414-72",
    "titulo": "REFINADOR DE ÓLEO E GORDURA"
  },
  {
    "codigo": "8414-76",
    "titulo": "TRABALHADOR DE FABRICAÇÃO DE MARGARINA"
  },
  {
    "codigo": "8414-84",
    "titulo": "TRABALHADOR DE PREPARAÇÃO DE PESCADOS (LIMPEZA)"
  },
  {
    "codigo": "8415-05",
    "titulo": "TRABALHADOR DE TRATAMENTO DO LEITE E FABRICAÇÃO DE LATICÍNIOS E AFINS"
  },
  {
    "codigo": "8416-05",
    "titulo": "MISTURADOR DE CAFÉ"
  },
  {
    "codigo": "8416-10",
    "titulo": "TORRADOR DE CAFÉ"
  },
  {
    "codigo": "8416-15",
    "titulo": "MOEDOR DE CAFÉ"
  },
  {
    "codigo": "8416-20",
    "titulo": "OPERADOR DE EXTRAÇÃO DE CAFÉ SOLÚVEL"
  },
  {
    "codigo": "8416-25",
    "titulo": "TORRADOR DE CACAU"
  },
  {
    "codigo": "8416-30",
    "titulo": "MISTURADOR DE CHÁ OU MATE"
  },
  {
    "codigo": "8417-05",
    "titulo": "ALAMBIQUEIRO"
  },
  {
    "codigo": "8417-10",
    "titulo": "FILTRADOR DE CERVEJA"
  },
  {
    "codigo": "8417-15",
    "titulo": "FERMENTADOR"
  },
  {
    "codigo": "8417-20",
    "titulo": "TRABALHADOR DE FABRICAÇÃO DE VINHOS"
  },
  {
    "codigo": "8417-25",
    "titulo": "MALTEIRO (GERMINAÇÃO)"
  },
  {
    "codigo": "8417-30",
    "titulo": "COZINHADOR DE MALTE"
  },
  {
    "codigo": "8417-35",
    "titulo": "DESSECADOR DE MALTE"
  },
  {
    "codigo": "8417-40",
    "titulo": "VINAGREIRO"
  },
  {
    "codigo": "8417-45",
    "titulo": "XAROPEIRO"
  },
  {
    "codigo": "8418-05",
    "titulo": "OPERADOR DE FORNO (FABRICAÇÃO DE PÃES, BISCOITOS E SIMILARES)"
  },
  {
    "codigo": "8418-10",
    "titulo": "OPERADOR DE MÁQUINAS DE FABRICAÇÃO DE DOCES, SALGADOS E MASSAS ALIMENTÍCIAS"
  },
  {
    "codigo": "8418-15",
    "titulo": "OPERADOR DE MÁQUINAS DE FABRICAÇÃO DE CHOCOLATES E ACHOCOLATADOS"
  },
  {
    "codigo": "8421-05",
    "titulo": "PREPARADOR DE MELADO E ESSÊNCIA DE FUMO"
  },
  {
    "codigo": "8421-10",
    "titulo": "PROCESSADOR DE FUMO"
  },
  {
    "codigo": "8421-15",
    "titulo": "CLASSIFICADOR DE FUMO"
  },
  {
    "codigo": "8421-20",
    "titulo": "AUXILIAR DE PROCESSAMENTO DE FUMO"
  },
  {
    "codigo": "8421-25",
    "titulo": "OPERADOR DE MÁQUINA (FABRICAÇÃO DE CIGARROS)"
  },
  {
    "codigo": "8421-35",
    "titulo": "OPERADOR DE MÁQUINA DE PREPARAÇÃO DE MATÉRIA PRIMA PARA PRODUÇÃO DE CIGARROS"
  },
  {
    "codigo": "8422-05",
    "titulo": "PREPARADOR DE FUMO NA FABRICAÇÃO DE CHARUTOS"
  },
  {
    "codigo": "8422-10",
    "titulo": "OPERADOR DE MÁQUINA DE FABRICAR CHARUTOS E CIGARRILHAS"
  },
  {
    "codigo": "8422-15",
    "titulo": "CLASSIFICADOR DE CHARUTOS"
  },
  {
    "codigo": "8422-20",
    "titulo": "CORTADOR DE CHARUTOS"
  },
  {
    "codigo": "8422-25",
    "titulo": "CELOFANISTA NA FABRICAÇÃO DE CHARUTOS"
  },
  {
    "codigo": "8422-30",
    "titulo": "CHARUTEIRO A MÃO"
  },
  {
    "codigo": "8422-35",
    "titulo": "DEGUSTADOR DE CHARUTOS"
  },
  {
    "codigo": "8481-05",
    "titulo": "DEFUMADOR DE CARNES E PESCADOS"
  },
  {
    "codigo": "8481-10",
    "titulo": "SALGADOR DE ALIMENTOS"
  },
  {
    "codigo": "8481-15",
    "titulo": "SALSICHEIRO (FABRICAÇÃO DE LINGÜIÇA, SALSICHA E PRODUTOS SIMILARES)"
  },
  {
    "codigo": "8482-05",
    "titulo": "PASTEURIZADOR"
  },
  {
    "codigo": "8482-10",
    "titulo": "QUEIJEIRO NA FABRICAÇÃO DE LATICÍNIO"
  },
  {
    "codigo": "8482-15",
    "titulo": "MANTEIGUEIRO NA FABRICAÇÃO DE LATICÍNIO"
  },
  {
    "codigo": "8483-05",
    "titulo": "PADEIRO"
  },
  {
    "codigo": "8483-10",
    "titulo": "CONFEITEIRO"
  },
  {
    "codigo": "8483-15",
    "titulo": "MASSEIRO (MASSAS ALIMENTÍCIAS)"
  },
  {
    "codigo": "8483-25",
    "titulo": "TRABALHADOR DE FABRICAÇÃO DE SORVETE"
  },
  {
    "codigo": "8484-05",
    "titulo": "DEGUSTADOR DE CAFÉ"
  },
  {
    "codigo": "8484-10",
    "titulo": "DEGUSTADOR DE CHÁ"
  },
  {
    "codigo": "8484-15",
    "titulo": "DEGUSTADOR DE DERIVADOS DE CACAU"
  },
  {
    "codigo": "8484-20",
    "titulo": "DEGUSTADOR DE VINHOS OU LICORES"
  },
  {
    "codigo": "8484-25",
    "titulo": "CLASSIFICADOR DE GRÃOS"
  },
  {
    "codigo": "8485-05",
    "titulo": "ABATEDOR"
  },
  {
    "codigo": "8485-10",
    "titulo": "AÇOUGUEIRO"
  },
  {
    "codigo": "8485-15",
    "titulo": "DESOSSADOR"
  },
  {
    "codigo": "8485-20",
    "titulo": "MAGAREFE"
  },
  {
    "codigo": "8485-25",
    "titulo": "RETALHADOR DE CARNE"
  },
  {
    "codigo": "8486-05",
    "titulo": "TRABALHADOR DO BENEFICIAMENTO DE FUMO"
  },
  {
    "codigo": "8601-05",
    "titulo": "SUPERVISOR DE MANUTENÇÃO ELETROMECÂNICA (UTILIDADES)"
  },
  {
    "codigo": "8601-10",
    "titulo": "SUPERVISOR DE OPERAÇÃO DE FLUIDOS (DISTRIBUIÇÃO, CAPTAÇÃO, TRATAMENTO DE ÁGUA, GASES, VAPOR)"
  },
  {
    "codigo": "8601-15",
    "titulo": "SUPERVISOR DE OPERAÇÃO ELÉTRICA (GERAÇÃO, TRANSMISSÃO E DISTRIBUIÇÃO DE ENERGIA ELÉTRICA)"
  },
  {
    "codigo": "8611-05",
    "titulo": "OPERADOR DE CENTRAL HIDRELÉTRICA"
  },
  {
    "codigo": "8611-10",
    "titulo": "OPERADOR DE QUADRO DE DISTRIBUIÇÃO DE ENERGIA ELÉTRICA"
  },
  {
    "codigo": "8611-15",
    "titulo": "OPERADOR DE CENTRAL TERMOELÉTRICA"
  },
  {
    "codigo": "8611-20",
    "titulo": "OPERADOR DE REATOR NUCLEAR"
  },
  {
    "codigo": "8612-05",
    "titulo": "OPERADOR DE SUBESTAÇÃO"
  },
  {
    "codigo": "8621-05",
    "titulo": "FOGUISTA (LOCOMOTIVAS A VAPOR)"
  },
  {
    "codigo": "8621-10",
    "titulo": "MAQUINISTA DE EMBARCAÇÕES"
  },
  {
    "codigo": "8621-15",
    "titulo": "OPERADOR DE BATERIA DE GÁS DE HULHA"
  },
  {
    "codigo": "8621-20",
    "titulo": "OPERADOR DE CALDEIRA"
  },
  {
    "codigo": "8621-30",
    "titulo": "OPERADOR DE COMPRESSOR DE AR"
  },
  {
    "codigo": "8621-40",
    "titulo": "OPERADOR DE ESTAÇÃO DE BOMBEAMENTO"
  },
  {
    "codigo": "8621-50",
    "titulo": "OPERADOR DE MÁQUINAS FIXAS, EM GERAL"
  },
  {
    "codigo": "8621-55",
    "titulo": "OPERADOR DE UTILIDADE (PRODUÇÃO E DISTRIBUIÇÃO DE VAPOR, GÁS, ÓLEO, COMBUSTÍVEL, ENERGIA, OXIGÊNIO)"
  },
  {
    "codigo": "8622-05",
    "titulo": "OPERADOR DE ESTAÇÃO DE CAPTAÇÃO, TRATAMENTO E DISTRIBUIÇÃO DE ÁGUA"
  },
  {
    "codigo": "8623-05",
    "titulo": "OPERADOR DE ESTAÇÃO DE TRATAMENTO DE ÁGUA E EFLUENTES"
  },
  {
    "codigo": "8623-10",
    "titulo": "OPERADOR DE FORNO DE INCINERAÇÃO NO TRATAMENTO DE ÁGUA, EFLUENTES E RESÍDUOS INDUSTRIAIS"
  },
  {
    "codigo": "8624-05",
    "titulo": "OPERADOR DE INSTALAÇÃO DE EXTRAÇÃO, PROCESSAMENTO, ENVASAMENTO E DISTRIBUIÇÃO DE GASES"
  },
  {
    "codigo": "8625-05",
    "titulo": "OPERADOR DE INSTALAÇÃO DE REFRIGERAÇÃO"
  },
  {
    "codigo": "8625-10",
    "titulo": "OPERADOR DE REFRIGERAÇÃO COM AMÔNIA"
  },
  {
    "codigo": "8625-15",
    "titulo": "OPERADOR DE INSTALAÇÃO DE AR-CONDICIONADO"
  },
  {
    "codigo": "9101-05",
    "titulo": "ENCARREGADO DE MANUTENÇÃO MECÂNICA DE SISTEMAS OPERACIONAIS"
  },
  {
    "codigo": "9101-10",
    "titulo": "SUPERVISOR DE MANUTENÇÃO DE APARELHOS TÉRMICOS, DE CLIMATIZAÇÃO E DE REFRIGERAÇÃO"
  },
  {
    "codigo": "9101-15",
    "titulo": "SUPERVISOR DE MANUTENÇÃO DE BOMBAS, MOTORES, COMPRESSORES E EQUIPAMENTOS DE TRANSMISSÃO"
  },
  {
    "codigo": "9101-20",
    "titulo": "SUPERVISOR DE MANUTENÇÃO DE MÁQUINAS GRÁFICAS"
  },
  {
    "codigo": "9101-25",
    "titulo": "SUPERVISOR DE MANUTENÇÃO DE MÁQUINAS INDUSTRIAIS TÊXTEIS"
  },
  {
    "codigo": "9101-30",
    "titulo": "SUPERVISOR DE MANUTENÇÃO DE MÁQUINAS OPERATRIZES E DE USINAGEM"
  },
  {
    "codigo": "9102-05",
    "titulo": "SUPERVISOR DA MANUTENÇÃO E REPARAÇÃO DE VEÍCULOS LEVES"
  },
  {
    "codigo": "9102-10",
    "titulo": "SUPERVISOR DA MANUTENÇÃO E REPARAÇÃO DE VEÍCULOS PESADOS"
  },
  {
    "codigo": "9109-05",
    "titulo": "SUPERVISOR DE REPAROS LINHAS FÉRREAS"
  },
  {
    "codigo": "9109-10",
    "titulo": "SUPERVISOR DE MANUTENÇÃO DE VIAS FÉRREAS"
  },
  {
    "codigo": "9111-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE BOMBA INJETORA (EXCETO DE VEÍCULOS AUTOMOTORES)"
  },
  {
    "codigo": "9111-10",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE BOMBAS"
  },
  {
    "codigo": "9111-15",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE COMPRESSORES DE AR"
  },
  {
    "codigo": "9111-20",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MOTORES DIESEL (EXCETO DE VEÍCULOS AUTOMOTORES)"
  },
  {
    "codigo": "9111-25",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE REDUTORES"
  },
  {
    "codigo": "9111-30",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE TURBINAS (EXCETO DE AERONAVES)"
  },
  {
    "codigo": "9111-35",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE TURBOCOMPRESSORES"
  },
  {
    "codigo": "9112-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO E INSTALAÇÃO DE APARELHOS DE CLIMATIZAÇÃO E REFRIGERAÇÃO"
  },
  {
    "codigo": "9113-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS, EM GERAL"
  },
  {
    "codigo": "9113-10",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS GRÁFICAS"
  },
  {
    "codigo": "9113-15",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS OPERATRIZES (LAVRA DE MADEIRA)"
  },
  {
    "codigo": "9113-20",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS TÊXTEIS"
  },
  {
    "codigo": "9113-25",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS-FERRAMENTAS (USINAGEM DE METAIS)"
  },
  {
    "codigo": "9131-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE APARELHOS DE LEVANTAMENTO"
  },
  {
    "codigo": "9131-10",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE EQUIPAMENTO DE MINERAÇÃO"
  },
  {
    "codigo": "9131-15",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS AGRÍCOLAS"
  },
  {
    "codigo": "9131-20",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS DE CONSTRUÇÃO E TERRAPLENAGEM"
  },
  {
    "codigo": "9141-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE AERONAVES, EM GERAL"
  },
  {
    "codigo": "9141-10",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE SISTEMA HIDRÁULICO DE AERONAVES (SERVIÇOS DE PISTA E HANGAR)"
  },
  {
    "codigo": "9142-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MOTORES E EQUIPAMENTOS NAVAIS"
  },
  {
    "codigo": "9143-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE VEÍCULOS FERROVIÁRIOS"
  },
  {
    "codigo": "9144-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE AUTOMÓVEIS, MOTOCICLETAS E VEÍCULOS SIMILARES"
  },
  {
    "codigo": "9144-10",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE EMPILHADEIRAS E OUTROS VEÍCULOS DE CARGAS LEVES"
  },
  {
    "codigo": "9144-15",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MOTOCICLETAS"
  },
  {
    "codigo": "9144-20",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE TRATORES"
  },
  {
    "codigo": "9144-25",
    "titulo": "MECÂNICO DE VEÍCULOS AUTOMOTORES A DIESEL (EXCETO TRATORES)"
  },
  {
    "codigo": "9151-05",
    "titulo": "TÉCNICO EM MANUTENÇÃO DE INSTRUMENTOS DE MEDIÇÃO E PRECISÃO"
  },
  {
    "codigo": "9151-10",
    "titulo": "TÉCNICO EM MANUTENÇÃO DE HIDRÔMETROS"
  },
  {
    "codigo": "9151-15",
    "titulo": "TÉCNICO EM MANUTENÇÃO DE BALANÇAS"
  },
  {
    "codigo": "9152-05",
    "titulo": "RESTAURADOR DE INSTRUMENTOS MUSICAIS (EXCETO CORDAS ARCADAS)"
  },
  {
    "codigo": "9152-10",
    "titulo": "REPARADOR DE INSTRUMENTOS MUSICAIS"
  },
  {
    "codigo": "9152-15",
    "titulo": "LUTHIER (RESTAURAÇÃO DE CORDAS ARCADAS)"
  },
  {
    "codigo": "9153-05",
    "titulo": "TÉCNICO EM MANUTENÇÃO DE EQUIPAMENTOS E INSTRUMENTOS MÉDICO-HOSPITALARES"
  },
  {
    "codigo": "9154-05",
    "titulo": "REPARADOR DE EQUIPAMENTOS FOTOGRÁFICOS"
  },
  {
    "codigo": "9191-05",
    "titulo": "LUBRIFICADOR INDUSTRIAL"
  },
  {
    "codigo": "9191-10",
    "titulo": "LUBRIFICADOR DE VEÍCULOS AUTOMOTORES (EXCETO EMBARCAÇÕES)"
  },
  {
    "codigo": "9191-15",
    "titulo": "LUBRIFICADOR DE EMBARCAÇÕES"
  },
  {
    "codigo": "9192-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE MÁQUINAS CORTADORAS DE GRAMA, ROÇADEIRAS, MOTOSSERRAS E SIMILARES"
  },
  {
    "codigo": "9193-05",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE APARELHOS ESPORTIVOS E DE GINÁSTICA"
  },
  {
    "codigo": "9193-10",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE BICICLETAS E VEÍCULOS SIMILARES"
  },
  {
    "codigo": "9193-15",
    "titulo": "MONTADOR DE BICICLETAS"
  },
  {
    "codigo": "9501-05",
    "titulo": "SUPERVISOR DE MANUTENÇÃO ELÉTRICA DE ALTA TENSÃO INDUSTRIAL"
  },
  {
    "codigo": "9501-10",
    "titulo": "SUPERVISOR DE MANUTENÇÃO ELETROMECÂNICA INDUSTRIAL, COMERCIAL E PREDIAL"
  },
  {
    "codigo": "9502-05",
    "titulo": "ENCARREGADO DE MANUTENÇÃO ELÉTRICA DE VEÍCULOS"
  },
  {
    "codigo": "9503-05",
    "titulo": "SUPERVISOR DE MANUTENÇÃO ELETROMECÂNICA"
  },
  {
    "codigo": "9511-05",
    "titulo": "ELETRICISTA DE MANUTENÇÃO ELETROELETRÔNICA"
  },
  {
    "codigo": "9513-05",
    "titulo": "INSTALADOR DE SISTEMAS ELETROELETRÔNICOS DE SEGURANÇA"
  },
  {
    "codigo": "9513-10",
    "titulo": "MANTENEDOR DE SISTEMAS ELETROELETRÔNICOS DE SEGURANÇA"
  },
  {
    "codigo": "9531-05",
    "titulo": "ELETRICISTA DE INSTALAÇÕES (AERONAVES)"
  },
  {
    "codigo": "9531-10",
    "titulo": "ELETRICISTA DE INSTALAÇÕES (EMBARCAÇÕES)"
  },
  {
    "codigo": "9531-15",
    "titulo": "ELETRICISTA DE INSTALAÇÕES (VEÍCULOS AUTOMOTORES E MÁQUINAS OPERATRIZES, EXCETO AERONAVES E EMBARCAÇÕES)"
  },
  {
    "codigo": "9541-05",
    "titulo": "ELETROMECÂNICO DE MANUTENÇÃO DE ELEVADORES"
  },
  {
    "codigo": "9541-10",
    "titulo": "ELETROMECÂNICO DE MANUTENÇÃO DE ESCADAS ROLANTES"
  },
  {
    "codigo": "9541-15",
    "titulo": "ELETROMECÂNICO DE MANUTENÇÃO DE PORTAS AUTOMÁTICAS"
  },
  {
    "codigo": "9541-20",
    "titulo": "MECÂNICO DE MANUTENÇÃO DE INSTALAÇÕES MECÂNICAS DE EDIFÍCIOS"
  },
  {
    "codigo": "9541-25",
    "titulo": "OPERADOR ELETROMECÂNICO"
  },
  {
    "codigo": "9542-05",
    "titulo": "REPARADOR DE APARELHOS ELETRODOMÉSTICOS (EXCETO IMAGEM E SOM)"
  },
  {
    "codigo": "9542-10",
    "titulo": "REPARADOR DE RÁDIO, TV E SOM"
  },
  {
    "codigo": "9543-05",
    "titulo": "REPARADOR DE EQUIPAMENTOS DE ESCRITÓRIO"
  },
  {
    "codigo": "9911-05",
    "titulo": "CONSERVADOR DE VIA PERMANENTE (TRILHOS)"
  },
  {
    "codigo": "9911-10",
    "titulo": "INSPETOR DE VIA PERMANENTE (TRILHOS)"
  },
  {
    "codigo": "9911-15",
    "titulo": "OPERADOR DE MÁQUINAS ESPECIAIS EM CONSERVAÇÃO DE VIA PERMANENTE (TRILHOS)"
  },
  {
    "codigo": "9911-20",
    "titulo": "SOLDADOR ALUMINOTÉRMICO EM CONSERVAÇÃO DE TRILHOS"
  },
  {
    "codigo": "9912-05",
    "titulo": "MANTENEDOR DE EQUIPAMENTOS DE PARQUES DE DIVERSÕES E SIMILARES"
  },
  {
    "codigo": "9913-05",
    "titulo": "FUNILEIRO DE VEÍCULOS (REPARAÇÃO)"
  },
  {
    "codigo": "9913-10",
    "titulo": "MONTADOR DE VEÍCULOS (REPARAÇÃO)"
  },
  {
    "codigo": "9913-15",
    "titulo": "PINTOR DE VEÍCULOS (REPARAÇÃO)"
  },
  {
    "codigo": "9921-05",
    "titulo": "ALINHADOR DE PNEUS"
  },
  {
    "codigo": "9921-10",
    "titulo": "BALANCEADOR"
  },
  {
    "codigo": "9921-15",
    "titulo": "BORRACHEIRO"
  },
  {
    "codigo": "9921-20",
    "titulo": "LAVADOR DE PEÇAS"
  },
  {
    "codigo": "9922-10",
    "titulo": "ENCARREGADO DE EQUIPE DE CONSERVAÇÃO DE VIAS PERMANENTES (EXCETO TRILHOS)"
  },
  {
    "codigo": "9922-15",
    "titulo": "OPERADOR DE CEIFADEIRA NA CONSERVAÇÃO DE VIAS PERMANENTES"
  },
  {
    "codigo": "9922-20",
    "titulo": "PEDREIRO DE CONSERVAÇÃO DE VIAS PERMANENTES (EXCETO TRILHOS)"
  },
  {
    "codigo": "9922-25",
    "titulo": "AUXILIAR GERAL DE CONSERVAÇÃO DE VIAS PERMANENTES (EXCETO TRILHOS)"
  }
]

export function buscarCBO(termo: string): CBO[] {
  if (!termo || termo.trim().length < 2) return []
  const q = normalizeText(termo.trim())
  
  // Buscar no código ou no título (sem acentos)
  const resultados = LISTA_CBO.filter(item => {
    const codMatch = item.codigo.includes(q)
    const titleMatch = normalizeText(item.titulo).includes(q)
    return codMatch || titleMatch
  })

  // Limitar a no máximo 20 sugestões para alta performance na interface
  return resultados.slice(0, 20)
}
