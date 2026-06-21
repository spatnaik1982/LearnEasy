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

  it("label fonts are 14px minimum", () => {
    const { container } = render(
      <ScaleReader type="ruler" min={0} max={10} step={1} unit="cm" />
    );
    const texts = container.querySelectorAll("text");
    texts.forEach((t) => {
      const fontSize = parseFloat(t.getAttribute("font-size") || "0");
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });
  });

  it("fires onValueChange on svg click for ruler", () => {
    const onChange = jest.fn();
    const { container } = render(
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
    const svg = container.querySelector("svg")!;
    jest.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      top: 0, left: 0, right: 300, bottom: 60,
      width: 300, height: 60,
      x: 0, y: 0,
      toJSON: () => ({}),
    });
    fireEvent.click(svg, { clientX: 160, clientY: 30 });
    expect(onChange).toHaveBeenCalled();
  });

  it("target indicator is dashed Muted Teal", () => {
    const { container } = render(
      <ScaleReader
        type="ruler"
        min={0}
        max={10}
        step={1}
        unit="cm"
        targetValue={5}
      />
    );
    const lines = container.querySelectorAll("line");
    const targetLine = Array.from(lines).find(
      (l) => l.getAttribute("stroke") === "#76A5AF" && l.getAttribute("stroke-dasharray") === "6 3"
    );
    expect(targetLine).not.toBeNull();
    expect(targetLine).toBeDefined();
  });

  it("slider track is 56px height", () => {
    render(
      <ScaleReader
        type="ruler"
        min={0}
        max={10}
        step={1}
        unit="cm"
        interactive
      />
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveStyle({ height: "56px" });
  });
});
