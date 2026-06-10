import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './_wake.js';

const strip = s => (s || '').replace(/^﻿/, '').trim()

const supabase = createClient(
  strip(process.env.NEXT_PUBLIC_SUPABASE_URL),
  strip(process.env.SUPABASE_SERVICE_ROLE_KEY),
  {
    global: {
      fetch: async (url, options) => {
        const res = await fetch(url, options);
        if (!res.ok && res.status >= 500) triggerRestore();
        return res;
      },
    },
  }
);

export default supabase;
