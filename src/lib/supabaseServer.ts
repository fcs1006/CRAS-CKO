import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) 
  ? rawUrl 
  : 'https://placeholder-project.supabase.co'

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function getSupabaseServer() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
