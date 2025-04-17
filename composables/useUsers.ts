import { ref } from 'vue'

export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
  updatedAt: string
  posts: any[]
}

export const useUsers = () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all users
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      users.value = await $fetch('/api/users')
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch a single user by ID
  const fetchUser = async (id: string) => {
    loading.value = true
    error.value = null
    currentUser.value = null
    
    try {
      currentUser.value = await $fetch(`/api/users/${id}`)
      return currentUser.value
    } catch (err: any) {
      error.value = err.message || `Failed to fetch user with ID ${id}`
      console.error(`Error fetching user ${id}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create a new user
  const createUser = async (userData: { email: string; name?: string }) => {
    loading.value = true
    error.value = null
    
    try {
      const newUser = await $fetch('/api/users', {
        method: 'POST',
        body: userData
      })
      
      users.value.push(newUser)
      return newUser
    } catch (err: any) {
      if (err.statusCode === 409) {
        error.value = 'A user with this email already exists'
      } else {
        error.value = err.message || 'Failed to create user'
      }
      console.error('Error creating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a user
  const updateUser = async (id: string, userData: { email?: string; name?: string }) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedUser = await $fetch(`/api/users/${id}`, {
        method: 'PUT',
        body: userData
      })
      
      // Update the user in the users array
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // Update currentUser if it's the same user
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = updatedUser
      }
      
      return updatedUser
    } catch (err: any) {
      if (err.statusCode === 404) {
        error.value = 'User not found'
      } else if (err.statusCode === 409) {
        error.value = 'A user with this email already exists'
      } else {
        error.value = err.message || `Failed to update user with ID ${id}`
      }
      console.error(`Error updating user ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a user
  const deleteUser = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })
      
      // Remove the user from the users array
      users.value = users.value.filter(user => user.id !== id)
      
      // Clear currentUser if it's the same user
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = null
      }
      
      return true
    } catch (err: any) {
      if (err.statusCode === 404) {
        error.value = 'User not found'
      } else if (err.statusCode === 400) {
        error.value = 'Cannot delete user with related posts. Delete the posts first.'
      } else {
        error.value = err.message || `Failed to delete user with ID ${id}`
      }
      console.error(`Error deleting user ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser
  }
} 