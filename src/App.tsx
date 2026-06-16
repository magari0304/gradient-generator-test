import { useRef } from "react";
import { LeftSidebar } from "./components/LeftSidebar";
import { PreviewStage } from "./components/PreviewStage";
import { RightSidebar } from "./components/RightSidebar";

const App = () => {
  const previewTimeRef = useRef(0);

  return (
    <div className="app-shell">
      <LeftSidebar />
      <PreviewStage timeRef={previewTimeRef} />
      <RightSidebar timeRef={previewTimeRef} />
    </div>
  );
};

export default App;
