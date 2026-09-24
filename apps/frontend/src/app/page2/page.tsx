
"use client";

import { useState } from "react";

import {
  Sidebar,
  type SidebarItem,
} from "./components/Sidebar";

import "./ShowcasePage.css";

const items: SidebarItem[] = [
  {
    id: "select",
    label: "Select",
  },
  {
    id: "button",
    label: "Button",
  },
  {
    id: "input",
    label: "Input",
  },
  {
    id: "slider",
    label: "Slider",
  },
];

export default function ShowcasePage() {
  const [activeId, setActiveId] = useState("select");
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="showcase">
      <Sidebar
        items={items}
        activeId={activeId}
        onChange={setActiveId}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        collapseIcon="←"
        expandIcon="→"
      />

      <main className="showcase__content">
        {activeId === "select" && (
          <div>Select Demo</div>
        )}

        {activeId === "button" && (
          <div>Button Demo</div>
        )}

        {activeId === "input" && (
          <div>Input Demo</div>
        )}

        {activeId === "slider" && (
          <div>Slider Demo</div>
        )}
      </main>
    </div>
  );
}
