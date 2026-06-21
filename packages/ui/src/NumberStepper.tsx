export interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label?: string;
  onChange: (value: number) => void;
  wrap?: boolean;
}

export function NumberStepper({
  value,
  min,
  max,
  step,
  label,
  onChange,
  wrap = false,
}: NumberStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const decrease = () => {
    if (atMin && !wrap) return;
    if (atMin && wrap) {
      onChange(max);
    } else {
      onChange(value - step);
    }
  };

  const increase = () => {
    if (atMax && !wrap) return;
    if (atMax && wrap) {
      onChange(min);
    } else {
      onChange(value + step);
    }
  };

  return (
    <div>
      {label && (
        <label
          data-testid="stepper-label"
          className="block mb-1"
          style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease"
          data-testid="stepper-decrease"
          onClick={decrease}
          disabled={atMin && !wrap}
          className="flex items-center justify-center rounded-lg border-2 bg-white text-xl font-bold"
          style={{
            width: "56px",
            height: "56px",
            borderColor: "#5D87B1",
            color: "#5D87B1",
            opacity: atMin && !wrap ? 0.5 : 1,
          }}
        >
          −
        </button>
        <span
          data-testid="stepper-value"
          className="text-center"
          style={{
            minWidth: "48px",
            fontSize: "24px",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label="Increase"
          data-testid="stepper-increase"
          onClick={increase}
          disabled={atMax && !wrap}
          className="flex items-center justify-center rounded-lg border-2 bg-white text-xl font-bold"
          style={{
            width: "56px",
            height: "56px",
            borderColor: "#5D87B1",
            color: "#5D87B1",
            opacity: atMax && !wrap ? 0.5 : 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
