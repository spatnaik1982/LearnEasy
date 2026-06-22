import { RealWorldTask } from "../RealWorldTask";
import type { ActivityAdapter } from "./adapter-interface";

export const realWorldAdapter: ActivityAdapter = {
  types: ["real_world", "real_world_task"],

  getInitialState() {
    return { response: "" };
  },

  render({ content, adapterState, onAdapterStateChange }) {
    return (
      <RealWorldTask
        scenario={(content.scenario as string) ?? ""}
        taskDescription={(content.taskDescription as string) ?? ""}
        visualExample={(content.visualExample as string) ?? undefined}
        hint={(content.hint as string) ?? undefined}
        response={adapterState.response as string}
        onResponseChange={(val) => onAdapterStateChange({ response: val })}
      />
    );
  },
};
