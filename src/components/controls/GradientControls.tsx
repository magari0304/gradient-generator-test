import { gradientTypeLabels, useGradientStore } from "../../store/gradientStore";
import type { GradientType } from "../../types";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";
import { SegmentedControl } from "../ui/SegmentedControl";

export const GradientControls = () => {
  const gradient = useGradientStore((state) => state.gradient);
  const setGradient = useGradientStore((state) => state.setGradient);

  return (
    <PanelSection title="Gradient">
      <SegmentedControl<GradientType>
        value={gradient.type}
        options={gradientTypeLabels}
        onChange={(value) => setGradient("type", value)}
      />
      <RangeControl
        label="Angle"
        min={0}
        max={360}
        value={gradient.angle}
        unit=" deg"
        onChange={(value) => setGradient("angle", value)}
      />
      <RangeControl
        label="Center X"
        min={0}
        max={1}
        step={0.01}
        value={gradient.centerX}
        onChange={(value) => setGradient("centerX", value)}
      />
      <RangeControl
        label="Center Y"
        min={0}
        max={1}
        step={0.01}
        value={gradient.centerY}
        onChange={(value) => setGradient("centerY", value)}
      />
      <RangeControl
        label="Blend"
        min={0}
        max={100}
        value={gradient.softness}
        unit="%"
        onChange={(value) => setGradient("softness", value)}
      />
    </PanelSection>
  );
};
