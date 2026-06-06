import { createClient } from '@supabase/supabase-js'

// Env tanımlı değilse client constructor'ı fırlatmasın diye güvenli fallback.
// Gerçek env varken gerçek değerler kullanılır; yokken istekler ağ katmanında
// sessizce başarısız olur (çağıran tarafta try/catch ile yakalanır).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-key-placeholder'

export const createBrowserClient = () =>
  createClient(supabaseUrl, supabaseAnonKey)

export const createServerClient = () =>
  createClient(supabaseUrl, supabaseAnonKey)
