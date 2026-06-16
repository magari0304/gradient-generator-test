import type { MutableRefObject } from "react";
import { useState } from "react";
import { FileImage, Film, ImageDown } from "lucide-react";
import { exportMp4, type VideoExportProgress } from "../../lib/exporters";
import { downloadBlob, renderStill } from "../../lib/renderFrame";
import { selectRenderConfig, useGradientStore } from "../../store/gradientStore";
import { PanelSection } from "../ui/PanelSection";
import { RangeControl } from "../ui/RangeControl";
import { SegmentedControl } from "../ui/SegmentedControl";

interface ExportControlsProps {
  timeRef: MutableRefObject<number>;
}

export const ExportControls = ({ timeRef }: ExportControlsProps) => {
  const exportSettings = useGradientStore((state) => state.exportSettings);
  const setExport = useGradientStore((state) => state.setExport);
  const [progress, setProgress] = useState<VideoExportProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const renderConfig = () => selectRenderConfig(useGradientStore.getState());

  const exportImage = async (mimeType: "image/png" | "image/jpeg") => {
    setBusy(true);
    setError("");
    try {
      const extension = mimeType === "image/png" ? "png" : "jpg";
      const blob = await renderStill(
        renderConfig(),
        timeRef.current,
        mimeType,
        exportSettings.quality / 100,
      );
      downloadBlob(blob, `gradient-motion-${Date.now()}.${extension}`);
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Image export failed.");
    } finally {
      setBusy(false);
    }
  };

  const exportVideo = async () => {
    setBusy(true);
    setError("");
    try {
      const blob = await exportMp4(renderConfig(), exportSettings, setProgress);
      downloadBlob(blob, `gradient-motion-${Date.now()}.mp4`);
    } catch (videoError) {
      setError(videoError instanceof Error ? videoError.message : "MP4 export failed.");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 1400);
    }
  };

  return (
    <PanelSection title="Export">
      <SegmentedControl<24 | 30 | 60>
        value={exportSettings.fps}
        options={[
          { label: "24", value: 24 },
          { label: "30", value: 30 },
          { label: "60", value: 60 },
        ]}
        onChange={(value) => setExport("fps", value)}
      />
      <RangeControl
        label="Duration"
        min={1}
        max={20}
        step={0.5}
        unit=" s"
        value={exportSettings.duration}
        onChange={(value) => setExport("duration", value)}
      />
      <RangeControl
        label="Quality"
        min={1}
        max={100}
        value={exportSettings.quality}
        onChange={(value) => setExport("quality", value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="command-button"
          disabled={busy}
          onClick={() => exportImage("image/png")}
        >
          <ImageDown size={15} />
          PNG
        </button>
        <button
          type="button"
          className="command-button"
          disabled={busy}
          onClick={() => exportImage("image/jpeg")}
        >
          <FileImage size={15} />
          JPEG
        </button>
      </div>
      <button type="button" className="command-button w-full" disabled={busy} onClick={exportVideo}>
        <Film size={15} />
        MP4
      </button>
      {progress ? (
        <div className="space-y-2 rounded-md border border-line bg-[#15161a] p-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#292c34]">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${Math.round(progress.progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted">{progress.message}</p>
        </div>
      ) : null}
      {error ? <p className="text-xs text-[#ff8f8f]">{error}</p> : null}
    </PanelSection>
  );
};
