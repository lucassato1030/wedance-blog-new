<template>
  <div class="flex flex-col h-full">
    <div v-if="!post" class="flex items-center justify-center h-60 text-muted-foreground">
      Select a post to view
    </div>
    
    <template v-else>
      <!-- View Mode -->
      <div v-if="!isEditing">
        <div v-if="loading" class="py-8 text-center text-gray-500">
          Loading post...
        </div>
        
        <div v-else-if="!post" class="py-8 text-center text-gray-500">
          Select a post from the list or create a new one
        </div>
        
        <div v-else>
          <Card class="mb-8">
            <CardHeader>
              <CardTitle>{{ post.title }}</CardTitle>
              <div class="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>{{ formatDate(post.createdAt) }}</span>
                <span v-if="post.published" class="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                  Published
                </span>
                <span v-else class="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Draft
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <!-- Post content with proper formatting -->
              <div class="prose max-w-none">
                <div v-html="formattedContent"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div v-else>
        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
            <CardDescription>Make changes to your blog post</CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="savePost" class="space-y-6">
              <div>
                <label class="block mb-1 text-sm font-medium">Title:</label>
                <Input 
                  v-model="editForm.title" 
                  required 
                  :disabled="saving"
                />
              </div>
              
              <div>
                <label class="block mb-1 text-sm font-medium">Content:</label>
                <Textarea 
                  v-model="editForm.content" 
                  class="h-80 font-mono"
                  :disabled="saving"
                />
              </div>
              
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    v-model="editForm.published"
                    :disabled="saving"
                  />
                  <span>Publish this post</span>
                </label>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <!-- Action buttons -->
      <div class="border-t pt-4 mt-4 flex items-center justify-between">
        <div>
          <Button 
            v-if="post && !isEditing" 
            @click="startEditing" 
            variant="default"
          >
            Edit Post
          </Button>
          
          <div v-if="isEditing" class="flex items-center gap-3">
            <Button 
              @click="savePost" 
              variant="default"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Post' }}
            </Button>
            
            <Button 
              @click="cancelEdit" 
              variant="outline"
              :disabled="saving"
            >
              Cancel
            </Button>
          </div>
        </div>
        
        <div v-if="post && !isEditing">
          <Button 
            @click="$emit('delete-post', post.id)" 
            variant="destructive"
            :disabled="saving"
          >
            Delete
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardDescription from '@/components/ui/card-description.vue'
import CardContent from '@/components/ui/card-content.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Textarea from '@/components/ui/textarea.vue'

const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update-post', 'delete-post'])

const isEditing = ref(false)
const editForm = ref({
  title: '',
  content: '',
  published: false
})

// Watch for post changes and update the form
watch(() => props.post, (newPost) => {
  if (newPost) {
    editForm.value = {
      title: newPost.title || '',
      content: newPost.content || '',
      published: newPost.published || false
    }
  }
  // Exit edit mode when changing posts
  isEditing.value = false
}, { immediate: true })

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Format content with line breaks for display
const formattedContent = computed(() => {
  if (!props.post || !props.post.content) return ''
  return props.post.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
})

// Start editing the post
const startEditing = () => {
  isEditing.value = true
}

// Save the post
const savePost = () => {
  if (!editForm.value.title) return
  
  emit('update-post', {
    id: props.post?.id,
    title: editForm.value.title,
    content: editForm.value.content,
    published: editForm.value.published
  })
  
  // Exit edit mode
  isEditing.value = false
}

// Cancel editing
const cancelEdit = () => {
  // Reset form to original post values
  if (props.post) {
    editForm.value = {
      title: props.post.title || '',
      content: props.post.content || '',
      published: props.post.published || false
    }
  }
  
  // Exit edit mode
  isEditing.value = false
}
</script> 