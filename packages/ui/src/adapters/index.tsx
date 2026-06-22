import type { ActivityAdapter } from "./adapter-interface";
import { visualCountingAdapter } from "./visual-counting-adapter";
import { matchingAdapter } from "./matching-adapter";
import { dragDropAdapter } from "./drag-drop-adapter";
import { sequencingAdapter } from "./sequencing-adapter";
import { multipleChoiceAdapter } from "./multiple-choice-adapter";
import { storyQuestionAdapter } from "./story-question-adapter";
import { realWorldAdapter } from "./real-world-adapter";
import { fractionVisualAdapter } from "./fraction-visual-adapter";
import { placeValueChartAdapter } from "./place-value-chart-adapter";
import { gridAreaAdapter } from "./grid-area-adapter";
import { chartReaderAdapter } from "./chart-reader-adapter";
import { clockTimeAdapter } from "./clock-time-adapter";
import { measurementScaleAdapter } from "./measurement-scale-adapter";
import { fillBlankAdapter } from "./fill-blank-adapter";

const adapters: ActivityAdapter[] = [
  visualCountingAdapter,
  matchingAdapter,
  dragDropAdapter,
  sequencingAdapter,
  multipleChoiceAdapter,
  storyQuestionAdapter,
  realWorldAdapter,
  fractionVisualAdapter,
  placeValueChartAdapter,
  gridAreaAdapter,
  chartReaderAdapter,
  clockTimeAdapter,
  measurementScaleAdapter,
  fillBlankAdapter,
];

const adapterByType = new Map<string, ActivityAdapter>();

for (const adapter of adapters) {
  for (const type of adapter.types) {
    adapterByType.set(type, adapter);
  }
}

export function getAdapter(type: string): ActivityAdapter | undefined {
  return adapterByType.get(type.toLowerCase().replace(/-/g, "_"));
}

export { type ActivityAdapter } from "./adapter-interface";
