import { CanvasController } from "../../types";
import { ExportDialog } from "./ExportDialog";
import { SaveDialog } from "./SaveDialog";

type DialogType =
  | "none"
  | "save"
  | "export"
  | "share"
  | "settings";

type CanvasDialogsProps = {
  type: DialogType;
  controller: CanvasController;
  onClose: () => void;
};

export function AllCanvasDialogs({
  type,
  controller,
  onClose,
}: CanvasDialogsProps) {
  switch (type) {
    case "save":
      return (
        <SaveDialog
          open
          controller={controller}
          onClose={onClose}
        />
      );

    case "export":
      return (
        <ExportDialog
          open
          controller={controller}
          onClose={onClose}
        />
      );

    case "share":
      return (
        <ShareDialog
          open
          controller={controller}
          onClose={onClose}
        />
      );

    case "settings":
      return (
        <SettingsDialog
          open
          controller={controller}
          onClose={onClose}
        />
      );

    default:
      return null;
  }
}