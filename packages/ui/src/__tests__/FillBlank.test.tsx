import { render, screen, fireEvent } from "@testing-library/react";
import { FillBlank } from "../FillBlank";

describe("FillBlank", () => {
  it("renders template with blank placeholders", () => {
    render(
      <FillBlank
        template="3 + ___ = 8"
        blanks={[
          {
            id: "b1",
            position: 0,
            correctAnswer: "5",
            options: ["4", "5", "6"],
          },
        ]}
        mode="select"
      />,
    );
    expect(screen.getByText("3 +")).toBeInTheDocument();
    expect(screen.getByText("= 8")).toBeInTheDocument();
  });

  it("renders option buttons in select mode", () => {
    render(
      <FillBlank
        template="___ + 2 = 7"
        blanks={[
          {
            id: "b1",
            position: 0,
            correctAnswer: "5",
            options: ["3", "5", "7"],
          },
        ]}
        mode="select"
      />,
    );
    // Click to activate blank and reveal options
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders input fields in type mode", () => {
    render(
      <FillBlank
        template="5 + ___ = 9"
        blanks={[{ id: "b1", position: 0, correctAnswer: "4" }]}
        mode="type"
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBe(1);
  });

  it("fires onComplete when all blanks filled", async () => {
    const onComplete = jest.fn();
    render(
      <FillBlank
        template="___ + ___ = 10"
        blanks={[
          { id: "b1", position: 0, correctAnswer: "3", options: ["2", "3", "4"] },
          { id: "b2", position: 1, correctAnswer: "7", options: ["6", "7", "8"] },
        ]}
        mode="select"
        onComplete={onComplete}
      />,
    );
    // Activate blank 1 and select an option
    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click((await screen.findAllByRole("option"))[0]);
    // Activate blank 2 and select an option
    fireEvent.click(screen.getAllByRole("button")[1]);
    fireEvent.click((await screen.findAllByRole("option"))[0]);
    expect(onComplete).toHaveBeenCalled();
  });

  it("has accessible labels on blanks", () => {
    render(
      <FillBlank
        template="___ + 3 = 7"
        blanks={[
          { id: "b1", position: 0, correctAnswer: "4", options: ["2", "4", "6"] },
        ]}
        mode="select"
      />,
    );
    expect(screen.getByLabelText(/Blank 1/)).toBeInTheDocument();
  });
});
