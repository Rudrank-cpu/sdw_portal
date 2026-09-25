import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: "blue" | "green" | "gold" | "red" | "neutral";
}

const badgeTones = {
  blue: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  gold: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function Badge({ children, className = "", tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold ${className}`}>
      {children}
    </p>
  );
}

const statusTones: Record<string, BadgeProps["tone"]> = {
  PUBLISHED: "green",
  AUTHENTICATED: "green",
  PENDING_APPROVAL: "gold",
  PENDING_DOCUMENTATION_REVIEW: "gold",
  PENDING_SECRETARY_APPROVAL: "gold",
  DRAFT: "neutral",
  REJECTED: "red",
  REJECTED_BY_DOCUMENTATION: "red",
  REJECTED_BY_SECRETARY: "red",
  DELISTED: "red",
  CANCELLED: "red",
  COMPLETED: "blue",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTones[status] ?? "neutral"}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
