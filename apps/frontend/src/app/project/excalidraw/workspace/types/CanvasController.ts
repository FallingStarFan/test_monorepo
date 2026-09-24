import type {
  AppState,
} from "@excalidraw/excalidraw/types";

import type { CanvasExportFormat } from "./CanvasExportFormat";
import type { CanvasSaveType } from "./CanvasSaveType";
import type { CanvasTool } from "./CanvasTool";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export type CanvasController = {
  // ========================================
  // Document
  // ========================================

  create: () => void;

  save: (type: CanvasSaveType) => void;

  load: () => void;

  // ========================================
  // Tool
  // ========================================

  setTool: (tool: CanvasTool) => void;

  // ========================================
  // Style
  // ========================================

  setStrokeColor: (
    color: string,
  ) => void;

  setBackgroundColor: (
    color: string,
  ) => void;

  setStrokeWidth: (
    width: ExcalidrawElement["strokeWidth"],
  ) => void;

  setStrokeStyle: (
    style: ExcalidrawElement["strokeStyle"],
  ) => void;

  setFillStyle: (
    style: ExcalidrawElement["fillStyle"],
  ) => void;

  setSloppiness: (
    value: AppState["currentItemRoughness"],
  ) => void;

  setOpacity: (
    value: AppState["currentItemOpacity"],
  ) => void;

  // ========================================
  // History
  // ========================================

  undo: () => void;

  redo: () => void;

  // ========================================
  // Clipboard
  // ========================================

  copy: () => void;

  cut: () => void;

  paste: () => void;

  // ========================================
  // View
  // ========================================

  zoomIn: () => void;

  zoomOut: () => void;

  zoomToFit: () => void;

  // ========================================
  // Output
  // ========================================

  export: (
    format: CanvasExportFormat,
  ) => void;

  // ========================================
  // Page
  // ========================================

  createPage: () => void;

  deletePage: () => void;

  renamePage: (
    name: string,
  ) => void;

  switchPage: (
    pageId: string,
  ) => void;

  // ========================================
  // Layer
  // ========================================

    moveLayerUp(): void;
    moveLayerDown(): void;

    moveLayerToTop(): void;
    moveLayerToBottom(): void;

  // ========================================
  // Collaboration
  // ========================================

  connect: () => void;

  disconnect: () => void;
};