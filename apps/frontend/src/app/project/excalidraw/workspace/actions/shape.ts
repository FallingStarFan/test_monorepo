import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

import type {
  ExcalidrawElement,
  FillStyle,
  StrokeStyle,
} from "@excalidraw/excalidraw/element/types";

type AppStateUpdate = Partial<
  Pick<
    AppState,
    | "currentItemStrokeWidth"
    | "currentItemStrokeStyle"
    | "currentItemFillStyle"
  >
>;

/**
 * 更新選取元素。
 *
 * 沒有選取元素時，更新目前新建元素的預設樣式。
 */
function updateSelectedElements(
  api: ExcalidrawImperativeAPI,
  update: (
    element: ExcalidrawElement,
  ) => ExcalidrawElement,
  defaultAppState: AppStateUpdate,
) {
  const appState = api.getAppState();
  const elements = api.getSceneElements();

  const selectedIds = appState.selectedElementIds;

  const hasSelection =
    Object.keys(selectedIds).length > 0;

  if (!hasSelection) {
    api.updateScene({
      appState: {
        ...appState,
        ...defaultAppState,
      },
    });

    return;
  }

  const updatedElements = elements.map((element) => {
    if (!selectedIds[element.id]) {
      return element;
    }

    return update(element);
  });

  api.updateScene({
    elements: updatedElements,
  });
}

/**
 * 設定線條粗細。
 */
export function setStrokeWidth(
  api: ExcalidrawImperativeAPI,
  strokeWidth: number,
) {
  updateSelectedElements(
    api,
    (element) => ({
      ...element,
      strokeWidth,
    }),
    {
      currentItemStrokeWidth: strokeWidth,
    },
  );
}

/**
 * 設定線條樣式。
 */
export function setStrokeStyle(
  api: ExcalidrawImperativeAPI,
  strokeStyle: StrokeStyle,
) {
  updateSelectedElements(
    api,
    (element) => ({
      ...element,
      strokeStyle,
    }),
    {
      currentItemStrokeStyle: strokeStyle,
    },
  );
}

/**
 * 設定填色樣式。
 */
export function setFillStyle(
  api: ExcalidrawImperativeAPI,
  fillStyle: FillStyle,
) {
  updateSelectedElements(
    api,
    (element) => ({
      ...element,
      fillStyle,
    }),
    {
      currentItemFillStyle: fillStyle,
    },
  );
}