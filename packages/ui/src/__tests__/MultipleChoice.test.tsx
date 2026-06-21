import { render, screen, fireEvent } from "@testing-library/react";
import { MultipleChoice } from "../MultipleChoice";

const options = [
  { id: "a", label: "Red" },
  { id: "b", label: "Blue" },
  { id: "c", label: "Green" },
  { id: "d", label: "Yellow" },
];

describe("MultipleChoice", () => {
  it("renders question and options with letter badges", () => {
    render(
      <MultipleChoice
        question="What color is the sky?"
        options={options}
        selectedIndex={null}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText("What color is the sky?")).toBeInTheDocument();
    const badges = screen.getAllByTestId("option-badge");
    expect(badges).toHaveLength(4);
    expect(badges[0]).toHaveTextContent("A");
    expect(badges[1]).toHaveTextContent("B");
    expect(badges[2]).toHaveTextContent("C");
    expect(badges[3]).toHaveTextContent("D");
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Yellow")).toBeInTheDocument();
  });

  it("calls onSelect with index when option clicked", () => {
    const onSelect = jest.fn();
    render(
      <MultipleChoice
        question="Test"
        options={options}
        selectedIndex={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("Blue"));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("highlights selected option with aria-selected=true", () => {
    render(
      <MultipleChoice
        question="Test"
        options={options}
        selectedIndex={2}
        onSelect={jest.fn()}
      />,
    );
    const optionCards = screen.getAllByTestId("option-card");
    expect(optionCards[2]).toHaveAttribute("aria-selected", "true");
    expect(optionCards[0]).toHaveAttribute("aria-selected", "false");
    expect(optionCards[1]).toHaveAttribute("aria-selected", "false");
    expect(optionCards[3]).toHaveAttribute("aria-selected", "false");
  });

  it("shows correct result when showResult and correctIndex match", () => {
    render(
      <MultipleChoice
        question="Test"
        options={options}
        selectedIndex={0}
        onSelect={jest.fn()}
        showResult={true}
        correctIndex={0}
      />,
    );
    const badges = screen.getAllByTestId("option-badge");
    expect(badges[0]).toHaveTextContent("✓");
  });

  it("shows incorrect result when showResult and wrong selection", () => {
    render(
      <MultipleChoice
        question="Test"
        options={options}
        selectedIndex={1}
        onSelect={jest.fn()}
        showResult={true}
        correctIndex={0}
      />,
    );
    const badges = screen.getAllByTestId("option-badge");
    expect(badges[1]).toHaveTextContent("✗");
    expect(badges[0]).toHaveTextContent("✓");
  });
});
