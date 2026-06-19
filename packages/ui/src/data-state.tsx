import type { ReactNode } from "react";
import { COPY } from "./copy";

type DataStateProps =
  | { status: "loading"; label?: string }
  | {
      status: "empty";
      title: string;
      body?: string;
      action?: { label: string; onClick: () => void };
    }
  | {
      status: "error";
      title?: string;
      body?: string;
      onRetry?: () => void;
    }
  | { status: "ready"; children: ReactNode };

function DataState(props: DataStateProps): JSX.Element {
  switch (props.status) {
    case "loading":
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="h-16 w-16 animate-pulse rounded-xl bg-outline-variant" />
          {props.label && (
            <p className="text-sm text-on-surface-variant">{props.label}</p>
          )}
        </div>
      );

    case "empty":
      return (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-text">
            {props.title}
          </h2>
          {props.body && (
            <p className="mt-2 text-sm text-on-surface-variant">{props.body}</p>
          )}
          {props.action && (
            <button
              onClick={props.action.onClick}
              className="mt-4 min-h-[44px] rounded-lg bg-soft-blue px-4 py-2 text-sm font-medium text-white"
            >
              {props.action.label}
            </button>
          )}
        </div>
      );

    case "error":
      return (
        <div className="rounded-xl bg-soft-coral/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-soft-coral">
            {props.title ?? COPY.errorTitle}
          </h3>
          {props.body && (
            <p className="mt-2 text-sm text-on-surface-variant">
              {props.body}
            </p>
          )}
          {props.onRetry && (
            <button
              onClick={props.onRetry}
              className="mt-4 min-h-[44px] rounded-lg bg-soft-coral px-4 py-2 text-sm font-medium text-white"
            >
              {COPY.tryAgain}
            </button>
          )}
        </div>
      );

    case "ready":
      return <>{props.children}</>;
  }
}

export { DataState };
export type { DataStateProps };
