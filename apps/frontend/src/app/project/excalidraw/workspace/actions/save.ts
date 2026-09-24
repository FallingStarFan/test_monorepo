import type {
  CanvasDocument,
  CanvasSaveType,
} from "../types";

/**
 * 將 CanvasDocument 儲存到瀏覽器 localStorage。
 *
 * 適合先做 MVP。
 * 如果資料量變大，之後可以換成 IndexedDB，
 * 上層呼叫方式不需要改變。
 */
export function saveLocal(
  canvasDocument: CanvasDocument,
) {
  localStorage.setItem(
    "canvas-document",
    JSON.stringify(canvasDocument),
  );
}

/**
 * 將 CanvasDocument 匯出成 JSON 檔案。
 */
export function saveJson(
  canvasDocument: CanvasDocument,
  name = "canvas",
) {
  // 將 CanvasDocument 轉成格式化 JSON 字串。
  const json = JSON.stringify(
    canvasDocument,
    null,
    2,
  );

  // 將 JSON 字串建立成檔案 Blob。
  const blob = new Blob(
    [json],
    {
      type: "application/json",
    },
  );

  // 建立暫時下載 URL。
  const url = URL.createObjectURL(blob);

  // 建立下載連結。
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.json`;

  // 觸發下載。
  link.click();

  // 釋放暫時 URL。
  URL.revokeObjectURL(url);
}

/**
 * 根據不同儲存類型執行對應的儲存行為。
 *
 * cloud：
 * 之後交給 React Query API。
 *
 * image：
 * 之後交給 Excalidraw export API。
 */
export function saveCanvas(
  type: CanvasSaveType,
  canvasDocument: CanvasDocument,
) {
  switch (type) {
    case "local":
      return saveLocal(canvasDocument);

    case "json":
      return saveJson(canvasDocument);

    case "cloud":
      // 這裡之後接 useSaveCanvas() 的 mutateAsync。
      return;

    case "image":
      // 這裡之後接 exportPng() 或 exportSvg()。
      return;
  }
}