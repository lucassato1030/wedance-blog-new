import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '~/server/trpc/routers';

// Create a tRPC client
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

// Export a composable that wraps the client
export const useTrpc = () => {
  return { client: trpc };
}; 