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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response shape is unknown
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

// ── Pause / Resume (localStorage stubs) ─────────────────────────

export async function pauseSession(
  sessionId: string,
  currentStep: number,
  activityId?: string,
): Promise<{ data: { pausedAt: string } | null; error: string | null }> {
  // TODO(api): Replace with real API call when backend supports pause/resume
  try {
    const key = `learn-easy.paused-${sessionId}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(
        key,
        JSON.stringify({
          step: currentStep,
          activityId,
          pausedAt: new Date().toISOString(),
        }),
      );
    }
    return { data: { pausedAt: new Date().toISOString() }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to pause session",
    };
  }
}

export async function resumeSession(
  sessionId: string,
): Promise<{ data: { step: number; activityId?: string } | null; error: string | null }> {
  // TODO(api): Replace with real API call when backend supports pause/resume
  try {
    const key = `learn-easy.paused-${sessionId}`;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { data: { step: parsed.step, activityId: parsed.activityId }, error: null };
      }
    }
    return { data: { step: 0 }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to resume session",
    };
  }
}
