import { render, screen, fireEvent } from "@testing-library/react";
import { GridCounter, computePerimeter } from "../GridCounter";

describe("GridCounter", () => {
  it("renders grid with correct dimensions", () => {
    const { container } = render(<GridCounter rows={3} cols={4} />);
    const cells = container.querySelectorAll('[role="gridcell"]');
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
      />,
    );
    expect(screen.getByText(/Area: 1 square/)).toBeInTheDocument();
  });

  it("has accessible grid role", () => {
    render(<GridCounter rows={3} cols={3} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("handles interactive cell click", () => {
    const onHighlight = jest.fn();
    render(
      <GridCounter rows={2} cols={2} interactive onHighlight={onHighlight} />,
    );
    const cells = screen.getAllByRole("gridcell");
    fireEvent.click(cells[0]);
    expect(onHighlight).toHaveBeenCalledWith([{ row: 0, col: 0 }]);
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
    // Cells forming an L: (0,0), (1,0), (2,0), (2,1)
    const cells = [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ];
    expect(computePerimeter(cells, 5, 5)).toBe(10);
  });
});
