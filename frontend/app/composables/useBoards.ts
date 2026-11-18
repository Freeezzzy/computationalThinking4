import { useLocalStorage } from '@vueuse/core'

export interface Board {
  id: string
  name: string
}

export interface BoardView {
  scale: number
  offset: { x: number; y: number }
}

const DEFAULT_NAME = 'New board'
const DEFAULT_VIEW: BoardView = { scale: 1, offset: { x: 0, y: 0 } }

export type ApiRequest = { method?: 'POST' | 'PATCH' | 'DELETE'; body?: object }

// Remembered in this browser: the board that was open last and the zoom and position of every board.
const currentBoardId = useLocalStorage<string | null>('current-board', null)
const views = useLocalStorage<Record<string, BoardView>>('board-views', {})

// A new board shows up right away, but the backend only knows it once its POST has finished.
// Every later request for that board waits for it.
const creating = new Map<string, Promise<unknown>>()

// The list of boards and which one is open. Like the objects, every change shows up
// right away and is then sent to the backend.
export function useBoards() {
  const api = $fetch.create({ baseURL: useRuntimeConfig().public.apiBase })
  const boards = useState<Board[]>('boards', () => [])

  function whenCreated(boardId: string) {
    return creating.get(boardId)
  }

  async function send(boardId: string, path: string, request: ApiRequest) {
    await whenCreated(boardId)
    return api(path, request)
  }

  // Opens the board that was open last, or the first one if it no longer exists.
  async function loadBoards() {
    boards.value = await api<Board[]>('/boards')
    if (boards.value.length === 0) createBoard(DEFAULT_NAME)
    else if (!boards.value.some(board => board.id === currentBoardId.value)) selectBoard(boards.value[0]!.id)
  }

  function selectBoard(id: string) {
    currentBoardId.value = id
  }

  function createBoard(name: string) {
    const board = { id: crypto.randomUUID(), name }
    boards.value = [...boards.value, board]
    selectBoard(board.id)
    creating.set(board.id, api('/boards', { method: 'POST', body: board }).finally(() => creating.delete(board.id)))
  }

  function renameBoard(id: string, name: string) {
    boards.value = boards.value.map(board => (board.id === id ? { ...board, name } : board))
    send(id, `/boards/${id}`, { method: 'PATCH', body: { name } })
  }

  // There is always at least one board: deleting the last one creates an empty new one.
  function deleteBoard(id: string) {
    boards.value = boards.value.filter(board => board.id !== id)
    const { [id]: _, ...otherViews } = views.value
    views.value = otherViews
    send(id, `/boards/${id}`, { method: 'DELETE' })
    if (boards.value.length === 0) createBoard(DEFAULT_NAME)
    else if (currentBoardId.value === id) selectBoard(boards.value[0]!.id)
  }

  function getView(id: string) {
    return views.value[id] ?? DEFAULT_VIEW
  }

  function saveView(id: string, view: BoardView) {
    views.value = { ...views.value, [id]: view }
  }

  return {
    boards: readonly(boards),
    currentBoardId: readonly(currentBoardId),
    loadBoards,
    selectBoard,
    createBoard,
    renameBoard,
    deleteBoard,
    whenCreated,
    getView,
    saveView,
  }
}
