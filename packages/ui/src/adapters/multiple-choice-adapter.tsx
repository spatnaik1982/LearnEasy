import { MultipleChoice } from "../MultipleChoice";
import type { ActivityAdapter } from "./adapter-interface";

export const multipleChoiceAdapter: ActivityAdapter = {
  types: ["multiple_choice"],
  multiQuestion: true,

  getInitialState() {
    return {};
  },

  render({ content, lifecycle, multiQuestionIndex, multiTotal, userResponse, onResponse }) {
    const rawQuestions = content.questions as Array<{
      question?: string;
      text?: string;
      options: string[];
      correctIndex: number;
    }> | undefined;

    if (rawQuestions?.length && multiTotal > 1) {
      if (multiQuestionIndex >= rawQuestions.length) return null;
      const q = rawQuestions[multiQuestionIndex];
      const options = q.options.map((label, i) => ({ id: String(i), label }));
      const isLast = multiQuestionIndex + 1 >= rawQuestions.length;
      if (lifecycle === "correct" && isLast) return null;

      return (
        <div className="flex flex-col gap-4">
          <MultipleChoice
            key={`mc-${multiQuestionIndex}`}
            question={q.question ?? q.text ?? ""}
            options={options}
            selectedIndex={userResponse?.selectedIndex as number | null}
            onSelect={(index) => {
              onResponse({ selectedIndex: index, questionIndex: multiQuestionIndex });
            }}
            showResult={lifecycle === "correct" || lifecycle === "incorrect"}
            correctIndex={q.correctIndex}
          />
        </div>
      );
    }

    return (
      <MultipleChoice
        question={(content.question as string) ?? ""}
        options={(content.options as Array<{ id: string; label: string; emoji?: string }>) ?? []}
        selectedIndex={userResponse?.selectedIndex as number | null}
        onSelect={(index) => {
          onResponse({ selectedIndex: index });
        }}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
        correctIndex={(content.correctIndex as number) ?? 0}
      />
    );
  },
};
