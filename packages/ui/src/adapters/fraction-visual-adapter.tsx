import { FractionVisualizer } from "../FractionVisualizer";
import type { ActivityAdapter } from "./adapter-interface";

export const fractionVisualAdapter: ActivityAdapter = {
  types: ["fraction_visual"],

  getInitialState() {
    return {};
  },

  render({ content, onResponse }) {
    return (
      <FractionVisualizer
        numerator={(content.numerator as number) ?? 1}
        denominator={(content.denominator as number) ?? 2}
        mode={(content.mode as "bar" | "circle") ?? "bar"}
        label={content.label as string}
        showLabel={(content.showLabel as boolean) ?? false}
        interactive={(content.interactive as boolean) ?? false}
        compare={content.compare as { numerator: number; denominator: number } | undefined}
        onShade={(shaded) => {
          onResponse({ shaded });
        }}
      />
    );
  },
};
