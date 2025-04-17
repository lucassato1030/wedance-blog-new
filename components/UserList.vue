<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">tRPC Users</h2>
    <div v-if="isLoading">Loading users...</div>
    <div v-else-if="error">Error loading users: {{ error.message }}</div>
    <div v-else>
      <ul class="space-y-2">
        <li v-for="user in users" :key="user.id" class="p-3 bg-gray-100 rounded">
          {{ user.name }} ({{ user.email }})
        </li>
      </ul>
      <div v-if="users && users.length === 0" class="p-3 text-gray-500">
        No users found
      </div>
    </div>
    
    <div class="mt-6">
      <h3 class="text-xl font-bold mb-2">Add User</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1">Name:</label>
          <input 
            v-model="newUser.name" 
            class="border p-2 rounded w-full" 
            placeholder="Enter name" 
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email:</label>
          <input 
            v-model="newUser.email" 
            class="border p-2 rounded w-full" 
            placeholder="Enter email" 
            type="email"
          />
        </div>
        <button 
          @click="createUser" 
          class="bg-blue-500 text-white px-4 py-2 rounded"
          :disabled="isCreating"
        >
          {{ isCreating ? 'Creating...' : 'Create' }}
        </button>
      </div>
      <p v-if="createError" class="text-red-500 mt-2">
        {{ createError.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { trpc } from '~/composables/useTrpc';

// User state
const users = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);

// Form state
const newUser = ref({
  name: '',
  email: '',
});
const isCreating = ref(false);
const createError = ref<Error | null>(null);

// Load all users
const loadUsers = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const result = await trpc.user.getAll.query();
    users.value = result;
  } catch (err) {
    console.error('Error loading users:', err);
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
};

// Create a new user
const createUser = async () => {
  if (!newUser.value.name || !newUser.value.email) return;
  
  try {
    isCreating.value = true;
    createError.value = null;
    
    await trpc.user.create.mutate({ 
      name: newUser.value.name,
      email: newUser.value.email
    });
    
    // Refresh the user list
    await loadUsers();
    
    // Clear the input
    newUser.value = {
      name: '',
      email: ''
    };
  } catch (err) {
    createError.value = err as Error;
  } finally {
    isCreating.value = false;
  }
};

// Load users when component is mounted
onMounted(() => {
  loadUsers();
});
</script> 