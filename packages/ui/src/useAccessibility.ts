import { useCallback, useEffect } from "react";
import { announceToScreenReader, createAnnouncementRegion } from "./accessibility-utils";

/**
 * React hook providing accessibility utilities:
 * - `announce(message)` — sends a screen reader announcement via an aria-live region
 * - `focusOnMount(ref)` — focuses the given element as soon as the DOM is ready
 */
export function useAccessibility() {
  useEffect(() => {
    createAnnouncementRegion();
  }, []);

  const announce = useCallback((message: string) => {
    announceToScreenReader(message);
  }, []);

  const focusOnMount = useCallback(
    (elementRef: React.RefObject<HTMLElement>) => {
      requestAnimationFrame(() => {
        elementRef.current?.focus();
      });
    },
    [],
  );

  return { announce, focusOnMount };
}
