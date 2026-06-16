interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const RangeControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: RangeControlProps) => (
  <label className="grid gap-1.5">
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums text-ink">
        {Number.isInteger(step) ? value.toFixed(0) : value.toFixed(2)}
        {unit}
      </span>
    </div>
    <input
      className="control-range"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
);
