<script setup lang="ts">
import { cn } from '@/utils/cn'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    class?: string
    as?: string
  }>(),
  {
    as: 'h3',
  }
)
</script>

<template>
  <component :is="as" :class="cn('text-2xl font-semibold leading-none tracking-tight', props.class)" v-bind="$attrs">
    <slot />
  </component>
</template> 