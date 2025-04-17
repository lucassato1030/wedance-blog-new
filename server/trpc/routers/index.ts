import { router } from '../trpc';
import { userRouter } from './user';

// Create the app router with all subrouters
export const appRouter = router({
  user: userRouter,
  // Add more subrouters here as your app grows
});

// Export type definition of API
export type AppRouter = typeof appRouter; 