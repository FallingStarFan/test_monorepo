"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { Toolbar } from "./components/Toolbar/Toolbar";
import { ExcalidrawController } from "./controller/ExcalidrawController";

import type { CanvasController } from "./types/CanvasController";
import type { CanvasState } from "./types/CanvasState";
import type { CanvasTool } from "./types/CanvasTool";

import ExcalidrawBody from "./ExcalidrawBody";

export function CanvasWorkspace() {
  const [controller, setController] =
    useState<CanvasController | null>(null);

  const [state, setState] =
    useState<CanvasState>({
      activeTool: "selection",

      strokeColor: "#000000",
      backgroundColor: "#ffffff",

      strokeWidth: 1,
      strokeStyle: "solid",
      fillStyle: "hachure",

      sloppiness: 1,
      opacity: 100,

      selectedElementId: null,
    });

  const initialData = useMemo(
    () => ({
      appState: {
        openSidebar: {
          name: "properties" as const,
        },
      },
    }),
    [],
  );

  const updateCanvasState = useCallback(
    (
      appState: AppState,
      elements: readonly ExcalidrawElement[],
    ) => {
      const selectedIds =
        appState.selectedElementIds;

      const selectedElement =
        elements.find(
          (element) => selectedIds[element.id],
        );

      setState((prev) => {
        // ========================================
        // 沒有選取物件
        // 使用 Excalidraw currentItem*
        // ========================================

        if (!selectedElement) {
          const nextState = {
            ...prev,

            strokeColor:
              appState.currentItemStrokeColor,

            backgroundColor:
              appState.currentItemBackgroundColor,

            strokeWidth:
              appState.currentItemStrokeWidth,

            strokeStyle:
              appState.currentItemStrokeStyle,

            fillStyle:
              appState.currentItemFillStyle,

            sloppiness:
              appState.currentItemRoughness,

            opacity:
              appState.currentItemOpacity,

            selectedElementId: null,
          };

          if (
            prev.strokeColor ===
              nextState.strokeColor &&
            prev.backgroundColor ===
              nextState.backgroundColor &&
            prev.strokeWidth ===
              nextState.strokeWidth &&
            prev.strokeStyle ===
              nextState.strokeStyle &&
            prev.fillStyle ===
              nextState.fillStyle &&
            prev.sloppiness ===
              nextState.sloppiness &&
            prev.opacity ===
              nextState.opacity &&
            prev.selectedElementId === null
          ) {
            return prev;
          }

          return nextState;
        }

        // ========================================
        // 有選取物件
        // 使用 selected element properties
        // ========================================

        const nextState = {
          ...prev,

          strokeColor:
            selectedElement.strokeColor,

          backgroundColor:
            selectedElement.backgroundColor,

          strokeWidth:
            selectedElement.strokeWidth,

          strokeStyle:
            selectedElement.strokeStyle,

          fillStyle:
            selectedElement.fillStyle,

          sloppiness:
            selectedElement.roughness,

          opacity:
            selectedElement.opacity,

          selectedElementId:
            selectedElement.id,
        };

        if (
          prev.strokeColor ===
            nextState.strokeColor &&
          prev.backgroundColor ===
            nextState.backgroundColor &&
          prev.strokeWidth ===
            nextState.strokeWidth &&
          prev.strokeStyle ===
            nextState.strokeStyle &&
          prev.fillStyle ===
            nextState.fillStyle &&
          prev.sloppiness ===
            nextState.sloppiness &&
          prev.opacity ===
            nextState.opacity &&
          prev.selectedElementId ===
            nextState.selectedElementId
        ) {
          return prev;
        }

        return nextState;
      });
    },
    [],
  );

  const handleReady = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      const nextController =
        new ExcalidrawController(api);

      setController(nextController);

      updateCanvasState(
        api.getAppState(),
        api.getSceneElements(),
      );
    },
    [updateCanvasState],
  );

  const handleStateChange = useCallback(
    (
      appState: AppState,
      elements: readonly ExcalidrawElement[],
    ) => {
      updateCanvasState(
        appState,
        elements,
      );
    },
    [updateCanvasState],
  );

  const handleToolChange = useCallback(
    (tool: CanvasTool) => {
      if (!controller) {
        return;
      }

      controller.setTool(tool);

      setState((prev) => {
        if (prev.activeTool === tool) {
          return prev;
        }

        return {
          ...prev,
          activeTool: tool,
        };
      });
    },
    [controller],
  );

  // ========================
  // 新增的處理方法：當透過 controller 修改屬性時，同步更新 state
  // ========================
  const updateStateFromController = useCallback(
    (updatedState: Partial<CanvasState>) => {
      setState(prev => ({
        ...prev,
        ...updatedState
      }));
    },
    []
  );

  return (
    <div className="canvas-workspace relative flex h-full flex-col">
      <ExcalidrawBody
        initialData={initialData}
        onReady={handleReady}
        onStateChange={handleStateChange}
        controller={controller}
        state={state}
      />

      <Toolbar
        activeTool={state.activeTool}
        onToolChange={handleToolChange}
      />
    </div>
  );
}