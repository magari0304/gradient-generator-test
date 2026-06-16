import { Shuffle } from "lucide-react";
import { useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";

export const TurbulenceControls = () => {
  const turbulence = useGradientStore((state) => state.turbulence);
  const setTurbulence = useGradientStore((state) => state.setTurbulence);

  return (
    <PanelSection
      title="Turbulent"
      action={
        <button
          type="button"
          className="icon-button"
          title="Random seed"
          onClick={() => setTurbulence("seed", Math.round(Math.random() * 10000))}
        >
          <Shuffle size={14} />
        </button>
      }
    >
      <RangeControl
        label="Amount"
        min={0}
        max={100}
        value={turbulence.amount}
        onChange={(value) => setTurbulence("amount", value)}
      />
      <RangeControl
        label="Size"
        min={0.2}
        max={12}
        step={0.05}
        value={turbulence.size}
        onChange={(value) => setTurbulence("size", value)}
      />
      <RangeControl
        label="Complexity"
        min={1}
        max={8}
        value={turbulence.complexity}
        onChange={(value) => setTurbulence("complexity", value)}
      />
      <RangeControl
        label="Evolution Speed"
        min={0}
        max={3}
        step={0.01}
        value={turbulence.evolutionSpeed}
        onChange={(value) => setTurbulence("evolutionSpeed", value)}
      />
      <RangeControl
        label="Direction"
        min={0}
        max={360}
        value={turbulence.direction}
        unit=" deg"
        onChange={(value) => setTurbulence("direction", value)}
      />
      <label className="grid gap-1.5">
        <span className="text-xs text-muted">Random Seed</span>
        <input
          type="number"
          className="field"
          value={turbulence.seed}
          onChange={(event) => setTurbulence("seed", Number(event.target.value))}
        />
      </label>
    </PanelSection>
  );
};
