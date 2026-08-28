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

function cleanCpf(cpf) {
  if (!cpf || cpf === '\\N') return '';
  return cpf.replace(/\D/g, '');
}

function formatCpf(digits) {
  if (!digits || digits.length !== 11) return digits || '';
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatNis(digits) {
  if (!digits || digits.length !== 11) return digits || '';
  return `${digits.slice(0, 3)}.${digits.slice(3, 8)}.${digits.slice(8, 10)}-${digits.slice(10)}`;
}

const parentescoMap = {
  '137': 'Cônjuge / Companheiro(a)',
  '138': 'Filho(a)',
  '139': 'Enteado(a)',
  '140': 'Neto(a) / Bisneto(a)',
  '141': 'Pai / Mãe',
  '142': 'Sogro(a)',
  '143': 'Irmão / Irmã',
  '144': 'Genro / Nora',
  '145': 'Outro parente',
  '146': 'Não parente'
};

async function fixFamilies() {
  console.log('1. Extraindo tabelas de Vínculo Familiar e Domicílios...');
  const [tNucleo, tCadInd, tPec, tDom, tFam, tCid] = await Promise.all([
    extractTable('tb_cidadao_nucleo_familiar'),
    extractTable('tb_cds_cad_individual'),
    extractTable('tb_fat_cidadao_pec'),
    extractTable('tb_cds_domicilio'),
    extractTable('tb_familia'),
    extractTable('tb_cidadao')
  ]);

  const rowsNucleo = parseTsv(tNucleo.text, parseCopyStatement(tNucleo.copyStmt));
  const rowsCadInd = parseTsv(tCadInd.text, parseCopyStatement(tCadInd.copyStmt));
  const rowsPec = parseTsv(tPec.text, parseCopyStatement(tPec.copyStmt));
  const rowsDom = parseTsv(tDom.text, parseCopyStatement(tDom.copyStmt));
  const rowsFam = parseTsv(tFam.text, parseCopyStatement(tFam.copyStmt));
  const rowsCid = parseTsv(tCid.text, parseCopyStatement(tCid.copyStmt));

  console.log('2. Mapeando cidadãos por ID (co_cidadao)...');
  // Mapear co_cidadao -> { nome, cpf, cns, dtNasc, sexo, mae }
  const cidMapById = new Map();
  for (const c of rowsCid) {
    if (c.co_seq_cidadao) {
      cidMapById.set(c.co_seq_cidadao, {
        nome: cleanStr(c.no_cidadao),
        cpf: cleanCpf(c.nu_cpf),
        cns: cleanStr(c.nu_cns),
        dtNasc: c.dt_nascimento ? c.dt_nascimento.split(' ')[0] : null,
        sexo: c.no_sexo === '1' || c.no_sexo === 'M' ? 'Masculino' : (c.no_sexo === '2' || c.no_sexo === 'F' ? 'Feminino' : 'Outro'),
        mae: cleanStr(c.no_mae)
      });
    }
  }

  // Mapear tb_fat_cidadao_pec por co_cidadao
  for (const p of rowsPec) {
    if (p.co_cidadao && !cidMapById.has(p.co_cidadao)) {
      cidMapById.set(p.co_cidadao, {
        nome: cleanStr(p.no_cidadao),
        cpf: cleanCpf(p.nu_cpf_cidadao),
        cns: cleanStr(p.nu_cns),
        dtNasc: p.co_dim_tempo_nascimento ? `${p.co_dim_tempo_nascimento.slice(0, 4)}-${p.co_dim_tempo_nascimento.slice(4, 6)}-${p.co_dim_tempo_nascimento.slice(6, 8)}` : null,
        sexo: p.co_dim_sexo === '1' ? 'Masculino' : (p.co_dim_sexo === '2' ? 'Feminino' : 'Outro'),
        mae: null
      });
    }
  }

  // Mapear cadastro individual por CPF e Nome
  const cadIndByCpf = new Map();
  const cadIndByName = new Map();
  for (const c of rowsCadInd) {
    const cpf = cleanCpf(c.nu_cpf_cidadao);
    const nome = cleanStr(c.no_cidadao);
    const info = {
      nome,
      cpf,
      nis: cleanCpf(c.nu_pis_pasep),
      mae: cleanStr(c.no_mae_cidadao),
      sexo: c.co_sexo === '1' || c.co_sexo === 'M' ? 'Masculino' : (c.co_sexo === '2' || c.co_sexo === 'F' ? 'Feminino' : 'Outro'),
      dtNasc: c.dt_nascimento ? c.dt_nascimento.split(' ')[0] : null,
      microArea: cleanStr(c.nu_micro_area),
      isResp: c.st_responsavel_familiar === '1',
      cpfResp: cleanCpf(c.nu_cpf_responsavel)
    };
    if (cpf.length === 11) cadIndByCpf.set(cpf, info);
    if (nome) cadIndByName.set(normalizeStr(nome), info);
  }

  // Mapear Domicílios por co_seq_cds_domicilio
  const domMap = new Map();
  for (const d of rowsDom) {
    const rua = cleanStr(d.no_logradouro);
    const num = cleanStr(d.nu_domicilio) || (d.st_sem_numero === '1' ? 'S/N' : '');
    const comp = cleanStr(d.ds_complemento);
    const bairro = cleanStr(d.no_bairro) || 'CENTRO';
    const cep = d.ds_cep ? d.ds_cep.replace(/\D/g, '') : '77305000';

    const endStr = [rua ? `RUA ${rua}` : 'CONCEIÇÃO DO TOCANTINS', num ? `Nº ${num}` : '', comp ? `(${comp})` : ''].filter(Boolean).join(', ');

    if (d.co_seq_cds_domicilio) {
      domMap.set(d.co_seq_cds_domicilio, {
        endereco: endStr,
        bairro: bairro,
        cep: cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : '77305-000',
        microArea: cleanStr(d.nu_micro_area)
      });
    }
  }

  // Mapear tb_familia: nu_cpf_cns_responsavel -> { domId, prontuario, renda }
  const tbFamByResp = new Map();
  for (const f of rowsFam) {
    const rawResp = cleanCpf(f.nu_cpf_cns_responsavel);
    if (rawResp) {
      tbFamByResp.set(rawResp, {
        domId: f.co_cds_domicilio,
        prontuario: cleanStr(f.nu_prontuario_familiar),
        renda: f.co_renda_familiar
      });
    }
  }

  // Mapear Parentescos por CPF/Nome do Membro
  console.log('3. Mapeando graus de parentesco exatos do e-SUS...');
  const parentescoByDocOrName = new Map();
  for (const n of rowsNucleo) {
    const cid = cidMapById.get(n.co_cidadao);
    const grau = parentescoMap[n.co_grau_parentesco] || (n.st_responsavel === '1' ? 'Responsável' : null);

    if (cid && grau) {
      if (cid.cpf && cid.cpf.length === 11) parentescoByDocOrName.set(cid.cpf, grau);
      if (cid.cns && cid.cns.length === 15) parentescoByDocOrName.set(cid.cns, grau);
      if (cid.nome) parentescoByDocOrName.set(normalizeStr(cid.nome), grau);
    }
  }

  console.log(`Graus de parentesco mapeados: ${parentescoByDocOrName.size}`);

  // 4. Atualizar Supabase
  console.log('\n4. Atualizando Famílias e Membros no Supabase com Responsáveis e Parentescos Exatos...');

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

  console.log(`Total de famílias carregadas do banco: ${allFamilias.length}`);

  let famCorrigidas = 0;
  let membrosCorrigidos = 0;

  for (const fam of allFamilias) {
    const cpfResp = cleanCpf(fam.cpf_responsavel);
    let patchFam = {};

    // 1. Identificar o verdadeiro responsável da família
    // Se o CPF pertence ao Raimundo ou a alguém específico no e-SUS
    let trueRespName = null;
    let trueRespMae = null;
    let trueRespSexo = null;
    let trueRespDt = null;
    let trueRespNis = null;

    if (cpfResp && cadIndByCpf.has(cpfResp)) {
      const c = cadIndByCpf.get(cpfResp);
      trueRespName = c.nome;
      trueRespMae = c.mae;
      trueRespSexo = c.sexo;
      trueRespDt = c.dtNasc;
      trueRespNis = c.nis;
    }

    if (trueRespName && trueRespName !== fam.responsavel) {
      patchFam.responsavel = trueRespName;
      if (trueRespMae) patchFam.nome_mae_responsavel = trueRespMae;
      if (trueRespSexo) patchFam.sexo_responsavel = trueRespSexo;
      if (trueRespDt) patchFam.data_nascimento_responsavel = trueRespDt;
      if (trueRespNis) patchFam.nis_responsavel = formatNis(trueRespNis);
    }

    // Buscar endereço real do domicílio em tb_familia -> tb_cds_domicilio
    if (cpfResp && tbFamByResp.has(cpfResp)) {
      const fInfo = tbFamByResp.get(cpfResp);
      if (fInfo.domId && domMap.has(fInfo.domId)) {
        const d = domMap.get(fInfo.domId);
        if (d.endereco && d.endereco !== 'CONCEIÇÃO DO TOCANTINS') patchFam.logradouro = d.endereco;
        if (d.bairro) patchFam.bairro = d.bairro;
        if (d.cep) patchFam.cep = d.cep;
      }
    }

    if (Object.keys(patchFam).length > 0) {
      await supabase.from('familias').update(patchFam).eq('id', fam.id);
      famCorrigidas++;
    }

    // 2. Atualizar membros e graus de parentesco
    const respNomeAtualizado = patchFam.responsavel || fam.responsavel;

    for (const m of (fam.membros || [])) {
      const mCpf = cleanCpf(m.cpf);
      const mNomeNorm = normalizeStr(m.nome);
      let patchMem = {};

      // Verificar se é o responsável
      const isEsteResp = (mCpf && mCpf === cpfResp) || (mNomeNorm === normalizeStr(respNomeAtualizado));

      if (isEsteResp) {
        if (m.parentesco !== 'Responsável') patchMem.parentesco = 'Responsável';
        if (patchFam.responsavel && m.nome !== patchFam.responsavel) patchMem.nome = patchFam.responsavel;
      } else {
        // Buscar parentesco real no mapa
        let parentescoReal = (mCpf && parentescoByDocOrName.get(mCpf)) || (mNomeNorm && parentescoByDocOrName.get(mNomeNorm));
        if (parentescoReal && parentescoReal !== 'Responsável') {
          if (m.parentesco !== parentescoReal) patchMem.parentesco = parentescoReal;
        } else if (m.parentesco === 'Dependente / Familiar') {
          // Se idade menor que 21 -> Filho(a)
          if (m.idade !== null && m.idade <= 21) {
            patchMem.parentesco = 'Filho(a)';
          }
        }
      }

      if (Object.keys(patchMem).length > 0) {
        await supabase.from('membros_familia').update(patchMem).eq('id', m.id);
        membrosCorrigidos++;
      }
    }
  }

  console.log(`\n=====================================================`);
  console.log(`✓ CORREÇÃO DE RESPONSÁVEIS E PARENTESCOS CONCLUÍDA!`);
  console.log(`- Famílias com Responsável / Endereço Corrigido: ${famCorrigidas}`);
  console.log(`- Membros com Grau de Parentesco Atualizado: ${membrosCorrigidos}`);
  console.log(`=====================================================`);
}

fixFamilies().catch(console.error);
