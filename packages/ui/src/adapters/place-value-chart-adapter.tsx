import { PlaceValueChart } from "../PlaceValueChart";
import type { ActivityAdapter } from "./adapter-interface";

export const placeValueChartAdapter: ActivityAdapter = {
  types: ["place_value_chart"],

  getInitialState(content) {
    const yamlDigits = content.digits as (number | null)[] | undefined;
    const maxPlaces = (content.maxPlaces as "lakh" | "crore") ?? "crore";
    const columns = maxPlaces === "lakh" ? 6 : 8;
    const placedDigits: Record<number, number> = {};
    if (Array.isArray(yamlDigits)) {
      yamlDigits.slice(-columns).forEach((d, i) => {
        const colIdx = columns - yamlDigits.length + i;
        if (d != null && colIdx >= 0) {
          placedDigits[colIdx] = d;
        }
      });
    }
    return { placedDigits, selectedDigit: null };
  },

  render({ content, adapterState, lifecycle, onResponse, onAdapterStateChange }) {
    const placedDigits = (adapterState.placedDigits as Record<number, number>) ?? {};
    const selectedDigit = adapterState.selectedDigit as number | null;
    const draggableDigits = (content.draggableDigits as number[]) ?? [];

    return (
      <PlaceValueChart
        maxPlaces={(content.maxPlaces as "lakh" | "crore") ?? "crore"}
        placedDigits={placedDigits}
        draggableDigits={draggableDigits}
        selectedDigit={selectedDigit}
        activeColumn={null}
        onSelectDigit={(digit) => onAdapterStateChange({ selectedDigit: digit === selectedDigit ? null : digit })}
        onPlaceDigit={(digit, column) => {
          const next = { ...placedDigits, [column]: digit };
          onAdapterStateChange({ placedDigits: next, selectedDigit: null });
          onResponse({ placedDigits: next });
        }}
        onRemoveDigit={(column) => {
          const next = { ...placedDigits };
          delete next[column];
          onAdapterStateChange({ placedDigits: next });
          onResponse({ placedDigits: next });
        }}
        targetNumber={content.targetNumber as number | undefined}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
        showLabels={(content.showLabels as boolean) ?? true}
      />
    );
  },
};
