import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { objects } from './routes/objects.js'

const PORT = 3001

const app = new Hono()
app.route('/objects', objects)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`)
})
