const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testando conexão com Supabase:', url);

fetch(`${url}/rest/v1/pacientes?select=*&limit=5`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(async res => {
  console.log('Status HTTP:', res.status);
  const text = await res.text();
  console.log('Resposta:', text);
})
.catch(err => {
  console.error('Erro na conexão:', err);
});
