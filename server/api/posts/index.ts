import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'

const prisma = new PrismaClient()

// Handler for GET requests
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET: Fetch all posts
  if (method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      return posts
    } catch (error) {
      console.error('Error fetching posts:', error)
      
      return {
        status: 'error',
        message: 'Failed to fetch posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // POST: Create a new post
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      
      // Validate required fields
      if (!body.title) {
        return {
          status: 'error',
          message: 'Title is required'
        }
      }
      
      // For demo purposes, using the first user as author
      // In a real app, this would come from authentication
      const firstUser = await prisma.user.findFirst()
      
      if (!firstUser) {
        return {
          status: 'error',
          message: 'No users available to be set as author'
        }
      }
      
      // Create the post
      const post = await prisma.post.create({
        data: {
          title: body.title,
          content: body.content || '',
          published: body.published || false,
          authorId: firstUser.id
        }
      })
      
      return {
        status: 'success',
        post
      }
    } catch (error) {
      console.error('Error creating post:', error)
      
      return {
        status: 'error',
        message: 'Failed to create post',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}) 