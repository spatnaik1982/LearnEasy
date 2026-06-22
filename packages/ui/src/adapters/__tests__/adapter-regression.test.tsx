import { render } from '@testing-library/react';
import { getAdapter } from "../index";
import { evaluateActivity } from "../../activity-utils";

function content(type: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const base: Record<string, Record<string, unknown>> = {
    visual_counting: { count: 5, emoji: "⭐", size: "md" },
    matching: { pairs: [{ id: "p1", itemA: "1", itemB: "one" }, { id: "p2", itemA: "2", itemB: "two" }] },
    drag_drop: { items: [{ id: "i1", label: "A" }], targets: [{ id: "t1", label: "Target" }], expectedPositions: { i1: "t1" } },
    sequencing: { items: [{ id: "s1", label: "First" }, { id: "s2", label: "Second" }], correctOrder: ["s1", "s2"] },
    multiple_choice: { question: "Pick one", options: [{ id: "0", label: "A" }, { id: "1", label: "B" }], correctIndex: 0 },
    story_question: { scenario: "Test", questions: [{ question: "Q", options: ["a", "b", "c", "d"], correctIndex: 0 }], visual: "🖼️" },
    real_world: { scenario: "Real task", taskDescription: "Describe" },
    fraction_visual: { numerator: 3, denominator: 4, mode: "bar", interactive: true },
    place_value_chart: { maxPlaces: "lakh", targetNumber: 543, interactive: true, draggableDigits: [5, 4, 3] },
    grid_area: { rows: 5, cols: 5, mode: "area", interactive: true, highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
    chart_reader: { type: "bar", data: [{ label: "A", value: 1 }, { label: "B", value: 2 }], interactive: true, correctLabel: "A" },
    clock_time: { hour: 3, minute: 0, mode: "set", interactive: true, targetTime: { hour: 4, minute: 0 } },
    measurement_scale: { type: "ruler", min: 0, max: 30, step: 1, unit: "cm", interactive: true, targetValue: 12 },
    fill_blank: { template: "3 + ___ = 8", blanks: [{ id: "b1", position: 0, correctAnswer: "5" }], mode: "select" },
  };
  return { ...(base[type] ?? {}), ...overrides };
}

function correctResponse(type: string): Record<string, unknown> {
  const responses: Record<string, Record<string, unknown>> = {
    visual_counting: { count: 5 },
    matching: { pairs: [{ id: "p1", correct: true }, { id: "p2", correct: true }] },
    drag_drop: { droppedPositions: { i1: "t1" } },
    sequencing: { order: ["s1", "s2"] },
    multiple_choice: { selectedIndex: 0, correct: true },
    story_question: { selectedIndex: 0, questionIndex: 0, correct: true },
    real_world: { completed: true },
    fraction_visual: { shaded: 3 },
    place_value_chart: { placedDigits: { 3: 5, 4: 4, 5: 3 } },
    grid_area: { highlighted: [{ row: 0, col: 0 }, { row: 0, col: 1 }], count: 2 },
    chart_reader: { selectedLabel: "A" },
    clock_time: { hour: 4, minute: 0 },
    measurement_scale: { value: 12 },
    fill_blank: { answers: { b1: "5" } },
  };
  return responses[type] ?? {};
}

function wrongResponse(type: string): Record<string, unknown> {
  const responses: Record<string, Record<string, unknown>> = {
    visual_counting: { count: 999 },
    matching: { pairs: [{ id: "p1", correct: false }, { id: "p2", correct: false }] },
    drag_drop: { droppedPositions: { i1: "wrong" } },
    sequencing: { order: ["s2", "s1"] },
    multiple_choice: { selectedIndex: 1 },
    story_question: { selectedIndex: 1, questionIndex: 0 },
    real_world: { completed: true },
    fraction_visual: { shaded: 999 },
    place_value_chart: { placedDigits: { 3: 9, 4: 9, 5: 9 } },
    grid_area: { highlighted: [], count: 0 },
    chart_reader: { selectedLabel: "B" },
    clock_time: { hour: 12, minute: 0 },
    measurement_scale: { value: 999 },
    fill_blank: { answers: { b1: "999" } },
  };
  return responses[type] ?? {};
}

const ACTIVITY_TYPES = [
  "visual_counting",
  "matching",
  "drag_drop",
  "sequencing",
  "multiple_choice",
  "story_question",
  "real_world",
  "fraction_visual",
  "place_value_chart",
  "grid_area",
  "chart_reader",
  "clock_time",
  "measurement_scale",
  "fill_blank",
] as const;

describe("adapter registry", () => {
  for (const type of ACTIVITY_TYPES) {
    it(`has an adapter for "${type}"`, () => {
      const adapter = getAdapter(type);
      expect(adapter).toBeDefined();
      expect(adapter!.types).toContain(type);
    });
  }
});

describe("adapter getInitialState", () => {
  for (const type of ACTIVITY_TYPES) {
    it(`"${type}" getInitialState returns a record`, () => {
      const adapter = getAdapter(type)!;
      const state = adapter.getInitialState(content(type));
      expect(state).toBeDefined();
      expect(typeof state).toBe("object");
    });
  }
});

describe("adapter render produces JSX", () => {
  for (const type of ACTIVITY_TYPES) {
    it(`"${type}" render returns a React element`, () => {
      const adapter = getAdapter(type)!;
      const state = adapter.getInitialState(content(type));
      const el = adapter.render({
        content: content(type),
        adapterState: state,
        lifecycle: "idle",
        isObserveStep: false,
        multiQuestionIndex: 0,
        multiTotal: type === "multiple_choice" || type === "story_question" ? 1 : 0,
        userResponse: null,
        onResponse: () => {},
        onAdapterStateChange: () => {},
      });
      expect(el).not.toBeNull();
    });
  }
});

describe("adapter render does not crash under react-dom", () => {
  for (const type of ACTIVITY_TYPES) {
    it(`"${type}" renders without throwing`, () => {
      const adapter = getAdapter(type)!;
      const state = adapter.getInitialState(content(type));
      const el = adapter.render({
        content: content(type),
        adapterState: state,
        lifecycle: "idle",
        isObserveStep: false,
        multiQuestionIndex: 0,
        multiTotal: type === "multiple_choice" || type === "story_question" ? 1 : 0,
        userResponse: null,
        onResponse: () => {},
        onAdapterStateChange: () => {},
      });
      expect(() => render(<>{el}</>)).not.toThrow();
    });
  }
});

describe("adapter scoring — correct responses", () => {
  for (const type of ACTIVITY_TYPES) {
    it(`"${type}" correct response scores correct`, () => {
      const result = evaluateActivity(type, correctResponse(type), content(type));
      expect(result.correct).toBe(true);
    });
  }
});

describe("adapter scoring — incorrect responses", () => {
  for (const type of ACTIVITY_TYPES) {
    if (type === "real_world") continue;
    it(`"${type}" wrong response scores incorrect`, () => {
      const result = evaluateActivity(type, wrongResponse(type), content(type));
      expect(result.correct).toBe(false);
    });
  }
});
