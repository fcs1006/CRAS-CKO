const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

console.log('--- BUSCANDO HISTORICO DE ATENDIMENTOS COM SERVICE ROLE ---');
fetch(`${url}/rest/v1/historico_atendimentos?select=*`, {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`
  }
})
.then(async res => {
  console.log('Status HTTP (Service Role):', res.status);
  const data = await res.json();
  console.log('Registros encontrados (Service Role):', Array.isArray(data) ? data.length : data);
  if (Array.isArray(data) && data.length > 0) {
    console.log('Primeiro atendimento:', data[0]);
  }
})
.catch(err => console.error('Erro:', err));

console.log('--- BUSCANDO HISTORICO DE ATENDIMENTOS COM ANON KEY ---');
fetch(`${url}/rest/v1/historico_atendimentos?select=*`, {
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
})
.then(async res => {
  console.log('Status HTTP (Anon Key):', res.status);
  const data = await res.json();
  console.log('Registros encontrados (Anon Key):', Array.isArray(data) ? data.length : data);
})
.catch(err => console.error('Erro:', err));
