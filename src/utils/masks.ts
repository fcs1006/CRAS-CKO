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

export function getNeighborhoodCoords(bairro: string): [number, number] {
  if (!bairro) return [-12.2152, -47.2625];
  const normalized = bairro.trim().toUpperCase();
  if (normalized.includes('CENTRO')) return [-12.2152, -47.2625];
  if (normalized.includes('LESTE')) return [-12.2140, -47.2550];
  if (normalized.includes('OESTE')) return [-12.2160, -47.2700];
  if (normalized.includes('NORTE')) return [-12.2080, -47.2610];
  if (normalized.includes('SUL')) return [-12.2220, -47.2640];
  if (normalized.includes('RURAL')) return [-12.2400, -47.2200];
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash += normalized.charCodeAt(i) * (i + 1);
  }
  const latOffset = ((hash % 100) - 50) / 5000;
  const lngOffset = (((hash >> 2) % 100) - 50) / 5000;
  return [-12.2152 + latOffset, -47.2625 + lngOffset];
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
