
"use client";

import type { ReactNode } from "react";

import "./Sidebar.css";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  activeId: string | null;
  onChange: (id: string) => void;

  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;

  ariaLabel?: string;
  collapseIcon?: ReactNode;
  expandIcon?: ReactNode;
}

export function Sidebar({
  items,
  activeId,
  onChange,
  collapsed,
  onCollapsedChange,
  ariaLabel = "Navigation",
  collapseIcon = "←",
  expandIcon = "→",
}: SidebarProps) {
  return (
    <aside
      className="sidebar"
      data-collapsed={collapsed}
    >
      <nav
        className="sidebar__nav"
        aria-label={ariaLabel}
      >
        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              className="sidebar__item"
              data-active={active}
              disabled={item.disabled}
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(item.id)}
              title={collapsed ? item.label : undefined}
            >
              {item.icon && (
                <span className="sidebar__icon">
                  {item.icon}
                </span>
              )}

              {!collapsed && (
                <span className="sidebar__label">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className="sidebar__toggle"
        onClick={() => onCollapsedChange(!collapsed)}
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
      >
        {collapsed ? expandIcon : collapseIcon}
      </button>
    </aside>
  );
}
