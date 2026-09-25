import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { EVENT_CATEGORY_TABS, categoryForEvent } from "@/lib/eventCategories";
import { getEvents } from "@/features/events/api";
import { getClubs } from "@/features/clubs/api";
import type { EventSummary } from "@/types/api";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { SearchField } from "@/components/ui/Inputs";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { Spinner, ErrorMessage, EmptyState } from "@/components/ui/States";
import { EventListRow } from "@/components/ui/Rows";
import {
  isEventUpcoming,
  greetingFor,
  formatFeaturedWhen,
  formatEventVenue,
} from "@/lib/eventUtils";
import {
  MapPinIcon,
  MegaphoneIcon,
  BuildingIcon,
  TrophyIcon,
} from "@/components/ui/Icons";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof EVENT_CATEGORY_TABS)[number]["value"]>("All");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => getEvents({ upcoming: true, limit: 50 }),
  });

  const clubsQuery = useQuery({
    queryKey: ["clubs"],
    queryFn: getClubs,
  });

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);

  const firstName = isGuest
    ? "Guest"
    : (user?.name.trim().split(/\s+/)[0] ?? "there");
  const hour = new Date().getHours();

  const featured = useMemo(
    () => data?.events.find(isEventUpcoming) ?? undefined,
    [data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.events ?? [])
      .filter(isEventUpcoming)
      .filter(
        (event) =>
          category === "All" || categoryForEvent(event.category) === category,
      )
      .filter(
        (event) =>
          !q ||
          `${event.title} ${event.venue} ${event.clubId.name} ${event.clubId.code}`
            .toLowerCase()
            .includes(q),
      )
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
  }, [data, search, category]);

  const announcementEvent = useMemo(() => {
    return filtered.find(
      (event) =>
        new Date(event.registrationDeadline) > new Date() &&
        event.registeredCount < event.capacity,
    );
  }, [filtered]);

  const previewClubs = (clubsQuery.data ?? []).slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Greeting */}
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted">{greetingFor(hour)}</p>
          <h1 className="mt-0.5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[2rem]">
            {firstName}
          </h1>
          <Eyebrow className="mt-2">CESA Community</Eyebrow>
        </div>
      </header>

      {/* Guest sign-in strip */}
      {isGuest && (
        <aside className="mb-6 flex flex-col gap-3 rounded-xl border border-primary-border bg-primary-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">Browsing as a guest</p>
            <p className="mt-0.5 text-xs text-body">
              Sign in with your PRN to register for events and track
              achievements.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/login"
              className="ui-button ui-button-primary ui-button-sm"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="ui-button ui-button-secondary ui-button-sm"
            >
              Register
            </Link>
          </div>
        </aside>
      )}

      {/* Quick links */}
      <nav
        aria-label="Quick links"
        className="mb-7 grid grid-cols-3 gap-2.5 sm:gap-3"
      >
        <QuickLink
          to="/clubs"
          icon={<BuildingIcon className="h-5 w-5" />}
          label="Clubs"
          hint="Find your community"
        />
        <QuickLink
          to="/events"
          icon={<MegaphoneIcon className="h-5 w-5" />}
          label="Events"
          hint="Workshops & more"
        />
        <QuickLink
          to="/leaderboard"
          icon={<TrophyIcon className="h-5 w-5" />}
          label="Standings"
          hint="Campus leaderboard"
        />
      </nav>

      {/* Featured event */}
      <section aria-label="Next upcoming" className="mb-7">
        {isLoading ? (
          <Spinner />
        ) : isError || !data ? (
          <ErrorMessage
            message="Couldn't load upcoming events."
            onRetry={refetch}
          />
        ) : featured ? (
          <FeaturedEventCard event={featured} />
        ) : (
          <article className="ui-card p-5 sm:p-6">
            <Eyebrow className="mb-2">Next Upcoming</Eyebrow>
            <h2 className="text-lg font-bold text-ink">No events scheduled</h2>
            <p className="mt-1 text-sm text-muted">
              Check back soon — clubs publish workshops and meets here.
            </p>
            <Link
              to="/clubs"
              className="ui-button ui-button-secondary mt-4"
            >
              Explore Clubs
            </Link>
          </article>
        )}
      </section>

      {isLoading || isError || !data ? null : (
        <>
          <div className="mb-6 space-y-4">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search events, workshops…"
              label="Search events"
            />
            <Tabs
              items={EVENT_CATEGORY_TABS}
              value={category}
              onChange={setCategory}
              variant="underline"
              ariaLabel="Event categories"
            />
          </div>

          {announcementEvent && (
            <section
              aria-label="Announcement"
              className="mb-8 border-t border-app pt-6"
            >
              <Eyebrow className="mb-3">
                <MegaphoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Announcement
              </Eyebrow>
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {announcementEvent.title} registration is live
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">
                {announcementEvent.description?.slice(0, 140) ||
                  "A featured campus event is open for registration. Form your teams and start building."}
                {(announcementEvent.description?.length ?? 0) > 140 ? "…" : ""}
              </p>
              <Link
                to={
                  isGuest
                    ? "/login"
                    : `/events/${announcementEvent._id}`
                }
                className="ui-button ui-button-primary mt-4"
              >
                {isGuest ? "Sign In to Register" : "Register Now"}
              </Link>
            </section>
          )}

          <section aria-label="Upcoming events" className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <Eyebrow className="mb-1.5">Upcoming</Eyebrow>
                <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                  Events & Workshops
                </h2>
              </div>
              <Link
                to="/events"
                className="ui-text-link inline-flex items-center gap-1 text-xs"
              >
                View all →
              </Link>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title={
                  search
                    ? "No events match your search."
                    : "No events in this category yet."
                }
                description="New events are announced as clubs publish them. Browse all events to see what's next."
                action={
                  <Link
                    to="/events"
                    className="ui-button ui-button-secondary ui-button-sm"
                  >
                    Browse All Events
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-app overflow-hidden rounded-xl border border-app bg-surface">
                {filtered.map((event) => (
                  <li key={event._id}>
                    <EventListRow event={event} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* Clubs preview */}
      {previewClubs.length > 0 && (
        <section aria-label="Clubs" className="mb-4">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <Eyebrow className="mb-1.5">Community</Eyebrow>
              <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                Active Clubs
              </h2>
            </div>
            <Link
              to="/clubs"
              className="ui-text-link inline-flex items-center gap-1 text-xs"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previewClubs.map((club) => (
              <Link
                key={club._id}
                to={`/clubs/${club._id}`}
                className="ui-card group flex flex-col items-center p-3.5 text-center transition-colors hover:border-primary-border"
              >
                <div className="mb-2.5 rounded-lg bg-surface-muted p-2.5">
                  <ClubLogo club={club} size="sm" />
                </div>
                <p className="w-full truncate text-xs font-bold text-ink group-hover:text-primary">
                  {club.name}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  {club.code}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuickLink({
  to,
  icon,
  label,
  hint,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="ui-card group flex flex-col gap-2 p-3.5 transition-colors hover:border-primary-border sm:p-4"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink group-hover:text-primary">
          {label}
        </span>
        <span className="mt-0.5 hidden text-[11px] text-muted sm:block">
          {hint}
        </span>
      </span>
    </Link>
  );
}

function FeaturedEventCard({ event }: { event: EventSummary }) {
  const mode = event.mode;
  const statusLabel =
    event.registeredCount >= event.capacity
      ? "FULL"
      : `NEXT UPCOMING · ${mode}`;

  return (
    <article className="ui-card relative overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-app opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-8 h-24 w-24 rounded-full border border-app opacity-30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-4 h-1.5 w-1.5 rounded-full bg-faint opacity-60"
      />

      <div className="relative max-w-xl">
        <Badge tone="blue" className="mb-3">
          {statusLabel}
        </Badge>
        <p className="text-sm text-muted">{formatFeaturedWhen(event.startDate)}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {event.title}
        </h2>
        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-body">
          <MapPinIcon
            className="h-4 w-4 shrink-0 text-muted"
            aria-hidden="true"
          />
          <span className="truncate">{formatEventVenue(event)}</span>
        </p>
        <Link
          to={`/events/${event._id}`}
          className="ui-button ui-button-primary mt-5"
        >
          View Event Details
        </Link>
      </div>
    </article>
  );
}
