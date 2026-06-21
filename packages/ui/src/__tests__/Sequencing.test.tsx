import { render, screen, fireEvent } from "@testing-library/react";
import { Sequencing } from "../Sequencing";

const defaultItems = [
  { id: "first", label: "First", emoji: "1️⃣" },
  { id: "second", label: "Second", emoji: "2️⃣" },
  { id: "third", label: "Third", emoji: "3️⃣" },
];

describe("Sequencing", () => {
  it("renders available items", () => {
    render(
      <Sequencing
        items={defaultItems}
        userOrder={[]}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("adds item to sequence when clicked", () => {
    const onAddItem = jest.fn();
    render(
      <Sequencing
        items={defaultItems}
        userOrder={[]}
        onAddItem={onAddItem}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("First"));
    expect(onAddItem).toHaveBeenCalledWith("first");
  });

  it("shows sequenced items with position badges", () => {
    render(
      <Sequencing
        items={defaultItems}
        userOrder={["first", "second"]}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />,
    );
    const badge1 = screen.getByText("1");
    const badge2 = screen.getByText("2");
    expect(badge1).toBeInTheDocument();
    expect(badge2).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("up/down buttons are 56x56px", () => {
    render(
      <Sequencing
        items={defaultItems}
        userOrder={["first", "second", "third"]}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
      />,
    );
    const upButtons = screen.getAllByLabelText(/move.*up/i);
    const downButtons = screen.getAllByLabelText(/move.*down/i);
    [...upButtons, ...downButtons].forEach((btn) => {
      expect(btn.className).toMatch(/h-14/);
      expect(btn.className).toMatch(/w-14/);
    });
  });

  it("shows correct/incorrect positions when showResult", () => {
    render(
      <Sequencing
        items={defaultItems}
        userOrder={["first", "third", "second"]}
        onAddItem={() => {}}
        onRemoveItem={() => {}}
        onReorder={() => {}}
        showResult={true}
        correctOrder={["first", "second", "third"]}
      />,
    );
    const results = document.querySelectorAll("[data-result]");
    expect(results.length).toBe(3);
  });
});
