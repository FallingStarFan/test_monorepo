import { CanvasWorkspace } from "./workspace/CanvasWorkspace";

export default function ExcalidrawPage() {
  return (
    <div className="h-screen flex flex-col">
      <CanvasWorkspace/>
    </div>
  );
}

export const dynamic = 'force-dynamic';
