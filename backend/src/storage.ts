import { DUPLICATE_KEY, supabase } from './database.js'

// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>

// The frontend says fontSize, the table says font_size; every other field has the same name.
// The board comes from the URL, so a board_id in the request body is ignored.
function toRow(fields: Record<string, unknown>) {
  const { fontSize, board_id, ...rest } = fields
  return fontSize === undefined ? rest : { ...rest, font_size: fontSize }
}

// Columns a variant does not use (e.g. text on a circle) come back as null and are left out.
function toObject(row: Record<string, unknown>) {
  const { font_size, created_at, board_id, ...rest } = row
  const object = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== null))
  return (font_size === null ? object : { ...object, fontSize: font_size }) as BoardObject
}

export async function listObjects(boardId: string) {
  const { data, error } = await supabase.from('objects').select().eq('board_id', boardId).order('created_at')
  if (error) throw error
  return data.map(toObject)
}

// Returns undefined when an object with this id already exists, on any board.
export async function insertObject(boardId: string, object: BoardObject) {
  const { data, error } = await supabase
    .from('objects')
    .insert({ ...toRow(object), board_id: boardId })
    .select()
    .single()
  if (error?.code === DUPLICATE_KEY) return undefined
  if (error) throw error
  return toObject(data)
}

export async function updateObject(boardId: string, id: string, changes: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('objects')
    .update(toRow({ ...changes, id }))
    .eq('id', id)
    .eq('board_id', boardId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? toObject(data) : undefined
}

export async function deleteObject(boardId: string, id: string) {
  const { data, error } = await supabase.from('objects').delete().eq('id', id).eq('board_id', boardId).select()
  if (error) throw error
  return data.length > 0
}
