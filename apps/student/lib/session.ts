import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth";
import { startSession, endSession } from "./api";

export interface SessionState {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useSession(studentId?: string) {
  const { token } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !token) return;

    let cancelled = false;

    async function init() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await startSession(studentId!);
        if (res.data && !cancelled) {
          setSessionId(res.data.id ?? (res.data as any).id);
        } else if (res.error && !cancelled) {
          setError(res.error);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to start session");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [studentId, token]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    await endSession(sessionId);
    setSessionId(null);
  }, [sessionId]);

  return {
    sessionId,
    isLoading,
    error,
    endSession: handleEndSession,
  };
}
