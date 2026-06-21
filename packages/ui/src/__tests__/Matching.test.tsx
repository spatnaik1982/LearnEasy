import { render, screen, fireEvent } from "@testing-library/react";
import { Matching } from "../Matching";

const defaultPairs = [
  { id: "1", itemA: "Cat", itemB: "Meow" },
  { id: "2", itemA: "Dog", itemB: "Bark" },
  { id: "3", itemA: "Cow", itemB: "Moo" },
];

describe("Matching", () => {
  it("renders left and right columns", () => {
    render(
      <Matching
        pairs={defaultPairs}
        connections={{}}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />,
    );
    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("Cow")).toBeInTheDocument();
    expect(screen.getByText("Meow")).toBeInTheDocument();
    expect(screen.getByText("Bark")).toBeInTheDocument();
    expect(screen.getByText("Moo")).toBeInTheDocument();
  });

  it("calls onSelectRight when right item clicked", () => {
    const onSelectRight = jest.fn();
    render(
      <Matching
        pairs={defaultPairs}
        connections={{}}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={onSelectRight}
        onUndo={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Meow"));
    expect(onSelectRight).toHaveBeenCalledWith("1");
  });

  it("applies matched styling", () => {
    const connections = { "1": "1", "2": "2" };
    render(
      <Matching
        pairs={defaultPairs}
        connections={connections}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />,
    );
    const matchedCat = screen.getByText("Cat").closest("button");
    const matchedMeow = screen.getByText("Meow").closest("button");
    expect(matchedCat?.className).toContain("border-muted-green");
    expect(matchedMeow?.className).toContain("border-muted-green");
  });

  it("shows correct/incorrect when showResult", () => {
    const correctPairs = { "1": "1", "2": "2", "3": "3" };
    const connections = { "1": "1", "2": "1", "3": "3" };
    render(
      <Matching
        pairs={defaultPairs}
        connections={connections}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
        showResult={true}
        correctPairs={correctPairs}
      />,
    );
    const correctLeft = screen.getByText("Cat").closest("button");
    const incorrectLeft = screen.getByText("Dog").closest("button");
    expect(correctLeft?.className).toContain("border-muted-green");
    expect(incorrectLeft?.className).toContain("border-soft-coral");
  });

  it("all buttons meet 56px min height", () => {
    const { container } = render(
      <Matching
        pairs={defaultPairs}
        connections={{}}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={() => {}}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />,
    );
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.className).toMatch(/min-h/);
    });
  });
});
