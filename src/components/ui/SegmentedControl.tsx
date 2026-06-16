interface SegmentedOption<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string | number>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) => (
  <div className="grid rounded-md border border-line bg-[#141519] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={`min-h-8 rounded px-2 text-xs transition ${
          option.value === value
            ? "bg-[#31343d] text-ink shadow-insetPanel"
            : "text-muted hover:bg-[#24262d] hover:text-ink"
        }`}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);
