// lib/supabase.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL não configurada no .env');
}

// use a SERVICE_ROLE se existir; senão, cai para a ANON (apenas leitura/escrita limitada)
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error('Defina SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY no .env');
}

export const supabase = createClient(SUPABASE_URL, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'x-client-info': 'vendify-api' } }
});
