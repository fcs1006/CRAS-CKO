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

function normalizeStr(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

async function deduplicatePacientes() {
  console.log('--- INICIANDO PROCESSO DE DEDUPLICAÇÃO DE CIDADÃOS ---');
  
  let allPacientes = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('pacientes').select('*').range(from, from + pageSize - 1);
    if (error) {
      console.error('Erro ao buscar pacientes:', error);
      break;
    }
    allPacientes.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Total de registros brutos lidos: ${allPacientes.length}`);

  // Agrupar por Chave Única (1º: CPF limpo se tiver 11 dígitos; 2º: CNS limpo se tiver 15 dígitos; 3º: Nome normalizado + Data Nasc)
  const grupos = new Map();

  for (const p of allPacientes) {
    const rawDoc = (p.cpf_cns || '').replace(/\D/g, '');
    const nomeNorm = normalizeStr(p.nome);
    const dt = p.dt_nasc || '';

    let chave = '';
    if (rawDoc.length === 11) {
      chave = `CPF_${rawDoc}`;
    } else if (rawDoc.length === 15) {
      chave = `CNS_${rawDoc}`;
    } else if (nomeNorm && dt) {
      chave = `NOME_DT_${nomeNorm}_${dt}`;
    } else if (nomeNorm) {
      chave = `NOME_${nomeNorm}`;
    } else {
      chave = `ID_${p.id}`;
    }

    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(p);
  }

  console.log(`Total de Cidadãos Únicos Reais após agrupamento: ${grupos.size}`);

  const idsParaDeletar = [];
  const atualizacoes = [];

  for (const [chave, lista] of grupos) {
    if (lista.length === 1) continue;

    // Ordenar para escolher o "melhor" registro a ser mantido:
    // Critérios: tem CPF/CNS válido, tem telefone, tem endereço preenchido, criado mais recente
    lista.sort((a, b) => {
      const scoreA = (a.cpf_cns && !a.cpf_cns.startsWith('CONCEICAO_') ? 10 : 0) +
                     (a.telefone && a.telefone !== '63999999999' ? 5 : 0) +
                     (a.endereco && a.endereco !== 'CONCEIÇÃO DO TOCANTINS' ? 5 : 0) +
                     (a.dt_nasc ? 3 : 0);
      const scoreB = (b.cpf_cns && !b.cpf_cns.startsWith('CONCEICAO_') ? 10 : 0) +
                     (b.telefone && b.telefone !== '63999999999' ? 5 : 0) +
                     (b.endereco && b.endereco !== 'CONCEIÇÃO DO TOCANTINS' ? 5 : 0) +
                     (b.dt_nasc ? 3 : 0);
      return scoreB - scoreA;
    });

    const principal = lista[0];
    const duplicatas = lista.slice(1);

    // Merge dos melhores campos para o principal
    let modificado = false;
    const patch = {};

    for (const dup of duplicatas) {
      idsParaDeletar.push(dup.id);

      if ((!principal.cpf_cns || principal.cpf_cns.startsWith('CONCEICAO_')) && dup.cpf_cns && !dup.cpf_cns.startsWith('CONCEICAO_')) {
        principal.cpf_cns = dup.cpf_cns;
        patch.cpf_cns = dup.cpf_cns;
        modificado = true;
      }
      if ((!principal.telefone || principal.telefone === '63999999999') && dup.telefone && dup.telefone !== '63999999999') {
        principal.telefone = dup.telefone;
        patch.telefone = dup.telefone;
        modificado = true;
      }
      if ((!principal.endereco || principal.endereco === 'CONCEIÇÃO DO TOCANTINS') && dup.endereco && dup.endereco !== 'CONCEIÇÃO DO TOCANTINS') {
        principal.endereco = dup.endereco;
        patch.endereco = dup.endereco;
        modificado = true;
      }
      if (!principal.dt_nasc && dup.dt_nasc) {
        principal.dt_nasc = dup.dt_nasc;
        patch.dt_nasc = dup.dt_nasc;
        modificado = true;
      }
    }

    if (modificado) {
      atualizacoes.push({ id: principal.id, patch });
    }
  }

  console.log(`- Registros principais aprimorados: ${atualizacoes.length}`);
  console.log(`- Registros duplicados a remover: ${idsParaDeletar.length}`);

  // 1. Atualizar os principais com os melhores dados mesclados
  console.log('Atualizando registros principais mesclados...');
  for (const { id, patch } of atualizacoes) {
    await supabase.from('pacientes').update(patch).eq('id', id);
  }

  // 2. Deletar os duplicados em lotes de 100
  console.log('Removendo duplicados do banco...');
  let deletados = 0;
  for (let i = 0; i < idsParaDeletar.length; i += 100) {
    const lote = idsParaDeletar.slice(i, i + 100);
    const { error: delErr } = await supabase.from('pacientes').delete().in('id', lote);
    if (delErr) {
      console.error(`Erro ao deletar lote ${i}:`, delErr.message);
    } else {
      deletados += lote.length;
    }
  }

  console.log(`\n✓ DEDUPLICAÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`- Total de duplicados removidos: ${deletados}`);

  const { count: finalCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
  console.log(`- Base Final de Cidadãos Únicos: ${finalCount} cidadãos`);
}

deduplicatePacientes().catch(console.error);
