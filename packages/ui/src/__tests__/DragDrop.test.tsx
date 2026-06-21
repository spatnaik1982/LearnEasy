import { render, screen, fireEvent } from "@testing-library/react";
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

const noop = () => {};

function renderDragDrop(overrides: Record<string, unknown> = {}) {
  return render(
    <DragDrop
      items={defaultItems}
      targets={defaultTargets}
      placements={{}}
      selectedItemId={null}
      onSelectItem={noop}
      onPlaceItem={noop}
      onRemoveItem={noop}
      {...overrides}
    />,
  );
}

describe("DragDrop", () => {
  it("renders items and targets", () => {
    renderDragDrop();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Carrot")).toBeInTheDocument();
    expect(screen.getByText("Fruits")).toBeInTheDocument();
    expect(screen.getByText("Vegetables")).toBeInTheDocument();
  });

  it("renders items as draggable", () => {
    renderDragDrop();
    const appleBtn = screen.getByText("Apple").closest("button");
    expect(appleBtn).toBeInTheDocument();
    expect(appleBtn).toHaveAttribute("aria-label", "Apple");
  });

  it("renders droppable targets with correct structure", () => {
    renderDragDrop();
    const fruitsRegion = screen.getByLabelText("Target: Fruits, empty");
    expect(fruitsRegion).toBeInTheDocument();
    const vegetablesRegion = screen.getByLabelText("Target: Vegetables, empty");
    expect(vegetablesRegion).toBeInTheDocument();
  });

  it("shows placed items in target zones", () => {
    const placements = { apple: "fruits", banana: "fruits" };
    renderDragDrop({ placements });
    const fruitsZone = screen.getByText("Fruits").closest("[data-target]");
    expect(fruitsZone).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("shows remove button on placed items", () => {
    const placements = { apple: "fruits" };
    renderDragDrop({ placements });
    const removeBtn = screen.getByLabelText("Remove Apple");
    expect(removeBtn).toBeInTheDocument();
  });

  it("shows correct/incorrect when showResult", () => {
    const placements = { apple: "fruits", banana: "vegetables", carrot: "fruits" };
    const correctPlacements = { apple: "fruits", banana: "vegetables", carrot: "vegetables" };
    renderDragDrop({ placements, showResult: true, correctPlacements });
    const correctItem = screen.getByText("Apple").closest("[data-result]");
    const incorrectItem = screen.getByText("Carrot").closest("[data-result]");
    expect(correctItem).toHaveAttribute("data-result", "correct");
    expect(incorrectItem).toHaveAttribute("data-result", "incorrect");
  });

  it("calls onSelectItem when an item is clicked", () => {
    const onSelectItem = jest.fn();
    renderDragDrop({ onSelectItem });
    fireEvent.click(screen.getByText("Apple"));
    expect(onSelectItem).toHaveBeenCalledWith("apple");
  });

  it("calls onPlaceItem with itemId and targetId when target clicked after selecting", () => {
    const onPlaceItem = jest.fn();
    renderDragDrop({ selectedItemId: "apple", onPlaceItem });
    const fruitsTarget = screen.getByLabelText(/Target: Fruits.*click to place/);
    fireEvent.click(fruitsTarget);
    expect(onPlaceItem).toHaveBeenCalledWith("apple", "fruits");
  });

  it("calls onRemoveItem when remove button clicked", () => {
    const onRemoveItem = jest.fn();
    const placements = { apple: "fruits" };
    renderDragDrop({ placements, onRemoveItem });
    fireEvent.click(screen.getByLabelText("Remove Apple"));
    expect(onRemoveItem).toHaveBeenCalledWith("apple");
  });
});
