const fs = require('fs');
const zlib = require('zlib');
const { createClient } = require('@supabase/supabase-js');

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

function cleanStr(s) {
  if (!s || s === '\\N') return '';
  return s.trim().toUpperCase();
}

function normalizeStr(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function cleanDigits(d) {
  if (!d) return '';
  return d.replace(/\D/g, '');
}

async function mergeCpfCnsDuplicates() {
  console.log('1. Carregando base do e-SUS para mapear CPF <-> CNS de cada cidadão...');
  const [tCadInd, tPec, tCid] = await Promise.all([
    extractTable('tb_cds_cad_individual'),
    extractTable('tb_fat_cidadao_pec'),
    extractTable('tb_cidadao')
  ]);

  const rowsCadInd = parseTsv(tCadInd.text, parseCopyStatement(tCadInd.copyStmt));
  const rowsPec = parseTsv(tPec.text, parseCopyStatement(tPec.copyStmt));
  const rowsCid = parseTsv(tCid.text, parseCopyStatement(tCid.copyStmt));

  // Mapa de Cidadão e-SUS: CPF <-> CNS e Sexo real
  const cnsToCpf = new Map();
  const cpfToCns = new Map();
  const docToRealSex = new Map();
  const nameToDoc = new Map();

  function registerCitizen(cpf, cns, nome, sexo, dtNasc) {
    const cleanC = cleanDigits(cpf);
    const cleanS = cleanDigits(cns);
    const normName = normalizeStr(nome);
    let realSex = null;
    if (sexo === '1' || sexo === 'M' || sexo === 'MASCULINO') realSex = 'M';
    else if (sexo === '2' || sexo === 'F' || sexo === 'FEMININO') realSex = 'F';

    if (cleanC.length === 11 && cleanS.length === 15) {
      cnsToCpf.set(cleanS, cleanC);
      cpfToCns.set(cleanC, cleanS);
    }
    if (cleanC.length === 11 && realSex) docToRealSex.set(cleanC, realSex);
    if (cleanS.length === 15 && realSex) docToRealSex.set(cleanS, realSex);
    if (normName && realSex) docToRealSex.set(normName, realSex);

    if (normName && dtNasc && cleanC.length === 11) {
      nameToDoc.set(`${normName}|${dtNasc}`, cleanC);
    }
  }

  for (const c of rowsCadInd) {
    registerCitizen(c.nu_cpf_cidadao, c.nu_cns_cidadao, c.no_cidadao, c.co_sexo, c.dt_nascimento ? c.dt_nascimento.split(' ')[0] : '');
  }
  for (const p of rowsPec) {
    registerCitizen(p.nu_cpf_cidadao, p.nu_cns, p.no_cidadao, p.co_dim_sexo, p.co_dim_tempo_nascimento ? `${p.co_dim_tempo_nascimento.slice(0, 4)}-${p.co_dim_tempo_nascimento.slice(4, 6)}-${p.co_dim_tempo_nascimento.slice(6, 8)}` : '');
  }
  for (const c of rowsCid) {
    registerCitizen(c.nu_cpf, c.nu_cns, c.no_cidadao, c.no_sexo, c.dt_nascimento ? c.dt_nascimento.split(' ')[0] : '');
  }

  console.log(`Mapeados: ${cnsToCpf.size} vínculos diretos de CPF <-> CNS.`);

  // 2. Carregar todos os pacientes do Supabase
  console.log('\n2. Carregando pacientes do Supabase...');
  let allPacientes = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('pacientes').select('*').range(from, from + pageSize - 1);
    if (error) break;
    allPacientes.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Total de pacientes lidos: ${allPacientes.length}`);

  // 3. Agrupar por Identidade Única Real
  // Chave: CPF (se tiver ou se CNS mapeia para CPF) ou Nome Normalizado + Data Nasc
  const grupos = new Map();

  for (const p of allPacientes) {
    const doc = cleanDigits(p.cpf_cns);
    const normNome = normalizeStr(p.nome);
    const dt = p.dt_nasc ? p.dt_nasc.split('T')[0] : '';

    let chave = '';

    // Se o doc é um CNS que conhecemos o CPF, usar o CPF como chave!
    if (doc.length === 15 && cnsToCpf.has(doc)) {
      chave = `CPF_${cnsToCpf.get(doc)}`;
    } else if (doc.length === 11) {
      chave = `CPF_${doc}`;
    } else if (doc.length === 15) {
      chave = `CNS_${doc}`;
    } else if (normNome && dt) {
      chave = `NOME_DT_${normNome}_${dt}`;
    } else if (normNome) {
      chave = `NOME_${normNome}`;
    } else {
      chave = `ID_${p.id}`;
    }

    // Se chave for por nome, checar se encontramos CPF pelo nome + data
    if (chave.startsWith('NOME_DT_') && nameToDoc.has(`${normNome}|${dt}`)) {
      chave = `CPF_${nameToDoc.get(`${normNome}|${dt}`)}`;
    }

    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(p);
  }

  console.log(`Total de Cidadãos Únicos após unificação de CPF e CNS: ${grupos.size}`);

  const idsParaDeletar = [];
  const atualizacoes = [];

  for (const [chave, lista] of grupos) {
    // Escolher o melhor registro
    // Pontuação: tem CPF de 11 dígitos > tem CNS de 15 dígitos > tem telefone > sexo M ou F
    lista.sort((a, b) => {
      const docA = cleanDigits(a.cpf_cns);
      const docB = cleanDigits(b.cpf_cns);
      const scoreA = (docA.length === 11 ? 50 : (docA.length === 15 ? 20 : 0)) +
                     (a.sexo === 'M' || a.sexo === 'F' ? 10 : 0) +
                     (a.telefone && a.telefone !== '63999999999' ? 5 : 0) +
                     (a.endereco && a.endereco !== 'CONCEIÇÃO DO TOCANTINS' ? 5 : 0);
      const scoreB = (docB.length === 11 ? 50 : (docB.length === 15 ? 20 : 0)) +
                     (b.sexo === 'M' || b.sexo === 'F' ? 10 : 0) +
                     (b.telefone && b.telefone !== '63999999999' ? 5 : 0) +
                     (b.endereco && b.endereco !== 'CONCEIÇÃO DO TOCANTINS' ? 5 : 0);
      return scoreB - scoreA;
    });

    const principal = lista[0];
    const duplicatas = lista.slice(1);

    let modificado = false;
    const patch = {};

    // Se o principal tem CNS mas sabemos o CPF, atualizar para o CPF!
    const princDoc = cleanDigits(principal.cpf_cns);
    if (princDoc.length === 15 && cnsToCpf.has(princDoc)) {
      patch.cpf_cns = cnsToCpf.get(princDoc);
      modificado = true;
    }

    // Se sexo é 'O' ou não informado, corrigir para 'M' ou 'F'
    if (principal.sexo === 'O' || !principal.sexo) {
      const doc = cleanDigits(patch.cpf_cns || principal.cpf_cns);
      const normN = normalizeStr(principal.nome);
      const sReal = docToRealSex.get(doc) || docToRealSex.get(normN);

      if (sReal) {
        patch.sexo = sReal;
        modificado = true;
      } else {
        // Heurística de primeiro nome comum
        const primeiroNome = normN.split(' ')[0];
        if (primeiroNome.endsWith('A') && !['RAIMUNDO', 'LUCAS', 'BATISTA', 'COSTA', 'SOUSA', 'SILVA', 'DEUS'].includes(primeiroNome)) {
          patch.sexo = 'F';
          modificado = true;
        } else if (primeiroNome.endsWith('O') || primeiroNome.endsWith('R') || primeiroNome.endsWith('L') || primeiroNome.endsWith('S') || primeiroNome.endsWith('E')) {
          patch.sexo = 'M';
          modificado = true;
        }
      }
    }

    // Mesclar dados das duplicatas
    for (const dup of duplicatas) {
      idsParaDeletar.push(dup.id);

      const dupDoc = cleanDigits(dup.cpf_cns);
      if (dupDoc.length === 11 && cleanDigits(patch.cpf_cns || principal.cpf_cns).length !== 11) {
        patch.cpf_cns = dupDoc;
        modificado = true;
      }
      if ((principal.sexo === 'O' || !principal.sexo) && (dup.sexo === 'M' || dup.sexo === 'F')) {
        patch.sexo = dup.sexo;
        modificado = true;
      }
      if ((!principal.telefone || principal.telefone === '63999999999') && dup.telefone && dup.telefone !== '63999999999') {
        patch.telefone = dup.telefone;
        modificado = true;
      }
      if ((!principal.endereco || principal.endereco === 'CONCEIÇÃO DO TOCANTINS') && dup.endereco && dup.endereco !== 'CONCEIÇÃO DO TOCANTINS') {
        patch.endereco = dup.endereco;
        modificado = true;
      }
    }

    if (modificado) {
      atualizacoes.push({ id: principal.id, patch });
    }
  }

  console.log(`- Registros principais aprimorados/corrigidos: ${atualizacoes.length}`);
  console.log(`- Duplicatas a remover: ${idsParaDeletar.length}`);

  // Executar updates
  console.log('Aplicando correções nos registros principais...');
  for (const { id, patch } of atualizacoes) {
    await supabase.from('pacientes').update(patch).eq('id', id);
  }

  // Executar deletes
  console.log('Removendo duplicados...');
  let deletados = 0;
  for (let i = 0; i < idsParaDeletar.length; i += 100) {
    const batch = idsParaDeletar.slice(i, i + 100);
    const { error: delErr } = await supabase.from('pacientes').delete().in('id', batch);
    if (!delErr) deletados += batch.length;
  }

  console.log(`✓ Remoção concluída: ${deletados} duplicados removidos.`);

  const { count: finalCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
  console.log(`\n=====================================================`);
  console.log(`✓ BASE FINAL DE PACIENTES: ${finalCount} Cidadãos Únicos Reais!`);
  console.log(`=====================================================`);
}

mergeCpfCnsDuplicates().catch(console.error);
