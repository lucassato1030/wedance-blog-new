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
  <p :class="cn('text-sm text-muted-foreground', props.class)" v-bind="$attrs">
    <slot />
  </p>
</template> 