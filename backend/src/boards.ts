import { Hono } from 'hono'
import { deleteBoard, insertBoard, listBoards, renameBoard } from './board-storage.js'

// REST routes for the boards. The objects of a board live under /boards/:boardId/objects.
export const boards = new Hono()

function isValidName(name: unknown): name is string {
  return typeof name === 'string' && name.trim() !== ''
}

boards.get('/', async c => c.json(await listBoards()))

boards.post('/', async (c) => {
  const { id, name } = await c.req.json()
  if (typeof id !== 'string') return c.json({ error: 'Board needs an id' }, 400)
  if (!isValidName(name)) return c.json({ error: 'Board needs a name' }, 400)
  const board = await insertBoard({ id, name })
  if (!board) return c.json({ error: 'A board with this id already exists' }, 409)
  return c.json(board, 201)
})

boards.patch('/:id', async (c) => {
  const { name } = await c.req.json()
  if (!isValidName(name)) return c.json({ error: 'Board needs a name' }, 400)
  const board = await renameBoard(c.req.param('id'), name)
  if (!board) return c.json({ error: 'Board not found' }, 404)
  return c.json(board)
})

boards.delete('/:id', async (c) => {
  const deleted = await deleteBoard(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Board not found' }, 404)
  return c.body(null, 204)
})
