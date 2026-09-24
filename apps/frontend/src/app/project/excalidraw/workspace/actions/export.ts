import {
  exportToBlob,
  exportToSvg,
} from "@excalidraw/excalidraw";

import type {
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

/**
 * 將目前畫布匯出成 PNG 圖片。
 *
 * api：
 * Excalidraw 的操作 API。
 *
 * name：
 * 下載檔案名稱，不需要包含副檔名。
 */
export async function exportPng(
  api: ExcalidrawImperativeAPI,
  name = "canvas",
) {
  // 將目前畫布元素轉換成 PNG Blob。
  const blob = await exportToBlob({
    elements: api.getSceneElements(),
    appState: api.getAppState(),
    files: api.getFiles(),
    mimeType: "image/png",
  });

  // 下載 PNG 檔案。
  downloadBlob(blob, `${name}.png`);
}

/**
 * 將目前畫布匯出成 SVG 圖片。
 */
export async function exportSvg(
  api: ExcalidrawImperativeAPI,
  name = "canvas",
) {
  // 將目前畫布元素轉換成 SVG DOM。
  const svg = await exportToSvg({
    elements: api.getSceneElements(),
    appState: api.getAppState(),
    files: api.getFiles(),
  });

  // 將 SVG DOM 轉成 Blob。
  const blob = new Blob(
    [svg.outerHTML],
    {
      type: "image/svg+xml",
    },
  );

  // 下載 SVG 檔案。
  downloadBlob(blob, `${name}.svg`);
}

/**
 * 通用 Blob 下載工具。
 *
 * PNG、SVG、JSON 等檔案都可以使用。
 */
function downloadBlob(
  blob: Blob,
  filename: string,
) {
  // 建立暫時的 Blob URL。
  const url = URL.createObjectURL(blob);

  // 建立隱藏下載連結。
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // 觸發瀏覽器下載。
  link.click();

  // 釋放暫時建立的 URL，避免記憶體浪費。
  URL.revokeObjectURL(url);
}