<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Blog Posts</h2>
      <Button 
        @click="$emit('create-post')" 
        size="sm"
      >
        New Post
      </Button>
    </div>
    
    <div class="flex-1">
      <div v-if="loading" class="py-8 text-center text-muted-foreground">
        Loading posts...
      </div>
      
      <div v-else-if="!posts || posts.length === 0" class="py-8 text-center text-muted-foreground">
        No posts found
      </div>
      
      <div v-else class="space-y-3">
        <Card 
          v-for="post in posts" 
          :key="post.id" 
          class="cursor-pointer transition"
          :class="{ 'border-primary': selectedPostId === post.id }"
          @click="$emit('select-post', post.id)"
        >
          <CardHeader class="pb-2">
            <CardTitle class="text-lg">{{ post.title }}</CardTitle>
            <div class="flex justify-between text-sm text-muted-foreground pt-2">
              <span>{{ formatDate(post.createdAt) }}</span>
              <span v-if="post.published" class="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                Published
              </span>
              <span v-else class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                Draft
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button.vue'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardTitle from '@/components/ui/card-title.vue'

defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedPostId: {
    type: String,
    default: ''
  }
})

defineEmits(['select-post', 'create-post'])

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script> 