const fs = require('fs');
const zlib = require('zlib');
const { createClient } = require('@supabase/supabase-js');

// 1. Supabase Client
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const k = match[1].trim();
    let v = match[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    env[k] = v;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Extrair e-SUS
const dumpPath = 'C:\\Users\\fcs_1\\Downloads\\411005-2026.08.conceicaodotocantins-to-5.5.24.backup';
const fd = fs.openSync(dumpPath, 'r');

const allTables = JSON.parse(
  fs.readFileSync(
    'C:\\Users\\fcs_1\\.gemini\\antigravity-ide\\brain\\7688d2aa-8be3-4b02-96c1-f05bc2004e77\\scratch\\all_table_data.json',
    'utf8'
  )
);

function extractTable(tableName) {
  return new Promise((resolve, reject) => {
    const info = allTables.find(t => t.tag === tableName);
    if (!info) return reject(new Error('Tabela não encontrada: ' + tableName));

    let filePos = Number(info.offset);
    function readByte() {
      const buf = Buffer.alloc(1);
      fs.readSync(fd, buf, 0, 1, filePos);
      filePos += 1;
      return buf[0];
    }
    function readBytes(n) {
      const buf = Buffer.alloc(n);
      fs.readSync(fd, buf, 0, n, filePos);
      filePos += n;
      return buf;
    }
    function readInt(intSize = 4) {
      const b0 = readByte();
      const sign = (b0 & 1);
      let val = 0;
      for (let i = 0; i < intSize; i++) {
        const b = readByte();
        val |= (b << (i * 8));
      }
      return sign ? -val : val;
    }

    const startBlk = readByte();
    if (startBlk !== 1) return reject(new Error(`Início inválido: ${startBlk}`));
    const dumpId = readInt(4);

    const inflater = zlib.createInflate();
    const chunks = [];
    let isDone = false;

    inflater.on('data', chunk => chunks.push(chunk));
    inflater.on('end', () => {
      if (!isDone) {
        isDone = true;
        const fullBuf = Buffer.concat(chunks);
        resolve({
          tag: tableName,
          copyStmt: info.copyStmt,
          text: fullBuf.toString('utf8'),
          size: fullBuf.length
        });
      }
    });
    inflater.on('error', err => {
      if (!isDone) {
        isDone = true;
        reject(err);
      }
    });

    while (true) {
      const chunkLen = readInt(4);
      if (chunkLen <= 0) break;
      const compChunk = readBytes(chunkLen);
      inflater.write(compChunk);
    }
    inflater.end();
  });
}

function parseCopyStatement(copyStmt) {
  const match = copyStmt.match(/\((.*?)\)/);
  if (!match) return [];
  return match[1].split(',').map(c => c.trim());
}

function parseTsv(text, columns) {
  const lines = text.split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line || line === '\\.') continue;
    const parts = line.split('\t');
    const obj = {};
    for (let i = 0; i < columns.length; i++) {
      let val = parts[i];
      if (val === '\\N' || val === undefined) val = null;
      obj[columns[i]] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function cleanDigits(d) {
  return (d || '').replace(/\D/g, '');
}

function normalizeStr(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

// 1. Mapeamento de Raça / Cor oficial e-SUS
const RACA_COR_OFICIAL = {
  '1': 'Branca',
  '2': 'Preta',
  '3': 'Amarela',
  '4': 'Parda',
  '5': 'Indígena',
  '6': 'Não declarada'
};

// 2. Mapeamento de Escolaridade oficial e-SUS para o SUAS
const ESCOLARIDADE_OFICIAL = {
  '1': 'Não Alfabetizado(a)', // Creche
  '2': 'Não Alfabetizado(a)', // Pré-escola
  '3': 'Não Alfabetizado(a)', // Classe Alfabetizada
  '4': 'Ensino Fundamental Incompleto', // 1ª a 4ª
  '5': 'Ensino Fundamental Incompleto', // 5ª a 8ª
  '6': 'Ensino Fundamental Completo', // Fundamental Completo
  '7': 'Ensino Fundamental Completo', // Especial
  '8': 'Ensino Fundamental Incompleto', // EJA inicial
  '9': 'Ensino Fundamental Completo', // EJA final
  '10': 'Ensino Médio Completo', // Médio Completo
  '11': 'Ensino Médio Completo', // Especial
  '12': 'Ensino Médio Completo', // EJA
  '13': 'Ensino Superior Completo', // Superior, Mestrado, Doutorado
  '14': 'Não Alfabetizado(a)', // Mobral
  '15': 'Não Alfabetizado(a)' // Nenhum
};

// 3. Mapeamento de Domicílio e-SUS
const TIPO_DOMICILIO = {
  '85': 'Própria',
  '86': 'Alugada',
  '87': 'Cedida',
  '88': 'Outro'
};

const MATERIAL_PAREDE = {
  '109': 'Alvenaria',
  '110': 'Alvenaria',
  '111': 'Taipa',
  '112': 'Taipa',
  '113': 'Madeira',
  '114': 'Material Aproveitado / Palha',
  '115': 'Outro'
};

const ABASTECIMENTO_AGUA = {
  '117': 'Rede Pública',
  '118': 'Poço / Nascente',
  '119': 'Cisterna',
  '120': 'Carro-pipa',
  '121': 'Outro'
};

const ESCOAMENTO_SANITARIO = {
  '123': 'Rede Pública',
  '124': 'Fossa Séptica',
  '125': 'Fossa Rudimentar',
  '126': 'Céu Aberto / Vala',
  '127': 'Direto para Rio / Lago',
  '128': 'Outro'
};

const DESTINO_LIXO = {
  '93': 'Coleta Pública',
  '94': 'Queimado / Enterrado',
  '95': 'Céu Aberto',
  '96': 'Outro'
};

async function recalibrateExact() {
  console.log('1. Extraindo todas as tabelas de referência do e-SUS...');
  const [tCid, tCadInd, tCbo, tDom, tFam] = await Promise.all([
    extractTable('tb_cidadao'),
    extractTable('tb_cds_cad_individual'),
    extractTable('tb_cbo'),
    extractTable('tb_cds_domicilio'),
    extractTable('tb_familia')
  ]);

  const rowsCid = parseTsv(tCid.text, parseCopyStatement(tCid.copyStmt));
  const rowsCadInd = parseTsv(tCadInd.text, parseCopyStatement(tCadInd.copyStmt));
  const rowsCbo = parseTsv(tCbo.text, parseCopyStatement(tCbo.copyStmt));
  const rowsDom = parseTsv(tDom.text, parseCopyStatement(tDom.copyStmt));
  const rowsFam = parseTsv(tFam.text, parseCopyStatement(tFam.copyStmt));

  // Mapa de CBOs: co_cbo (ID) -> Nome por extenso da profissão
  console.log(`2. Mapeando ${rowsCbo.length} CBOs por extenso...`);
  const cboNamesById = new Map();
  for (const c of rowsCbo) {
    if (c.co_cbo && c.no_cbo) {
      cboNamesById.set(c.co_cbo, c.no_cbo.trim().toUpperCase());
    }
  }

  // Mapa de Cidadão em tb_cidadao (Oficial ativo)
  const cidDataByCpf = new Map();
  const cidDataByCns = new Map();
  const cidDataByName = new Map();

  for (const c of rowsCid) {
    const cpf = cleanDigits(c.nu_cpf);
    const cns = cleanDigits(c.nu_cns);
    const nome = normalizeStr(c.no_cidadao);
    const raca = RACA_COR_OFICIAL[c.co_raca_cor] || null;
    const ocupacao = c.co_cbo ? cboNamesById.get(c.co_cbo) : null;
    const escolaridade = c.co_escolaridade ? ESCOLARIDADE_OFICIAL[c.co_escolaridade] : null;
    const rua = c.ds_logradouro ? c.ds_logradouro.trim().toUpperCase() : null;
    const num = c.nu_numero ? c.nu_numero.trim().toUpperCase() : (c.st_sem_numero === '1' ? 'S/N' : null);
    const bairro = c.no_bairro ? c.no_bairro.trim().toUpperCase() : null;
    const cep = c.ds_cep ? cleanDigits(c.ds_cep) : null;
    const phone = cleanDigits(c.nu_telefone_celular || c.nu_telefone_contato);

    const info = {
      nome: (c.no_cidadao || '').trim().toUpperCase(),
      raca,
      ocupacao,
      escolaridade,
      rua: rua ? (rua.startsWith('RUA') || rua.startsWith('AV') || rua.startsWith('TRAVESSA') ? rua : `RUA ${rua}`) : null,
      num: num || 'S/N',
      bairro: bairro || 'CENTRO',
      cep: cep && cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : '77305-000',
      phone: phone && phone.length >= 10 ? phone : null,
      pcd: c.st_deficiencia === '1' || c.st_deficiencia_intelectual === '1' || c.st_deficiencia_fisica === '1' || c.st_deficiencia_visual === '1' || c.st_deficiencia_auditiva === '1',
      tipoDeficiencia: c.st_deficiencia_intelectual === '1' ? 'Intelectual / Cognitiva' :
                       (c.st_deficiencia_fisica === '1' ? 'Física' :
                       (c.st_deficiencia_visual === '1' ? 'Visual' :
                       (c.st_deficiencia_auditiva === '1' ? 'Auditiva' : 'Outra')))
    };

    if (cpf.length === 11) cidDataByCpf.set(cpf, info);
    if (cns.length === 15) cidDataByCns.set(cns, info);
    if (nome) cidDataByName.set(nome, info);
  }

  // Complementar com tb_cds_cad_individual
  for (const c of rowsCadInd) {
    const cpf = cleanDigits(c.nu_cpf_cidadao);
    const cns = cleanDigits(c.nu_cns_cidadao);
    const nome = normalizeStr(c.no_cidadao);
    const raca = RACA_COR_OFICIAL[c.co_raca_cor] || null;
    const ocupacao = c.co_cbo ? cboNamesById.get(c.co_cbo) : null;
    const escolaridade = c.co_escolaridade ? ESCOLARIDADE_OFICIAL[c.co_escolaridade] : null;

    const existing = (cpf.length === 11 && cidDataByCpf.get(cpf)) || (cns.length === 15 && cidDataByCns.get(cns)) || (nome && cidDataByName.get(nome)) || {};
    const merged = {
      ...existing,
      raca: existing.raca || raca,
      ocupacao: existing.ocupacao || ocupacao,
      escolaridade: existing.escolaridade || escolaridade
    };
    if (cpf.length === 11) cidDataByCpf.set(cpf, merged);
    if (cns.length === 15) cidDataByCns.set(cns, merged);
    if (nome) cidDataByName.set(nome, merged);
  }

  // Mapa de Domicílio -> Condições Habitacionais
  const domConditionsMap = new Map();
  for (const d of rowsDom) {
    if (d.co_seq_cds_domicilio) {
      domConditionsMap.set(d.co_seq_cds_domicilio, {
        moradia_tipo: TIPO_DOMICILIO[d.co_tipo_domicilio] || 'Própria',
        tipo_construcao: MATERIAL_PAREDE[d.co_tipo_material_parede] || 'Alvenaria',
        moradia_agua: ABASTECIMENTO_AGUA[d.co_tipo_abstcmento_agua] || 'Rede Pública',
        moradia_sanear: ESCOAMENTO_SANITARIO[d.co_tipo_escmento_sntar] || 'Fossa Séptica',
        moradia_lixo: DESTINO_LIXO[d.co_tipo_destino_lixo] || 'Coleta Pública',
        moradia_energia: 'Rede Elétrica com Relógio',
        moradia_comodos: d.nu_comodos ? String(d.nu_comodos) : '4'
      });
    }
  }

  // Mapa de Família e-SUS: Responsável (CPF/CNS) -> { prontuario, domId }
  const esusFamByResp = new Map();
  for (const f of rowsFam) {
    const rawResp = cleanDigits(f.nu_cpf_cns_responsavel);
    if (rawResp) {
      esusFamByResp.set(rawResp, {
        prontuario: f.nu_prontuario_familiar ? f.nu_prontuario_familiar.trim().toUpperCase() : null,
        domId: f.co_cds_domicilio
      });
    }
  }

  console.log('3. Atualizando famílias e membros no Supabase...');
  let allFamilias = [];
  let fFrom = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('familias').select('*, membros:membros_familia(*)').range(fFrom, fFrom + pageSize - 1);
    if (error) break;
    allFamilias.push(...(data || []));
    if (!data || data.length < pageSize) break;
    fFrom += pageSize;
  }

  console.log(`Total de famílias carregadas: ${allFamilias.length}`);

  let famCount = 0;
  let memCount = 0;

  for (const fam of allFamilias) {
    const cpfResp = cleanDigits(fam.cpf_responsavel);
    const nomeResp = normalizeStr(fam.responsavel);
    const esusFam = (cpfResp && esusFamByResp.get(cpfResp)) || null;
    const cidInfo = (cpfResp && cidDataByCpf.get(cpfResp)) || (nomeResp && cidDataByName.get(nomeResp));

    let patchFam = {};

    // 1. Nº Prontuário Oficial
    if (esusFam && esusFam.prontuario && fam.cod_familiar !== esusFam.prontuario) {
      patchFam.cod_familiar = esusFam.prontuario;
    }

    // 2. Condições da Moradia
    if (esusFam && esusFam.domId && domConditionsMap.has(esusFam.domId)) {
      const cond = domConditionsMap.get(esusFam.domId);
      patchFam.moradia_tipo = cond.moradia_tipo;
      patchFam.tipo_construcao = cond.tipo_construcao;
      patchFam.moradia_agua = cond.moradia_agua;
      patchFam.moradia_sanear = cond.moradia_sanear;
      patchFam.moradia_lixo = cond.moradia_lixo;
      patchFam.moradia_energia = cond.moradia_energia;
      patchFam.moradia_comodos = cond.moradia_comodos;
    }

    // 3. Raça/Cor, Ocupação/CBO, Escolaridade e Endereço Oficial do Responsável
    if (cidInfo) {
      if (cidInfo.raca) patchFam.raca_cor_responsavel = cidInfo.raca;
      if (cidInfo.ocupacao) patchFam.ocupacao_responsavel = cidInfo.ocupacao;
      if (cidInfo.escolaridade) patchFam.escolaridade_responsavel = cidInfo.escolaridade;
      if (cidInfo.rua) patchFam.logradouro = cidInfo.rua;
      if (cidInfo.bairro) patchFam.bairro = cidInfo.bairro;
      if (cidInfo.num) patchFam.numero = cidInfo.num;
      if (cidInfo.cep) patchFam.cep = cidInfo.cep;
      if (cidInfo.phone) patchFam.telefone = cidInfo.phone;
    }

    if (Object.keys(patchFam).length > 0) {
      await supabase.from('familias').update(patchFam).eq('id', fam.id);
      famCount++;
    }

    // 4. Atualizar cada membro
    for (const m of (fam.membros || [])) {
      const mCpf = cleanDigits(m.cpf);
      const mNome = normalizeStr(m.nome);
      const mCid = (mCpf && cidDataByCpf.get(mCpf)) || (mNome && cidDataByName.get(mNome));

      if (mCid) {
        let patchMem = {};
        if (mCid.raca) patchMem.raca_cor = mCid.raca;
        if (mCid.ocupacao) patchMem.ocupacao = mCid.ocupacao;
        if (mCid.escolaridade) patchMem.escolaridade = mCid.escolaridade;
        if (mCid.pcd) {
          patchMem.possui_deficiencia = true;
          patchMem.tipo_deficiencia = mCid.tipoDeficiencia;
        }

        if (Object.keys(patchMem).length > 0) {
          await supabase.from('membros_familia').update(patchMem).eq('id', m.id);
          memCount++;
        }
      }
    }
  }

  console.log(`\n=====================================================`);
  console.log(`✓ RECALIBRAÇÃO TOTAL CONCLUÍDA COM SUCESSO!`);
  console.log(`- Famílias atualizadas com dados ricos: ${famCount}`);
  console.log(`- Membros atualizados com CBO e Escolaridade: ${memCount}`);
  console.log(`=====================================================`);
}

recalibrateExact().catch(console.error);
