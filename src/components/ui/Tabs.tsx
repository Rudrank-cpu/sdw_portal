import type { ReactNode } from "react";

interface TabItem<Value extends string> {
  value: Value;
  label: ReactNode;
}

interface TabsProps<Value extends string> {
  items: readonly TabItem<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  variant?: "underline" | "pill";
  ariaLabel: string;
}

export function Tabs<Value extends string>({
  items,
  value,
  onChange,
  variant = "pill",
  ariaLabel,
}: TabsProps<Value>) {
  return (
    <div className={variant === "underline" ? "flex gap-5 border-b border-app" : "flex flex-wrap gap-2"} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={variant === "underline"
              ? `border-b-2 px-1 pb-2 text-xs font-semibold transition-colors ${selected ? "border-primary text-primary" : "border-transparent text-muted hover:text-body"}`
              : `rounded-full px-3 py-1.5 text-xs font-medium ${selected ? "bg-brand-600 text-white" : "border border-app text-muted hover:text-body"}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
