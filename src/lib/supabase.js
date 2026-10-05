import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas chaves reais do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tfvyapgnokgyytkgmqwv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EywaTZmEDDfqcjGJwe2VcQ_249_zs1O';

export const supabase = createClient(supabaseUrl, supabaseKey);