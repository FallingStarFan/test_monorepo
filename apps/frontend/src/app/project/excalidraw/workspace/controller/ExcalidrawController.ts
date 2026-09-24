import type { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import type { CanvasController } from "../types";
import type { CanvasTool } from "../types/CanvasTool";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import {
  setTool,
} from "../actions/draw";

import {
  setSelectedStrokeColor,
  setSelectedBackgroundColor,
  setSelectedStrokeWidth,
  setSelectedStrokeStyle,
  setSelectedFillStyle,
  setSelectedOpacity,
  setSelectedSloppiness,
} from "../actions/style";

import {
  setFillStyle,
  setStrokeWidth,
  setStrokeStyle,
} from "../actions/shape";

type AppStateUpdate = Partial<AppState>;

export class ExcalidrawController
  implements CanvasController
{
  constructor(
    private readonly api: ExcalidrawImperativeAPI,
  ) {}

  // ========================================
  // Document
  // ========================================

  create() {
    this.api.resetScene();
  }

  save() {}

  load() {}

  // ========================================
  // Tool
  // ========================================

  setTool(tool: CanvasTool) {
    setTool(this.api, tool);
  }

  // ========================================
  // Style
  // ========================================

  setStrokeColor(color: string) {
    setSelectedStrokeColor(
      this.api,
      color,
    );
  }

  setBackgroundColor(color: string) {
    setSelectedBackgroundColor(
      this.api,
      color,
    );
  }

  setStrokeWidth(width: number) {
    setStrokeWidth(
      this.api,
      width,
    );
  }

  setStrokeStyle(style: string) {
    setStrokeStyle(
      this.api,
      style,
    );
  }

  setFillStyle(style: string) {
    setFillStyle(
      this.api,
      style,
    );
  }
setSloppiness(value: number) {
  updateSelectedElements(
    this.api,
    (element) => ({
      ...element,
      roughness: value,
    }),
    {
      currentItemRoughness: value,
    },
  );
}

setOpacity(value: number) {
  updateSelectedElements(
    this.api,
    (element) => ({
      ...element,
      opacity: value,
    }),
    {
      currentItemOpacity: value,
    },
  );
}

  // ========================================
  // History
  // ========================================

  undo() {}

  redo() {}

  // ========================================
  // Clipboard
  // ========================================

  copy() {}

  cut() {}

  paste() {}

  // ========================================
  // View
  // ========================================

  zoomIn() {}

  zoomOut() {}

  zoomToFit() {}

  // ========================================
  // Output
  // ========================================

  export() {}

  // ========================================
  // Page
  // ========================================

  createPage() {}

  deletePage() {}

  renamePage() {}

  switchPage() {}

  // ========================================
  // Layer
  // ========================================

moveLayerUp() {}

moveLayerDown() {}

moveLayerToTop() {}

moveLayerToBottom() {}

  // ========================================
  // Collaboration
  // ========================================

  connect() {}

  disconnect() {}
}

function updateSelectedElements(
  api: ExcalidrawImperativeAPI,
  update: (
    element: ExcalidrawElement,
  ) => ExcalidrawElement,
  defaultAppState: AppStateUpdate,
) {
  const appState = api.getAppState();
  const elements = api.getSceneElements();

  const selectedIds =
    appState.selectedElementIds;

  const hasSelection =
    Object.keys(selectedIds).length > 0;

  // 沒有選取物件
  // → 修改之後建立物件的預設值
  if (!hasSelection) {
    api.updateScene({
      appState: {
        ...appState,
        ...defaultAppState,
      },
    });

    return;
  }

  // 有選取物件
  // → 修改目前選取的物件
  const updatedElements = elements.map(
    (element) => {
      if (!selectedIds[element.id]) {
        return element;
      }

      return update(element);
    },
  );

  api.updateScene({
    elements: updatedElements,
  });
}