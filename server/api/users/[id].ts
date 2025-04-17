import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  switch (method) {
    case 'GET':
      return handleGet(event)
    case 'PUT':
      return handlePut(event)
    case 'DELETE':
      return handleDelete(event)
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
})

// GET /api/users/[id] - Get a single user
async function handleGet(event) {
  const id = getRouterParam(event, 'id')
  
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return user
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error)
    
    if (error.statusCode === 404) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user',
      data: error?.message || 'Unknown error'
    })
  }
}

// PUT /api/users/[id] - Update a user
async function handlePut(event) {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  try {
    // First check if the user exists
    const exists = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    })
    
    if (!exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Update the user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        email: body.email !== undefined ? body.email : undefined,
      },
      include: {
        posts: true,
      },
    })
    
    return user
  } catch (error: any) {
    // Handle unique constraint violation (duplicate email)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this email already exists'
      })
    }
    
    console.error(`Error updating user ${id}:`, error)
    
    if (error.statusCode === 404) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user',
      data: error?.message || 'Unknown error'
    })
  }
}

// DELETE /api/users/[id] - Delete a user
async function handleDelete(event) {
  const id = getRouterParam(event, 'id')
  
  try {
    // First check if the user exists
    const exists = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
          },
          take: 1, // Only need to check if any posts exist
        },
      },
    })
    
    if (!exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Check if user has posts and reject deletion if they do
    if (exists.posts.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete user with related posts. Delete the posts first.'
      })
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id }
    })
    
    return { 
      success: true,
      message: 'User deleted successfully' 
    }
  } catch (error: any) {
    console.error(`Error deleting user ${id}:`, error)
    
    if (error.statusCode === 404) {
      throw error
    }
    
    // Handle foreign key constraint violations (if user has posts)
    if (error.code === 'P2003') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete user with related posts. Delete the posts first.'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete user',
      data: error?.message || 'Unknown error'
    })
  }
} 

