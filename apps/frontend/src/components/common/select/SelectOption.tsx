import type { ReactNode } from "react";

export interface SelectOptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function SelectOption({
  value,
  children,
  disabled = false,
}: SelectOptionProps) {
  return (
    <div
      data-select-option=""
      data-value={value}
      data-disabled={disabled ? "" : undefined}
    >
      {children}
    </div>
  );
}