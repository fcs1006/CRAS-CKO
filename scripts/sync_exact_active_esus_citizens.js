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
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

async function syncExactActiveCitizens() {
  console.log('1. Extraindo tabela oficial de Cidadãos Ativos (tb_cidadao)...');
  const [tCid, tFat] = await Promise.all([
    extractTable('tb_cidadao'),
    extractTable('tb_fat_cidadao_pec')
  ]);

  const rowsCid = parseTsv(tCid.text, parseCopyStatement(tCid.copyStmt));
  const rowsFat = parseTsv(tFat.text, parseCopyStatement(tFat.copyStmt));

  console.log(`- Cidadãos brutos em tb_cidadao: ${rowsCid.length}`);
  console.log(`- Cidadãos brutos em tb_fat_cidadao_pec: ${rowsFat.length}`);

  // Filtrar apenas cidadãos ativos e não falecidos
  const activeCid = rowsCid.filter(c => c.st_ativo_para_exibicao === '1' && c.st_faleceu === '0');
  console.log(`- Cidadãos Vivos e Ativos para Exibição no e-SUS: ${activeCid.length}`);

  // Criar mapas de busca por CPF, CNS e Nome Normalizado + Data de Nascimento
  const officialByCpf = new Map();
  const officialByCns = new Map();
  const officialByNameDt = new Map();
  const allActiveOfficialNames = new Set();

  for (const c of activeCid) {
    const cpf = cleanDigits(c.nu_cpf);
    const cns = cleanDigits(c.nu_cns);
    const nome = (c.no_cidadao || '').trim().toUpperCase();
    const normNome = normalizeStr(nome);
    const dt = c.dt_nascimento ? c.dt_nascimento.split('T')[0].split(' ')[0] : '';
    const phone = cleanDigits(c.nu_telefone_celular || c.nu_telefone_contato || c.nu_telefone_residencial);
    let sex = c.no_sexo === 'MASCULINO' || c.no_sexo === '1' || c.no_sexo === 'M' ? 'M' : (c.no_sexo === 'FEMININO' || c.no_sexo === '2' || c.no_sexo === 'F' ? 'F' : 'M');

    // Documento preferencial legítimo
    const docOficial = cpf.length === 11 ? cpf : (cns.length === 15 ? cns : null);

    const info = {
      nome,
      docOficial,
      cpf: cpf.length === 11 ? cpf : null,
      cns: cns.length === 15 ? cns : null,
      dtNasc: dt || null,
      sexo: sex,
      mae: (c.no_mae || '').trim().toUpperCase(),
      telefone: phone.length >= 10 ? phone : null
    };

    if (cpf.length === 11) officialByCpf.set(cpf, info);
    if (cns.length === 15) officialByCns.set(cns, info);
    if (normNome && dt) officialByNameDt.set(`${normNome}|${dt}`, info);
    if (normNome) allActiveOfficialNames.add(normNome);
  }

  // 2. Carregar pacientes atuais do Supabase
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
  console.log(`Total de pacientes atuais no Supabase: ${allPacientes.length}`);

  const updates = [];
  const idsParaRemover = [];

  for (const p of allPacientes) {
    const doc = cleanDigits(p.cpf_cns);
    const normNome = normalizeStr(p.nome);
    const dt = p.dt_nasc ? p.dt_nasc.split('T')[0] : '';

    // Buscar correspondência oficial no e-SUS
    let oficial = (doc.length === 11 && officialByCpf.get(doc)) ||
                  (doc.length === 15 && officialByCns.get(doc)) ||
                  (normNome && dt && officialByNameDt.get(`${normNome}|${dt}`));

    // Se não encontrou exato por nome+dt, tentar só por nome se o nome for longo (>= 3 palavras)
    if (!oficial && normNome.split(' ').length >= 3) {
      for (const [k, item] of officialByNameDt) {
        if (k.startsWith(normNome)) {
          oficial = item;
          break;
        }
      }
    }

    if (oficial) {
      let mod = false;
      const patch = {};

      // 1. Atualizar para o documento oficial legítimo (eliminar hashes como 68119364137463634812)
      if (oficial.docOficial && p.cpf_cns !== oficial.docOficial) {
        patch.cpf_cns = oficial.docOficial;
        mod = true;
      } else if (!oficial.docOficial && p.cpf_cns && cleanDigits(p.cpf_cns).length > 15) {
        // Se o e-SUS não tem CPF nem CNS cadastrado, deixar NULL
        patch.cpf_cns = null;
        mod = true;
      }

      // 2. Atualizar nome oficial
      if (oficial.nome && p.nome !== oficial.nome) {
        patch.nome = oficial.nome;
        mod = true;
      }

      // 3. Atualizar data de nascimento se vazia
      if (oficial.dtNasc && (!p.dt_nasc || p.dt_nasc !== oficial.dtNasc)) {
        patch.dt_nasc = oficial.dtNasc;
        mod = true;
      }

      // 4. Atualizar sexo oficial
      if (oficial.sexo && p.sexo !== oficial.sexo) {
        patch.sexo = oficial.sexo;
        mod = true;
      }

      // 5. Atualizar telefone se o oficial for válido
      if (oficial.telefone && (!p.telefone || p.telefone === '63999999999')) {
        patch.telefone = oficial.telefone;
        mod = true;
      }

      if (mod) {
        updates.push({ id: p.id, patch });
      }
    } else {
      // Se for um registro com código sintético/hash longo (>15 dígitos) E que NÃO existe no e-SUS ativo (ex: Abidom ou Abilene de fichas inativas de 2017)
      if (cleanDigits(p.cpf_cns).length > 15 || !p.cpf_cns) {
        idsParaRemover.push(p.id);
      }
    }
  }

  console.log(`- Registros oficiais atualizados / corrigidos com CPF/CNS real: ${updates.length}`);
  console.log(`- Registros fantasmas/inativados de 2017 a remover: ${idsParaRemover.length}`);

  // Aplicar updates
  console.log('Aplicando atualizações no banco...');
  for (const { id, patch } of updates) {
    await supabase.from('pacientes').update(patch).eq('id', id);
  }

  // Deletar registros fantasmas
  console.log('Removendo registros fantasmas...');
  let remCount = 0;
  for (let i = 0; i < idsParaRemover.length; i += 100) {
    const batch = idsParaRemover.slice(i, i + 100);
    const { error } = await supabase.from('pacientes').delete().in('id', batch);
    if (!error) remCount += batch.length;
  }
  console.log(`✓ Removidos ${remCount} registros inativos/fantasmas.`);

  const { count: finalCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
  console.log(`\n=====================================================`);
  console.log(`✓ BASE ATIVA SINCRONIZADA COM E-SUS PEC: ${finalCount} Cidadãos!`);
  console.log(`=====================================================`);
}

syncExactActiveCitizens().catch(console.error);
