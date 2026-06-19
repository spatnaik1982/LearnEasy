/**
 * Consistent ID for the screen reader announcement region.
 */
export const announcementId = "aria-announcements";

/**
 * Creates the aria-live announcement region in the DOM if it doesn't already exist.
 * Returns the region element, or null if not in a browser environment.
 */
export function createAnnouncementRegion(): HTMLDivElement | null {
  if (typeof document === "undefined") return null;

  let region = document.getElementById(announcementId) as HTMLDivElement | null;
  if (!region) {
    region = document.createElement("div");
    region.id = announcementId;
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-relevant", "additions text");
    region.setAttribute("role", "status");
    region.className = "sr-only";
    // Visually hidden but accessible to screen readers
    region.style.position = "absolute";
    region.style.width = "1px";
    region.style.height = "1px";
    region.style.padding = "0";
    region.style.margin = "-1px";
    region.style.overflow = "hidden";
    region.style.clip = "rect(0, 0, 0, 0)";
    region.style.whiteSpace = "nowrap";
    region.style.border = "0";
    document.body.appendChild(region);
  }
  return region;
}

/**
 * Sets a screen reader announcement by updating the aria-live region.
 * Creates the region if it doesn't exist.
 * Uses a clear-then-set pattern to ensure the announcement is read even
 * if the same message is announced consecutively.
 */
export function announceToScreenReader(message: string): void {
  if (typeof document === "undefined") return;

  let region = document.getElementById(announcementId) as HTMLDivElement | null;
  if (!region) {
    region = createAnnouncementRegion();
  }
  if (region) {
    // Clear first to ensure re-announcement of identical messages
    region.textContent = "";
    // Use setTimeout to let the clear take effect before setting new content
    setTimeout(() => {
      region!.textContent = message;
    }, 50);
  }
}
