import { render, screen } from "@testing-library/react";
import { DragDrop } from "../DragDrop";

const defaultItems = [
  { id: "apple", label: "Apple", emoji: "🍎" },
  { id: "banana", label: "Banana", emoji: "🍌" },
  { id: "carrot", label: "Carrot", emoji: "🥕" },
];

const defaultTargets = [
  { id: "fruits", label: "Fruits" },
  { id: "vegetables", label: "Vegetables" },
];

describe("DragDrop", () => {
  it("renders items and targets", () => {
    render(
      <DragDrop
        items={defaultItems}
        targets={defaultTargets}
        placements={{}}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />,
    );
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Carrot")).toBeInTheDocument();
    expect(screen.getByText("Fruits")).toBeInTheDocument();
    expect(screen.getByText("Vegetables")).toBeInTheDocument();
  });

  it("renders items as draggable", () => {
    render(
      <DragDrop
        items={defaultItems}
        targets={defaultTargets}
        placements={{}}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />,
    );
    const appleBtn = screen.getByText("Apple").closest("button");
    expect(appleBtn).toBeInTheDocument();
    expect(appleBtn).toHaveAttribute("aria-label", "Apple");
  });

  it("renders droppable targets with correct structure", () => {
    render(
      <DragDrop
        items={defaultItems}
        targets={defaultTargets}
        placements={{}}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />,
    );
    const fruitsRegion = screen.getByLabelText("Target: Fruits, empty");
    expect(fruitsRegion).toBeInTheDocument();
    const vegetablesRegion = screen.getByLabelText("Target: Vegetables, empty");
    expect(vegetablesRegion).toBeInTheDocument();
  });

  it("shows placed items in target zones", () => {
    const placements = { apple: "fruits", banana: "fruits" };
    render(
      <DragDrop
        items={defaultItems}
        targets={defaultTargets}
        placements={placements}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />,
    );
    const fruitsZone = screen.getByText("Fruits").closest("[data-target]");
    expect(fruitsZone).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("shows remove button on placed items", () => {
    const placements = { apple: "fruits" };
    render(
      <DragDrop
        items={defaultItems}
        targets={defaultTargets}
        placements={placements}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
      />,
    );
    const removeBtn = screen.getByLabelText("Remove Apple");
    expect(removeBtn).toBeInTheDocument();
  });

  it("shows correct/incorrect when showResult", () => {
    const placements = { apple: "fruits", banana: "vegetables", carrot: "fruits" };
    const correctPlacements = { apple: "fruits", banana: "vegetables", carrot: "vegetables" };
    render(
      <DragDrop
        items={defaultItems}
        targets={defaultTargets}
        placements={placements}
        selectedItemId={null}
        onSelectItem={() => {}}
        onPlaceItem={() => {}}
        onRemoveItem={() => {}}
        showResult={true}
        correctPlacements={correctPlacements}
      />,
    );
    const correctItem = screen.getByText("Apple").closest("[data-result]");
    const incorrectItem = screen.getByText("Carrot").closest("[data-result]");
    expect(correctItem).toHaveAttribute("data-result", "correct");
    expect(incorrectItem).toHaveAttribute("data-result", "incorrect");
  });
});
