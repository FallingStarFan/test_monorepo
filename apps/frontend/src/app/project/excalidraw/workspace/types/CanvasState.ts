import type {
  AppState,

} from "@excalidraw/excalidraw/types";

import type { CanvasTool } from "./CanvasTool";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export type CanvasState = {
  // Tool
  activeTool: CanvasTool;

  // Current properties
  strokeColor: string;
  backgroundColor: string;

  strokeWidth: ExcalidrawElement["strokeWidth"];
  strokeStyle: ExcalidrawElement["strokeStyle"];
  fillStyle: ExcalidrawElement["fillStyle"];

  sloppiness: AppState["currentItemRoughness"];
  opacity: AppState["currentItemOpacity"];

  // Selection
  selectedElementId: string | null;
};