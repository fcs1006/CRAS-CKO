const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- BUSCANDO FAMILIAS COM CHAVE ANONIMA ---');

fetch(`${url}/rest/v1/familias?select=*,membros:membros_familia(*)`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(async res => {
  console.log('Status HTTP:', res.status);
  const data = await res.json();
  console.log('Retorno para chave Anônima:', data);
})
.catch(err => {
  console.error('Erro:', err);
});
