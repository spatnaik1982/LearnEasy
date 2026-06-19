import { useState, useEffect, useCallback, useRef } from "react";

function useApi<T>(
  fn: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[],
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setData: (data: T | null) => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fn();
      if (controller.signal.aborted) return;
      setData(result.data);
      setError(result.error);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setData(null);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
    return () => {
      abortRef.current?.abort();
    };
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch, setData };
}

export { useApi };
