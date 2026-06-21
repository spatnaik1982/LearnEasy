import { render, screen, fireEvent } from "@testing-library/react";
import { GridCounter, computePerimeter } from "../GridCounter";

describe("GridCounter", () => {
  it("renders grid with correct dimensions", () => {
    const { container } = render(
      <GridCounter rows={3} cols={4} highlighted={[]} onHighlight={jest.fn()} onClearAll={jest.fn()} />
    );
    const cells = container.querySelectorAll('[role="gridcell"], [role="button"]');
    expect(cells.length).toBe(12);
  });

  it("highlights specified cells", () => {
    const { container } = render(
      <GridCounter
        rows={2}
        cols={2}
        highlighted={[
          { row: 0, col: 0 },
          { row: 1, col: 1 },
        ]}
        onHighlight={jest.fn()}
        onClearAll={jest.fn()}
      />,
    );
    const cells = container.querySelectorAll('[data-highlighted="true"]');
    expect(cells.length).toBe(2);
  });

  it("shows count in area mode", () => {
    render(
      <GridCounter
        rows={2}
        cols={2}
        highlighted={[{ row: 0, col: 0 }]}
        showCount
        mode="area"
        onHighlight={jest.fn()}
        onClearAll={jest.fn()}
      />,
    );
    expect(screen.getByText(/Area: 1 square/)).toBeInTheDocument();
  });

  it("has accessible grid role", () => {
    render(
      <GridCounter rows={3} cols={3} highlighted={[]} onHighlight={jest.fn()} onClearAll={jest.fn()} />
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("handles interactive cell click", () => {
    const onHighlight = jest.fn();
    render(
      <GridCounter rows={2} cols={2} highlighted={[]} interactive onHighlight={onHighlight} onClearAll={jest.fn()} />
    );
    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[0]);
    expect(onHighlight).toHaveBeenCalledWith([{ row: 0, col: 0 }]);
  });

  it("calls onClearAll when clear button clicked", () => {
    const onClearAll = jest.fn();
    render(
      <GridCounter
        rows={2}
        cols={2}
        highlighted={[{ row: 0, col: 0 }]}
        interactive
        onHighlight={jest.fn()}
        onClearAll={onClearAll}
      />
    );
    fireEvent.click(screen.getByText("Clear All"));
    expect(onClearAll).toHaveBeenCalled();
  });
});

describe("computePerimeter", () => {
  it("1x1 cell has perimeter 4", () => {
    expect(computePerimeter([{ row: 0, col: 0 }], 5, 5)).toBe(4);
  });

  it("2x2 block has perimeter 8", () => {
    const cells = [
      { row: 0, col: 0 }, { row: 0, col: 1 },
      { row: 1, col: 0 }, { row: 1, col: 1 },
    ];
    expect(computePerimeter(cells, 5, 5)).toBe(8);
  });

  it("1x4 horizontal strip has perimeter 10", () => {
    const cells = [
      { row: 0, col: 0 }, { row: 0, col: 1 },
      { row: 0, col: 2 }, { row: 0, col: 3 },
    ];
    expect(computePerimeter(cells, 5, 5)).toBe(10);
  });

  it("empty cells has perimeter 0", () => {
    expect(computePerimeter([], 5, 5)).toBe(0);
  });

  it("L-shape (3x1 + 2x1) has perimeter 10", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ];
    expect(computePerimeter(cells, 5, 5)).toBe(10);
  });
});
