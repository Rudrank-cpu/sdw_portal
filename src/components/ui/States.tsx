import type { ReactNode } from "react";

export function Spinner() {
  return (
    <div className="flex justify-center py-8" role="status" aria-label="Loading">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ml-3 font-semibold underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-app px-5 py-8 text-center">
      <h3 className="font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
