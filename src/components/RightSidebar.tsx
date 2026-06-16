import type { MutableRefObject } from "react";
import { CanvasControls } from "./controls/CanvasControls";
import { ExportControls } from "./controls/ExportControls";
import { PresetControls } from "./controls/PresetControls";

interface RightSidebarProps {
  timeRef: MutableRefObject<number>;
}

export const RightSidebar = ({ timeRef }: RightSidebarProps) => (
  <aside className="side-panel border-l border-line">
    <CanvasControls />
    <PresetControls />
    <ExportControls timeRef={timeRef} />
  </aside>
);
