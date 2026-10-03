import 'jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2.112.4';
import { handleRequest } from './core.mjs';

const service = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Keep the platform's default verify_jwt=true when deploying this function.
Deno.serve((req: Request) => handleRequest(req, service));
