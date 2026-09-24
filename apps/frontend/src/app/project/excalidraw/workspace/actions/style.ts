import type {
  ExcalidrawElement,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

/**
 * 修改目前選取的元素。
 *
 * 如果沒有選取元素，
 * 則只修改 Excalidraw 的目前工具預設值。
 */
function updateSelectedElements(
  api: ExcalidrawImperativeAPI,
  updater: (
    element: ExcalidrawElement,
  ) => ExcalidrawElement,
): boolean {
  const appState = api.getAppState();

  const selectedIds =
    appState.selectedElementIds;

  const hasSelection =
    Object.keys(selectedIds).length > 0;

  if (!hasSelection) {
    return false;
  }

  const elements =
    api.getSceneElements();

  const updatedElements = elements.map(
    (element) => {
      if (!selectedIds[element.id]) {
        return element;
      }

      return {
        ...updater(element),

        version: element.version + 1,

        versionNonce:
          Math.floor(
            Math.random() * 2 ** 31,
          ),
      };
    },
  );

  api.updateScene({
    elements: updatedElements,
  });

  return true;
}

/**
 * 設定線條顏色。
 *
 * 有選取元素：
 *   → 修改選取元素
 *
 * 沒有選取元素：
 *   → 修改之後新建立元素的預設顏色
 */
export function setSelectedStrokeColor(
  api: ExcalidrawImperativeAPI,
  color: string,
) {
  const updated =
    updateSelectedElements(
      api,
      (element) => ({
        ...element,
        strokeColor: color,
      }),
    );

  if (!updated) {
    api.updateScene({
      appState: {
        currentItemStrokeColor: color,
      },
    });

    return;
  }

  api.updateScene({
    appState: {
      currentItemStrokeColor: color,
    },
  });
}

/**
 * 設定背景 / 填充顏色。
 */
export function setSelectedBackgroundColor(
  api: ExcalidrawImperativeAPI,
  color: string,
) {
  const updated =
    updateSelectedElements(
      api,
      (element) => ({
        ...element,
        backgroundColor: color,
      }),
    );

  if (!updated) {
    api.updateScene({
      appState: {
        currentItemBackgroundColor:
          color,
      },
    });

    return;
  }

  api.updateScene({
    appState: {
      currentItemBackgroundColor:
        color,
    },
  });
}

/**
 * 設定線條寬度。
 */
export function setSelectedStrokeWidth(
  api: ExcalidrawImperativeAPI,
  width: ExcalidrawElement["strokeWidth"],
) {
  const updated =
    updateSelectedElements(
      api,
      (element) => ({
        ...element,
        strokeWidth: width,
      }),
    );

  if (!updated) {
    api.updateScene({
      appState: {
        currentItemStrokeWidth: width,
      },
    });

    return;
  }

  api.updateScene({
    appState: {
      currentItemStrokeWidth: width,
    },
  });
}

/**
 * 設定線條樣式。
 */
export function setSelectedStrokeStyle(
  api: ExcalidrawImperativeAPI,
  style: ExcalidrawElement["strokeStyle"],
) {
  const updated =
    updateSelectedElements(
      api,
      (element) => ({
        ...element,
        strokeStyle: style,
      }),
    );

  if (!updated) {
    api.updateScene({
      appState: {
        currentItemStrokeStyle: style,
      },
    });

    return;
  }

  api.updateScene({
    appState: {
      currentItemStrokeStyle: style,
    },
  });
}

/**
 * 設定填充樣式。
 */
export function setSelectedFillStyle(
  api: ExcalidrawImperativeAPI,
  style: ExcalidrawElement["fillStyle"],
) {
  const updated =
    updateSelectedElements(
      api,
      (element) => ({
        ...element,
        fillStyle: style,
      }),
    );

  if (!updated) {
    api.updateScene({
      appState: {
        currentItemFillStyle: style,
      },
    });

    return;
  }

  api.updateScene({
    appState: {
      currentItemFillStyle: style,
    },
  });
}

/**
 * 設定透明度。
 */
export function setSelectedOpacity(
  api: ExcalidrawImperativeAPI,
  opacity: number,
) {
  const updated =
    updateSelectedElements(
      api,
      (element) => ({
        ...element,
        opacity,
      }),
    );

  if (!updated) {
    api.updateScene({
      appState: {
        currentItemOpacity: opacity,
      },
    });

    return;
  }

  api.updateScene({
    appState: {
      currentItemOpacity: opacity,
    },
  });
}

/**
 * 設定粗糙程度。
 *
 * Sloppiness 是 Excalidraw 的繪製設定，
 * 主要影響之後建立的元素。
 */
export function setSelectedSloppiness(
  api: ExcalidrawImperativeAPI,
  sloppiness: number,
) {
  api.updateScene({
    appState: {
      currentItemRoughness:
        sloppiness,
    },
  });
}