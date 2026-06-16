import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { CheckSquare, Minus, Plus, Square } from "lucide-react";
import { useGradientRenderer } from "../hooks/useGradientRenderer";
import { useGradientStore } from "../store/gradientStore";

interface PreviewStageProps {
  timeRef: MutableRefObject<number>;
}

export const PreviewStage = ({ timeRef }: PreviewStageProps) => {
  const { canvasRef, fps } = useGradientRenderer(timeRef);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [availableWidth, setAvailableWidth] = useState(900);
  const canvas = useGradientStore((state) => state.canvas);
  const setCanvas = useGradientStore((state) => state.setCanvas);
  const aspect = `${canvas.width} / ${canvas.height}`;
  const baseWidth = Math.min(canvas.width, 1180);
  const fitWidth = Math.max(260, availableWidth - 64);
  const displayWidth = Math.max(
    260,
    Math.round(Math.min(baseWidth * canvas.zoom, fitWidth * Math.max(1, canvas.zoom))),
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[#111216]">
      <div className="flex min-h-12 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Preview</span>
          <span className="rounded border border-line bg-[#18191e] px-2 py-1 text-xs tabular-nums text-ink">
            {canvas.width} x {canvas.height}
          </span>
          <span className="rounded border border-line bg-[#18191e] px-2 py-1 text-xs tabular-nums text-accent">
            {fps} FPS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="icon-button"
            title="Zoom out"
            onClick={() => setCanvas("zoom", Math.max(0.25, canvas.zoom - 0.1))}
          >
            <Minus size={15} />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-muted">
            {Math.round(canvas.zoom * 100)}%
          </span>
          <button
            type="button"
            className="icon-button"
            title="Zoom in"
            onClick={() => setCanvas("zoom", Math.min(2.5, canvas.zoom + 0.1))}
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            className="icon-button"
            title="Checker"
            onClick={() => setCanvas("checker", !canvas.checker)}
          >
            {canvas.checker ? <CheckSquare size={15} /> : <Square size={15} />}
          </button>
        </div>
      </div>
      <div className="preview-scroll" ref={scrollRef}>
        <div
          className={`preview-frame ${canvas.checker ? "checker-bg" : ""}`}
          style={{ width: `${displayWidth}px`, aspectRatio: aspect }}
        >
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      </div>
    </main>
  );
};
