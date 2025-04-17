<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: string
  type?: string
  modelValue?: string | number
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <input
    :type="type || 'text'"
    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="cn(props.class)"
    v-model="value"
  />
</template> 