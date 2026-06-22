import { Matching } from "../Matching";
import type { ActivityAdapter } from "./adapter-interface";

export const matchingAdapter: ActivityAdapter = {
  types: ["matching"],

  getInitialState() {
    return { connections: {}, selectedLeft: null, selectedRight: null };
  },

  render({ content, adapterState, lifecycle, onResponse, onAdapterStateChange }) {
    const pairs = (content.pairs as Array<{ id: string; itemA: string; itemB: string }>) ?? [];
    const connections = (adapterState.connections as Record<string, string>) ?? {};
    const selectedLeft = adapterState.selectedLeft as string | null;
    const selectedRight = adapterState.selectedRight as string | null;
    const correctPairs: Record<string, string> = {};
    pairs.forEach((p) => { correctPairs[p.id] = p.id; });

    return (
      <Matching
        pairs={pairs}
        connections={connections}
        selectedLeftId={selectedLeft}
        selectedRightId={selectedRight}
        onSelectLeft={(id) => {
          if (selectedRight) {
            const updated = { ...connections, [id]: selectedRight };
            onAdapterStateChange({ connections: updated, selectedLeft: null, selectedRight: null });
            onResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === correctPairs[k] })) });
          } else {
            onAdapterStateChange({ selectedLeft: id });
          }
        }}
        onSelectRight={(id) => {
          if (selectedLeft) {
            const updated = { ...connections, [selectedLeft]: id };
            onAdapterStateChange({ connections: updated, selectedLeft: null, selectedRight: null });
            onResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === correctPairs[k] })) });
          } else {
            onAdapterStateChange({ selectedRight: id });
          }
        }}
        onConnect={(leftId, rightId) => {
          const updated = { ...connections, [leftId]: rightId };
          onAdapterStateChange({ connections: updated, selectedLeft: null, selectedRight: null });
          onResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === correctPairs[k] })) });
        }}
        onUndo={() => {
          const keys = Object.keys(connections);
          if (keys.length === 0) return;
          const lastKey = keys[keys.length - 1];
          const updated = { ...connections };
          delete updated[lastKey];
          onAdapterStateChange({ connections: updated });
          onResponse({ pairs: Object.keys(updated).map((k) => ({ id: k, correct: updated[k] === correctPairs[k] })) });
        }}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
        correctPairs={correctPairs}
      />
    );
  },
};
