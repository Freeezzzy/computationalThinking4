<script setup lang="ts">
// Deleting a board also deletes all its objects, so it needs a confirmation.
const open = defineModel<boolean>('open', { required: true })
defineProps<{ boardName: string }>()
const emit = defineEmits<{ confirm: [] }>()

function confirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete board</DialogTitle>
        <DialogDescription>Delete board “{{ boardName }}” and all its objects?</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button variant="destructive" @click="confirm">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
