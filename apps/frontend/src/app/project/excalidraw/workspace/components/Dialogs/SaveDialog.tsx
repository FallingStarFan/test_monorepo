"use client";

import { Dialog } from "@/components/Dialog/Dialog";
import { useState } from "react";
import type { CanvasController, CanvasSaveType } from "../../types";

type SaveDialogProps = {
  open: boolean;
  controller: CanvasController;
  onClose: () => void;
};

export function SaveDialog({
  open,
  controller,
  onClose,
}: SaveDialogProps) {
  const [saveType, setSaveType] =
    useState<CanvasSaveType>("local");

  const handleSave = () => {
    controller.save(saveType);
    onClose();
  };

  return (
    <Dialog
      open={open}
      title="儲存畫布"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            儲存方式
          </label>
          <select
            value={saveType}
            onChange={(event) =>
              setSaveType(
                event.target.value as CanvasSaveType
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="local">
              本地儲存
            </option>

            <option value="cloud">
              雲端儲存
            </option>

            <option value="json">
              JSON
            </option>

            <option value="image">
              圖片
            </option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            儲存
          </button>
        </div>
      </div>
    </Dialog>
  );
}