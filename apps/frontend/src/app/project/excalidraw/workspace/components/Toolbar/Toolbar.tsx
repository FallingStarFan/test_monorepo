"use client";

import {
  IconPointer,
  IconSquare,
  IconCircle,
  IconDiamond,
  IconArrowRight,
  IconMinus,
  IconPencil,
  IconEraser,
} from "@tabler/icons-react";

import type { CanvasTool } from "../../types/CanvasTool";

import "./Toolbar.css";

type ToolbarProps = {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
};

const tools = [
  {
    id: "selection" as CanvasTool,
    icon: IconPointer,
    title: "Select",
  },
  {
    id: "rectangle" as CanvasTool,
    icon: IconSquare,
    title: "Rectangle",
  },
  {
    id: "ellipse" as CanvasTool,
    icon: IconCircle,
    title: "Ellipse",
  },
  {
    id: "diamond" as CanvasTool,
    icon: IconDiamond,
    title: "Diamond",
  },
  {
    id: "arrow" as CanvasTool,
    icon: IconArrowRight,
    title: "Arrow",
  },
  {
    id: "line" as CanvasTool,
    icon: IconMinus,
    title: "Line",
  },
  {
    id: "freedraw" as CanvasTool,
    icon: IconPencil,
    title: "Draw",
  },
  {
    id: "eraser" as CanvasTool,
    icon: IconEraser,
    title: "Eraser",
  },
];

export function Toolbar({
  activeTool,
  onToolChange,
}: ToolbarProps) {
  return (
    <div className="canvas-toolbar">
      {tools.map(
        ({ id, icon: Icon, title }) => (
          <button
            key={id}
            type="button"
            className={
              activeTool === id
                ? "canvas-toolbar__button canvas-toolbar__button--active"
                : "canvas-toolbar__button"
            }
            onClick={() => onToolChange(id)}
            title={title}
            aria-label={title}
          >
            <Icon
              size={20}
              stroke={1.8}
            />
          </button>
        ),
      )}
    </div>
  );
}