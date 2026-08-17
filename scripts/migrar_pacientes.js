/**
 * SCRIPT DE MIGRAÇÃO / CÓPIA DA TABELA PACIENTES
 * ----------------------------------------------------
 * Este script conecta ao Supabase de Origem (do outro projeto),
 * lê os registros da tabela 'pacientes' e os insere no Supabase Destino (CRAS).
 *
 * Como executar:
 * node scripts/migrar_pacientes.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const ORIGEM_URL = process.env.NEXT_PUBLIC_PACIENTES_SUPABASE_URL;
const ORIGEM_KEY = process.env.NEXT_PUBLIC_PACIENTES_SUPABASE_ANON_KEY;

const DESTINO_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const DESTINO_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!ORIGEM_URL || !ORIGEM_KEY) {
  console.error('ERRO: NEXT_PUBLIC_PACIENTES_SUPABASE_URL e NEXT_PUBLIC_PACIENTES_SUPABASE_ANON_KEY devem ser configurados no .env.local');
  process.exit(1);
}

if (!DESTINO_URL || !DESTINO_KEY) {
  console.error('ERRO: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem ser configurados no .env.local');
  process.exit(1);
}

const supabaseOrigem = createClient(ORIGEM_URL, ORIGEM_KEY);
const supabaseDestino = createClient(DESTINO_URL, DESTINO_KEY);

async function migrar() {
  console.log('Iniciando cópia de registros da tabela pacientes...');

  const { data: pacientesOrigem, error: errOrigem } = await supabaseOrigem
    .from('pacientes')
    .select('*');

  if (errOrigem) {
    console.error('Erro ao ler pacientes da origem:', errOrigem);
    return;
  }

  console.log(`Lidos ${pacientesOrigem?.length || 0} pacientes do banco de origem.`);

  if (!pacientesOrigem || pacientesOrigem.length === 0) {
    console.log('Nenhum paciente encontrado para copiar.');
    return;
  }

  const { data: inseridos, error: errDestino } = await supabaseDestino
    .from('pacientes')
    .upsert(pacientesOrigem, { onConflict: 'cpf' });

  if (errDestino) {
    console.error('Erro ao inserir pacientes no destino:', errDestino);
    return;
  }

  console.log('Cópia concluída com sucesso!');
}

migrar();
