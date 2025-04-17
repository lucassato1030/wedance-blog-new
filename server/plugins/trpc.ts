import { appRouter } from '../trpc/routers';

export default defineNitroPlugin(() => {
  // This plugin initializes tRPC when the Nitro server starts
  console.log('tRPC initialized with routers:', Object.keys(appRouter._def.procedures));
}); 