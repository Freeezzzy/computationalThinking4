import { DUPLICATE_KEY, supabase } from './database.js'

export type Board = { id: string; name: string }

export async function listBoards() {
  const { data, error } = await supabase.from('boards').select('id, name').order('created_at')
  if (error) throw error
  return data as Board[]
}

export async function boardExists(id: string) {
  const { data, error } = await supabase.from('boards').select('id').eq('id', id).maybeSingle()
  if (error) throw error
  return data !== null
}

// Returns undefined when a board with this id already exists.
export async function insertBoard(board: Board) {
  const { data, error } = await supabase.from('boards').insert(board).select('id, name').single()
  if (error?.code === DUPLICATE_KEY) return undefined
  if (error) throw error
  return data as Board
}

export async function renameBoard(id: string, name: string) {
  const { data, error } = await supabase.from('boards').update({ name }).eq('id', id).select('id, name').maybeSingle()
  if (error) throw error
  return (data ?? undefined) as Board | undefined
}

// The database also deletes all objects of the board (on delete cascade).
export async function deleteBoard(id: string) {
  const { data, error } = await supabase.from('boards').delete().eq('id', id).select('id')
  if (error) throw error
  return data.length > 0
}
