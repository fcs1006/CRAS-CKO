export async function syncPacienteComBase(dados: {
  id?: string
  nome: string
  cpf?: string
  rg?: string
  data_nascimento?: string
  logradouro?: string
  bairro?: string
  cep?: string
  telefone?: string
  sexo?: string
}) {
  if (!dados.nome || !dados.nome.trim()) return
  try {
    await fetch('/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
  } catch (e) {
    console.error('Erro ao sincronizar paciente com a base de busca inteligente:', e)
  }
}
