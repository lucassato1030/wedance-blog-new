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
  <div :class="cn('p-6 pt-0', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template> 