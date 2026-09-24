"use client";

import { useState } from "react";
import { CanvasController } from "../../types";
import { ExportDialog } from "../Dialogs/ExportDialog";
import { SaveDialog } from "../Dialogs/SaveDialog";
import "./main-menu.css";

type MainMenuProps = {
  controller: CanvasController;
};

type MenuState = "closed" | "menu" | "save" | "export";

export function MainMenu({ controller }: MainMenuProps) {
  const [state, setState] = useState<MenuState>("closed");

  return (
    <div className="main-menu">
      <button
        type="button"
        className="main-menu-trigger"
        onClick={() =>
          setState((value) =>
            value === "closed" ? "menu" : "closed"
          )
        }
      >
        ☰
      </button>

      {state === "menu" && (
        <div className="main-menu-dropdown">
          <button
            type="button"
            onClick={controller.create}
          >
            New
          </button>

          <button
            type="button"
            onClick={() => setState("save")}
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => setState("export")}
          >
            Export
          </button>
        </div>
      )}

      <SaveDialog
        open={state === "save"}
        controller={controller}
        onClose={() => setState("menu")}
      />

      <ExportDialog
        open={state === "export"}
        controller={controller}
        onClose={() => setState("menu")}
      />
    </div>
  );
}