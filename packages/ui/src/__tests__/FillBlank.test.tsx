import { render, screen, fireEvent } from "@testing-library/react";
import { FillBlank } from "../FillBlank";

const blanks = [
  { id: "b1", position: 0, correctAnswer: "5", options: ["4", "5", "6"] },
];

describe("FillBlank", () => {
  it("renders template text with blanks", () => {
    render(
      <FillBlank
        template="3 + ___ = 8"
        blanks={blanks}
        mode="select"
        filledAnswers={{}}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    expect(screen.getByText("3 +")).toBeInTheDocument();
    expect(screen.getByText("= 8")).toBeInTheDocument();
  });

  it("activates blank when clicked (calls onBlankActivate)", () => {
    const onBlankActivate = jest.fn();
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{}}
        activeBlankId={null}
        onBlankActivate={onBlankActivate}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/Blank 1/));
    expect(onBlankActivate).toHaveBeenCalledWith("b1");
  });

  it("fills blank when option clicked (calls onBlankFill)", () => {
    const onBlankFill = jest.fn();
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{}}
        activeBlankId="b1"
        onBlankActivate={jest.fn()}
        onBlankFill={onBlankFill}
        onBlankClear={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: "5" }));
    expect(onBlankFill).toHaveBeenCalledWith("b1", "5");
  });

  it("shows filled value in blank", () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{ b1: "5" }}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows clear button on filled blank", () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{ b1: "5" }}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    const clearButtons = screen.getAllByRole("button", { name: /clear/i });
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onBlankClear when clear button clicked", () => {
    const onBlankClear = jest.fn();
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{ b1: "5" }}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={onBlankClear}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onBlankClear).toHaveBeenCalledWith("b1");
  });

  it("shows options when blank is active", () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{}}
        activeBlankId="b1"
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    expect(screen.getByRole("option", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "6" })).toBeInTheDocument();
  });

  it("renders input fields in type mode", () => {
    render(
      <FillBlank
        template="5 + ___ = 9"
        blanks={[{ id: "b1", position: 0, correctAnswer: "4" }]}
        mode="type"
        filledAnswers={{}}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBe(1);
  });

  it("has accessible labels on blanks", () => {
    render(
      <FillBlank
        template="___ + 3 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{}}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
      />,
    );
    expect(screen.getByLabelText(/Blank 1/)).toBeInTheDocument();
  });

  it("shows correct result styling when showResult and answer correct", () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{ b1: "5" }}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
        showResult={true}
      />,
    );
    const blankButton = screen.getByLabelText(/Blank 1/);
    expect(blankButton).toHaveStyle("borderColor: #8FB996");
  });

  it("shows incorrect result styling when showResult and answer wrong", () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={blanks}
        mode="select"
        filledAnswers={{ b1: "4" }}
        activeBlankId={null}
        onBlankActivate={jest.fn()}
        onBlankFill={jest.fn()}
        onBlankClear={jest.fn()}
        showResult={true}
      />,
    );
    const blankButton = screen.getByLabelText(/Blank 1/);
    expect(blankButton).toHaveStyle("borderColor: #E5989B");
  });
});
