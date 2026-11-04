import { Hono } from 'hono'
import { readObjects, writeObjects, type BoardObject } from '../storage.js'

const NOT_FOUND = { error: 'Objekt nicht gefunden' }

// Routes only talk to storage.ts, never to the file directly.
export const objects = new Hono()

objects.get('/', async c => c.json(await readObjects()))

objects.post('/', async (c) => {
  const object = await c.req.json<BoardObject>()
  if (typeof object.id !== 'string') return c.json({ error: 'id fehlt' }, 400)
  await writeObjects([...await readObjects(), object])
  return c.json(object, 201)
})

objects.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const changes = await c.req.json<Partial<BoardObject>>()
  const all = await readObjects()
  const existing = all.find(object => object.id === id)
  if (!existing) return c.json(NOT_FOUND, 404)
  const updated = { ...existing, ...changes, id }
  await writeObjects(all.map(object => (object.id === id ? updated : object)))
  return c.json(updated)
})

objects.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const all = await readObjects()
  if (!all.some(object => object.id === id)) return c.json(NOT_FOUND, 404)
  await writeObjects(all.filter(object => object.id !== id))
  return c.body(null, 204)
})
