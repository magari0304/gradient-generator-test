interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export const Toggle = ({ checked, label, onChange }: ToggleProps) => (
  <button
    type="button"
    className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-[#15161a] px-3 py-2 text-left text-xs text-ink transition hover:border-[#4a4e59]"
    aria-pressed={checked}
    onClick={() => onChange(!checked)}
  >
    <span>{label}</span>
    <span
      className={`relative h-5 w-9 rounded-full border transition ${
        checked ? "border-accent bg-accent/35" : "border-[#454953] bg-[#24262d]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-ink transition ${
          checked ? "left-4" : "left-0.5"
        }`}
      />
    </span>
  </button>
);
