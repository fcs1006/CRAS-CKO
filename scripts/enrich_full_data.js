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

// 2. Extrair tabelas e-SUS do backup
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

function cleanStr(s) {
  if (!s || s === '\\N') return '';
  return s.trim().toUpperCase();
}

function normalizeStr(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function mapRacaCor(co) {
  const map = {
    '1': 'Branca',
    '2': 'Preta',
    '3': 'Parda',
    '4': 'Amarela',
    '5': 'Indígena'
  };
  return map[co] || 'Não informada';
}

function mapEscolaridade(co) {
  const map = {
    '51': 'Creche',
    '52': 'Pré-escola',
    '53': 'Ensino Fundamental Incompleto',
    '54': 'Ensino Fundamental Incompleto',
    '55': 'Ensino Fundamental Completo',
    '56': 'Ensino Médio Incompleto',
    '57': 'Ensino Médio Completo',
    '58': 'Ensino Superior Incompleto',
    '59': 'Ensino Superior Completo',
    '60': 'Pós-graduação',
    '61': 'Mestrado',
    '62': 'Doutorado',
    '63': 'Alfabetização de Adultos (EJA)',
    '64': 'Nenhuma'
  };
  return map[co] || 'Não informada';
}

function mapSexo(co) {
  if (co === '1' || co === 'M' || co === 'Masculino') return 'Masculino';
  if (co === '2' || co === 'F' || co === 'Feminino') return 'Feminino';
  return 'Não informado';
}

function mapRenda(co) {
  const map = {
    '1': 0,
    '2': 350,
    '3': 700,
    '4': 1412,
    '5': 2824
  };
  return map[co] || 0;
}

function cleanCpf(cpf) {
  if (!cpf || cpf === '\\N') return '';
  return cpf.replace(/\D/g, '');
}

function cleanNis(nis) {
  if (!nis || nis === '\\N') return '';
  return nis.replace(/\D/g, '');
}

function cleanDate(d) {
  if (!d || d === '\\N') return null;
  const s = d.split(' ')[0].split('T')[0];
  if (s.length === 8 && /^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return s;
}

async function enrichAllData() {
  console.log('1. Extraindo tabelas cadastrais completas do backup...');
  const [tCadInd, tPec, tDomFam] = await Promise.all([
    extractTable('tb_cds_cad_individual'),
    extractTable('tb_fat_cidadao_pec'),
    extractTable('tb_cds_domicilio_familia')
  ]);

  const rowsCadInd = parseTsv(tCadInd.text, parseCopyStatement(tCadInd.copyStmt));
  const rowsPec = parseTsv(tPec.text, parseCopyStatement(tPec.copyStmt));
  const rowsDomFam = parseTsv(tDomFam.text, parseCopyStatement(tDomFam.copyStmt));

  console.log(`- Cadastros Individuais e-SUS: ${rowsCadInd.length}`);
  console.log(`- Cidadãos PEC: ${rowsPec.length}`);

  // Mapear dicionário rico de cidadãos por CPF, CNS e Nome Normalizado
  const citizenDictByCpf = new Map();
  const citizenDictByCns = new Map();
  const citizenDictByName = new Map();

  for (const c of rowsCadInd) {
    const nome = cleanStr(c.no_cidadao);
    if (!nome) continue;

    const cpf = cleanCpf(c.nu_cpf_cidadao);
    const cns = cleanStr(c.nu_cns_cidadao);
    const nis = cleanNis(c.nu_pis_pasep);
    const nomeMae = cleanStr(c.no_mae_cidadao);
    const nomePai = cleanStr(c.no_pai_cidadao);
    const dtNasc = cleanDate(c.dt_nascimento);
    const sexo = mapSexo(c.co_sexo);
    const racaCor = mapRacaCor(c.co_raca_cor);
    const escolaridade = mapEscolaridade(c.co_escolaridade);
    const ocupacao = cleanStr(c.co_cbo) ? `CBO ${cleanStr(c.co_cbo)}` : 'Não informada';

    const info = {
      nome,
      cpf,
      cns,
      nis,
      nomeMae,
      nomePai,
      dtNasc,
      sexo,
      racaCor,
      escolaridade,
      ocupacao
    };

    if (cpf && cpf.length === 11) citizenDictByCpf.set(cpf, info);
    if (cns && cns.length === 15) citizenDictByCns.set(cns, info);
    const norm = normalizeStr(nome);
    if (norm) citizenDictByName.set(norm, info);
  }

  // Enriquecer com tb_fat_cidadao_pec
  for (const p of rowsPec) {
    const cpf = cleanCpf(p.nu_cpf_cidadao);
    const cns = cleanStr(p.nu_cns);
    const nome = cleanStr(p.no_cidadao);
    const norm = normalizeStr(nome);
    const sexo = mapSexo(p.co_dim_sexo);
    const dtNasc = cleanDate(p.co_dim_tempo_nascimento);

    let existing = (cpf && citizenDictByCpf.get(cpf)) || (cns && citizenDictByCns.get(cns)) || (norm && citizenDictByName.get(norm));
    if (existing) {
      if (existing.sexo === 'Não informado' && sexo !== 'Não informado') existing.sexo = sexo;
      if (!existing.dtNasc && dtNasc) existing.dtNasc = dtNasc;
    }
  }

  console.log(`Dicionário consolidado com ${citizenDictByName.size} pessoas com Nome da Mãe, Sexo, Raça/Cor e Escolaridade.`);

  // 2. Corrigir campo ACESSIBILIDADE em todas as famílias para false por padrão
  console.log('\n2. Corrigindo campo Acessibilidade na tabela `familias`...');
  await supabase.from('familias').update({ acessibilidade: false }).neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Atualizar Responsáveis Familiares em `familias`
  console.log('\n3. Atualizando dados completos dos Responsáveis Familiares em `familias`...');
  let fFrom = 0;
  const pageSize = 1000;
  let allFamilias = [];
  while (true) {
    const { data, error } = await supabase.from('familias').select('*').range(fFrom, fFrom + pageSize - 1);
    if (error) break;
    allFamilias.push(...(data || []));
    if (!data || data.length < pageSize) break;
    fFrom += pageSize;
  }

  let famAtualizadas = 0;
  for (const fam of allFamilias) {
    const cpf = (fam.cpf_responsavel || '').replace(/\D/g, '');
    const nome = normalizeStr(fam.responsavel);

    const info = (cpf && citizenDictByCpf.get(cpf)) || (nome && citizenDictByName.get(nome));
    if (info) {
      const patch = {};
      if (info.nomeMae) patch.nome_mae_responsavel = info.nomeMae;
      if (info.sexo && info.sexo !== 'Não informado') patch.sexo_responsavel = info.sexo;
      if (info.racaCor && info.racaCor !== 'Não informada') patch.raca_cor_responsavel = info.racaCor;
      if (info.dtNasc && !fam.data_nascimento_responsavel) patch.data_nascimento_responsavel = info.dtNasc;
      if (info.escolaridade && info.escolaridade !== 'Não informada') patch.escolaridade_responsavel = info.escolaridade;
      if (info.ocupacao && info.ocupacao !== 'Não informada') patch.ocupacao_responsavel = info.ocupacao;
      if (info.nis && (!fam.nis_responsavel || fam.nis_responsavel.startsWith('SEM_NIS_'))) patch.nis_responsavel = info.nis;

      if (Object.keys(patch).length > 0) {
        await supabase.from('familias').update(patch).eq('id', fam.id);
        famAtualizadas++;
      }
    }
  }

  console.log(`✓ ${famAtualizadas} famílias enriquecidas com Nome da Mãe, Sexo, Raça/Cor, NIS e Escolaridade!`);

  // 4. Atualizar Membros Familiares em `membros_familia`
  console.log('\n4. Atualizando dados completos de cada dependente em `membros_familia`...');
  let mFrom = 0;
  let allMembros = [];
  while (true) {
    const { data, error } = await supabase.from('membros_familia').select('*').range(mFrom, mFrom + pageSize - 1);
    if (error) break;
    allMembros.push(...(data || []));
    if (!data || data.length < pageSize) break;
    mFrom += pageSize;
  }

  let memAtualizados = 0;
  for (const mem of allMembros) {
    const cpf = (mem.cpf || '').replace(/\D/g, '');
    const nome = normalizeStr(mem.nome);

    const info = (cpf && citizenDictByCpf.get(cpf)) || (nome && citizenDictByName.get(nome));
    if (info) {
      const patch = {};
      if (info.sexo && info.sexo !== 'Não informado' && (mem.sexo === 'Não informado' || !mem.sexo)) patch.sexo = info.sexo;
      if (info.racaCor && info.racaCor !== 'Não informada' && (mem.raca_cor === 'Não informada' || !mem.raca_cor)) patch.raca_cor = info.racaCor;
      if (info.escolaridade && info.escolaridade !== 'Não informada' && (mem.escolaridade === 'Não informada' || !mem.escolaridade)) patch.escolaridade = info.escolaridade;
      if (info.ocupacao && info.ocupacao !== 'Não informada' && (mem.ocupacao === 'Não informada' || !mem.ocupacao)) patch.ocupacao = info.ocupacao;
      if (info.nis && !mem.nis) patch.nis = info.nis;
      if (info.dtNasc && !mem.data_nascimento) patch.data_nascimento = info.dtNasc;

      if (Object.keys(patch).length > 0) {
        await supabase.from('membros_familia').update(patch).eq('id', mem.id);
        memAtualizados++;
      }
    }
  }

  console.log(`✓ ${memAtualizados} membros familiares enriquecidos com Sexo, Raça/Cor, Escolaridade e NIS!`);
  console.log('\n=====================================================');
  console.log('ENRIQUECIMENTO AUTOMÁTICO CONCLUÍDO COM SUCESSO!');
  console.log('=====================================================');
}

enrichAllData().catch(console.error);
