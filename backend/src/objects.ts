import { Hono } from 'hono'
import { boardExists } from './board-storage.js'
import { deleteObject, insertObject, listObjects, updateObject } from './storage.js'

// REST routes for the objects on one board, mounted under /boards/:boardId/objects.
export const objects = new Hono()

// Every route below needs an existing board.
objects.use('*', async (c, next) => {
  if (!(await boardExists(c.req.param('boardId')!))) return c.json({ error: 'Board not found' }, 404)
  await next()
})

objects.get('/', async c => c.json(await listObjects(c.req.param('boardId')!)))

objects.post('/', async (c) => {
  const object = await c.req.json()
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  const inserted = await insertObject(c.req.param('boardId')!, object)
  if (!inserted) return c.json({ error: 'An object with this id already exists' }, 409)
  return c.json(inserted, 201)
})

objects.patch('/:id', async (c) => {
  const updated = await updateObject(c.req.param('boardId')!, c.req.param('id'), await c.req.json())
  if (!updated) return c.json({ error: 'Object not found' }, 404)
  return c.json(updated)
})

objects.delete('/:id', async (c) => {
  const deleted = await deleteObject(c.req.param('boardId')!, c.req.param('id'))
  if (!deleted) return c.json({ error: 'Object not found' }, 404)
  return c.body(null, 204)
})
