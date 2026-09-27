"use client";

import { useState } from "react";

import { Input } from "@/components/base/input";
import { ApiError, createStoredFileMeta, createUploadUrl } from "@/lib/api";

type UploadPhase =
  "idle" | "requesting" | "uploading" | "saving" | "done" | "error";

const PHASE_LABELS: Record<UploadPhase, string> = {
  idle: "尚未開始",
  requesting: "正在取得上傳網址…",
  uploading: "正在上傳檔案…",
  saving: "正在寫入檔案紀錄…",
  done: "上傳完成",
  error: "上傳失敗",
};

interface UploadResult {
  objectKey: string;
  originalName: string;
}

export function FileUploadPanel() {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function uploadFile(file: File) {
    setPhase("requesting");
    setMessage(null);
    setResult(null);

    try {
      const { url, objectKey } = await createUploadUrl({
        fileName: file.name,
        contentType: file.type || undefined,
      });

      setPhase("uploading");

      // The presigned object-storage URL is intentionally not sent through the
      // Nest Axios client: it is a third-party URL with its own headers/cookies.
      const putResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "content-type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error(
          `檔案上傳到物件儲存失敗（HTTP ${putResponse.status}）。`,
        );
      }

      setPhase("saving");

      await createStoredFileMeta({
        objectKey,
        originalName: file.name,
        mimeType: file.type || undefined,
        bytes: file.size,
      });

      setPhase("done");
      setResult({ objectKey, originalName: file.name });
    } catch (unknownError) {
      setPhase("error");
      setMessage(
        unknownError instanceof ApiError || unknownError instanceof Error
          ? unknownError.message
          : "上傳過程中發生未預期的錯誤，請稍後再試。",
      );
    }
  }

  const busy =
    phase === "requesting" || phase === "uploading" || phase === "saving";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Input
          type="file"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadFile(file);
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
          <p className="font-medium">已上傳：{result.originalName}</p>
          <p className="break-all font-mono text-xs text-muted-foreground">
            objectKey：{result.objectKey}
          </p>
        </div>
      ) : null}
    </div>
  );
}
