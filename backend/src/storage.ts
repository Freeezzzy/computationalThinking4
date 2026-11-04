import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export type BoardObject = { id: string } & Record<string, unknown>

// The only place that knows where the board is stored.
const BOARD_FILE = join(import.meta.dirname, '..', 'data', 'board.json')

export async function readObjects(): Promise<BoardObject[]> {
  try {
    return JSON.parse(await readFile(BOARD_FILE, 'utf-8'))
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

export async function writeObjects(objects: BoardObject[]) {
  await mkdir(dirname(BOARD_FILE), { recursive: true })
  await writeFile(BOARD_FILE, JSON.stringify(objects, null, 2))
}
