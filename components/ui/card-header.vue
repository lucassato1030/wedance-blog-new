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
  <div :class="cn('flex flex-col space-y-1.5 p-6', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template> 