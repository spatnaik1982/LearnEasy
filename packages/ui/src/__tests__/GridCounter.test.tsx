import { render, screen, fireEvent } from "@testing-library/react";
import { GridCounter } from "../GridCounter";

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
