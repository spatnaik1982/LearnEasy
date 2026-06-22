import { ScaleReader } from "../ScaleReader";
import type { ActivityAdapter } from "./adapter-interface";

export const measurementScaleAdapter: ActivityAdapter = {
  types: ["measurement_scale"],

  getInitialState() {
    return {};
  },

  render({ content, onResponse }) {
    return (
      <ScaleReader
        type={(content.type as "ruler" | "thermometer" | "cylinder") ?? "ruler"}
        min={(content.min as number) ?? 0}
        max={(content.max as number) ?? 10}
        step={(content.step as number) ?? 1}
        unit={(content.unit as string) ?? "cm"}
        value={content.value as number | undefined}
        interactive={(content.interactive as boolean) ?? false}
        targetValue={content.targetValue as number | undefined}
        showReading
        onValueChange={(v) => onResponse({ value: v })}
      />
    );
  },
};
