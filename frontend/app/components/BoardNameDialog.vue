<script setup lang="ts">
// Asks for a board name; used both to create a board and to rename one.
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ title: string; submitLabel: string; initialName: string }>()
const emit = defineEmits<{ submit: [name: string] }>()

const name = ref('')

watch(open, (isOpen) => {
  if (isOpen) name.value = props.initialName
})

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('submit', trimmed)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :aria-describedby="undefined">
      <form class="grid gap-4" @submit.prevent="submit">
        <DialogHeader>
          <DialogTitle>{{ title }}</DialogTitle>
        </DialogHeader>
        <Input v-model="name" placeholder="Board name" aria-label="Board name" />
        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" :disabled="!name.trim()">{{ submitLabel }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
