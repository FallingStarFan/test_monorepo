"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type {
    AppState,
    ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import "@excalidraw/excalidraw/index.css";
import "./excalidraw.css";

import { PropertiesPanel } from "./components/Sidebar/PropertiesPannel/PropertiesPanel";
import { excalidrawOptions } from "./excalidraw-options";
import { Sidebar } from "./components/Sidebar/Sidebar";

import type { CanvasController } from "./types/CanvasController";
import type { CanvasState } from "./types/CanvasState";
import { DevPanel } from "./components/Sidebar/PropertiesPannel/DevPannel/DevPanel";
import { isDevMode } from "@/lib/environment";

const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then(
      (module) => module.Excalidraw,
    ),
  {
    ssr: false,
  },
);

const ExcalidrawSidebar = dynamic(
  () =>
    import("@excalidraw/excalidraw").then(
      (module) => module.Sidebar,
    ),
  {
    ssr: false,
  },
);

type ExcalidrawBodyProps = {
  initialData: {
    appState: {
      openSidebar: {
        name: "properties";
      };
    };
  };

  onReady?: (
    api: ExcalidrawImperativeAPI,
  ) => void;

  onStateChange?: (
    appState: AppState,
    elements: readonly ExcalidrawElement[],
  ) => void;

  controller?: CanvasController | null;

  state: CanvasState;
};

export default function ExcalidrawBody({
  initialData,
  onReady,
  onStateChange,
  controller,
  state,
}: ExcalidrawBodyProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-full">
      <Excalidraw
        {...excalidrawOptions}
        initialData={initialData}
        excalidrawAPI={onReady}
        onChange={(elements, appState) => {
          onStateChange?.(appState, elements);
        }}
      >
        <ExcalidrawSidebar
          name="properties"
          docked={true}
        >
          <Sidebar 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Properties"
          >
            <div className="p-4">
              <h2 className="text-sm font-semibold">
                Properties
              </h2>

              {controller && (
                <PropertiesPanel
                  controller={controller}
                  state={state}
                />
              )}
              {controller && isDevMode && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold">
                    Dev Panel
                  </h2>
                  <DevPanel
                    controller={controller}
                    state={state}
                  />
                </div>
              )}
            </div>
          </Sidebar>
        </ExcalidrawSidebar>
      </Excalidraw>
    </div>
  );
}