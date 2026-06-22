import { GridCounter, computePerimeter } from "../GridCounter";
import type { ActivityAdapter } from "./adapter-interface";

export const gridAreaAdapter: ActivityAdapter = {
  types: ["grid_area"],

  getInitialState(content) {
    const highlighted = (content.highlighted as { row: number; col: number }[]) ?? [];
    return { highlighted };
  },

  render({ content, adapterState, onResponse, onAdapterStateChange }) {
    const rows = (content.rows as number) ?? 5;
    const cols = (content.cols as number) ?? 5;
    const highlighted = (adapterState.highlighted as { row: number; col: number }[]) ?? [];

    return (
      <GridCounter
        rows={rows}
        cols={cols}
        highlighted={highlighted}
        mode={(content.mode as "area" | "perimeter") ?? "area"}
        interactive={(content.interactive as boolean) ?? false}
        maxHighlights={content.maxHighlights as number}
        cellSize={(content.cellSize as number) ?? 40}
        showCount
        onHighlight={(cells) => {
          onAdapterStateChange({ highlighted: cells });
          const mode = (content.mode as "area" | "perimeter") ?? "area";
          const count = mode === "perimeter"
            ? computePerimeter(cells, rows, cols)
            : cells.length;
          onResponse({ highlighted: cells, count });
        }}
        onClearAll={() => {
          onAdapterStateChange({ highlighted: [] });
          onResponse({ highlighted: [], count: 0 });
        }}
      />
    );
  },
};
