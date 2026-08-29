const fs = require('fs');
const zlib = require('zlib');
const { createClient } = require('@supabase/supabase-js');

// 1. Conexão Supabase
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

// 2. Extração do backup e-SUS
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

// Dicionários de Moradia do e-SUS
const TIPO_DOMICILIO = {
  '85': 'Casa',
  '86': 'Apartamento',
  '87': 'Cômodo',
  '88': 'Outro'
};

const MATERIAL_PAREDE = {
  '109': 'Alvenaria / Tijolo com revestimento',
  '110': 'Alvenaria / Tijolo sem revestimento',
  '111': 'Taipa com revestimento',
  '112': 'Taipa sem revestimento',
  '113': 'Madeira aparelhada',
  '114': 'Material aproveitado / Palha',
  '115': 'Outro material'
};

const ABASTECIMENTO_AGUA = {
  '117': 'Rede encanada',
  '118': 'Poço ou nascente',
  '119': 'Cisterna',
  '120': 'Carro-pipa',
  '121': 'Outro'
};

const ESCOAMENTO_SANITARIO = {
  '123': 'Rede coletora de esgoto',
  '124': 'Fossa séptica',
  '125': 'Fossa rudimentar',
  '126': 'Vala a céu aberto',
  '127': 'Direto para rio, lago ou mar',
  '128': 'Outro'
};

const DESTINO_LIXO = {
  '93': 'Coletado diretamente',
  '94': 'Queimado ou enterrado',
  '95': 'Céu aberto',
  '96': 'Outro'
};

const RACA_COR_MAP = {
  '1': 'Branca',
  '2': 'Preta',
  '3': 'Amarela',
  '4': 'Parda',
  '5': 'Indígena'
};

