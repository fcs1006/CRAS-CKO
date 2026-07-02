import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) 
  ? rawUrl 
  : 'https://placeholder-project.supabase.co'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
