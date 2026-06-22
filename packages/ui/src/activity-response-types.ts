/**
 * Response contracts for all 14 activity types.
 *
 * Each contract documents:
 * - content fields needed to render
 * - response fields emitted by the UI
 * - fields required for scoring
 * - observe-mode behavior
 * - interactive-mode behavior
 *
 * ## Mode semantics
 * - **observe**: Non-interactive display. Auto-completes via { observed: true }
 *   or when evaluated with empty content targets. The user does not produce a response.
 * - **interactive**: User produces a response which is scored against an authored target.
 *   "Check My Answer" is enabled only after handleResponse() has been called.
 */

/** visual_counting / visual_counter */
export interface VisualCountingResponse {
  count: number;
}
// Render: content.count, content.items, content.emoji, content.size, content.left+right+sum (addition)
// Score : response.count === (content.sum ?? content.count)
// Observe: displays count, auto-completes
// Interactive: user picks a count

/** matching */
export interface MatchingResponse {
  pairs: Array<{ id: string; correct: boolean }>;
}
// Render: content.pairs[{ id, itemA, itemB }]
// Score : all pairs have correct === true
// Observe: not applicable (matching is always interactive)
// Interactive: user connects itemA ↔ itemB

/** drag_drop */
export interface DragDropResponse {
  droppedPositions: Record<string, string>;
}
// Render: content.items[{ id, label }], content.targets[{ id, label }]
// Score : droppedPositions matches content.expectedPositions
// Observe: not applicable (drag_drop is always interactive)
// Interactive: user drags items to targets

/** sequencing */
export interface SequencingResponse {
  order: string[];
}
// Render: content.items[{ id, label, emoji? }]
// Score : response.order matches content.correctOrder element-wise
// Observe: not applicable (sequencing is always interactive)
// Interactive: user arranges items in order

/** multiple_choice */
export interface MultipleChoiceResponse {
  selectedIndex: number;
  questionIndex?: number;
  correct?: boolean;
}
// Render: content.questions[{ question, options, correctIndex }] or single content.question+options
// Score : response.selectedIndex matches content.correctIndex (or per-question)
// Observe: not applicable
// Interactive: user selects an option
// Multi-question: uses correct: boolean aggregate

/** story_question */
export interface StoryQuestionResponse {
  selectedIndex: number;
  questionIndex?: number;
  correct?: boolean;
}
// Render: content.scenario, content.questions[{ question, options, correctIndex }]
// Score : same as multiple_choice per-question
// Observe: displays scenario, auto-completes
// Interactive: user answers questions

/** real_world / real_world_task */
export interface RealWorldResponse {
  completed?: boolean;
  text?: string;
}
// Render: content.scenario, content.taskDescription, content.visualExample
// Score : always returns correct: true (self-report / open-ended)
// Observe: not applicable
// Interactive: user describes their approach (unscored)

/** fraction_visual */
export interface FractionVisualResponse {
  shaded: number;
}
// Render: content.numerator, content.denominator, content.mode, content.interactive
// Score : interactive + response.shaded === content.numerator; non-interactive auto-completes
// Observe: displays fraction, auto-completes
// Interactive: user shades parts

/** place_value_chart */
export interface PlaceValueChartResponse {
  placedDigits: Record<number, number>;
}
// Render: content.maxPlaces, content.digits (observe init), content.draggableDigits
// Score : number built from response.placedDigits === content.targetNumber
// Observe: displays pre-placed digits from content.digits, auto-completes
// Interactive: user drags/taps digits into columns, response emitted on each placement

/** grid_area */
export interface GridAreaResponse {
  highlighted: { row: number; col: number }[];
  count: number;
}
// Render: content.rows, content.cols, content.mode, content.highlighted (observe init)
// Score : interactive + content.highlighted present → user highlighted matches; else auto-completes
// Observe: displays highlighted cells, auto-completes
// Interactive: user highlights cells

/** chart_reader */
export interface ChartReaderResponse {
  selectedLabel: string;
}
// Render: content.type, content.data[{ label, value, emoji? }], content.interactive
// Score : interactive + content.correctLabel present → response.selectedLabel matches; else auto-completes
// Observe: displays chart, auto-completes
// Interactive: user selects a bar/pictograph row

/** clock_time */
export interface ClockTimeResponse {
  hour: number;
  minute: number;
}
// Render: content.hour, content.minute, content.mode, content.interactive, content.targetTime
// Score : interactive + content.targetTime → hour match + minute within 5; else auto-completes
// Observe: displays clock, auto-completes
// Interactive: user drags hands or uses steppers

/** measurement_scale */
export interface MeasurementScaleResponse {
  value: number;
}
// Render: content.type, content.min, content.max, content.step, content.unit, content.interactive
// Score : interactive + content.targetValue → |response.value - targetValue| <= step; else auto-completes
// Observe: displays scale, auto-completes
// Interactive: user adjusts slider/clicks scale

/** fill_blank */
export interface FillBlankResponse {
  answers: Record<string, string | number>;
}
// Render: content.template, content.blanks[{ id, position, correctAnswer, options? }], content.mode
// Score : all response.answers match content.blanks[*].correctAnswer
// Observe: not applicable
// Interactive: user fills each blank
