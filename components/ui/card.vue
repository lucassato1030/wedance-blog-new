<script setup lang="ts">
import { cn } from '@/utils/cn'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template> 