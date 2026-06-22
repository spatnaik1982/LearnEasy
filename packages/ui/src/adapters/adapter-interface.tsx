import type { ReactNode } from "react";

export type LifecycleState = "idle" | "interacting" | "submitted" | "correct" | "incorrect";

export interface AdapterRenderProps {
  content: Record<string, unknown>;
  adapterState: Record<string, unknown>;
  lifecycle: LifecycleState;
  isObserveStep: boolean;
  multiQuestionIndex: number;
  multiTotal: number;
  userResponse: Record<string, unknown> | null;
  onResponse: (response: Record<string, unknown>) => void;
  onAdapterStateChange: (updates: Record<string, unknown>) => void;
}

export interface ActivityAdapter {
  types: readonly string[];
  multiQuestion?: boolean;
  getInitialState(content: Record<string, unknown>): Record<string, unknown>;
  render(props: AdapterRenderProps): ReactNode;
}
