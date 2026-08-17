const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function fixEmptyNis() {
  console.log('--- BUSCANDO TODAS AS FAMILIAS COM NIS VAZIO ("") ---');
  const res = await fetch(`${url}/rest/v1/familias?nis_responsavel=eq.`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });
  const familiasVazias = await res.json();
  console.log('Famílias com NIS vazias (""):', familiasVazias);

  for (const fam of familiasVazias) {
    const placeholder = `SEM_NIS_${fam.cod_familiar || fam.id.substring(0, 8)}`;
    console.log(`Atualizando familia ${fam.id} (${fam.responsavel}) setando nis_responsavel = ${placeholder}...`);
    const updateRes = await fetch(`${url}/rest/v1/familias?id=eq.${fam.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ nis_responsavel: placeholder })
    });
    console.log('Resultado update:', await updateRes.json());
  }

  console.log('--- CONCLUÍDO CORREÇÃO DE NIS VAZIO ---');
}

fixEmptyNis();
