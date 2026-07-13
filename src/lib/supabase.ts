import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wjsbehweqjcduksmains.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_k58P376YgBw9yd0Hx1TtnA_OxNPSm7I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
