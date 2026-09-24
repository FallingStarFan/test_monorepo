// hooks/useSaveCanvas.ts

import { useMutation } from "@tanstack/react-query";
import {
    saveCanvasApi,
    type SaveCanvasRequest,
} from "../../../../../api/canvas-api";

export function useSaveCanvas() {
  return useMutation({
    mutationFn: (data: SaveCanvasRequest) =>
      saveCanvasApi(data),
  });
}