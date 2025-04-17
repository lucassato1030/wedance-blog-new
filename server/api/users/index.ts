import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/users - Get all users
export default defineEventHandler(async (event) => {
  // Determine the HTTP method
  const method = event.method
  
  console.log(`Handling ${method} request to /api/users`)
  
  // Handle GET request
  if (method === 'GET') {
    try {
      console.log('Processing GET request for users')
      
      const users = await prisma.user.findMany({
        include: {
          posts: true,
        },
      })
      
      console.log(`Found ${users.length} users`)
      return users
    } catch (error: any) {
      console.error('Error fetching users:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch users',
        data: error?.message || 'Unknown error'
      })
    }
  }
  
  // Handle POST request
  if (method === 'POST') {
    try {
      
      const body = await readBody(event)
      
      if (!body.email) {
        console.error('Email is required but not provided')
        throw createError({
          statusCode: 400,
          statusMessage: 'Email is required'
        })
      }
      
      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name || null,
        },
        include: {
          posts: true,
        },
      })
      
      console.log('Created user:', user)
      return user
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        console.error('Duplicate email error:', error)
        throw createError({
          statusCode: 409,
          statusMessage: 'A user with this email already exists'
        })
      }
      
      console.error('Error creating user:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user',
        data: error?.message || 'Unknown error'
      })
    }
  }
  
  // If method is not supported
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
    data: `Method ${method} is not supported`
  })
}) 