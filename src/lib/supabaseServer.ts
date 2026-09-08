import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://placeholder-project.supabase.co'
const DEFAULT_ANON_KEY = 'placeholder-anon-key'

export function getSupabaseServer() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseUrl = (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) 
    ? rawUrl 
    : DEFAULT_SUPABASE_URL

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
