// api/canvas-api.ts

import { CanvasDocument } from "@/app/project/excalidraw/workspace/types";


export type SaveCanvasRequest = {
  id?: string;
  name: string;
  document: CanvasDocument;
};

export type SaveCanvasResponse = {
  id: string;
  name: string;
  updatedAt: string;
};

export async function saveCanvasApi(
  data: SaveCanvasRequest,
): Promise<SaveCanvasResponse> {
  const response = await fetch("/api/canvas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save canvas");
  }

  return response.json();
}