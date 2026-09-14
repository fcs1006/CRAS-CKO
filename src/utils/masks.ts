export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

export function maskNIS(value: string): string {
  if (!value || value.startsWith('SEM_NIS')) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 8) return digits.replace(/(\d{3})(\d{1,5})/, '$1.$2');
  if (digits.length <= 10) return digits.replace(/(\d{3})(\d{5})(\d{1,2})/, '$1.$2.$3');
  return digits.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, '$1.$2.$3-$4');
}

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) {
    return digits.length > 0 ? '(' + digits : '';
  }
  if (digits.length <= 6) {
    return digits.replace(/(\d{2})(\d{1,4})/, '($1) $2');
  }
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const clean = dateStr.trim();
  if (!clean) return '—';
  if (clean.includes('/')) return clean;
  const parts = clean.split('T')[0].split('-');
  if (parts.length === 3) {
    const [ano, mes, dia] = parts;
    if (ano.length === 4) {
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }
  }
  return clean;
}

export function maskCurrency(value: string | number | null | undefined): string {
  if (value === undefined || value === null || value === '') return ''
  const str = String(value)
  const digits = str.replace(/\D/g, '')
  if (!digits) return ''
  const numericValue = parseFloat(digits) / 100
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function parseCurrencyToFloat(value: string | number | null | undefined): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return value
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return parseFloat(digits) / 100
}

export function formatFloatToCurrency(value: number | string | null | undefined): string {
  if (value === undefined || value === null || value === '') return ''
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\D/g, '')) / 100 || 0
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

// Coordenadas geográficas oficiais da sede urbana de Conceição do Tocantins (TO)
export const CENTRO_CONCEICAO_TO: [number, number] = [-12.2208, -47.2941]

// Gerador determinístico de dispersão com base no ID para manter cada família fixa na mesma posição
function hashStringToFloat(str: string, salt = 0): number {
  let h = (0x811c9dc5 ^ salt) >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return ((h ^= h >>> 16) >>> 0) / 4294967296
}

export function getNeighborhoodCoords(bairro?: string | null, seed?: string | null): [number, number] {
  const norm = (bairro || '').trim().toUpperCase()

  // Centros geográficos dos bairros e setores reais dentro da malha urbana de Conceição do Tocantins
  let baseLat = -12.2208
  let baseLng = -47.2941
  let maxRaioLat = 0.0035 // ~350 metros
  let maxRaioLng = 0.0040

  if (norm.includes('SUL')) {
    baseLat = -12.2255
    baseLng = -47.2935
    maxRaioLat = 0.0022
    maxRaioLng = 0.0028
  } else if (norm.includes('LESTE')) {
    baseLat = -12.2185
    baseLng = -47.2895
    maxRaioLat = 0.0025
    maxRaioLng = 0.0028
  } else if (norm.includes('OESTE') || norm.includes('BRASIL')) {
    baseLat = -12.2215
    baseLng = -47.2985
    maxRaioLat = 0.0025
    maxRaioLng = 0.0030
  } else if (norm.includes('AEROPORTO') || norm.includes('NORTE')) {
    baseLat = -12.2150
    baseLng = -47.2930
    maxRaioLat = 0.0028
    maxRaioLng = 0.0032
  } else if (norm.includes('RURAL') || norm.includes('ZR') || norm.includes('POVOADO')) {
    // Zona rural espalhada nas rotas rurais da região
    baseLat = -12.2350
    baseLng = -47.2850
    maxRaioLat = 0.0250 // ~2.5 km
    maxRaioLng = 0.0250
  } else if (norm.includes('MICROÁREA') || norm.includes('MICROAREA')) {
    const num = parseInt(norm.replace(/\D/g, '') || '1')
    // Distribuir microáreas pelos quadrantes da malha urbana
    const anguloMicro = (num * 45) * (Math.PI / 180)
    baseLat = -12.2208 + Math.sin(anguloMicro) * 0.0030
    baseLng = -47.2941 + Math.cos(anguloMicro) * 0.0035
    maxRaioLat = 0.0018
    maxRaioLng = 0.0020
  } else {
    // Centro e Setor Central (onde fica a maior parte das famílias da cidade)
    baseLat = -12.2208
    baseLng = -47.2941
    maxRaioLat = 0.0038
    maxRaioLng = 0.0042
  }

  // Dispersão orgânica determinística para não sobrepor todas as famílias no mesmo ponto
  const chave = seed ? `${seed}_${norm}` : norm
  const r = Math.sqrt(hashStringToFloat(chave, 1))
  const theta = hashStringToFloat(chave, 2) * 2 * Math.PI

  const dLat = r * Math.sin(theta) * maxRaioLat
  const dLng = r * Math.cos(theta) * maxRaioLng

  return [baseLat + dLat, baseLng + dLng]
}

export function compressImage(source: string, maxWidth = 350, maxHeight = 350): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width || 1;
      let height = img.height || 1;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      try {
        // Tentar preservar transparência em PNG se for leve, senão JPEG compactado
        const png = canvas.toDataURL('image/png');
        if (png.length < 120000) {
          resolve(png);
        } else {
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        }
      } catch (e) {
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      }
    };
    img.onerror = () => resolve(source);
    img.src = source;
  });
}
