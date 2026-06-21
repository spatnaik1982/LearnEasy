import { render, screen, fireEvent } from "@testing-library/react";
import { VisualCounter } from "../VisualCounter";

describe("VisualCounter", () => {
  it("renders emoji items", () => {
    const { container } = render(<VisualCounter count={5} emoji="⭐" />);
    const spans = container.querySelectorAll("span[aria-hidden='true']");
    expect(spans.length).toBe(5);
    expect(spans[0]).toHaveTextContent("⭐");
  });

  it("shows count when showCount is true", () => {
    const { container } = render(<VisualCounter count={5} emoji="⭐" showCount />);
    expect(container.textContent).toContain("There are");
    expect(container.textContent).toContain("5");
    expect(container.textContent).toContain("items");
  });

  it("renders number selector when interactive", () => {
    render(<VisualCounter count={5} emoji="⭐" interactive />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const buttons = screen.getAllByRole("radio");
    expect(buttons.length).toBe(7);
  });

  it("calls onNumberSelect when button clicked", () => {
    const onSelect = jest.fn();
    render(<VisualCounter count={5} emoji="⭐" interactive onNumberSelect={onSelect} />);
    const buttons = screen.getAllByRole("radio");
    fireEvent.click(buttons[0]);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("number buttons are 56x56px", () => {
    render(<VisualCounter count={5} emoji="⭐" interactive />);
    const buttons = screen.getAllByRole("radio");
    buttons.forEach((btn) => {
      expect(btn).toHaveStyle({ width: "56px", height: "56px" });
    });
  });

  it("shows result colors: green for correct, coral for incorrect", () => {
    const { rerender } = render(
      <VisualCounter count={5} emoji="⭐" interactive selectedNumber={5} showResult />
    );
    const correctBtn = screen.getByRole("radio", { name: "5 items" });
    expect(correctBtn.className).toContain("8FB996");

    rerender(<VisualCounter count={5} emoji="⭐" interactive selectedNumber={3} showResult />);
    const incorrectBtn = screen.getByRole("radio", { name: "3 items" });
    expect(incorrectBtn.className).toContain("E5989B");
  });
});
