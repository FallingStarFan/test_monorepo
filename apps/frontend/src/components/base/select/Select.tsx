"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  SelectOption,
  type SelectOptionProps,
} from "./SelectOption";

import "./Select.css";

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  children,
  placeholder = "Select...",
  disabled = false,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const options = Children.toArray(children).filter(
    (child): child is React.ReactElement<SelectOptionProps> =>
      isValidElement<SelectOptionProps>(child) &&
      child.type === SelectOption,
  );

  const selectedOption = options.find(
    (option) => option.props.value === value,
  );

  const handleOptionClick = (option: React.ReactElement<SelectOptionProps>) => {
    if (option.props.disabled) {
      return;
    }

    onChange(option.props.value);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`select ${className}`}
      data-open={open ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <button
        type="button"
        className="select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="select__value">
          {selectedOption?.props.children ?? placeholder}
        </span>

        <span className="select__arrow" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="select__menu" role="listbox">
          {options.map((option) => {
            const optionValue = option.props.value;
            const isSelected = optionValue === value;
            const isDisabled = option.props.disabled ?? false;

            return (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isDisabled}
                className="select__option"
                data-selected={isSelected ? "" : undefined}
                onClick={() => handleOptionClick(option)}
              >
                {option.props.children}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}