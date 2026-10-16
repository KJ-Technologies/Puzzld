import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabase =
  env.supabaseUrl && env.supabaseSecretKey
    ? createClient(env.supabaseUrl, env.supabaseSecretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
