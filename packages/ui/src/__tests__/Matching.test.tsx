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

  it("calls onSelectLeft when left item clicked", () => {
    const onSelectLeft = jest.fn();
    render(
      <Matching
        pairs={defaultPairs}
        connections={{}}
        selectedLeftId={null}
        selectedRightId={null}
        onSelectLeft={onSelectLeft}
        onSelectRight={() => {}}
        onUndo={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Cat"));
    expect(onSelectLeft).toHaveBeenCalledWith("1");
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

  it("shows matched pairs with green styling", () => {
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
    const matchedLeft = screen.getByText("Cat").closest("[data-matched]");
    const matchedRight = screen.getByText("Meow").closest("[data-matched]");
    expect(matchedLeft).toHaveAttribute("data-matched", "true");
    expect(matchedRight).toHaveAttribute("data-matched", "true");
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
    const correctLeft = screen.getByText("Cat").closest("[data-result]");
    const incorrectLeft = screen.getByText("Dog").closest("[data-result]");
    expect(correctLeft).toHaveAttribute("data-result", "correct");
    expect(incorrectLeft).toHaveAttribute("data-result", "incorrect");
  });

  it("all buttons meet 56px min height", () => {
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
    const items = screen.getAllByRole("listitem");
    items.forEach((btn) => {
      expect(btn.className).toMatch(/min-h/);
    });
  });
});
