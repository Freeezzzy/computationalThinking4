import { createClient } from '@supabase/supabase-js'

// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>

process.loadEnvFile(new URL('../.env', import.meta.url).pathname)

// The secret key is only used here on the server and must never reach the browser.
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

// The frontend says fontSize, the table says font_size; every other field has the same name.
function toRow(fields: Record<string, unknown>) {
  const { fontSize, ...rest } = fields
  return fontSize === undefined ? rest : { ...rest, font_size: fontSize }
}

// Columns a variant does not use (e.g. text on a circle) come back as null and are left out.
function toObject(row: Record<string, unknown>) {
  const { font_size, created_at, ...rest } = row
  const object = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null))
  return (font_size === null ? object : { ...object, fontSize: font_size }) as BoardObject
}

export async function listObjects() {
  const { data, error } = await supabase.from('objects').select().order('created_at')
  if (error) throw error
  return data.map(toObject)
}

export async function insertObject(object: BoardObject) {
  const { data, error } = await supabase.from('objects').insert(toRow(object)).select().single()
  if (error) throw error
  return toObject(data)
}

export async function updateObject(id: string, changes: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('objects')
    .update(toRow({ ...changes, id }))
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toObject(data) : undefined
}

export async function deleteObject(id: string) {
  const { data, error } = await supabase.from('objects').delete().eq('id', id).select()
  if (error) throw error
  return data.length > 0
}
