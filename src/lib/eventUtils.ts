import type { EventSummary } from "@/types/api";

export function isEventUpcoming(event: EventSummary): boolean {
  return event.status === "PUBLISHED" && new Date(event.endDate) > new Date();
}

export function formatEventVenue(event: EventSummary): string {
  if (event.mode === "ONLINE") return "Online";
  if (event.mode === "HYBRID") return `${event.venue} (HYBRID)`;
  return event.venue;
}

export function formatDateColumn(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
  };
}

export function formatFeaturedWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}