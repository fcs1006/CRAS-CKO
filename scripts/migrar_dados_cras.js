const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Carregar variáveis de ambiente
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

function calcIdade(dtNasc) {
  if (!dtNasc) return 0;
  const d = new Date(dtNasc);
  if (isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age >= 0 && age < 130 ? age : 0;
}

function formatCpf(cpf) {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return digits;
}

function formatNis(nis) {
  if (!nis) return '';
  const digits = nis.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 8)}.${digits.slice(8, 10)}-${digits.slice(10)}`;
  }
  return digits;
}

async function runMigration() {
  console.log('=====================================================');
  console.log('INICIANDO IMPORTAÇÃO OFICIAL PARA O SISTEMA CRAS / SUAS');
  console.log('=====================================================\n');

  // Carregar dados estruturados
  const familiasPath = 'C:\\Users\\fcs_1\\.gemini\\antigravity-ide\\brain\\7688d2aa-8be3-4b02-96c1-f05bc2004e77\\scratch\\familias_importacao.json';
  const cidadaosPath = 'C:\\Users\\fcs_1\\.gemini\\antigravity-ide\\brain\\7688d2aa-8be3-4b02-96c1-f05bc2004e77\\scratch\\cidadaos_importacao.json';

  const familiasData = JSON.parse(fs.readFileSync(familiasPath, 'utf8'));
  const cidadaosData = JSON.parse(fs.readFileSync(cidadaosPath, 'utf8'));

  console.log(`Total de Famílias a processar: ${familiasData.length}`);
  console.log(`Total de Cidadãos a processar: ${cidadaosData.length}\n`);

  // 1. Buscar CPFs e Nomes já cadastrados no Supabase para evitar qualquer duplicidade
  console.log('Carregando famílias existentes do banco Supabase...');
  const { data: exFamilias, error: exFamErr } = await supabase.from('familias').select('id, responsavel, cpf_responsavel');
  if (exFamErr) {
    console.error('Erro ao ler famílias existentes:', exFamErr);
    return;
  }

  const cpfsExistentes = new Set();
  const nomesExistentes = new Set();
  (exFamilias || []).forEach(f => {
    if (f.cpf_responsavel) cpfsExistentes.add(f.cpf_responsavel.replace(/\D/g, ''));
    if (f.responsavel) nomesExistentes.add(f.responsavel.trim().toUpperCase());
  });

  console.log(`Famílias já cadastradas no sistema: ${exFamilias.length}`);

  // 2. Inserir Famílias e Membros em lotes
  let totalFamiliasInseridas = 0;
  let totalMembrosInseridos = 0;
  let totalFamiliasIgnoradas = 0;

  console.log('\n--- INICIANDO GRAVAÇÃO DOS PRONTUÁRIOS FAMILIARES ---');

  let codBase = 100000 + exFamilias.length;

  for (let i = 0; i < familiasData.length; i++) {
    const fam = familiasData[i];
    const respNome = (fam.responsavel || '').trim().toUpperCase();
    const rawCpf = fam.cpf_responsavel ? fam.cpf_responsavel.replace(/\D/g, '') : '';

    if (!respNome) continue;

    // Verificar se já existe
    if ((rawCpf && cpfsExistentes.has(rawCpf)) || nomesExistentes.has(respNome)) {
      totalFamiliasIgnoradas++;
      continue;
    }

    codBase++;
    const codFamiliar = String(codBase);
    const cpfFormatado = rawCpf.length === 11 ? formatCpf(rawCpf) : `000.${String(codBase).padStart(3, '0').slice(-3)}.${String(codBase).padStart(3, '0').slice(-3)}-00`;
    const nisFormatado = fam.nis_responsavel && fam.nis_responsavel.replace(/\D/g, '').length === 11 ? formatNis(fam.nis_responsavel) : `SEM_NIS_${codFamiliar}`;

    const famPayload = {
      cod_familiar: codFamiliar,
      responsavel: respNome,
      cpf_responsavel: cpfFormatado,
      nis_responsavel: nisFormatado,
      telefone: fam.telefone || 'Não informado',
      logradouro: fam.endereco || 'CONCEIÇÃO DO TOCANTINS',
      numero: 'S/N',
      complemento: '',
      ponto_referencia: '',
      bairro: fam.bairro || 'CENTRO',
      cep: fam.cep ? fam.cep.replace(/\D/g, '') : '77305000',
      municipio: 'CONCEIÇÃO DO TOCANTINS',
      uf: 'TO',
      paif_ativo: false,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };

    const { data: famInserida, error: famErr } = await supabase
      .from('familias')
      .insert(famPayload)
      .select()
      .single();

    if (famErr) {
      console.error(`Erro ao inserir família ${respNome}:`, famErr.message);
      continue;
    }

    if (rawCpf) cpfsExistentes.add(rawCpf);
    nomesExistentes.add(respNome);
    totalFamiliasInseridas++;

    // Inserir Membros
    if (fam.membros && fam.membros.length > 0) {
      const membrosPayload = fam.membros.map(m => {
        const mNome = (m.nome || '').trim().toUpperCase();
        const mCpf = m.cpf && m.cpf.replace(/\D/g, '').length === 11 ? m.cpf.replace(/\D/g, '') : null;
        const mNis = m.nis && m.nis.replace(/\D/g, '').length === 11 ? m.nis.replace(/\D/g, '') : null;
        const mDt = m.data_nascimento || null;

        return {
          familia_id: famInserida.id,
          nome: mNome,
          parentesco: m.parentesco || 'Dependente / Familiar',
          data_nascimento: mDt,
          idade: calcIdade(mDt),
          cpf: mCpf,
          nis: mNis,
          sexo: m.sexo === 'Masculino' || m.sexo === 'Feminino' ? m.sexo : 'Não informado',
          raca_cor: 'Não informada',
          renda: 0,
          escolaridade: 'Não informada',
          ocupacao: 'Não informada',
          programa_governo: 'Nenhum'
        };
      });

      const { error: memErr } = await supabase.from('membros_familia').insert(membrosPayload);
      if (memErr) {
        console.error(`Erro ao inserir membros da família ${respNome}:`, memErr.message);
      } else {
        totalMembrosInseridos += membrosPayload.length;
      }
    }

    if (totalFamiliasInseridas % 200 === 0) {
      console.log(`Progresso: ${totalFamiliasInseridas} famílias inseridas (${totalMembrosInseridos} membros)...`);
    }
  }

  console.log(`\n✓ Gravação de Famílias concluída!`);
  console.log(`- Novas Famílias inseridas: ${totalFamiliasInseridas}`);
  console.log(`- Novos Membros vinculados: ${totalMembrosInseridos}`);
  console.log(`- Famílias ignoradas por já existirem: ${totalFamiliasIgnoradas}`);

  // 3. Atualizar / Inserir Cidadãos na tabela `pacientes`
  console.log('\n--- ATUALIZANDO BASE GERAL DE CIDADÃOS (`pacientes`) ---');
  const { data: exPacientes } = await supabase.from('pacientes').select('nome, cpf_cns');
  const pacExistentes = new Set();
  (exPacientes || []).forEach(p => {
    if (p.cpf_cns) pacExistentes.add(p.cpf_cns.replace(/\D/g, ''));
    if (p.nome) pacExistentes.add(p.nome.trim().toUpperCase());
  });

  const novosPacientes = [];
  for (const c of cidadaosData) {
    const nome = (c.nome || '').trim().toUpperCase();
    const doc = (c.cpf || c.cns || '').replace(/\D/g, '');
    if (!nome) continue;
    if (doc && pacExistentes.has(doc)) continue;
    if (pacExistentes.has(nome)) continue;

    pacExistentes.add(nome);
    if (doc) pacExistentes.add(doc);

    novosPacientes.push({
      nome,
      cpf_cns: doc || `CONCEICAO_${Math.random().toString(36).substring(2, 8)}`,
      dt_nasc: c.data_nascimento || null,
      sexo: c.sexo === 'Masculino' ? 'M' : (c.sexo === 'Feminino' ? 'F' : 'O'),
      telefone: c.telefone || '63999999999',
      endereco: 'CONCEIÇÃO DO TOCANTINS',
      bairro: c.bairro || 'CENTRO',
      cep: '77305000',
      criado_em: new Date().toISOString()
    });
  }

  console.log(`Novos cidadãos para cadastrar na base geral: ${novosPacientes.length}`);

  // Inserir pacientes em lotes de 100
  let pacInseridos = 0;
  for (let i = 0; i < novosPacientes.length; i += 100) {
    const batch = novosPacientes.slice(i, i + 100);
    const { error: pacErr } = await supabase.from('pacientes').insert(batch);
    if (pacErr) {
      console.error(`Erro ao inserir lote de pacientes ${i}:`, pacErr.message);
    } else {
      pacInseridos += batch.length;
    }
  }

  console.log(`✓ Cidadãos inseridos na base geral: ${pacInseridos}`);

  console.log('\n=====================================================');
  console.log('MIGRAÇÃO E POPULAÇÃO DO SISTEMA CONCLUÍDAS COM SUCESSO!');
  console.log('=====================================================');
}

runMigration().catch(console.error);
