import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuery<T>(path: string): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get<{ success: boolean; data: T }>(path)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, setData };
}

export function useMutation<T>(path: string, method: 'post' | 'put' | 'patch' | 'del' = 'post') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (body?: unknown): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = method === 'del'
        ? await api.del<{ success: boolean; data: T }>(path)
        : await api[method]<{ success: boolean; data: T }>(path, body);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [path, method]);

  return { mutate, loading, error };
}
