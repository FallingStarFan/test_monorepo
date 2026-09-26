"use client"

import {
  FILE_METADATA_BFF_PATH,
  FILE_UPLOAD_URL_BFF_PATH,
} from '@test/shared';
import { useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';

/**
 * 上傳面板（僅在已登入時渲染）。
 *
 * 走既有的 presigned 流程，三步驟都在這裡完成：
 * 1. 向 BFF 要 presigned URL（BFF 帶 Cookie 轉發後端 /file/upload-url）。
 * 2. 瀏覽器直接 PUT 檔案到物件儲存（大檔不經過 API 伺服器）。
 * 3. 把檔名、大小等中介資料寫回後端（POST /file）。
 *
 * 為什麼要顯示每一步的狀態：上傳失敗可能發生在任何一步（未登入、後端 500、
 * 物件儲存拒絕），只顯示「上傳失敗」會讓使用者無從判斷要找誰處理。
 */
type UploadPhase =
  | 'idle'
  | 'requesting'
  | 'uploading'
  | 'saving'
  | 'done'
  | 'error';

const PHASE_LABELS: Record<UploadPhase, string> = {
  idle: '尚未開始',
  requesting: '正在取得上傳網址…',
  uploading: '正在上傳檔案…',
  saving: '正在寫入檔案紀錄…',
  done: '上傳完成',
  error: '上傳失敗',
};

interface UploadResult {
  objectKey: string;
  originalName: string;
}

export function FileUploadPanel() {
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function uploadFile(file: File) {
    setPhase('requesting');
    setMessage(null);
    setResult(null);

    try {
      const urlResponse = await fetch(FILE_UPLOAD_URL_BFF_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || undefined,
        }),
      });

      if (!urlResponse.ok) {
        setPhase('error');
        setMessage(
          `取得上傳網址失敗（HTTP ${urlResponse.status}）：${
            await readErrorMessage(urlResponse)
          }`,
        );
        return;
      }

      const { url, objectKey } = (await urlResponse.json()) as {
        url: string;
        objectKey: string;
      };

      setPhase('uploading');

      const putResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'content-type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!putResponse.ok) {
        setPhase('error');
        setMessage(
          `檔案上傳到物件儲存失敗（HTTP ${putResponse.status}）。請確認物件儲存設定是否正確。`,
        );
        return;
      }

      setPhase('saving');

      const metaResponse = await fetch(FILE_METADATA_BFF_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          objectKey,
          originalName: file.name,
          mimeType: file.type || undefined,
          bytes: file.size,
        }),
      });

      if (!metaResponse.ok) {
        setPhase('error');
        setMessage(
          `檔案已上傳，但寫入紀錄失敗（HTTP ${metaResponse.status}）：${
            await readErrorMessage(metaResponse)
          }`,
        );
        return;
      }

      setPhase('done');
      setResult({ objectKey, originalName: file.name });
    } catch {
      setPhase('error');
      setMessage('上傳過程中發生未預期的錯誤，請稍後再試。');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Input
          type="file"
          disabled={
            phase === 'requesting' ||
            phase === 'uploading' ||
            phase === 'saving'
          }
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void uploadFile(file);
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          目前狀態：{PHASE_LABELS[phase]}
        </p>
      </div>

      {message ? (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">
            已上傳：{result.originalName}
          </p>
          <p className="break-all font-mono text-xs text-muted-foreground">
            objectKey：{result.objectKey}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** 取出後端或 BFF 回應中的中文錯誤訊息，讓失敗原因可直接顯示給使用者。 */
async function readErrorMessage(
  response: Response,
): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | { en?: string; zh?: string };
  } | null;

  const message = payload?.message;

  if (!message) {
    return '沒有回傳錯誤內容';
  }

  if (typeof message === 'string') {
    return message;
  }

  return message.zh ?? message.en ?? '沒有回傳錯誤內容';
}
