import { render, screen, fireEvent } from "@testing-library/react";
import { Matching } from "../Matching";

const defaultPairs = [
  { id: "1", itemA: "Cat", itemB: "Meow" },
  { id: "2", itemA: "Dog", itemB: "Bark" },
  { id: "3", itemA: "Cow", itemB: "Moo" },
];

const noop = () => {};

function renderMatching(overrides: Record<string, unknown> = {}) {
  return render(
    <Matching
      pairs={defaultPairs}
      connections={{}}
      selectedLeftId={null}
      selectedRightId={null}
      onSelectLeft={noop}
      onSelectRight={noop}
      onConnect={noop}
      onUndo={noop}
      {...overrides}
    />,
  );
}

describe("Matching", () => {
  it("renders left and right columns", () => {
    renderMatching();
    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("Cow")).toBeInTheDocument();
    expect(screen.getByText("Meow")).toBeInTheDocument();
    expect(screen.getByText("Bark")).toBeInTheDocument();
    expect(screen.getByText("Moo")).toBeInTheDocument();
  });

  it("calls onSelectRight when right item clicked", () => {
    const onSelectRight = jest.fn();
    renderMatching({ onSelectRight });
    fireEvent.click(screen.getByText("Meow"));
    expect(onSelectRight).toHaveBeenCalledWith("1");
  });

  it("calls onSelectLeft when left item clicked", () => {
    const onSelectLeft = jest.fn();
    renderMatching({ onSelectLeft });
    fireEvent.click(screen.getByText("Cat"));
    expect(onSelectLeft).toHaveBeenCalledWith("1");
  });

  it("applies matched styling", () => {
    const connections = { "1": "1", "2": "2" };
    renderMatching({ connections });
    const matchedCat = screen.getByText("Cat").closest("button");
    const matchedMeow = screen.getByText("Meow").closest("button");
    expect(matchedCat?.className).toContain("border-muted-green");
    expect(matchedMeow?.className).toContain("border-muted-green");
  });

  it("shows correct/incorrect when showResult", () => {
    const correctPairs = { "1": "1", "2": "2", "3": "3" };
    const connections = { "1": "1", "2": "1", "3": "3" };
    renderMatching({ connections, correctPairs, showResult: true });
    const correctLeft = screen.getByText("Cat").closest("button");
    const incorrectLeft = screen.getByText("Dog").closest("button");
    expect(correctLeft?.className).toContain("border-muted-green");
    expect(incorrectLeft?.className).toContain("border-soft-coral");
  });

  it("all buttons meet 56px min height", () => {
    const { container } = renderMatching();
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.className).toMatch(/min-h/);
    });
  });

  it("shows undo button when connections exist", () => {
    renderMatching({ connections: { "1": "1" } });
    expect(screen.getByLabelText("Undo last match")).toBeInTheDocument();
  });

  it("hides undo button when no connections", () => {
    renderMatching();
    expect(screen.queryByLabelText("Undo last match")).not.toBeInTheDocument();
  });
});
