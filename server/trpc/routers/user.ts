import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import { formatUser } from '../../utils/prisma-helpers';

export const userRouter = router({
  // Get all users
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.prisma.user.findMany({
        include: {
          posts: true,
        },
      });
      return users.map(formatUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch users',
        cause: error,
      });
    }
  }),

  // Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.id },
          include: {
            posts: true,
          },
        });
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${input.id} not found`,
          });
        }
        
        return formatUser(user);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error(`Error fetching user ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
          cause: error,
        });
      }
    }),

  // Create a new user
  create: publicProcedure
    .input(z.object({ 
      name: z.string().min(3),
      email: z.string().email()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
          },
        });
        return formatUser(user);
      } catch (error: any) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          });
        }
        
        console.error('Error creating user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
          cause: error,
        });
      }
    }),
    
  // Update a user
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().min(3).optional(),
        email: z.string().email().optional(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: input.id },
          data: input.data,
        });
        return formatUser(user);
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${input.id} not found`,
          });
        }
        
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          });
        }
        
        console.error(`Error updating user ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
          cause: error,
        });
      }
    }),

  // Delete a user
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.delete({
          where: { id: input.id },
        });
        return formatUser(user);
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${input.id} not found`,
          });
        }
        
        console.error(`Error deleting user ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
          cause: error,
        });
      }
    }),
}); 