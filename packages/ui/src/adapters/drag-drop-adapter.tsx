import { DragDrop } from "../DragDrop";
import type { ActivityAdapter } from "./adapter-interface";

export const dragDropAdapter: ActivityAdapter = {
  types: ["drag_drop", "dragdrop"],

  getInitialState() {
    return { placements: {}, selectedItem: null };
  },

  render({ content, adapterState, lifecycle, onResponse, onAdapterStateChange }) {
    const items = (content.items as Array<{ id: string; label: string; emoji?: string }>) ?? [];
    const targets = (content.targets as Array<{ id: string; label: string }>) ?? [];
    const placements = (adapterState.placements as Record<string, string>) ?? {};
    const selectedItem = adapterState.selectedItem as string | null;

    return (
      <DragDrop
        items={items}
        targets={targets}
        placements={placements}
        selectedItemId={selectedItem}
        onSelectItem={(id) => onAdapterStateChange({ selectedItem: id === selectedItem ? null : id })}
        onPlaceItem={(itemId, targetId) => {
          const updated = { ...placements, [itemId]: targetId };
          onAdapterStateChange({ placements: updated, selectedItem: null });
          onResponse({ droppedPositions: updated });
        }}
        onRemoveItem={(itemId) => {
          const updated = { ...placements };
          delete updated[itemId];
          onAdapterStateChange({ placements: updated });
          onResponse({ droppedPositions: updated });
        }}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
        correctPlacements={content.expectedPositions as Record<string, string> | undefined}
      />
    );
  },
};
