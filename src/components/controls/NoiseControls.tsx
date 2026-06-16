import { useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";
import { Toggle } from "../ui/Toggle";

export const NoiseControls = () => {
  const noise = useGradientStore((state) => state.noise);
  const setNoise = useGradientStore((state) => state.setNoise);

  return (
    <PanelSection title="Noise">
      <Toggle checked={noise.enabled} label="Enabled" onChange={(value) => setNoise("enabled", value)} />
      <RangeControl
        label="Amount"
        min={0}
        max={100}
        value={noise.amount}
        onChange={(value) => setNoise("amount", value)}
      />
      <RangeControl
        label="Scale"
        min={0.4}
        max={8}
        step={0.05}
        value={noise.scale}
        onChange={(value) => setNoise("scale", value)}
      />
      <Toggle
        checked={noise.monochrome}
        label="Monochrome"
        onChange={(value) => setNoise("monochrome", value)}
      />
      <Toggle checked={noise.animate} label="Animate" onChange={(value) => setNoise("animate", value)} />
      <RangeControl
        label="Animation Speed"
        min={0}
        max={4}
        step={0.01}
        value={noise.speed}
        onChange={(value) => setNoise("speed", value)}
      />
    </PanelSection>
  );
};
