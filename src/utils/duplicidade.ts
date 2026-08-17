import { Familia, MembroFamilia } from '@/types'
import { maskCPF } from './masks'

export interface ResultadoDuplicidade {
  duplicado: boolean
  mensagem?: string
  familiaEncontrada?: Familia
  papel?: 'responsavel' | 'membro'
  membroEncontrado?: MembroFamilia
}

export function verificarDuplicidadePessoa(
  dados: { nome?: string; cpf?: string; nis?: string; data_nascimento?: string },
  familias: Familia[],
  familiaIdAtual?: string
): ResultadoDuplicidade {
  const cpfClean = (dados.cpf || '').replace(/\D/g, '')
  const nomeClean = (dados.nome || '').trim().toUpperCase()
  const nomeDisplay = nomeClean || 'Esta pessoa'

  if (!familias || familias.length === 0) {
    return { duplicado: false }
  }

  for (const fam of familias) {
    // Se for a mesma família que estamos editando, pula
    if (familiaIdAtual && fam.id === familiaIdAtual) {
      continue
    }

    const famCpfRespClean = (fam.cpf_responsavel || '').replace(/\D/g, '')
    const famNomeRespClean = (fam.responsavel || '').trim().toUpperCase()

    // 1. Checagem contra o Responsável Familiar por CPF
    if (cpfClean && cpfClean.length === 11 && famCpfRespClean === cpfClean) {
      return {
        duplicado: true,
        papel: 'responsavel',
        familiaEncontrada: fam,
        mensagem: `ATENÇÃO — TRAVA DE DUPLICIDADE:\n\nA pessoa "${nomeDisplay}" (CPF: ${maskCPF(cpfClean)}) já é o(a) RESPONSÁVEL pela família CÓD. ${fam.cod_familiar} (${fam.responsavel}).\n\nNo Sistema SUAS, cada cidadão só pode pertencer a uma única família.`
      }
    }

    // Checagem contra o Responsável por Nome Exato (para registros sem CPF prévio)
    if (nomeClean && nomeClean.length >= 6 && famNomeRespClean === nomeClean) {
      return {
        duplicado: true,
        papel: 'responsavel',
        familiaEncontrada: fam,
        mensagem: `ATENÇÃO — TRAVA DE DUPLICIDADE:\n\nA pessoa "${nomeDisplay}" já é o(a) RESPONSÁVEL pela família CÓD. ${fam.cod_familiar} (${fam.responsavel}).\n\nNo Sistema SUAS, cada cidadão só pode pertencer a uma única família.`
      }
    }

    // 2. Checagem contra os Membros/Dependentes desta família
    if (fam.membros && Array.isArray(fam.membros)) {
      for (const m of fam.membros) {
        const mCpfClean = (m.cpf || '').replace(/\D/g, '')
        const mNomeClean = (m.nome || '').trim().toUpperCase()

        // Por CPF
        if (cpfClean && cpfClean.length === 11 && mCpfClean === cpfClean) {
          return {
            duplicado: true,
            papel: 'membro',
            familiaEncontrada: fam,
            membroEncontrado: m,
            mensagem: `ATENÇÃO — TRAVA DE DUPLICIDADE:\n\nA pessoa "${nomeDisplay}" (CPF: ${maskCPF(cpfClean)}) já está cadastrada como MEMBRO (${m.parentesco}) na família de ${fam.responsavel} (CÓD. ${fam.cod_familiar}).\n\nNo Sistema SUAS, cada cidadão só pode pertencer a uma única família.`
          }
        }

        // Por Nome Exato (para membros antigos que estavam sem CPF registrado)
        if (nomeClean && nomeClean.length >= 6 && mNomeClean === nomeClean) {
          return {
            duplicado: true,
            papel: 'membro',
            familiaEncontrada: fam,
            membroEncontrado: m,
            mensagem: `ATENÇÃO — TRAVA DE DUPLICIDADE:\n\nA pessoa "${nomeDisplay}" já está cadastrada como MEMBRO (${m.parentesco}) na família de ${fam.responsavel} (CÓD. ${fam.cod_familiar}).\n\nNo Sistema SUAS, cada cidadão só pode pertencer a uma única família.`
          }
        }
      }
    }
  }

  return { duplicado: false }
}
