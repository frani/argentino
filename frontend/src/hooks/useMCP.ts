import { useState, useCallback } from 'react';

export function useMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (method: string, params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now(),
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}
