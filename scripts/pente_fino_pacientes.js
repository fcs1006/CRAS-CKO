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

function cleanDigits(d) {
  return (d || '').replace(/\D/g, '');
}

function cleanString(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

// Levenshtein distance
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function stringSimilarity(s1, s2) {
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length < s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;
  const dist = levenshtein(longer, shorter);
  return (longer.length - dist) / longer.length;
}

// Heurística robusta de gênero para nomes brasileiros
const FEMININE_FIRST_NAMES = new Set([
  'MARIA', 'ANA', 'ADELINA', 'ADELICE', 'ADELITA', 'ADENILSA', 'ADENILZA', 'ADRIANA', 'ALICE', 'ALINE',
  'AMANDA', 'ANDREIA', 'ANGELA', 'ANTONIA', 'APARECIDA', 'BEATRIZ', 'BERENICE', 'BERONICE', 'BRUNA',
  'CAMILA', 'CARLA', 'CAROLINA', 'CECILIA', 'CLARA', 'CLAUDIA', 'CRISTIANA', 'CRISTIANE', 'CRISTINA',
  'DAIANE', 'DANIELA', 'DANIELE', 'DEBORA', 'DENISE', 'DOMINGAS', 'EDNA', 'ELAINE', 'ELEN', 'ELIANA',
  'ELIANE', 'ELISABETE', 'ELIZABETH', 'ELIZETE', 'ERICA', 'EVA', 'FABIANA', 'FATIMA', 'FERNANDA',
  'FLAVIA', 'FRANCISCA', 'GABRIELA', 'GISELE', 'GISELLE', 'HELENA', 'IARA', 'INES', 'IRACEMA', 'ISABEL',
  'ISABELA', 'IVONE', 'JACIRA', 'JANETE', 'JAQUELINE', 'JESSICA', 'JOANA', 'JOSEFA', 'JOSIANE',
  'JULIA', 'JULIANA', 'JUSSARA', 'KARINA', 'KATIA', 'LARISSA', 'LAURA', 'LAYLA', 'LETICIA', 'LIDIA',
  'LILIAN', 'LIVIA', 'LORENA', 'LUANA', 'LUCIA', 'LUCIANA', 'LUCIENE', 'LUDMILA', 'LUISA', 'LUIZA',
  'LUZIA', 'MADALENA', 'MAIRA', 'MANUELA', 'MARA', 'MARCELA', 'MARCIA', 'MARGARETE', 'MARGARIDA',
  'MARIA', 'MARIANA', 'MARILENE', 'MARINA', 'MARISA', 'MARIZA', 'MARTA', 'MATILDE', 'MAURA',
  'MAYARA', 'MICHELE', 'MIRIAM', 'MONICA', 'NATALIA', 'NAYARA', 'NEIDE', 'NILZA', 'NOEMIA', 'NUBIA',
  'PALOMA', 'PATRICIA', 'PAULA', 'PRISCILA', 'RAFAELA', 'RAIMUNDA', 'RAQUEL', 'REBECA', 'REGINA',
  'RENATA', 'RITA', 'ROBERTA', 'ROSA', 'ROSANA', 'ROSANGELA', 'ROSE', 'ROSEMEIRE', 'ROSILENE',
  'RUTH', 'SABRINA', 'SAMARA', 'SANDRA', 'SARA', 'SILVIA', 'SIMONE', 'SIRLEI', 'SOLANGE', 'SONIA',
  'STEFANY', 'SUELI', 'SUELEN', 'SUZANA', 'TAIS', 'TALITA', 'TATIANA', 'TERESA', 'TEREZINHA', 'THAIS',
  'VALERIA', 'VANDETE', 'VANESSA', 'VANIA', 'VERA', 'VERONICA', 'VILMA', 'VITORIA', 'VIVIANE',
  'YARA', 'YASMIN', 'ZELIA', 'ZILDA', 'ZILMA'
]);

const MASCULINE_FIRST_NAMES = new Set([
  'ABIMAEL', 'ABNER', 'ABRAAO', 'ADAILTON', 'ADAILSON', 'ADALBERTO', 'ADAO', 'ADEILDO', 'ADELINO',
  'ADELMAR', 'ADELSON', 'ADEMILSON', 'ADEMIR', 'ADENILSON', 'ADERALDO', 'ADRIANO', 'AILTON', 'ALAN',
  'ALBERTO', 'ALCEU', 'ALCIDES', 'ALDO', 'ALEX', 'ALEXANDRE', 'ALMIR', 'ALTAIR', 'ALVARO', 'AMILTON',
  'ANDRE', 'ANSELMO', 'ANTONIO', 'ARNALDO', 'ARTHUR', 'ARTUR', 'AUGUSTO', 'BENEDITO', 'BERNARDO',
  'BRUNO', 'CAIO', 'CARLOS', 'CESAR', 'CICERO', 'CLAUDIO', 'CLEBER', 'CLEITON', 'CRISTIANO',
  'DANIEL', 'DANILO', 'DAVI', 'DAVID', 'DECIO', 'DENILSON', 'DIEGO', 'DIOGO', 'DIONISIO', 'DOMINGOS',
  'DOUGLAS', 'EDER', 'EDGAR', 'EDILSON', 'EDMAR', 'EDMILSON', 'EDMUNDO', 'EDNALDO', 'EDSON', 'EDUARDO',
  'ELIAS', 'ELISEU', 'ELTON', 'EMERSON', 'ENZO', 'ERICO', 'ERIVALDO', 'ERNANI', 'ESTEVAO', 'EVANDRO',
  'FABIANO', 'FABIO', 'FABRICIO', 'FELIPE', 'FELIX', 'FERNANDO', 'FLAVIO', 'FRANCISCO', 'GABRIEL',
  'GERALDO', 'GERSON', 'GILBERTO', 'GILMAR', 'GIOVANE', 'GUILHERME', 'GUSTAVO', 'HEITOR', 'HELIO',
  'HENRIQUE', 'HUGO', 'HUMBERTO', 'IAGO', 'IGOR', 'ISMAEL', 'ISRAEL', 'ITAMAR', 'IVAN', 'JADER',
  'JAIME', 'JAIR', 'JAIRO', 'JEAN', 'JEFERSON', 'JOAO', 'JOAQUIM', 'JOCELIO', 'JOEL', 'JONAS',
  'JONATAS', 'JORGE', 'JOSE', 'JOSUE', 'JULIANO', 'JULIO', 'JUNIOR', 'KAUAN', 'KLEBER', 'LAERTE',
  'LEANDRO', 'LEONARDO', 'LINDOMAR', 'LUCAS', 'LUCIANO', 'LUCIO', 'LUIS', 'LUIZ', 'MAGNO', 'MAICON',
  'MANOEL', 'MANUEL', 'MARCELO', 'MARCIO', 'MARCOS', 'MARIO', 'MATEUS', 'MATHEUS', 'MAURICIO',
  'MAURO', 'MICHEL', 'MIGUEL', 'MILTON', 'MOACIR', 'MOISES', 'MURILO', 'NATAN', 'NELSON', 'NEWTON',
  'NILSON', 'NILTON', 'ORLANDO', 'OSMAR', 'OSVALDO', 'OTAVIO', 'PAULO', 'PEDRO', 'RAFAEL', 'RAIMUNDO',
  'RAMIRO', 'REGINALDO', 'RENAN', 'RENATO', 'RICARDO', 'ROBERTO', 'ROBSON', 'RODRIGO', 'ROGERIO',
  'ROMARIO', 'RONALDO', 'ROQUE', 'RUBENS', 'SAMUEL', 'SANDRO', 'SAULO', 'SERGIO', 'SILVIO', 'TALES',
  'TIAGO', 'VALDIR', 'VALMIR', 'VALTER', 'VANDERLEI', 'VICENTE', 'VICTOR', 'VINICIUS', 'VITOR',
  'WAGNER', 'WALDIR', 'WALLACE', 'WALTER', 'WELLINGTON', 'WESLEY', 'WILLIAM', 'WILLIAN', 'WILSON'
]);

function inferSex(name) {
  const norm = cleanString(name);
  const firstName = norm.split(' ')[0];

  if (FEMININE_FIRST_NAMES.has(firstName)) return 'F';
  if (MASCULINE_FIRST_NAMES.has(firstName)) return 'M';

  if (firstName.endsWith('A') && !['LUCAS', 'BATISTA', 'COSTA', 'SOUSA', 'SILVA', 'DEUS', 'ALVES', 'DIAS', 'CALDAS', 'PEREIRA'].includes(firstName)) {
    return 'F';
  }
  if (firstName.endsWith('O') || firstName.endsWith('OR') || firstName.endsWith('SON') || firstName.endsWith('TON') || firstName.endsWith('EL') || firstName.endsWith('DO')) {
    return 'M';
  }
  return null;
}

async function penteFino() {
  console.log('=====================================================');
  console.log('INICIANDO PENTE FINO AVANÇADO NA BASE DE PACIENTES');
  console.log('=====================================================\n');

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

  // 1. Agrupar por data de nascimento exata
  const byBirthDate = new Map();
  for (const p of allPacientes) {
    const dt = p.dt_nasc ? p.dt_nasc.split('T')[0] : 'SEM_DATA';
    if (!byBirthDate.has(dt)) byBirthDate.set(dt, []);
    byBirthDate.get(dt).push(p);
  }

  const duplicatesToMerge = [];
  const processedIds = new Set();

  for (const [dt, list] of byBirthDate) {
    if (list.length <= 1) continue;

    for (let i = 0; i < list.length; i++) {
      const p1 = list[i];
      if (processedIds.has(p1.id)) continue;

      const norm1 = cleanString(p1.nome);
      const group = [p1];

      for (let j = i + 1; j < list.length; j++) {
        const p2 = list[j];
        if (processedIds.has(p2.id)) continue;

        const norm2 = cleanString(p2.nome);

        // Similaridade de string completa
        const sim = stringSimilarity(norm1, norm2);

        // Ex: ADELINA RAIMUDO DO NACIMENTO vs ADELINA RAIMUNDA DO NASCIMENTO (sim > 0.88)
        if (sim >= 0.78) {
          group.push(p2);
          processedIds.add(p2.id);
        }
      }

      if (group.length > 1) {
        processedIds.add(p1.id);
        duplicatesToMerge.push(group);
      }
    }
  }

  console.log(`\nGrupos duplicados por similaridade fonética/tipográfica encontrados: ${duplicatesToMerge.length}`);

  const idsParaDeletar = [];
  const updates = [];

  for (const group of duplicatesToMerge) {
    // Escolher o melhor registro:
    // 1. Tem CPF legítimo (11 dígitos)
    // 2. Tem CNS legítimo (15 dígitos)
    // 3. Nome mais correto / completo (sem erros ortográficos como NACIMENTO em vez de NASCIMENTO)
    group.sort((a, b) => {
      const docA = cleanDigits(a.cpf_cns);
      const docB = cleanDigits(b.cpf_cns);
      const isCpfA = docA.length === 11;
      const isCpfB = docB.length === 11;
      const isCnsA = docA.length === 15;
      const isCnsB = docB.length === 15;

      const scoreA = (isCpfA ? 100 : (isCnsA ? 50 : 0)) +
                     (a.nome.includes('NASCIMENTO') ? 20 : 0) +
                     (a.nome.length) +
                     (a.telefone && a.telefone !== '63999999999' ? 10 : 0);
      const scoreB = (isCpfB ? 100 : (isCnsB ? 50 : 0)) +
                     (b.nome.includes('NASCIMENTO') ? 20 : 0) +
                     (b.nome.length) +
                     (b.telefone && b.telefone !== '63999999999' ? 10 : 0);
      return scoreB - scoreA;
    });

    const principal = group[0];
    const dups = group.slice(1);

    let mod = false;
    const patch = {};

    // Corrigir nome do principal se alguma duplicata tiver o nome grafado mais corretamente
    for (const d of dups) {
      if (d.nome.includes('NASCIMENTO') && !principal.nome.includes('NASCIMENTO')) {
        patch.nome = d.nome.trim().toUpperCase();
        principal.nome = patch.nome;
        mod = true;
      }
      if (d.nome.includes('RAIMUNDA') && !principal.nome.includes('RAIMUNDA')) {
        patch.nome = d.nome.trim().toUpperCase();
        principal.nome = patch.nome;
        mod = true;
      }

      const docD = cleanDigits(d.cpf_cns);
      if (docD.length === 11 && cleanDigits(principal.cpf_cns).length !== 11) {
        patch.cpf_cns = docD;
        principal.cpf_cns = docD;
        mod = true;
      } else if (docD.length === 15 && cleanDigits(principal.cpf_cns).length > 15) {
        patch.cpf_cns = docD;
        principal.cpf_cns = docD;
        mod = true;
      }

      if ((!principal.telefone || principal.telefone === '63999999999') && d.telefone && d.telefone !== '63999999999') {
        patch.telefone = d.telefone;
        principal.telefone = d.telefone;
        mod = true;
      }
      if ((!principal.endereco || principal.endereco === 'CONCEIÇÃO DO TOCANTINS') && d.endereco && d.endereco !== 'CONCEIÇÃO DO TOCANTINS') {
        patch.endereco = d.endereco;
        principal.endereco = d.endereco;
        mod = true;
      }

      idsParaDeletar.push(d.id);
    }

    // Inferir e corrigir Sexo
    const sexoCorreto = inferSex(patch.nome || principal.nome);
    if (sexoCorreto && (principal.sexo !== sexoCorreto || principal.sexo === 'O')) {
      patch.sexo = sexoCorreto;
      principal.sexo = sexoCorreto;
      mod = true;
    }

    if (mod) {
      updates.push({ id: principal.id, patch });
    }
  }

  console.log('Exemplos de fusões do pente fino:');
  duplicatesToMerge.slice(0, 8).forEach(grp => {
    console.log(`- Manter: "${grp[0].nome}" (${grp[0].cpf_cns}) [Sexo: ${grp[0].sexo}] | Remover: ${grp.slice(1).map(x => `"${x.nome}" (${x.cpf_cns}) [Sexo: ${x.sexo}]`).join(', ')}`);
  });

  // 2. Correção em massa de sexo para todos os outros pacientes que ainda tinham 'O' ou inconsistência
  console.log('\n2. Auditando e corrigindo Sexo/Gênero de TODOS os pacientes na base...');
  for (const p of allPacientes) {
    if (idsParaDeletar.includes(p.id)) continue;

    const sexoEsperado = inferSex(p.nome);
    if (sexoEsperado && (p.sexo === 'O' || p.sexo !== sexoEsperado || !p.sexo)) {
      // Checar se já tem update
      const existingUpdate = updates.find(u => u.id === p.id);
      if (existingUpdate) {
        existingUpdate.patch.sexo = sexoEsperado;
      } else {
        updates.push({ id: p.id, patch: { sexo: sexoEsperado } });
      }
    }
  }

  console.log(`- Total de atualizações/correções de gênero: ${updates.length}`);
  console.log(`- Total de duplicatas a excluir: ${idsParaDeletar.length}`);

  // Aplicar updates
  console.log('Aplicando correções de dados e gênero...');
  for (const { id, patch } of updates) {
    await supabase.from('pacientes').update(patch).eq('id', id);
  }

  // Deletar duplicatas
  console.log('Removendo duplicatas...');
  let delCount = 0;
  for (let i = 0; i < idsParaDeletar.length; i += 100) {
    const batch = idsParaDeletar.slice(i, i + 100);
    const { error } = await supabase.from('pacientes').delete().in('id', batch);
    if (!error) delCount += batch.length;
  }

  console.log(`✓ Removidas ${delCount} duplicatas.`);

  const { count: finalCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
  console.log(`\n=====================================================`);
  console.log(`✓ BASE FINAL PURIFICADA NO PENTE FINO: ${finalCount} Cidadãos!`);
  console.log(`=====================================================`);
}

penteFino().catch(console.error);
