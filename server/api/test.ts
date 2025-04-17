import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    // Create a temporary PrismaClient instance just for the test
    const prisma = new PrismaClient()
    
    // Test the database connection using a simple query
    const result = await prisma.$queryRaw`SELECT 1 as "connectionTest"`
    
    // Close the connection
    await prisma.$disconnect()
    
    return {
      status: 'success',
      message: 'Database connection successful!',
      details: {
        connection: 'Supabase PostgreSQL',
        result
      }
    }
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    
    return {
      status: 'error',
      message: 'Failed to connect to the database',
      error: error?.message || 'Unknown error',
      hint: 'Check your DATABASE_URL in .env file and make sure Supabase is accessible'
    }
  }
}) 