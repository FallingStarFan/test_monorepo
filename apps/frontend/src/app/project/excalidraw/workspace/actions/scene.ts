import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/**
 * 清空目前畫布上的所有元素。
 *
 * 注意：
 * resetScene() 會重置場景，
 * 但不代表一定會清除 undo/redo 歷史。
 */
export function clearCanvas(
  api: ExcalidrawImperativeAPI,
) {
  api.resetScene();
}



export function showCanvasData(
  api: ExcalidrawImperativeAPI,
) {
  return api.getSceneElements();
}

/**
 * 清空畫布，並且清除 undo/redo 歷史。
 *
 * 適合用在「建立新畫布」之類的功能。
 */
export function clearCanvasAndHistory(
  api: ExcalidrawImperativeAPI,
) {
  api.resetScene();
  api.history.clear();
}