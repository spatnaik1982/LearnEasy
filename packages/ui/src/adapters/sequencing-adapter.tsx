import { Sequencing } from "../Sequencing";
import type { ActivityAdapter } from "./adapter-interface";

export const sequencingAdapter: ActivityAdapter = {
  types: ["sequencing"],

  getInitialState() {
    return { userOrder: [] };
  },

  render({ content, adapterState, lifecycle, onResponse, onAdapterStateChange }) {
    const items = (content.items as Array<{ id: string; label: string; emoji?: string }>) ?? [];
    const userOrder = (adapterState.userOrder as string[]) ?? [];

    return (
      <Sequencing
        items={items}
        userOrder={userOrder}
        onAddItem={(id) => {
          const updated = [...userOrder, id];
          onAdapterStateChange({ userOrder: updated });
          onResponse({ order: updated });
        }}
        onRemoveItem={(id) => {
          const updated = userOrder.filter((i) => i !== id);
          onAdapterStateChange({ userOrder: updated });
          onResponse({ order: updated });
        }}
        onReorder={(fromIndex, toIndex) => {
          const updated = [...userOrder];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          onAdapterStateChange({ userOrder: updated });
          onResponse({ order: updated });
        }}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
        correctOrder={content.correctOrder as string[] | undefined}
      />
    );
  },
};
