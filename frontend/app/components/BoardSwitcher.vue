<script setup lang="ts">
import { ChevronDown, Pencil, Plus, Trash2 } from '@lucide/vue'
import type { Board } from '~/composables/useBoards'

const { boards, currentBoardId, selectBoard, createBoard, renameBoard, deleteBoard } = useBoards()

const currentBoard = computed(() => boards.value.find(board => board.id === currentBoardId.value))

const menuOpen = ref(false)
const nameDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
// The board being renamed, or null while a new board is being created.
const renaming = ref<Board | null>(null)
const deleting = ref<Board | null>(null)

// Dialogs open once the menu has closed, so the two do not fight over keyboard focus.
function closeMenuThen(open: () => void) {
  menuOpen.value = false
  nextTick(open)
}

function startCreate() {
  closeMenuThen(() => {
    renaming.value = null
    nameDialogOpen.value = true
  })
}

function startRename(board: Board) {
  closeMenuThen(() => {
    renaming.value = board
    nameDialogOpen.value = true
  })
}

function startDelete(board: Board) {
  closeMenuThen(() => {
    deleting.value = board
    deleteDialogOpen.value = true
  })
}

function onName(name: string) {
  if (renaming.value) renameBoard(renaming.value.id, name)
  else createBoard(name)
}
</script>

<template>
  <div class="fixed top-6 left-6">
    <DropdownMenu v-model:open="menuOpen">
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="h-10 max-w-72 rounded-2xl bg-white px-4 shadow-xl">
          <span class="truncate">{{ currentBoard?.name }}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-64">
        <DropdownMenuItem v-for="board in boards" :key="board.id" @select="selectBoard(board.id)">
          <span class="flex-1 truncate" :class="{ 'font-semibold': board.id === currentBoardId }">{{ board.name }}</span>
          <Button variant="ghost" size="icon-xs" :aria-label="`Rename ${board.name}`" @click.stop="startRename(board)">
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-xs" :aria-label="`Delete ${board.name}`" @click.stop="startDelete(board)">
            <Trash2 />
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="startCreate">
          <Plus />
          New board
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <BoardNameDialog
      v-model:open="nameDialogOpen"
      :title="renaming ? 'Rename board' : 'New board'"
      :submit-label="renaming ? 'Rename' : 'Create'"
      :initial-name="renaming?.name ?? ''"
      @submit="onName"
    />
    <DeleteBoardDialog
      v-model:open="deleteDialogOpen"
      :board-name="deleting?.name ?? ''"
      @confirm="deleteBoard(deleting!.id)"
    />
  </div>
</template>
