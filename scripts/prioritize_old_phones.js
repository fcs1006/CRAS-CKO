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

function formatPhone(p) {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits === '63999999999' || digits.length < 8) return null;
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

async function prioritizeOldPhones() {
  console.log('--- APLICANDO PRIORIDADE ABSOLUTA AOS TELEFONES ANTIGOS/ATUALIZADOS ---');

  // 1. Buscar todos os pacientes
  let allPacientes = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('pacientes').select('*').range(from, from + pageSize - 1);
    if (error) {
      console.error('Erro ao ler pacientes:', error);
      break;
    }
    allPacientes.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Total de pacientes lidos: ${allPacientes.length}`);

  // 2. Mapear telefones dos registros antigos (criados em 2026-04-01)
  const phoneByCpf = new Map();
  const phoneByCns = new Map();
  const phoneByName = new Map();

  for (const p of allPacientes) {
    const isAntigo = p.criado_em && p.criado_em.startsWith('2026-04-01');
    const rawTel = (p.telefone || '').replace(/\D/g, '');

    if (isAntigo && rawTel && rawTel !== '63999999999' && rawTel.length >= 8) {
      const doc = (p.cpf_cns || '').replace(/\D/g, '');
      const nome = normalizeStr(p.nome);

      if (doc.length === 11) phoneByCpf.set(doc, p.telefone);
      else if (doc.length === 15) phoneByCns.set(doc, p.telefone);

      if (nome) phoneByName.set(nome, p.telefone);
    }
  }

  console.log(`Total de telefones únicos mapeados dos registros antigos:`);
  console.log(`- Por CPF: ${phoneByCpf.size}`);
  console.log(`- Por CNS: ${phoneByCns.size}`);
  console.log(`- Por Nome: ${phoneByName.size}`);

  // 3. Atualizar telefones na tabela `pacientes`
  let pacAtualizados = 0;
  for (const p of allPacientes) {
    const doc = (p.cpf_cns || '').replace(/\D/g, '');
    const nome = normalizeStr(p.nome);
    const telAtual = (p.telefone || '').replace(/\D/g, '');

    // Buscar telefone do registro antigo prioritariamente
    let telPrioritario = null;
    if (doc.length === 11 && phoneByCpf.has(doc)) {
      telPrioritario = phoneByCpf.get(doc);
    } else if (doc.length === 15 && phoneByCns.has(doc)) {
      telPrioritario = phoneByCns.get(doc);
    } else if (nome && phoneByName.has(nome)) {
      telPrioritario = phoneByName.get(nome);
    }

    // Se não tem telefone antigo, manter o telefone atual (formatado) desde que não seja o dummy 63999999999
    if (!telPrioritario && telAtual && telAtual !== '63999999999' && telAtual.length >= 8) {
      telPrioritario = p.telefone;
    }

    const telFinal = formatPhone(telPrioritario);

    if (telFinal !== p.telefone) {
      await supabase.from('pacientes').update({ telefone: telFinal }).eq('id', p.id);
      pacAtualizados++;
    }
  }

  console.log(`✓ Pacientes com telefone atualizado: ${pacAtualizados}`);

  // 4. Atualizar telefones na tabela `familias`
  console.log('\nAtualizando telefones dos Responsáveis Familiares em `familias`...');
  let allFamilias = [];
  let fFrom = 0;
  while (true) {
    const { data, error } = await supabase.from('familias').select('id, responsavel, cpf_responsavel, telefone').range(fFrom, fFrom + pageSize - 1);
    if (error) break;
    allFamilias.push(...(data || []));
    if (!data || data.length < pageSize) break;
    fFrom += pageSize;
  }

  let famAtualizadas = 0;
  for (const f of allFamilias) {
    const cpf = (f.cpf_responsavel || '').replace(/\D/g, '');
    const nome = normalizeStr(f.responsavel);
    const telAtual = (f.telefone || '').replace(/\D/g, '');

    let telPrioritario = null;
    if (cpf.length === 11 && phoneByCpf.has(cpf)) {
      telPrioritario = phoneByCpf.get(cpf);
    } else if (nome && phoneByName.has(nome)) {
      telPrioritario = phoneByName.get(nome);
    }

    if (!telPrioritario && telAtual && telAtual !== '63999999999' && telAtual !== '999999999' && telAtual.length >= 8) {
      telPrioritario = f.telefone;
    }

    const telFinal = formatPhone(telPrioritario) || 'Não informado';

    if (telFinal !== f.telefone) {
      await supabase.from('familias').update({ telefone: telFinal }).eq('id', f.id);
      famAtualizadas++;
    }
  }

  console.log(`✓ Famílias com telefone atualizado: ${famAtualizadas}`);
  console.log('\n=====================================================');
  console.log('PRIORIZAÇÃO DOS TELEFONES CONCLUÍDA COM SUCESSO!');
  console.log('=====================================================');
}

prioritizeOldPhones().catch(console.error);
