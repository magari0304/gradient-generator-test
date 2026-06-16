import { Pause, Play } from "lucide-react";
import { useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";
import { Toggle } from "../ui/Toggle";

export const AnimationControls = () => {
  const animation = useGradientStore((state) => state.animation);
  const setAnimation = useGradientStore((state) => state.setAnimation);

  return (
    <PanelSection
      title="Animation"
      action={
        <button
          type="button"
          className="icon-button"
          title={animation.playing ? "Pause" : "Play"}
          onClick={() => setAnimation("playing", !animation.playing)}
        >
          {animation.playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
      }
    >
      <Toggle checked={animation.loop} label="Loop" onChange={(value) => setAnimation("loop", value)} />
      <RangeControl
        label="Speed"
        min={0}
        max={4}
        step={0.01}
        value={animation.speed}
        onChange={(value) => setAnimation("speed", value)}
      />
      <Toggle
        checked={animation.colorMotion}
        label="Color Motion"
        onChange={(value) => setAnimation("colorMotion", value)}
      />
      <Toggle
        checked={animation.noiseMotion}
        label="Noise Motion"
        onChange={(value) => setAnimation("noiseMotion", value)}
      />
      <Toggle
        checked={animation.turbulentEvolution}
        label="Turbulent Evolution"
        onChange={(value) => setAnimation("turbulentEvolution", value)}
      />
    </PanelSection>
  );
};
