import { FillBlank } from "../FillBlank";
import type { ActivityAdapter } from "./adapter-interface";

export const fillBlankAdapter: ActivityAdapter = {
  types: ["fill_blank"],

  getInitialState() {
    return { filledAnswers: {}, activeBlankId: null };
  },

  render({ content, adapterState, lifecycle, onResponse, onAdapterStateChange }) {
    const filledAnswers = (adapterState.filledAnswers as Record<string, string | number>) ?? {};
    const activeBlankId = adapterState.activeBlankId as string | null;

    return (
      <FillBlank
        template={(content.template as string) ?? ""}
        blanks={(content.blanks as { id: string; position: number; correctAnswer: string | number; options?: (string | number)[] }[]) ?? []}
        mode={(content.mode as "select" | "type") ?? "select"}
        filledAnswers={filledAnswers}
        activeBlankId={activeBlankId}
        onBlankActivate={(id) => onAdapterStateChange({ activeBlankId: id })}
        onBlankFill={(id, value) => {
          const next = { ...filledAnswers, [id]: value };
          onAdapterStateChange({ filledAnswers: next, activeBlankId: null });
          onResponse({ answers: next });
        }}
        onBlankClear={(id) => {
          const next = { ...filledAnswers };
          delete next[id];
          onAdapterStateChange({ filledAnswers: next });
        }}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
      />
    );
  },
};
