export async function parseResponseJson(res: Response, fallbackErrorMsg = 'Erro na resposta do servidor.') {
  try {
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '')
      console.warn(`Resposta não-JSON [Status ${res.status}]:`, text.slice(0, 300))
      return { ok: false, error: `${fallbackErrorMsg} (Código ${res.status})` }
    }
    const json = await res.json()
    return json
  } catch (err: any) {
    console.error('Erro ao interpretar JSON da resposta:', err)
    return { ok: false, error: `${fallbackErrorMsg}: Formato de resposta inválido.` }
  }
}

export async function safeFetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options)
    const data = await parseResponseJson(res, `Erro ao consultar ${url}`)
    if (!res.ok) {
      return { ok: false, error: data?.error || `Erro de requisição (${res.status}).` }
    }
    return { ok: true, data: data.data !== undefined ? data.data : data }
  } catch (err: any) {
    console.error(`Falha na requisição para ${url}:`, err)
    return { ok: false, error: err.message || 'Erro de conexão.' }
  }
}
