import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "./Icons";
import type { EventSummary } from "@/types/api";
import { formatDateColumn, formatEventVenue } from "@/lib/eventUtils";

/* --- List row (profile/settings style) -------------------------------------- */

interface ListRowProps {
  icon: ReactNode;
  label: string;
  description?: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
}

export function ListRow({
  icon,
  label,
  description,
  to,
  onClick,
  danger = false,
  trailing,
}: ListRowProps) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          danger ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-semibold ${danger ? "text-danger" : "text-ink"}`}
        >
          {label}
        </span>
        {description && (
          <span className="block truncate text-xs text-muted">
            {description}
          </span>
        )}
      </span>
      {trailing ?? (
        <ChevronRightIcon
          className="h-4 w-4 shrink-0 text-faint"
          aria-hidden="true"
        />
      )}
    </>
  );

  const classes = "ui-row";

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

/* --- Info row (event detail metadata) ---------------------------------------- */

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

export function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 px-1 py-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-ink">{children}</p>
      </div>
    </div>
  );
}

/* --- Stat cell (three-cell academic card) ------------------------------------ */

export function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
      <p className="w-full truncate text-sm font-bold text-ink" title={value}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
    </div>
  );
}

/* --- Event list row (HomePage, EventDetailPage, EventListPage) ---------------- */

interface EventListRowProps {
  event: EventSummary;
  to?: string;
}

export function EventListRow({ event, to = `/events/${event._id}` }: EventListRowProps) {
  const { day, month } = formatDateColumn(event.startDate);

  const content = (
    <div className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary sm:gap-4 sm:px-5">
      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-muted py-1.5 text-center">
        <span className="text-base font-bold tabular leading-none text-ink">
          {day}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-muted">
          {month}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">
          {event.mode}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-ink group-hover:text-primary">
          {event.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {event.clubId.name} · {formatEventVenue(event)}
        </p>
      </div>
      <ChevronRightIcon
        className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </div>
  );

  if (to) {
    return <Link to={to} className="flex">{content}</Link>;
  }
  return <div className="flex">{content}</div>;
}
