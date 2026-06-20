import { evaluateActivity } from "../activity-utils";

describe("evaluateActivity - observed: true short-circuit", () => {
  it("fraction_visual with observed: true returns correct: true", () => {
    expect(evaluateActivity("fraction_visual", { observed: true }, {})).toEqual({ correct: true });
  });

  it("place_value_chart with observed: true returns correct: true", () => {
    expect(evaluateActivity("place_value_chart", { observed: true }, {})).toEqual({ correct: true });
  });

  it("chart_reader with observed: true returns correct: true", () => {
    expect(evaluateActivity("chart_reader", { observed: true }, {})).toEqual({ correct: true });
  });

  it("grid_area with observed: true returns correct: true", () => {
    expect(evaluateActivity("grid_area", { observed: true }, {})).toEqual({ correct: true });
  });

  it("clock_time with observed: true returns correct: true", () => {
    expect(evaluateActivity("clock_time", { observed: true }, {})).toEqual({ correct: true });
  });

  it("measurement_scale with observed: true returns correct: true", () => {
    expect(evaluateActivity("measurement_scale", { observed: true }, {})).toEqual({ correct: true });
  });

  it("fill_blank with observed: true returns correct: true", () => {
    expect(evaluateActivity("fill_blank", { observed: true }, {})).toEqual({ correct: true });
  });

  it("fraction_visual with shaded response and interactive: true uses type-specific scoring", () => {
    const result = evaluateActivity("fraction_visual", { shaded: 1 }, { interactive: true, numerator: 3 });
    expect(result.correct).toBe(false);
  });
});

describe("evaluateActivity - fraction_visual", () => {
  it("non-interactive (observe) auto-completes", () => {
    expect(evaluateActivity("fraction_visual", {}, { interactive: false })).toEqual({ correct: true });
  });

  it("interactive, correct shaded count", () => {
    expect(evaluateActivity("fraction_visual", { shaded: 3 }, { numerator: 3, interactive: true })).toEqual({ correct: true });
  });

  it("interactive, incorrect shaded count", () => {
    expect(evaluateActivity("fraction_visual", { shaded: 2 }, { numerator: 3, interactive: true })).toEqual({ correct: false });
  });
});

describe("evaluateActivity - place_value_chart", () => {
  it("non-interactive (observe) auto-completes", () => {
    expect(evaluateActivity("place_value_chart", {}, { interactive: false })).toEqual({ correct: true });
  });

  it("missing targetNumber returns correct: false (interactive)", () => {
    expect(evaluateActivity("place_value_chart", { placed: { col: 5, digit: 5 } }, { digits: [null, null, null, null, null, 5, 4, 3] })).toEqual({ correct: false });
  });

  it("correct placement matches targetNumber", () => {
    expect(evaluateActivity("place_value_chart", {}, { digits: [null, null, null, null, null, 5, 4, 3], targetNumber: 543 })).toEqual({ correct: true });
  });

  it("wrong placement does not match targetNumber", () => {
    expect(evaluateActivity("place_value_chart", {}, { digits: [null, null, null, null, 9, 5, 4, 3], targetNumber: 543 })).toEqual({ correct: false });
  });
});

describe("evaluateActivity - chart_reader", () => {
  it("no correctLabel (stimulus) auto-completes", () => {
    expect(evaluateActivity("chart_reader", { selectedLabel: "January" }, {})).toEqual({ correct: true });
  });

  it("correctLabel match returns correct", () => {
    expect(evaluateActivity("chart_reader", { selectedLabel: "February" }, { correctLabel: "February" })).toEqual({ correct: true });
  });

  it("correctLabel mismatch returns incorrect", () => {
    expect(evaluateActivity("chart_reader", { selectedLabel: "January" }, { correctLabel: "February" })).toEqual({ correct: false });
  });
});

describe("evaluateActivity - clock_time", () => {
  it("no targetTime (observe) auto-completes", () => {
    expect(evaluateActivity("clock_time", { hour: 3, minute: 0 }, { hour: 3, minute: 0 })).toEqual({ correct: true });
  });

  it("correct targetTime match", () => {
    expect(evaluateActivity("clock_time", { hour: 7, minute: 45 }, { targetTime: { hour: 7, minute: 45 }, interactive: true })).toEqual({ correct: true });
  });

  it("hour mismatch returns incorrect", () => {
    expect(evaluateActivity("clock_time", { hour: 8, minute: 0 }, { targetTime: { hour: 7, minute: 0 }, interactive: true })).toEqual({ correct: false });
  });

  it("minute within 5 tolerance is correct", () => {
    expect(evaluateActivity("clock_time", { hour: 7, minute: 42 }, { targetTime: { hour: 7, minute: 45 }, interactive: true })).toEqual({ correct: true });
  });
});

describe("evaluateActivity - measurement_scale", () => {
  it("no targetValue (observe) auto-completes", () => {
    expect(evaluateActivity("measurement_scale", {}, { interactive: false })).toEqual({ correct: true });
  });

  it("correct targetValue match", () => {
    expect(evaluateActivity("measurement_scale", { value: 15 }, { targetValue: 15, step: 1 })).toEqual({ correct: true });
  });

  it("value within 1 step tolerance is correct", () => {
    expect(evaluateActivity("measurement_scale", { value: 16 }, { targetValue: 15, step: 1 })).toEqual({ correct: true });
  });

  it("value outside tolerance returns incorrect", () => {
    expect(evaluateActivity("measurement_scale", { value: 13 }, { targetValue: 15, step: 1 })).toEqual({ correct: false });
  });
});