import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { isHexColor, normalizeHex } from "../../lib/color";
import { useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";

export const ColorControls = () => {
  const colors = useGradientStore((state) => state.colors);
  const setColorHex = useGradientStore((state) => state.setColorHex);
  const setColorRange = useGradientStore((state) => state.setColorRange);
  const addColor = useGradientStore((state) => state.addColor);
  const removeColor = useGradientStore((state) => state.removeColor);
  const reorderColor = useGradientStore((state) => state.reorderColor);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <PanelSection
      title="Color"
      action={
        <button
          type="button"
          className="icon-button"
          title="Add color"
          onClick={addColor}
          disabled={colors.length >= 3}
        >
          <Plus size={15} />
        </button>
      }
    >
      {colors.map((color, index) => {
        const pickerValue = isHexColor(color.hex) ? normalizeHex(color.hex) : "#000000";
        return (
          <div
            key={color.id}
            className="rounded-md border border-line bg-[#15161a] p-3"
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) {
                reorderColor(dragIndex, index);
              }
              setDragIndex(null);
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <GripVertical size={16} className="shrink-0 text-muted" />
              <input
                type="color"
                value={pickerValue}
                className="h-8 w-10 cursor-pointer rounded border border-line bg-transparent"
                onChange={(event) => setColorHex(color.id, event.target.value)}
                title={`Color ${index + 1}`}
              />
              <input
                value={color.hex}
                spellCheck={false}
                className="min-w-0 flex-1 rounded border border-line bg-[#101115] px-2 py-1.5 font-mono text-xs uppercase text-ink outline-none focus:border-accent"
                onChange={(event) => setColorHex(color.id, event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                title="Remove color"
                onClick={() => removeColor(color.id)}
                disabled={colors.length <= 1}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <RangeControl
                label="Start"
                min={0}
                max={100}
                value={color.start}
                unit="%"
                onChange={(value) => setColorRange(color.id, "start", value)}
              />
              <RangeControl
                label="End"
                min={0}
                max={100}
                value={color.end}
                unit="%"
                onChange={(value) => setColorRange(color.id, "end", value)}
              />
              <RangeControl
                label="Intensity"
                min={0}
                max={2}
                step={0.01}
                value={color.intensity}
                onChange={(value) => setColorRange(color.id, "intensity", value)}
              />
            </div>
          </div>
        );
      })}
    </PanelSection>
  );
};
