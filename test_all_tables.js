const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const tables = ['pacientes', 'paciente', 'pessoas', 'assistidos', 'familias', 'usuarios'];

async function checkTables() {
  console.log('--- VERIFICANDO REGISTROS NAS TABELAS ---');
  for (const t of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${t}?select=count`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Prefer': 'count=exact' }
      });
      const contentRange = res.headers.get('content-range');
      console.log(`Tabela '${t}': Status HTTP ${res.status}, Content-Range: ${contentRange}`);
    } catch (e) {
      console.error(`Erro ao consultar '${t}':`, e.message);
    }
  }
}

checkTables();
