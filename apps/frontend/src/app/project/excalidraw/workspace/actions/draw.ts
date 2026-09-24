import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ToolType } from "@excalidraw/excalidraw/types";

export function setTool(
  api: ExcalidrawImperativeAPI,
  tool: ToolType,
) {
  api.setActiveTool({
    type: tool,
  });
}