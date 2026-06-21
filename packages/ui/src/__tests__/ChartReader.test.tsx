import { render, screen, fireEvent } from "@testing-library/react";
import { ChartReader } from "../ChartReader";

describe("ChartReader", () => {
  const data = [
    { label: "Cricket", value: 8 },
    { label: "Football", value: 5 },
    { label: "Tennis", value: 3 },
  ];

  it("renders bar chart with correct number of bars", () => {
    const { container } = render(<ChartReader type="bar" data={data} />);
    const bars = container.querySelectorAll("rect");
    expect(bars.length).toBe(3);
  });

  it("shows value labels when showValues is true", () => {
    render(<ChartReader type="bar" data={data} showValues />);
    expect(screen.getAllByText("8").length).toBeGreaterThanOrEqual(1);
  });

  it("renders pictograph with emojis", () => {
    render(
      <ChartReader type="pictograph" data={[{ label: "Apples", value: 4, emoji: "🍎" }]} />
    );
    expect(screen.getAllByText("🍎").length).toBeGreaterThanOrEqual(1);
  });

  it("handles interactive selection", () => {
    const onSelect = jest.fn();
    render(<ChartReader type="bar" data={data} interactive onSelect={onSelect} />);
    const bars = screen.getAllByRole("button");
    fireEvent.click(bars[0]);
    expect(onSelect).toHaveBeenCalledWith("Cricket");
  });

  it("shows fallback for empty data", () => {
    render(<ChartReader type="bar" data={[]} />);
    expect(screen.getByText("No data to display")).toBeInTheDocument();
  });

  it("has hidden data table for accessibility", () => {
    const { container } = render(<ChartReader type="bar" data={data} />);
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("renders Y-axis gridlines at 25/50/75/100%", () => {
    const { container } = render(<ChartReader type="bar" data={data} />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  it("pictograph shows Each = 1 legend", () => {
    render(<ChartReader type="pictograph" data={data} />);
    expect(screen.getByText(/Each.*= 1/)).toBeInTheDocument();
  });

  it("pictograph shows ...(N) for values over 20", () => {
    render(
      <ChartReader
        type="pictograph"
        data={[{ label: "Stars", value: 25, emoji: "⭐" }]}
      />
    );
    expect(screen.getByText(/\(25\)/)).toBeInTheDocument();
  });

  it("has fixed height 300px", () => {
    const { container } = render(<ChartReader type="bar" data={data} />);
    const img = container.querySelector('[role="img"]');
    expect(img).toHaveStyle({ height: "300px" });
  });
});
