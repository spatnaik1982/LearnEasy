

export interface FillBlankBlank {
  id: string;
  position: number;
  correctAnswer: string | number;
  options?: (string | number)[];
}

export interface FillBlankProps {
  template: string;
  blanks: FillBlankBlank[];
  mode: "select" | "type";
  filledAnswers: Record<string, string | number>;
  activeBlankId: string | null;
  onBlankActivate: (id: string) => void;
  onBlankFill: (id: string, value: string | number) => void;
  onBlankClear: (id: string) => void;
  showResult?: boolean;
}

function getBlankBorderColor(
  blank: FillBlankBlank,
  filledAnswers: Record<string, string | number>,
  activeBlankId: string | null,
  showResult?: boolean,
): string {
  const value = filledAnswers[blank.id];
  const isFilled = value !== undefined && value !== "";

  if (showResult && isFilled) {
    return String(value) === String(blank.correctAnswer) ? "#8FB996" : "#E5989B";
  }
  if (isFilled) {
    return "#76A5AF";
  }
  if (activeBlankId === blank.id) {
    return "#5D87B1";
  }
  return "#E5E7EB";
}

function getBlankTextColor(
  blank: FillBlankBlank,
  filledAnswers: Record<string, string | number>,
  showResult?: boolean,
): string {
  const value = filledAnswers[blank.id];
  const isFilled = value !== undefined && value !== "";

  if (showResult && isFilled) {
    return String(value) === String(blank.correctAnswer) ? "#8FB996" : "#E5989B";
  }
  if (isFilled) {
    return "#76A5AF";
  }
  return "#374151";
}

function BlankSlot({
  blank,
  index,
  mode,
  filledAnswers,
  activeBlankId,
  onBlankActivate,
  onBlankFill,
  onBlankClear,
  showResult,
}: {
  blank: FillBlankBlank;
  index: number;
  mode: "select" | "type";
  filledAnswers: Record<string, string | number>;
  activeBlankId: string | null;
  onBlankActivate: (id: string) => void;
  onBlankFill: (id: string, value: string | number) => void;
  onBlankClear: (id: string) => void;
  showResult?: boolean;
}) {
  const value = filledAnswers[blank.id];
  const isFilled = value !== undefined && value !== "";
  const isActive = activeBlankId === blank.id;
  const borderColor = getBlankBorderColor(blank, filledAnswers, activeBlankId, showResult);
  const textColor = getBlankTextColor(blank, filledAnswers, showResult);

  if (mode === "select") {
    return (
      <span className="inline-flex flex-col items-center gap-1 relative">
        <button
          type="button"
          onClick={() => {
            if (isFilled) {
              onBlankClear(blank.id);
            } else {
              onBlankActivate(blank.id);
            }
          }}
          style={{
            minHeight: "56px",
            minWidth: "60px",
            border: `2px ${isFilled ? "solid" : "dashed"}`,
            borderColor,
            color: textColor,
            backgroundColor: isFilled ? "#76A5AF1A" : "white",
            borderRadius: "8px",
            padding: "0 12px",
            fontSize: "18px",
            fontWeight: 700,
          }}
          className="focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
          aria-label={`Blank ${index + 1}${isFilled ? `, current value ${value}` : ", fill in the missing value"}`}
        >
          {isFilled ? value : "___"}
        </button>
        {isFilled && (
          <button
            type="button"
            onClick={() => onBlankClear(blank.id)}
            aria-label={`Clear blank ${index + 1}`}
            style={{
              position: "absolute",
              top: "-14px",
              right: "-14px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#E5989B",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              cursor: "pointer",
              lineHeight: 1,
            }}
            className="focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
          >
            ✕
          </button>
        )}
        {isActive && !isFilled && blank.options && (
          <span
            role="radiogroup"
            aria-label={`Options for blank ${index + 1}`}
            className="flex gap-2"
          >
            {blank.options.map((opt) => (
              <button
                key={String(opt)}
                type="button"
                role="option"
                aria-label={String(opt)}
                onClick={() => onBlankFill(blank.id, opt)}
                style={{
                  minHeight: "56px",
                  minWidth: "56px",
                  border: "2px solid #5D87B1",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#374151",
                  backgroundColor: "white",
                }}
                className="focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2"
              >
                {opt}
              </button>
            ))}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={isFilled ? String(value) : ""}
        onChange={(e) => onBlankFill(blank.id, e.target.value)}
        onFocus={() => onBlankActivate(blank.id)}
        style={{
          width: "64px",
          borderBottom: `2px ${isFilled ? "solid" : "dashed"}`,
          borderColor,
          color: textColor,
          backgroundColor: "transparent",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: 700,
        }}
        className="focus:outline-none focus:border-soft-blue"
        aria-label={`Blank ${index + 1}${isFilled ? `, current value ${value}` : ", fill in the missing value"}`}
      />
    </span>
  );
}

export function FillBlank({
  template,
  blanks,
  mode,
  filledAnswers,
  activeBlankId,
  onBlankActivate,
  onBlankFill,
  onBlankClear,
  showResult,
}: FillBlankProps) {
  const segments = template.split("___");
  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

  return (
    <div
      className="inline-flex flex-wrap items-center gap-2 rounded-lg p-2"
      aria-live="polite"
      role="group"
      aria-label="Fill in the blank activity"
    >
      {segments.map((seg, i) => (
        <span key={i}>
          <span className="text-xl text-slate-text">{seg}</span>
          {i < sortedBlanks.length && (
            <BlankSlot
              blank={sortedBlanks[i]}
              index={i}
              mode={mode}
              filledAnswers={filledAnswers}
              activeBlankId={activeBlankId}
              onBlankActivate={onBlankActivate}
              onBlankFill={onBlankFill}
              onBlankClear={onBlankClear}
              showResult={showResult}
            />
          )}
        </span>
      ))}
    </div>
  );
}
