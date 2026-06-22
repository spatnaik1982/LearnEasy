import { ScaleReader } from "../ScaleReader";
import type { ActivityAdapter } from "./adapter-interface";

export const measurementScaleAdapter: ActivityAdapter = {
  types: ["measurement_scale"],

  getInitialState(content) {
    return {
      currentValue: content.value as number | undefined,
    };
  },

  render({ content, adapterState, onResponse, onAdapterStateChange }) {
    const currentValue = (adapterState.currentValue as number | undefined) ?? (content.value as number | undefined);

    return (
      <ScaleReader
        type={(content.type as "ruler" | "thermometer" | "cylinder") ?? "ruler"}
        min={(content.min as number) ?? 0}
        max={(content.max as number) ?? 10}
        step={(content.step as number) ?? 1}
        unit={(content.unit as string) ?? "cm"}
        value={currentValue}
        interactive={(content.interactive as boolean) ?? false}
        targetValue={content.targetValue as number | undefined}
        showReading
        onValueChange={(v) => {
          onAdapterStateChange({ currentValue: v });
          onResponse({ value: v });
        }}
      />
    );
  },
};
