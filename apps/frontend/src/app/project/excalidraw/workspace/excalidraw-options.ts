import type { ExcalidrawProps } from "@excalidraw/excalidraw/types";


export const excalidrawOptions: ExcalidrawProps = {
  UIOptions: {
    canvasActions: {
      changeViewBackgroundColor: false,
      clearCanvas: false,
      export: false,
      loadScene: false,
      saveToActiveFile: false,
      saveAsImage: false,
      toggleTheme: true,
    },
 
  },
};