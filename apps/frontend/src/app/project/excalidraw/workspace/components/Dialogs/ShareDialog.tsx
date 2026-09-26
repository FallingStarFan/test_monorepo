import { Dialog } from "@/components/base/dialog";
import { CanvasController } from "../../types";

type ShareDialogProps = {
  open: boolean;
  controller: CanvasController;
  onClose: () => void;
};

export function ShareDialog({
  open,
  controller,
  onClose,
}: ShareDialogProps) {
  return (
    <Dialog
      open={open}
      title="分享"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          分享您的畫布給其他人
        </p>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value="https://example.com/share/12345"
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            複製連結
          </button>
        </div>
        
        <div className="flex justify-center space-x-4 pt-2">
          <button 
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => {
              alert("分享到 Facebook");
            }}
          >
            <span className="text-lg">📘</span>
          </button>
          <button 
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => {
              alert("分享到 Twitter");
            }}
          >
            <span className="text-lg">🐦</span>
          </button>
          <button 
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => {
              alert("分享到 LinkedIn");
            }}
          >
            <span className="text-lg">💼</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}