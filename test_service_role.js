const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- BUSCANDO PACIENTES USANDO SERVICE_ROLE KEY ---');
fetch(`${url}/rest/v1/pacientes?select=*&limit=5`, {
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`
  }
})
.then(async res => {
  console.log('Status HTTP:', res.status);
  const data = await res.json();
  console.log('Dados com Service Role Key:', data);
})
.catch(err => {
  console.error('Erro na requisição:', err);
});
