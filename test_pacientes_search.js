const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- BUSCANDO TODOS OS PACIENTES ---');
fetch(`${url}/rest/v1/pacientes?select=*`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(async res => {
  console.log('Status HTTP:', res.status);
  const data = await res.json();
  console.log('Total registros na tabela pacientes:', Array.isArray(data) ? data.length : data);
  if (Array.isArray(data) && data.length > 0) {
    console.log('Primeiro registro:', JSON.stringify(data[0], null, 2));
    console.log('Chaves/Colunas existentes:', Object.keys(data[0]));
  }
})
.catch(err => {
  console.error('Erro na requisição:', err);
});
