import { canvasPresets, useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";

export const CanvasControls = () => {
  const canvas = useGradientStore((state) => state.canvas);
  const setCanvas = useGradientStore((state) => state.setCanvas);
  const setCanvasSize = useGradientStore((state) => state.setCanvasSize);

  return (
    <PanelSection title="Output Size">
      <div className="grid grid-cols-2 gap-2">
        {canvasPresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`preset-button ${
              canvas.width === preset.width && canvas.height === preset.height ? "is-active" : ""
            }`}
            onClick={() => setCanvasSize(preset.width, preset.height)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1.5">
          <span className="text-xs text-muted">Width</span>
          <input
            className="field"
            type="number"
            min={64}
            max={7680}
            value={canvas.width}
            onChange={(event) => setCanvasSize(Number(event.target.value), canvas.height)}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs text-muted">Height</span>
          <input
            className="field"
            type="number"
            min={64}
            max={7680}
            value={canvas.height}
            onChange={(event) => setCanvasSize(canvas.width, Number(event.target.value))}
          />
        </label>
      </div>
      <RangeControl
        label="Preview Zoom"
        min={0.25}
        max={2.5}
        step={0.01}
        value={canvas.zoom}
        onChange={(value) => setCanvas("zoom", value)}
      />
    </PanelSection>
  );
};
