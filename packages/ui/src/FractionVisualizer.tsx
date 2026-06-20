import { cn } from './utils';

export interface FractionVisualizerCompare {
  numerator: number;
  denominator: number;
}

export interface FractionVisualizerProps {
  numerator: number;
  denominator: number;
  mode?: 'bar' | 'circle';
  label?: string;
  showLabel?: boolean;
  interactive?: boolean;
  maxDenominator?: number;
  compare?: FractionVisualizerCompare;
  onShade?: (shaded: number) => void;
  className?: string;
}

function FractionBar({
  denominator,
  shaded,
  interactive,
  onShade,
}: {
  denominator: number;
  shaded: number;
  interactive?: boolean;
  onShade?: (shaded: number) => void;
}) {
  const parts = Array.from({ length: denominator }, (_, i) => i);
  const width = 300;
  const partWidth = width / denominator;

  return (
    <svg
      width={width}
      height={60}
      role="img"
      aria-label={`${shaded} out of ${denominator} parts shaded`}
      className="overflow-visible"
    >
      {parts.map((i) => (
        <rect
          key={i}
          x={i * partWidth}
          y={0}
          width={Math.max(partWidth - 1, 1)}
          height={60}
          fill={i < shaded ? '#76A5AF' : '#F9F7F2'}
          stroke="#374151"
          strokeWidth={1}
          className={interactive ? 'cursor-pointer transition-opacity duration-200 hover:opacity-80' : ''}
          onClick={() => {
            if (interactive && onShade) {
              onShade(i < shaded ? shaded - 1 : shaded + 1);
            }
          }}
        />
      ))}
    </svg>
  );
}

function FractionCircle({
  denominator,
  shaded,
  interactive,
  onShade,
  size = 200,
}: {
  denominator: number;
  shaded: number;
  interactive?: boolean;
  onShade?: (shaded: number) => void;
  size?: number;
}) {
  const center = size / 2;
  const radius = center - 10;
  const parts = Array.from({ length: denominator }, (_, i) => i);

  function sectorPath(index: number): string {
    const startAngle = (index / denominator) * 360 - 90;
    const endAngle = ((index + 1) / denominator) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`${shaded} out of ${denominator} parts shaded`}
      className="overflow-visible"
    >
      {parts.map((i) => (
        <path
          key={i}
          d={sectorPath(i)}
          fill={i < shaded ? '#EBC06D' : '#F9F7F2'}
          stroke="#374151"
          strokeWidth={1}
          className={interactive ? 'cursor-pointer transition-opacity duration-200 hover:opacity-80' : ''}
          onClick={() => {
            if (interactive && onShade) {
              onShade(i < shaded ? shaded - 1 : shaded + 1);
            }
          }}
        />
      ))}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#374151" strokeWidth={2} />
      <circle cx={center} cy={center} r={4} fill="#374151" />
    </svg>
  );
}

export function FractionVisualizer({
  numerator,
  denominator,
  mode = 'bar',
  label,
  showLabel = false,
  interactive = false,
  maxDenominator = 12,
  compare,
  onShade,
  className,
}: FractionVisualizerProps) {
  const labelText = label ?? `${numerator}/${denominator}`;

  if (denominator > maxDenominator) {
    return (
      <div className={cn('flex items-center justify-center rounded-lg bg-warm-off-white p-4', className)} role="alert">
        <p className="text-base text-slate-text">Too many parts to show clearly</p>
      </div>
    );
  }

  function renderSingleFraction(_num: number, den: number, shaded: number) {
    return mode === 'circle' ? (
      <FractionCircle denominator={den} shaded={shaded} interactive={interactive} onShade={onShade} />
    ) : (
      <FractionBar denominator={den} shaded={shaded} interactive={interactive} onShade={onShade} />
    );
  }

  const isImproper = numerator > denominator && denominator > 1;
  const wholes = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {isImproper ? (
        <div className="flex items-center gap-2">
          {renderSingleFraction(wholes, 1, wholes)}
          <span className="text-xl text-slate-text">+</span>
          {renderSingleFraction(remainder, denominator, remainder)}
        </div>
      ) : (
        renderSingleFraction(numerator, denominator, numerator)
      )}

      {showLabel && (
        <p className="text-[20px] text-slate-text" aria-live="polite">
          {labelText}
        </p>
      )}

      {compare && (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            {mode === 'bar' ? (
              <FractionBar denominator={denominator} shaded={numerator} />
            ) : (
              <FractionCircle denominator={denominator} shaded={numerator} size={150} />
            )}
            <span className="text-sm text-slate-text">{numerator}/{denominator}</span>
          </div>
          <span className="text-2xl text-slate-text">=</span>
          <div className="flex flex-col items-center gap-1">
            {mode === 'bar' ? (
              <FractionBar denominator={compare.denominator} shaded={compare.numerator} />
            ) : (
              <FractionCircle denominator={compare.denominator} shaded={compare.numerator} size={150} />
            )}
            <span className="text-sm text-slate-text">{compare.numerator}/{compare.denominator}</span>
          </div>
        </div>
      )}
    </div>
  );
}
