import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "danger";
}

const variantClasses = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  className = "",
  size = "md",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
