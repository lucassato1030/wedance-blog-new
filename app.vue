<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="border-b bg-white dark:bg-gray-800 py-4">
      <div class="container mx-auto px-6 max-w-6xl">
        <h1 class="text-3xl font-bold">Nuxt, Vue.shadcn, TailwindCSS, Supabase, Prisma, tRPC Testing</h1>
      </div>
    </header>
    
    <main class="flex-1 container mx-auto px-6 py-6 max-w-6xl">
      <!-- Blog Layout -->
      <Card>
        <CardContent class="p-6 h-full">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <!-- Blog List (Left Side) -->
            <div class="md:col-span-1 border-r pr-4 h-full flex flex-col">
              <BlogList 
                :posts="posts" 
                :loading="postLoading"
                :selectedPostId="selectedPostId"
                @select-post="selectPost"
                @create-post="createNewPost"
              />
            </div>
            
            <!-- Blog Content (Right Side) -->
            <div class="md:col-span-2 pl-4 h-full flex flex-col">
              <BlogContent 
                :post="currentPost" 
                :loading="currentPostLoading"
                :saving="postSaving"
                @update-post="updatePost"
                @delete-post="confirmDeletePost"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card class="max-w-md w-full">
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
          <CardDescription>
            Are you sure you want to delete the post. <span class="font-semibold">{{ postToDelete?.title }}</span>?
            This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardFooter class="gap-3 justify-end">
          <Button 
            @click="showDeleteModal = false" 
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            @click="deletePostConfirmed"
            variant="destructive"
            :disabled="postSaving"
          >
            {{ postSaving ? 'Deleting...' : 'Delete' }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BlogList from '~/components/BlogList.vue'
import BlogContent from '~/components/BlogContent.vue'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardFooter from '@/components/ui/card-footer.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardDescription from '@/components/ui/card-description.vue'
import CardContent from '@/components/ui/card-content.vue'
import Button from '@/components/ui/button.vue'

// Posts status
const posts = ref([])
const postLoading = ref(false)
const currentPostLoading = ref(false)
const postSaving = ref(false)
const selectedPostId = ref('')
const currentPost = ref(null)

// Delete confirmation
const showDeleteModal = ref(false)
const postToDelete = ref(null)

// Load all posts
const loadPosts = async () => {
  try {
    postLoading.value = true
    
    const response = await fetch('/api/posts')
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message)
    }
    
    posts.value = data || []
    
    // If we have posts and none is selected, select the first one
    if (posts.value.length > 0 && !selectedPostId.value) {
      selectPost(posts.value[0].id)
    }
  } catch (error) {
    console.error('Error loading posts:', error)
  } finally {
    postLoading.value = false
  }
}

// Load a single post
const loadPost = async (id) => {
  if (!id) return
  
  try {
    currentPostLoading.value = true
    
    const response = await fetch(`/api/posts/${id}`)
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message)
    }
    
    currentPost.value = data
  } catch (error) {
    console.error('Error loading post:', error)
  } finally {
    currentPostLoading.value = false
  }
}

// Select a post
const selectPost = (id) => {
  selectedPostId.value = id
  loadPost(id)
}

// Create a new post
const createNewPost = async () => {
  try {
    postSaving.value = true
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'New Blog Post',
        content: 'Start writing your blog post here...',
        published: false
      })
    })
    
    const result = await response.json()
    
    if (result.status === 'error') {
      throw new Error(result.message)
    }
    
    // Reload posts and select the new one
    await loadPosts()
    selectPost(result.post.id)
  } catch (error) {
    console.error('Error creating post:', error)
  } finally {
    postSaving.value = false
  }
}

// Update a post
const updatePost = async (updatedPost) => {
  try {
    postSaving.value = true
    
    const response = await fetch(`/api/posts/${updatedPost.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPost)
    })
    
    const result = await response.json()
    
    if (result.status === 'error') {
      throw new Error(result.message)
    }
    
    // Reload posts and the current post
    await loadPosts()
    await loadPost(updatedPost.id)
  } catch (error) {
    console.error('Error updating post:', error)
  } finally {
    postSaving.value = false
  }
}

// Confirm post deletion
const confirmDeletePost = (id) => {
  const post = posts.value.find(p => p.id === id)
  postToDelete.value = post
  showDeleteModal.value = true
}

// Delete post after confirmation
const deletePostConfirmed = async () => {
  try {
    postSaving.value = true
    
    const response = await fetch(`/api/posts/${postToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.status === 'error') {
      throw new Error(result.message)
    }
    
    // Close modal
    showDeleteModal.value = false
    postToDelete.value = null
    
    // Reset current post and reload posts
    currentPost.value = null
    selectedPostId.value = ''
    await loadPosts()
  } catch (error) {
    console.error('Error deleting post:', error)
  } finally {
    postSaving.value = false
  }
}

// Load posts on component mount
onMounted(() => {
  loadPosts()
})
</script>

<style>
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
</style>
