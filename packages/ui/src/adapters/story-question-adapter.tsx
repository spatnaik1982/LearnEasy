import { StoryQuestion } from "../StoryQuestion";
import type { ActivityAdapter } from "./adapter-interface";

export const storyQuestionAdapter: ActivityAdapter = {
  types: ["story_question"],
  multiQuestion: true,

  getInitialState() {
    return {};
  },

  render({ content, lifecycle, multiQuestionIndex, userResponse, onResponse }) {
    const questions = (content.questions as Array<{
      question: string;
      options: string[];
      correctIndex: number;
    }>) ?? [];
    const currentIdx = multiQuestionIndex;
    if (currentIdx >= questions.length) return null;
    const isLast = currentIdx + 1 >= questions.length;
    if (lifecycle === "correct" && isLast) return null;

    return (
      <StoryQuestion
        scenario={(content.scenario as string) ?? ""}
        questions={questions}
        currentQuestionIndex={currentIdx}
        selectedIndex={userResponse?.selectedIndex as number | null}
        onSelect={(index) => {
          onResponse({ selectedIndex: index, questionIndex: currentIdx });
        }}
        showResult={lifecycle === "correct" || lifecycle === "incorrect"}
        visual={(content.visual as string) ?? undefined}
      />
    );
  },
};
