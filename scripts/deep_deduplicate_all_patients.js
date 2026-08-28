const fs = require('fs');
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

function cleanDigits(d) {
  return (d || '').replace(/\D/g, '');
}

function normalizeWords(name) {
  if (!name) return [];
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .toUpperCase();
  const stopWords = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E']);
  return clean.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
}

function wordSimilarity(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

async function deepScan() {
  console.log('--- VARREDURA PROFUNDA DE DUPLICIDADES EM PACIENTES ---');
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

  // Agrupar por data de nascimento exata
  const byBirthDate = new Map();
  for (const p of allPacientes) {
    const dt = p.dt_nasc ? p.dt_nasc.split('T')[0] : 'SEM_DATA';
    if (!byBirthDate.has(dt)) byBirthDate.set(dt, []);
    byBirthDate.get(dt).push(p);
  }

  const duplicatesToMerge = [];
  const alreadyGrouped = new Set();

  for (const [dt, list] of byBirthDate) {
    if (list.length <= 1) continue;

    for (let i = 0; i < list.length; i++) {
      const p1 = list[i];
      if (alreadyGrouped.has(p1.id)) continue;

      const words1 = normalizeWords(p1.nome);
      const currentGroup = [p1];

      for (let j = i + 1; j < list.length; j++) {
        const p2 = list[j];
        if (alreadyGrouped.has(p2.id)) continue;

        const words2 = normalizeWords(p2.nome);

        // Critério 1: Mesmo primeiro nome e mesmo último nome
        const sameFirstAndLast = words1.length >= 2 && words2.length >= 2 &&
          words1[0] === words2[0] && words1[words1.length - 1] === words2[words2.length - 1];

        // Critério 2: Similaridade de palavras >= 60% (ex: Adão Carlos dos Santos Godinho vs Adão Carlos dos Godinho)
        const sim = wordSimilarity(words1, words2);

        // Critério 3: Um nome contém o outro (substring / subconjunto)
        const subset = words1.every(w => words2.includes(w)) || words2.every(w => words1.includes(w));

        if (sameFirstAndLast || sim >= 0.6 || (subset && words1.length >= 2 && words2.length >= 2)) {
          currentGroup.push(p2);
          alreadyGrouped.add(p2.id);
        }
      }

      if (currentGroup.length > 1) {
        alreadyGrouped.add(p1.id);
        duplicatesToMerge.push(currentGroup);
      }
    }
  }

  console.log(`\nGrupos de duplicados complexos encontrados: ${duplicatesToMerge.length}`);

  let totalIdsDeletar = [];
  let totalUpdates = [];

  for (const group of duplicatesToMerge) {
    // Escolher o melhor registro do grupo:
    // Critérios:
    // 1. CPF de 11 dígitos legítimo (score +100)
    // 2. CNS de 15 dígitos legítimo (score +50)
    // 3. Nome mais completo (maior número de palavras / caracteres) (score + length)
    // 4. Telefone real preenchido (score +10)
    group.sort((a, b) => {
      const docA = cleanDigits(a.cpf_cns);
      const docB = cleanDigits(b.cpf_cns);
      const isCpfA = docA.length === 11;
      const isCpfB = docB.length === 11;
      const isCnsA = docA.length === 15;
      const isCnsB = docB.length === 15;

      const scoreA = (isCpfA ? 100 : (isCnsA ? 50 : 0)) + a.nome.length + (a.telefone && a.telefone !== '63999999999' ? 10 : 0);
      const scoreB = (isCpfB ? 100 : (isCnsB ? 50 : 0)) + b.nome.length + (b.telefone && b.telefone !== '63999999999' ? 10 : 0);
      return scoreB - scoreA;
    });

    const principal = group[0];
    const dups = group.slice(1);

    let mod = false;
    const patch = {};

    // Se o nome do principal não for o mais completo, pegar o nome mais completo do grupo
    for (const d of dups) {
      if (d.nome.length > principal.nome.length && normalizeWords(d.nome).length >= normalizeWords(principal.nome).length) {
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
      if ((principal.sexo === 'O' || !principal.sexo) && (d.sexo === 'M' || d.sexo === 'F')) {
        patch.sexo = d.sexo;
        principal.sexo = d.sexo;
        mod = true;
      }

      totalIdsDeletar.push(d.id);
    }

    if (mod) {
      totalUpdates.push({ id: principal.id, patch });
    }
  }

  console.log(`\nExemplos de fusões que serão aplicadas:`);
  duplicatesToMerge.slice(0, 8).forEach(grp => {
    console.log(`- Manter: "${grp[0].nome}" (${grp[0].cpf_cns}) | Remover: ${grp.slice(1).map(x => `"${x.nome}" (${x.cpf_cns})`).join(', ')}`);
  });

  console.log(`\nTotal de registros aprimorados: ${totalUpdates.length}`);
  console.log(`Total de duplicatas a excluir: ${totalIdsDeletar.length}`);

  // Aplicar atualizações
  for (const { id, patch } of totalUpdates) {
    await supabase.from('pacientes').update(patch).eq('id', id);
  }

  // Deletar duplicatas em lotes
  let delCount = 0;
  for (let i = 0; i < totalIdsDeletar.length; i += 100) {
    const batch = totalIdsDeletar.slice(i, i + 100);
    const { error } = await supabase.from('pacientes').delete().in('id', batch);
    if (!error) delCount += batch.length;
  }

  console.log(`\n✓ Removidas ${delCount} duplicatas com sucesso!`);

  const { count: finalCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
  console.log(`\n=====================================================`);
  console.log(`✓ BASE FINAL PURIFICADA: ${finalCount} Cidadãos Únicos!`);
  console.log(`=====================================================`);
}

deepScan().catch(console.error);
