import { render, screen, fireEvent } from "@testing-library/react";
import { StoryQuestion } from "../StoryQuestion";

const questions = [
  { question: "What did Ria see first?", options: ["A squirrel", "A bird", "A cat"], correctIndex: 0 },
  { question: "What color was the bird?", options: ["Red", "Blue", "Green"], correctIndex: 1 },
  { question: "How many birds were there?", options: ["One", "Two", "Three"], correctIndex: 2 },
];

describe("StoryQuestion", () => {
  it("renders scenario and current question", () => {
    render(
      <StoryQuestion
        scenario="Ria went to the park."
        questions={questions}
        currentQuestionIndex={0}
        selectedIndex={null}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByTestId("scenario-card")).toBeInTheDocument();
    expect(screen.getByText("Ria went to the park.")).toBeInTheDocument();
    expect(screen.getByText("What did Ria see first?")).toBeInTheDocument();
    const badges = screen.getAllByTestId("option-badge");
    expect(badges).toHaveLength(3);
  });

  it("shows only current question, not others", () => {
    render(
      <StoryQuestion
        scenario="Ria went to the park."
        questions={questions}
        currentQuestionIndex={1}
        selectedIndex={null}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("What color was the bird?")).toBeInTheDocument();
    expect(screen.queryByText("What did Ria see first?")).not.toBeInTheDocument();
    expect(screen.queryByText("How many birds were there?")).not.toBeInTheDocument();
  });

  it("calls onSelect when option clicked", () => {
    const onSelect = jest.fn();
    render(
      <StoryQuestion
        scenario="Ria went to the park."
        questions={questions}
        currentQuestionIndex={0}
        selectedIndex={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("A squirrel"));
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("renders visual when provided", () => {
    render(
      <StoryQuestion
        scenario="Ria went to the park."
        questions={questions}
        currentQuestionIndex={0}
        selectedIndex={null}
        onSelect={jest.fn()}
        visual="🌳"
      />,
    );
    expect(screen.getByTestId("scenario-visual")).toHaveTextContent("🌳");
  });

  it("shows correct result when showResult and correctIndex match", () => {
    render(
      <StoryQuestion
        scenario="Ria went to the park."
        questions={questions}
        currentQuestionIndex={0}
        selectedIndex={0}
        onSelect={jest.fn()}
        showResult={true}
      />,
    );
    const badges = screen.getAllByTestId("option-badge");
    expect(badges[0]).toHaveTextContent("✓");
  });

  it("shows incorrect result when showResult and wrong selection", () => {
    render(
      <StoryQuestion
        scenario="Ria went to the park."
        questions={questions}
        currentQuestionIndex={0}
        selectedIndex={2}
        onSelect={jest.fn()}
        showResult={true}
      />,
    );
    const badges = screen.getAllByTestId("option-badge");
    expect(badges[2]).toHaveTextContent("✗");
    expect(badges[0]).toHaveTextContent("✓");
  });
});
