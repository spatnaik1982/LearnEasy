import { ClockWidget } from "../ClockWidget";
import type { ActivityAdapter } from "./adapter-interface";

export const clockTimeAdapter: ActivityAdapter = {
  types: ["clock_time"],

  getInitialState(content) {
    return {
      currentHour: content.hour as number | undefined,
      currentMinute: content.minute as number | undefined,
    };
  },

  render({ content, adapterState, onResponse, onAdapterStateChange }) {
    const currentHour = (adapterState.currentHour as number | undefined) ?? (content.hour as number) ?? 12;
    const currentMinute = (adapterState.currentMinute as number | undefined) ?? (content.minute as number) ?? 0;

    return (
      <ClockWidget
        hour={currentHour}
        minute={currentMinute}
        interactive={(content.interactive as boolean) ?? false}
        mode={(content.mode as "read" | "set") ?? "read"}
        showDigital={(content.showDigital as boolean) ?? true}
        targetTime={content.targetTime as { hour: number; minute: number } | undefined}
        onTimeChange={(h, m) => {
          onAdapterStateChange({ currentHour: h, currentMinute: m });
          onResponse({ hour: h, minute: m });
        }}
      />
    );
  },
};
