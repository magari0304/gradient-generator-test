import { Download, Save, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { createPresetPayload, downloadJson, readPresetFile } from "../../lib/preset";
import { selectRenderConfig, useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";

export const PresetControls = () => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("New Preset");
  const [error, setError] = useState("");
  const savedPresets = useGradientStore((state) => state.savedPresets);
  const exportSettings = useGradientStore((state) => state.exportSettings);
  const savePreset = useGradientStore((state) => state.savePreset);
  const removePreset = useGradientStore((state) => state.removePreset);
  const applyPreset = useGradientStore((state) => state.applyPreset);
  const currentPayload = useMemo(
    () =>
      createPresetPayload(
        name.trim() || "Gradient Preset",
        selectRenderConfig(useGradientStore.getState()),
        exportSettings,
      ),
    [exportSettings, name],
  );

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const preset = await readPresetFile(file);
      applyPreset(preset);
      savePreset(preset);
      setError("");
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <PanelSection title="Presets">
      <div className="flex gap-2">
        <input
          className="field min-w-0 flex-1"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="button"
          className="icon-button"
          title="Save preset"
          onClick={() => savePreset(currentPayload)}
        >
          <Save size={15} />
        </button>
        <button
          type="button"
          className="icon-button"
          title="Export JSON"
          onClick={() => downloadJson(currentPayload)}
        >
          <Download size={15} />
        </button>
        <button
          type="button"
          className="icon-button"
          title="Import JSON"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={15} />
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
      {error ? <p className="text-xs text-[#ff8f8f]">{error}</p> : null}
      <div className="space-y-2">
        {savedPresets.map((preset) => (
          <div
            key={preset.createdAt}
            className="flex items-center gap-2 rounded-md border border-line bg-[#15161a] px-2 py-2"
          >
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left text-xs text-ink"
              onClick={() => applyPreset(preset)}
              title={preset.name}
            >
              {preset.name}
            </button>
            <button
              type="button"
              className="icon-button"
              title="Delete preset"
              onClick={() => removePreset(preset.createdAt)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </PanelSection>
  );
};
