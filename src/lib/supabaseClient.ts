import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Lanzar un error claro en desarrollo si faltan variables
  // En producción, Supabase no se inicializa silenciosamente
  if (import.meta.env.DEV) {
    console.error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




