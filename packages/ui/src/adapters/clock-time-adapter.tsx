import { ClockWidget } from "../ClockWidget";
import type { ActivityAdapter } from "./adapter-interface";

export const clockTimeAdapter: ActivityAdapter = {
  types: ["clock_time"],

  getInitialState() {
    return {};
  },

  render({ content, onResponse }) {
    return (
      <ClockWidget
        hour={(content.hour as number) ?? 12}
        minute={(content.minute as number) ?? 0}
        interactive={(content.interactive as boolean) ?? false}
        mode={(content.mode as "read" | "set") ?? "read"}
        showDigital={(content.showDigital as boolean) ?? true}
        targetTime={content.targetTime as { hour: number; minute: number } | undefined}
        onTimeChange={(h, m) => onResponse({ hour: h, minute: m })}
      />
    );
  },
};
