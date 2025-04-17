import { initTRPC } from '@trpc/server';
import { type inferAsyncReturnType } from '@trpc/server';
import type { H3Event } from 'h3';
import { prisma } from '../database/prisma';

/**
 * Create context for the tRPC server
 */
export const createContext = (event: H3Event) => {
  return {
    event,
    prisma,
  };
};

type Context = inferAsyncReturnType<typeof createContext>;

/**
 * Initialize tRPC instance
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure; 