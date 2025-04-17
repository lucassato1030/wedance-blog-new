import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody, getRouterParam } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    return {
      status: 'error',
      message: 'Post ID is required'
    }
  }

  // GET: Fetch a single post
  if (method === 'GET') {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
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
      
      if (!post) {
        return {
          status: 'error',
          message: 'Post not found'
        }
      }
      
      return post
    } catch (error) {
      console.error('Error fetching post:', error)
      
      return {
        status: 'error',
        message: 'Failed to fetch post',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // PUT: Update a post
  if (method === 'PUT') {
    try {
      const body = await readBody(event)
      
      // Check if post exists
      const existingPost = await prisma.post.findUnique({
        where: { id }
      })
      
      if (!existingPost) {
        return {
          status: 'error',
          message: 'Post not found'
        }
      }
      
      // Update the post
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title: body.title !== undefined ? body.title : existingPost.title,
          content: body.content !== undefined ? body.content : existingPost.content,
          published: body.published !== undefined ? body.published : existingPost.published
        }
      })
      
      return {
        status: 'success',
        post: updatedPost
      }
    } catch (error) {
      console.error('Error updating post:', error)
      
      return {
        status: 'error',
        message: 'Failed to update post',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // DELETE: Delete a post
  if (method === 'DELETE') {
    try {
      // Check if post exists
      const existingPost = await prisma.post.findUnique({
        where: { id }
      })
      
      if (!existingPost) {
        return {
          status: 'error',
          message: 'Post not found'
        }
      }
      
      // Delete the post
      await prisma.post.delete({
        where: { id }
      })
      
      return {
        status: 'success',
        message: 'Post deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      
      return {
        status: 'error',
        message: 'Failed to delete post',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}) 