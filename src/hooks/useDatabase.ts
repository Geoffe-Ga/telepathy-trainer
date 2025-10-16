import { useEffect, useState } from 'react';
import { initDatabase } from '../database/db';

/**
 * Hook to initialize database on app startup
 * Returns loading state and error if initialization fails
 */
export function useDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    }

    init();
  }, []);

  return { isLoading, error };
}
