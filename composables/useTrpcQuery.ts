import { trpc } from './useTrpc';

/**
 * A composable for handling tRPC queries with automatic error handling and loading states
 */
export function useTrpcQuery<T>(
  queryFn: () => Promise<T>,
  options?: {
    immediate?: boolean,
    key?: string
  }
) {
  const { immediate = true, key = 'trpc-query' } = options || {};
  
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const isLoading = ref(false);
  
  const execute = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      data.value = await queryFn();
    } catch (err) {
      console.error('tRPC query error:', err);
      error.value = err as Error;
      data.value = null;
    } finally {
      isLoading.value = false;
    }
  };
  
  onMounted(() => {
    if (immediate) {
      execute();
    }
  });
  
  return {
    data,
    error,
    isLoading,
    execute,
    refresh: execute,
  };
} 