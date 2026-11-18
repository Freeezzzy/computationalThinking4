import { createClient } from '@supabase/supabase-js'

process.loadEnvFile(new URL('../.env', import.meta.url).pathname)

// The secret key is only used here on the server and must never reach the browser.
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

// Postgres error code for "a row with this primary key already exists".
export const DUPLICATE_KEY = '23505'
