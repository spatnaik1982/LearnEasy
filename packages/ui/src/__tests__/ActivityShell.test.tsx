import { render, screen, fireEvent, within } from "@testing-library/react";
import { ActivityShell } from "../ActivityShell";

const defaultProps = {
  instruction: "Count the number of apples",
  activityIcon: <span data-testid="icon">🍎</span>,
  stepLabel: "guided_practice",
  hasInteracted: true,
  isCorrect: null,
  feedbackMessage: "Great job!",
  guidanceMessage: "",
  hintAvailable: true,
  hintLevel: 0,
  onCheckAnswer: jest.fn(),
  onShowHint: jest.fn(),
  onContinue: jest.fn(),
  onTryAgain: jest.fn(),
  children: <div data-testid="child">Activity content</div>,
};

describe("ActivityShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders instruction text and icon", () => {
    render(<ActivityShell {...defaultProps} />);
    expect(screen.getByText("Count the number of apples")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders children in interaction area", () => {
    render(<ActivityShell {...defaultProps} />);
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Activity content")).toBeInTheDocument();
  });

  it("disables Check button when hasInteracted is false", () => {
    render(<ActivityShell {...defaultProps} hasInteracted={false} />);
    const button = screen.getByText("Check My Answer");
    expect(button).toBeDisabled();
  });

  it("enables Check button when hasInteracted is true", () => {
    render(<ActivityShell {...defaultProps} hasInteracted={true} />);
    const button = screen.getByText("Check My Answer");
    expect(button).not.toBeDisabled();
  });

  it("calls onCheckAnswer when Check button clicked", () => {
    const onCheckAnswer = jest.fn();
    render(<ActivityShell {...defaultProps} onCheckAnswer={onCheckAnswer} />);
    fireEvent.click(screen.getByText("Check My Answer"));
    expect(onCheckAnswer).toHaveBeenCalledTimes(1);
  });

  it("hides feedback zone when isCorrect is null", () => {
    render(<ActivityShell {...defaultProps} isCorrect={null} />);
    expect(screen.queryByTestId("feedback-zone")).not.toBeInTheDocument();
  });

  it("shows success feedback when isCorrect is true", () => {
    render(
      <ActivityShell
        {...defaultProps}
        isCorrect={true}
        feedbackMessage="Great job!"
      />,
    );
    expect(screen.getByTestId("feedback-zone")).toBeInTheDocument();
    expect(screen.getByText("Great job!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue Lesson/i }),
    ).toBeInTheDocument();
  });

  it("shows retry feedback when isCorrect is false", () => {
    render(
      <ActivityShell
        {...defaultProps}
        isCorrect={false}
        feedbackMessage="Not quite"
      />,
    );
    expect(screen.getByTestId("feedback-zone")).toBeInTheDocument();
    expect(screen.getByText("Not quite")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("feedback-zone")).getByRole("button", {
        name: /Try Again/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows guidance message when incorrect", () => {
    render(
      <ActivityShell
        {...defaultProps}
        isCorrect={false}
        feedbackMessage="Not quite"
        guidanceMessage="Try counting each apple one by one"
      />,
    );
    expect(
      screen.getByText("Try counting each apple one by one"),
    ).toBeInTheDocument();
  });

  it("calls onTryAgain when Try Again clicked", () => {
    const onTryAgain = jest.fn();
    render(
      <ActivityShell
        {...defaultProps}
        isCorrect={false}
        onTryAgain={onTryAgain}
      />,
    );
    fireEvent.click(screen.getAllByText("Try Again")[0]);
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });

  it("calls onContinue when Continue Lesson clicked", () => {
    const onContinue = jest.fn();
    render(
      <ActivityShell
        {...defaultProps}
        isCorrect={true}
        onContinue={onContinue}
      />,
    );
    fireEvent.click(screen.getByText("Continue Lesson"));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("shows only Continue button in observe-step mode", () => {
    render(<ActivityShell {...defaultProps} isObserveStep={true} />);
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(screen.queryByText("Check My Answer")).not.toBeInTheDocument();
    expect(screen.queryByText("Show Hint")).not.toBeInTheDocument();
  });

  it('shows "I Completed This Task" in self-report mode', () => {
    render(<ActivityShell {...defaultProps} isSelfReport={true} />);
    expect(
      screen.getByText("I Completed This Task"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Check My Answer")).not.toBeInTheDocument();
  });

  it("hides hint button when hintAvailable is false", () => {
    render(<ActivityShell {...defaultProps} hintAvailable={false} />);
    expect(screen.queryByText("Show Hint")).not.toBeInTheDocument();
  });

  it("shows hint button when hintAvailable is true", () => {
    render(<ActivityShell {...defaultProps} hintAvailable={true} />);
    expect(screen.getByText("Show Hint")).toBeInTheDocument();
  });

  it("calls onShowHint when hint button clicked", () => {
    const onShowHint = jest.fn();
    render(<ActivityShell {...defaultProps} onShowHint={onShowHint} />);
    fireEvent.click(screen.getByText("Show Hint"));
    expect(onShowHint).toHaveBeenCalledTimes(1);
  });

  it("shows progress label when provided", () => {
    render(
      <ActivityShell
        {...defaultProps}
        progressLabel="Question 2 of 5 · Practice"
      />,
    );
    expect(
      screen.getByText("Question 2 of 5 · Practice"),
    ).toBeInTheDocument();
  });

  it("uses aria-live='polite' on feedback zone", () => {
    render(
      <ActivityShell {...defaultProps} isCorrect={true} />,
    );
    const feedback = screen.getByTestId("feedback-zone");
    expect(feedback).toHaveAttribute("aria-live", "polite");
  });
});
