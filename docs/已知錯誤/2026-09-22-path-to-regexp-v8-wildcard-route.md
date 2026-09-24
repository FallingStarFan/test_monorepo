# path-to-regexp v8 萬用路由語法

## 症狀

NestJS 使用 Express v5 / `path-to-regexp v8` 時，舊式路由
`object/:objectKey(*)` 會因正規表示式語法已移除而無法註冊。

## 根因

v8 不再支援參數後綴 `?`、`*`、`+`，也不支援路由中的正規表示式括號。

## 正確寫法

| 需求 | v8 寫法 | 說明 |
|---|---|---|
| 一段以上的萬用路徑 | `object/*objectKey` | 本專案 Object Key 必填時使用 |
| 零段以上的萬用路徑 | `object/{*objectKey}` | 路徑可為空時使用 |

不要使用：`object/:objectKey(*)`、`object/:objectKey*` 或
`object/:objectKey+`。

`*objectKey` 的值會是路徑片段陣列；傳給需要原始 object key 的 service 前，使用
`objectKey.join('/')` 還原為字串。

## 防呆規則

新增或修改 NestJS catch-all 路由前，搜尋 `docs/已知錯誤/`；並以 `rg` 確認專案中
不存在舊式 `:(名稱)(*)` 路由。完成後至少執行 build。

## 來源

- path-to-regexp 官方 README：Wildcard 與錯誤遷移說明
  <https://github.com/pillarjs/path-to-regexp#readme>
