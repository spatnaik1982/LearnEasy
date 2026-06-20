import { render, screen, fireEvent } from "@testing-library/react";
import { ScaleReader } from "../ScaleReader";

describe("ScaleReader", () => {
  it("renders ruler with marks", () => {
    render(
      <ScaleReader type="ruler" min={0} max={10} step={1} unit="cm" />
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders thermometer with liquid", () => {
    render(
      <ScaleReader
        type="thermometer"
        min={0}
        max={100}
        step={10}
        unit="°C"
        value={50}
      />
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders cylinder with liquid", () => {
    render(
      <ScaleReader
        type="cylinder"
        min={0}
        max={50}
        step={5}
        unit="mL"
        value={25}
      />
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("shows reading when showReading is true", () => {
    render(
      <ScaleReader
        type="ruler"
        min={0}
        max={10}
        step={1}
        unit="cm"
        value={5}
        showReading
      />
    );
    expect(screen.getByText("5 cm")).toBeInTheDocument();
  });

  it("shows error for invalid range", () => {
    render(<ScaleReader type="ruler" min={10} max={0} step={1} unit="cm" />);
    expect(screen.getByText("Invalid scale range")).toBeInTheDocument();
  });

  it("fires onValueChange when interactive slider changes", () => {
    const onChange = jest.fn();
    render(
      <ScaleReader
        type="ruler"
        min={0}
        max={10}
        step={1}
        unit="cm"
        interactive
        onValueChange={onChange}
      />
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
