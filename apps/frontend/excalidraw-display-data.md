# Excalidraw 顯示儲存資料指南

## 概述

Excalidraw 是一個互動式的繪圖工具，允許使用者創建和編輯繪圖。本文將介紹如何使用 Excalidraw API 來顯示之前儲存的繪圖資料。

## 主要功能

### 1. 使用 `initialData` 屬性

要顯示已儲存的繪圖資料，可以使用 `initialData` 屬性來傳遞先前儲存的資料：

```jsx
import Excalidraw from "@excalidraw/excalidraw";

const savedData = {
  elements: [
    // 繪圖元素陣列
  ],
  appState: {
    // 應用狀態
  }
};

function MyComponent() {
  return (
    <Excalidraw initialData={savedData} />
  );
}
```

### 2. 使用 `excalidrawAPI` 更新場景

如果您需要在應用程式運行時動態更新場景，可以使用 `excalidrawAPI` 的 `updateScene` 方法：

```jsx
import { useState } from "react";
import Excalidraw from "@excalidraw/excalidraw";

function MyComponent() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  
  const loadSavedData = () => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene(savedData);
    }
  };
  
  return (
    <div>
      <Excalidraw 
        excalidrawAPI={(api) => setExcalidrawAPI(api)} 
        initialData={savedData}
      />
      <button onClick={loadSavedData}>載入儲存的資料</button>
    </div>
  );
}
```

### 3. 從伺服器獲取資料

要從伺服器獲取並顯示儲存的資料：

```jsx
import { useState, useEffect } from "react";
import Excalidraw from "@excalidraw/excalidraw";

function MyComponent() {
  const [savedData, setSavedData] = useState(null);
  
  useEffect(() => {
    // 從伺服器獲取儲存的資料
    fetch('/api/get-drawing-data')
      .then(response => response.json())
      .then(data => setSavedData(data))
      .catch(error => console.error('Error loading data:', error));
  }, []);
  
  if (!savedData) {
    return <div>載入中...</div>;
  }
  
  return (
    <Excalidraw initialData={savedData} />
  );
}
```

## API 方法說明

### `getSceneElements()`
獲取當前場景中的所有元素（不包含已刪除的元素）：

```javascript
const elements = excalidrawAPI.getSceneElements();
```

### `getAppState()`
獲取當前應用程式狀態：

```javascript
const appState = excalidrawAPI.getAppState();
```

### `updateScene()`
更新場景資料：

```javascript
const sceneData = {
  elements: [...], // 繪圖元素
  appState: {...}, // 應用程式狀態
};

excalidrawAPI.updateScene(sceneData);
```

## 資料格式

儲存的資料通常包含以下結構：

```json
{
  "elements": [
    {
      "type": "rectangle",
      "version": 141,
      "id": "oDVXy8D6rom3H1-LLH2-f",
      "x": 100.50390625,
      "y": 93.67578125,
      "width": 186.47265625,
      "height": 141.9765625,
      "strokeColor": "#c92a2a",
      "fillStyle": "hachure",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "isDeleted": false,
      "seed": 1968410350,
      "groupIds": []
    }
  ],
  "appState": {
    "theme": "light",
    "viewBackgroundColor": "#ffffff"
  }
}
```

## 注意事項

1. 確保資料格式正確，與 Excalidraw 需要的結構相符
2. 使用 `initialData` 屬性來初始化顯示儲存的資料
3. 如果需要在運行時更新資料，使用 `excalidrawAPI.updateScene()`
4. 處理可能的錯誤情況，例如載入資料失敗

## 參考連結

- [Excalidraw 官方文件](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/excalidraw-api)