import { ChartReader } from "../ChartReader";
import type { ActivityAdapter } from "./adapter-interface";

export const chartReaderAdapter: ActivityAdapter = {
  types: ["chart_reader"],

  getInitialState() {
    return {};
  },

  render({ content, onResponse }) {
    return (
      <ChartReader
        type={(content.type as "bar" | "pictograph") ?? "bar"}
        data={(content.data as { label: string; value: number; emoji?: string }[]) ?? []}
        title={content.title as string}
        showValues={(content.showValues as boolean) ?? true}
        interactive={(content.interactive as boolean) ?? false}
        onSelect={(label) => {
          if ((content.interactive as boolean) ?? false) {
            onResponse({ selectedLabel: label });
          }
        }}
      />
    );
  },
};
