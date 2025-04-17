import { createNuxtApiHandler } from 'trpc-nuxt';
import { appRouter } from '~/server/trpc/routers';
import { createContext } from '~/server/trpc/trpc';

// Export API handler
export default createNuxtApiHandler({
  router: appRouter,
  createContext,
  onError({ error, path }) {
    console.error(`Error in tRPC handler for ${path}:`, error);
  },
}); 