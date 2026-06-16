import { AnimationControls } from "./controls/AnimationControls";
import { ColorControls } from "./controls/ColorControls";
import { GradientControls } from "./controls/GradientControls";
import { NoiseControls } from "./controls/NoiseControls";
import { TurbulenceControls } from "./controls/TurbulenceControls";

export const LeftSidebar = () => (
  <aside className="side-panel border-r border-line">
    <div className="border-b border-line px-4 py-4">
      <h1 className="text-sm font-semibold text-ink">Gradient Motion Studio</h1>
      <p className="mt-1 text-xs text-muted">MV / VJ / Motion Graphics</p>
    </div>
    <ColorControls />
    <GradientControls />
    <NoiseControls />
    <TurbulenceControls />
    <AnimationControls />
  </aside>
);