async function migrateHousingAndProntuario() {
  console.log('1. Extraindo tabelas de Moradia, Prontuário e CBO do e-SUS...');
  const [tFam, tDom, tCbo, tCadInd, tCid] = await Promise.all([
    extractTable('tb_familia'),
    extractTable('tb_cds_domicilio'),
    extractTable('tb_cbo').catch(() => ({ text: '', copyStmt: '()' })),
    extractTable('tb_cds_cad_individual'),
    extractTable('tb_cidadao')
  ]);

  const rowsFam = parseTsv(tFam.text, parseCopyStatement(tFam.copyStmt));
  const rowsDom = parseTsv(tDom.text, parseCopyStatement(tDom.copyStmt));
  const rowsCadInd = parseTsv(tCadInd.text, parseCopyStatement(tCadInd.copyStmt));
  const rowsCid = parseTsv(tCid.text, parseCopyStatement(tCid.copyStmt));

  // Mapa de CBO: co_cbo -> Nome da Profissão
  const cboMap = new Map();
  if (tCbo.text) {
    const rowsCbo = parseTsv(tCbo.text, parseCopyStatement(tCbo.copyStmt));
    for (const c of rowsCbo) {
      if (c.co_cbo && c.no_cbo) cboMap.set(c.co_cbo, c.no_cbo.trim().toUpperCase());
      if (c.co_cbo_2002 && c.no_cbo) cboMap.set(c.co_cbo_2002, c.no_cbo.trim().toUpperCase());
    }
  }

  // Mapa de Cidadão -> { racaCor, ocupacao, cbo }
  const citizenInfoByDoc = new Map();
  const citizenInfoByName = new Map();

  for (const c of rowsCadInd) {
    const cpf = cleanDigits(c.nu_cpf_cidadao);
    const cns = cleanDigits(c.nu_cns_cidadao);
    const nome = normalizeStr(c.no_cidadao);
    const raca = RACA_COR_MAP[c.co_raca_cor] || null;
    const ocupacao = c.co_cbo ? (cboMap.get(c.co_cbo) || `CBO ${c.co_cbo}`) : null;

    const info = { raca, ocupacao };
    if (cpf.length === 11) citizenInfoByDoc.set(cpf, info);
    if (cns.length === 15) citizenInfoByDoc.set(cns, info);
    if (nome) citizenInfoByName.set(nome, info);
  }

  for (const c of rowsCid) {
    const cpf = cleanDigits(c.nu_cpf);
    const cns = cleanDigits(c.nu_cns);
    const nome = normalizeStr(c.no_cidadao);
    const raca = RACA_COR_MAP[c.co_raca_cor] || null;
    const ocupacao = c.co_cbo ? (cboMap.get(c.co_cbo) || `CBO ${c.co_cbo}`) : null;

    if (raca || ocupacao) {
      const existing = (cpf && citizenInfoByDoc.get(cpf)) || (cns && citizenInfoByDoc.get(cns)) || (nome && citizenInfoByName.get(nome)) || {};
      const merged = {
        raca: raca || existing.raca || null,
        ocupacao: ocupacao || existing.ocupacao || null
      };
      if (cpf.length === 11) citizenInfoByDoc.set(cpf, merged);
      if (cns.length === 15) citizenInfoByDoc.set(cns, merged);
      if (nome) citizenInfoByName.set(nome, merged);
    }
  }

  // Mapa de Domicílio -> Condições Habitacionais
  const domConditionsMap = new Map();
  for (const d of rowsDom) {
    if (d.co_seq_cds_domicilio) {
      domConditionsMap.set(d.co_seq_cds_domicilio, {
        moradia_tipo: TIPO_DOMICILIO[d.co_tipo_domicilio] || 'Casa',
        tipo_construcao: MATERIAL_PAREDE[d.co_tipo_material_parede] || 'Alvenaria / Tijolo',
        moradia_agua: ABASTECIMENTO_AGUA[d.co_tipo_abstcmento_agua] || 'Rede encanada',
        moradia_sanear: ESCOAMENTO_SANITARIO[d.co_tipo_escmento_sntar] || 'Fossa séptica',
        moradia_lixo: DESTINO_LIXO[d.co_tipo_destino_lixo] || 'Coletado diretamente',
        moradia_energia: d.st_energia_eletrica === '1' ? 'Com energia (Rede elétrica)' : 'Sem energia elétrica',
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

  console.log('2. Carregando e atualizando famílias no Supabase...');
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

  console.log(`Total de famílias lidas: ${allFamilias.length}`);

  let prontuariosAtualizados = 0;
  let moradiasAtualizadas = 0;
  let membrosAtualizados = 0;

  for (const fam of allFamilias) {
    const cpfResp = cleanDigits(fam.cpf_responsavel);
    const nomeResp = normalizeStr(fam.responsavel);
    const esusFam = (cpfResp && esusFamByResp.get(cpfResp)) || null;

    let patchFam = {};

    // 1. Atualizar Nº do Prontuário Familiar oficial do e-SUS se disponível
    if (esusFam && esusFam.prontuario && fam.cod_familiar !== esusFam.prontuario) {
      patchFam.cod_familiar = esusFam.prontuario;
      prontuariosAtualizados++;
    }

    // 2. Atualizar Condições da Moradia
    if (esusFam && esusFam.domId && domConditionsMap.has(esusFam.domId)) {
      const cond = domConditionsMap.get(esusFam.domId);
      patchFam.moradia_tipo = cond.moradia_tipo;
      patchFam.tipo_construcao = cond.tipo_construcao;
      patchFam.moradia_agua = cond.moradia_agua;
      patchFam.moradia_sanear = cond.moradia_sanear;
      patchFam.moradia_lixo = cond.moradia_lixo;
      patchFam.moradia_energia = cond.moradia_energia;
      patchFam.moradia_comodos = cond.moradia_comodos;
      moradiasAtualizadas++;
    }

    // 3. Atualizar Raça/Cor e Ocupação do Responsável
    const respCid = (cpfResp && citizenInfoByDoc.get(cpfResp)) || (nomeResp && citizenInfoByName.get(nomeResp));
    if (respCid) {
      if (respCid.raca && (!fam.raca_cor_responsavel || fam.raca_cor_responsavel === 'Não informada')) {
        patchFam.raca_cor_responsavel = respCid.raca;
      }
      if (respCid.ocupacao && (!fam.ocupacao_responsavel || fam.ocupacao_responsavel === 'Não informada')) {
        patchFam.ocupacao_responsavel = respCid.ocupacao;
      }
    }

    if (Object.keys(patchFam).length > 0) {
      await supabase.from('familias').update(patchFam).eq('id', fam.id);
    }

    // 4. Atualizar Raça/Cor e Ocupação / CBO de cada Membro
    for (const m of (fam.membros || [])) {
      const mCpf = cleanDigits(m.cpf);
      const mNome = normalizeStr(m.nome);
      const mCid = (mCpf && citizenInfoByDoc.get(mCpf)) || (mNome && citizenInfoByName.get(mNome));

      if (mCid) {
        let patchMembro = {};
        if (mCid.raca && (!m.raca_cor || m.raca_cor === 'Não informada')) {
          patchMembro.raca_cor = mCid.raca;
        }
        if (mCid.ocupacao && (!m.ocupacao || m.ocupacao === 'Não informada')) {
          patchMembro.ocupacao = mCid.ocupacao;
        }

        if (Object.keys(patchMembro).length > 0) {
          await supabase.from('membros_familia').update(patchMembro).eq('id', m.id);
          membrosAtualizados++;
        }
      }
    }
  }

  console.log('\n=====================================================');
  console.log('✓ MIGRAÇÃO COMPLETA DE MORADIA, PRONTUÁRIOS E CBO CONCLUÍDA!');
  console.log(`- Prontuários com Código Oficial do e-SUS: ${prontuariosAtualizados}`);
  console.log(`- Famílias com Condições de Moradia Atualizadas: ${moradiasAtualizadas}`);
  console.log(`- Membros com Raça/Cor e Ocupação/CBO Atualizados: ${membrosAtualizados}`);
  console.log('=====================================================');
}

migrateHousingAndProntuario().catch(console.error);
