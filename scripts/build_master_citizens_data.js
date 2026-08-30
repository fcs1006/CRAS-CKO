const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

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

function formatPhone(phone) {
  const digits = cleanDigits(phone);
  if (!digits || digits.length < 10) return null;
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

const RACA_COR_MAP = {
  '1': 'Branca',
  '2': 'Preta',
  '3': 'Amarela',
  '4': 'Parda',
  '5': 'Indígena',
  '6': 'Não declarada'
};

const ESCOLARIDADE_MAP = {
  '1': 'Não Alfabetizado(a)',
  '2': 'Não Alfabetizado(a)',
  '3': 'Não Alfabetizado(a)',
  '4': 'Ensino Fundamental Incompleto',
  '5': 'Ensino Fundamental Incompleto',
  '6': 'Ensino Fundamental Completo',
  '7': 'Ensino Fundamental Completo',
  '8': 'Ensino Fundamental Incompleto',
  '9': 'Ensino Fundamental Completo',
  '10': 'Ensino Médio Completo',
  '11': 'Ensino Médio Completo',
  '12': 'Ensino Médio Completo',
  '13': 'Ensino Superior Completo',
  '14': 'Não Alfabetizado(a)',
  '15': 'Não Alfabetizado(a)'
};

async function buildMasterData() {
  console.log('1. Extraindo tabelas de cidadãos e CBOs do e-SUS...');
  const [tCid, tCadInd, tCbo] = await Promise.all([
    extractTable('tb_cidadao'),
    extractTable('tb_cds_cad_individual'),
    extractTable('tb_cbo').catch(() => ({ text: '', copyStmt: '()' }))
  ]);

  const rowsCid = parseTsv(tCid.text, parseCopyStatement(tCid.copyStmt));
  const rowsCadInd = parseTsv(tCadInd.text, parseCopyStatement(tCadInd.copyStmt));
  const rowsCbo = parseTsv(tCbo.text, parseCopyStatement(tCbo.copyStmt));

  const cboMap = new Map();
  for (const c of rowsCbo) {
    if (c.co_cbo && c.no_cbo) cboMap.set(c.co_cbo, c.no_cbo.trim().toUpperCase());
    if (c.co_cbo_2002 && c.no_cbo) cboMap.set(c.co_cbo_2002, c.no_cbo.trim().toUpperCase());
  }

  const masterByCpf = {};
  const masterByName = {};

  function mergeCitizen(docKey, nameKey, data) {
    const existing = (docKey && masterByCpf[docKey]) || (nameKey && masterByName[nameKey]) || {};
    const merged = {
      nome: data.nome || existing.nome || null,
      nome_mae: data.nome_mae || existing.nome_mae || null,
      cpf: data.cpf || existing.cpf || null,
      nis: data.nis || existing.nis || null,
      data_nascimento: data.data_nascimento || existing.data_nascimento || null,
      sexo: data.sexo || existing.sexo || 'Feminino',
      raca_cor: data.raca_cor || existing.raca_cor || 'Parda',
      escolaridade: data.escolaridade || existing.escolaridade || null,
      ocupacao: data.ocupacao || existing.ocupacao || null,
      telefone: data.telefone || existing.telefone || null,
      logradouro: data.logradouro || existing.logradouro || null,
      numero: data.numero || existing.numero || 'S/N',
      bairro: data.bairro || existing.bairro || 'CENTRO',
      cep: data.cep || existing.cep || '77305-000',
      zona_territorio: data.zona_territorio || existing.zona_territorio || 'Urbana'
    };

    if (docKey) masterByCpf[docKey] = merged;
    if (nameKey) masterByName[nameKey] = merged;
  }

  // Processar tb_cds_cad_individual
  for (const c of rowsCadInd) {
    const cpf = cleanDigits(c.nu_cpf_cidadao);
    const nome = (c.no_cidadao || '').trim().toUpperCase();
    const nomeNorm = normalizeStr(nome);
    const nomeMae = (c.no_mae_cidadao || '').trim().toUpperCase();
    const dtNasc = c.dt_nascimento ? c.dt_nascimento.split(' ')[0] : null;
    const sexo = c.co_sexo === '0' ? 'Masculino' : (c.co_sexo === '1' ? 'Feminino' : 'Outro');
    const raca = RACA_COR_MAP[c.co_raca_cor] || 'Parda';
    const ocupacao = c.co_cbo ? cboMap.get(c.co_cbo) : null;
    const escolaridade = c.co_escolaridade ? ESCOLARIDADE_MAP[c.co_escolaridade] : null;
    const telefone = formatPhone(c.nu_celular_cidadao);
    const nis = cleanDigits(c.nu_pis_pasep);

    if (nome) {
      mergeCitizen(cpf.length === 11 ? cpf : null, nomeNorm, {
        nome,
        nome_mae: nomeMae && !nomeMae.includes('DESCONHEC') ? nomeMae : null,
        cpf: cpf.length === 11 ? cpf : null,
        nis: nis.length >= 10 ? nis : null,
        data_nascimento: dtNasc,
        sexo,
        raca_cor: raca,
        escolaridade,
        ocupacao,
        telefone
      });
    }
  }

  // Processar tb_cidadao (sobrepor dados mais recentes/oficiais)
  for (const c of rowsCid) {
    const cpf = cleanDigits(c.nu_cpf);
    const nome = (c.no_cidadao || '').trim().toUpperCase();
    const nomeNorm = normalizeStr(nome);
    const nomeMae = (c.no_mae || '').trim().toUpperCase();
    const dtNasc = c.dt_nascimento ? c.dt_nascimento.split(' ')[0] : null;
    const sexo = c.no_sexo === 'MASCULINO' ? 'Masculino' : (c.no_sexo === 'FEMININO' ? 'Feminino' : 'Outro');
    const raca = RACA_COR_MAP[c.co_raca_cor] || 'Parda';
    const ocupacao = c.co_cbo ? cboMap.get(c.co_cbo) : null;
    const escolaridade = c.co_escolaridade ? ESCOLARIDADE_MAP[c.co_escolaridade] : null;
    const rua = c.ds_logradouro ? c.ds_logradouro.trim().toUpperCase() : null;
    const num = c.nu_numero ? c.nu_numero.trim().toUpperCase() : (c.st_sem_numero === '1' ? 'S/N' : null);
    const bairro = c.no_bairro ? c.no_bairro.trim().toUpperCase() : 'CENTRO';
    const cep = c.ds_cep ? cleanDigits(c.ds_cep) : null;
    const telefone = formatPhone(c.nu_telefone_celular || c.nu_telefone_contato);

    if (nome) {
      mergeCitizen(cpf.length === 11 ? cpf : null, nomeNorm, {
        nome,
        nome_mae: nomeMae && !nomeMae.includes('DESCONHEC') ? nomeMae : null,
        cpf: cpf.length === 11 ? cpf : null,
        data_nascimento: dtNasc,
        sexo,
        raca_cor: raca,
        escolaridade,
        ocupacao,
        telefone,
        logradouro: rua ? (rua.startsWith('RUA') || rua.startsWith('AV') || rua.startsWith('TRAVESSA') ? rua : `RUA ${rua}`) : null,
        numero: num || 'S/N',
        bairro: bairro || 'CENTRO',
        cep: cep && cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : '77305-000',
        zona_territorio: (bairro || '').includes('RURAL') ? 'Rural' : 'Urbana'
      });
    }
  }

  const outDir = path.join(__dirname, '..', 'src', 'lib');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'master_cidadaos_data.json');
  const masterPayload = {
    byCpf: masterByCpf,
    byName: masterByName
  };

  fs.writeFileSync(outPath, JSON.stringify(masterPayload));
  console.log(`✓ Dicionário Mestre Gerado com Sucesso em: ${outPath}`);
  console.log(`- Total de CPFs indexados: ${Object.keys(masterByCpf).length}`);
  console.log(`- Total de Nomes indexados: ${Object.keys(masterByName).length}`);

  // Testar Beronice no dicionário
  console.log('\nTeste Beronice por CPF (47221356149):', masterByCpf['47221356149']);
  console.log('Teste Beronice por Nome:', masterByName['BERONICE GONCALVES DE CERQUEIRA']);
}

buildMasterData().catch(console.error);
