import { Dialog } from "@/components/Dialog/Dialog";
import { CanvasController } from "../../types";

type ExportDialogProps = {
  open: boolean;
  controller: CanvasController;
  onClose: () => void;
};

export function ExportDialog({
  open,
  controller,
  onClose,
}: ExportDialogProps) {
  return (
    <Dialog
      open={open}
      title="匯出"
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => controller.export("png")}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center justify-center"
        >
          <span className="text-xl">🖼️</span>
          <span className="mt-1">PNG</span>
        </button>

        <button 
          onClick={() => controller.export("svg")}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center justify-center"
        >
          <span className="text-xl">📐</span>
          <span className="mt-1">SVG</span>
        </button>

        <button 
          onClick={() => controller.export("pdf")}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center justify-center"
        >
          <span className="text-xl">📄</span>
          <span className="mt-1">PDF</span>
        </button>

        <button 
          onClick={() => controller.export("json")}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center justify-center"
        >
          <span className="text-xl">📋</span>
          <span className="mt-1">JSON</span>
        </button>
      </div>
    </Dialog>
  );
}