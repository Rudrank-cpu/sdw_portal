import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { canPerformInClub } from "@/lib/permissions";
import { getClubById, updateClub } from "@/features/clubs/api";
import {
  addWhitelistedPrn,
  listAdminClubs,
  listWhitelistedPrns,
  transferMasterAdmin,
} from "@/features/admin/api";
import {
  approveEvent,
  createEvent,
  delistEvent,
  getClubEvents,
} from "@/features/events/api";
import { uploadFile } from "@/features/uploads/api";
import { Card, ErrorMessage, Spinner } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import type { Club, EventMode, Year } from "@/types/api";
import { CLUB_PERMISSIONS } from "@/lib/permissions";

const errorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  return (
    (error.response?.data as { message?: string } | undefined)?.message ??
    fallback
  );
};

const inputClass =
  "w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900";
const initialEventForm = {
  title: "",
  description: "",
  bannerUrl: "",
  venue: "",
  mode: "OFFLINE" as EventMode,
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  capacity: "50",
};

export function AdminPortalPage() {
  const { user, auth } = useAuthStore();
  const queryClient = useQueryClient();
  const isMasterAdmin = user?.isMasterAdmin === true;
  const clubMemberships = (auth?.memberships ?? []).filter(
    (membership) =>
      canPerformInClub(auth, membership.clubId, CLUB_PERMISSIONS.EDIT_CLUB) ||
      canPerformInClub(auth, membership.clubId, CLUB_PERMISSIONS.EDIT_CLUB_MEMBERS),
  );
  const eventMemberships = (auth?.memberships ?? []).filter((membership) =>
    [
      CLUB_PERMISSIONS.CREATE_EVENT,
      CLUB_PERMISSIONS.EDIT_EVENT,
      CLUB_PERMISSIONS.DELETE_EVENT_CESA,
    ].some((permission) =>
      canPerformInClub(auth, membership.clubId, permission),
    ),
  );
  const adminClubsQuery = useQuery({
    queryKey: ["admin", "clubs"],
    queryFn: listAdminClubs,
    enabled: isMasterAdmin,
  });
  const manageableClubs: Array<Pick<Club, "_id" | "name" | "code">> =
    isMasterAdmin
      ? (adminClubsQuery.data ?? []).map(({ _id, name, code }) => ({
          _id,
          name,
          code,
        }))
      : clubMemberships.map(({ clubId, clubName, clubCode }) => ({
          _id: clubId,
          name: clubName,
          code: clubCode,
        }));
  const [clubId, setClubId] = useState("");
  const [clubForm, setClubForm] = useState({
    description: "",
    logoUrl: "",
    bannerUrl: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [prnForm, setPrnForm] = useState({
    prn: "",
    name: "",
    email: "",
    branch: "",
    year: "FE" as Year,
  });
  const [newMasterUserId, setNewMasterUserId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!manageableClubs.some((club) => club._id === clubId))
      setClubId(manageableClubs[0]?._id ?? "");
  }, [clubId, manageableClubs]);

  const selectedClubQuery = useQuery({
    queryKey: ["admin", "club", clubId],
    queryFn: () => getClubById(clubId),
    enabled: Boolean(clubId),
  });
  const selectedClub = selectedClubQuery.data?.club;
  useEffect(() => {
    if (selectedClub)
      setClubForm({
        description: selectedClub.description,
        logoUrl: selectedClub.logoUrl,
        bannerUrl: selectedClub.bannerUrl ?? "",
      });
  }, [selectedClub]);

  const canCreateEvent = canPerformInClub(auth, clubId, CLUB_PERMISSIONS.CREATE_EVENT);
  const canApproveEvent = canPerformInClub(auth, clubId, CLUB_PERMISSIONS.EDIT_EVENT);
  const canDelistEvent = canPerformInClub(auth, clubId, CLUB_PERMISSIONS.DELETE_EVENT_CESA);
  const eventsQuery = useQuery({
    queryKey: ["admin", "events", clubId],
    queryFn: () => getClubEvents(clubId, { limit: 50 }),
    enabled:
      Boolean(clubId) && (canCreateEvent || canApproveEvent || canDelistEvent),
  });

  const clubMutation = useMutation({
    mutationFn: async () => {
      const [logoUpload, bannerUpload] = await Promise.all([
        logoFile ? uploadFile(logoFile, "cesa/clubs/logos") : null,
        bannerFile ? uploadFile(bannerFile, "cesa/clubs/banners") : null,
      ]);
      return updateClub(clubId, {
        ...clubForm,
        logoUrl: logoUpload?.secure_url ?? clubForm.logoUrl,
        bannerUrl: bannerUpload?.secure_url ?? clubForm.bannerUrl,
      });
    },
    onSuccess: () => {
      setLogoFile(null);
      setBannerFile(null);
      setMessage("Club branding updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
  const prnMutation = useMutation({
    mutationFn: () => addWhitelistedPrn(prnForm),
    onSuccess: () => {
      setPrnForm({ prn: "", name: "", email: "", branch: "", year: "FE" });
      setMessage("PRN added to the whitelist.");
      queryClient.invalidateQueries({ queryKey: ["admin", "prns"] });
    },
  });
  const transferMutation = useMutation({
    mutationFn: () => transferMasterAdmin(newMasterUserId),
    onSuccess: () => {
      setNewMasterUserId("");
      setMessage("Master admin role transfer requested.");
    },
  });
  const createEventMutation = useMutation({
    mutationFn: () =>
      createEvent(clubId, {
        title: eventForm.title,
        description: eventForm.description,
        bannerUrl: eventForm.bannerUrl,
        venue: eventForm.venue,
        mode: eventForm.mode,
        startDate: new Date(eventForm.startDate).toISOString(),
        endDate: new Date(eventForm.endDate).toISOString(),
        registrationDeadline: new Date(
          eventForm.registrationDeadline,
        ).toISOString(),
        capacity: Number(eventForm.capacity),
      }),
    onSuccess: () => {
      setEventForm(initialEventForm);
      setMessage("Activity created successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "events", clubId] });
    },
  });
  const approveEventMutation = useMutation({
    mutationFn: (eventId: string) => approveEvent(clubId, eventId),
    onSuccess: () => {
      setMessage("Activity approved and published.");
      queryClient.invalidateQueries({ queryKey: ["admin", "events", clubId] });
    },
  });
  const delistEventMutation = useMutation({
    mutationFn: (eventId: string) =>
      delistEvent(clubId, eventId, "Removed by club administrator."),
    onSuccess: () => {
      setMessage("Activity delisted successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "events", clubId] });
    },
  });

  if (
    !isMasterAdmin &&
    clubMemberships.length === 0 &&
    eventMemberships.length === 0
  ) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your account cannot manage any club settings.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {isMasterAdmin ? "Master admin panel" : "Club admin panel"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Club admins can edit branding only for clubs assigned to them. Master
          admins can manage the full club registry.
        </p>
      </header>

      {message && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          {message}
        </p>
      )}
      {clubMutation.isError && (
        <ErrorMessage
          message={errorMessage(
            clubMutation.error,
            "Club branding could not be updated.",
          )}
        />
      )}
      {prnMutation.isError && (
        <ErrorMessage
          message={errorMessage(
            prnMutation.error,
            "The PRN could not be added.",
          )}
        />
      )}
      {transferMutation.isError && (
        <ErrorMessage
          message={errorMessage(
            transferMutation.error,
            "The master admin role could not be transferred.",
          )}
        />
      )}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Club branding</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Logo, description, and banner updates are scoped to the selected
              club.
            </p>
          </div>
          <label className="w-full sm:max-w-xs">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Managed club
            </span>
            <select
              value={clubId}
              onChange={(event) => setClubId(event.target.value)}
              className={inputClass}
            >
              {manageableClubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name} ({club.code})
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedClubQuery.isLoading && <Spinner />}
        {selectedClubQuery.isError && (
          <ErrorMessage message="Failed to load the selected club." />
        )}
        {selectedClub && (
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              clubMutation.mutate();
            }}
            className="mt-6 grid gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:grid-cols-2"
          >
            <label className="text-sm sm:col-span-2">
              Description
              <textarea
                required
                value={clubForm.description}
                onChange={(event) =>
                  setClubForm({ ...clubForm, description: event.target.value })
                }
                className={`${inputClass} mt-1 min-h-28`}
              />
            </label>
            <label className="text-sm">
              Logo URL
              <input
                type="url"
                value={clubForm.logoUrl}
                onChange={(event) =>
                  setClubForm({ ...clubForm, logoUrl: event.target.value })
                }
                placeholder="https://..."
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-sm">
              Banner URL
              <input
                type="url"
                value={clubForm.bannerUrl}
                onChange={(event) =>
                  setClubForm({ ...clubForm, bannerUrl: event.target.value })
                }
                placeholder="https://..."
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-sm">
              Or upload logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setLogoFile(event.target.files?.[0] ?? null)
                }
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-sm">
              Or upload banner
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setBannerFile(event.target.files?.[0] ?? null)
                }
                className={`${inputClass} mt-1`}
              />
            </label>
            <Button
              type="submit"
              disabled={clubMutation.isPending}
              className="sm:col-span-2"
              variant="primary"
            >
              {clubMutation.isPending ? "Saving..." : "Save club branding"}
            </Button>
          </form>
        )}
      </Card>

      {isMasterAdmin && (
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-bold">Master controls</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Whitelist students and transfer the single master admin role.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                prnMutation.mutate();
              }}
              className="mt-5 grid gap-3 sm:grid-cols-2"
            >
              <input
                required
                value={prnForm.prn}
                onChange={(event) =>
                  setPrnForm({ ...prnForm, prn: event.target.value })
                }
                placeholder="PRN"
                className={inputClass}
              />
              <input
                required
                value={prnForm.name}
                onChange={(event) =>
                  setPrnForm({ ...prnForm, name: event.target.value })
                }
                placeholder="Student name"
                className={inputClass}
              />
              <input
                type="email"
                value={prnForm.email}
                onChange={(event) =>
                  setPrnForm({ ...prnForm, email: event.target.value })
                }
                placeholder="Institutional email"
                className={inputClass}
              />
              <input
                value={prnForm.branch}
                onChange={(event) =>
                  setPrnForm({ ...prnForm, branch: event.target.value })
                }
                placeholder="Branch"
                className={inputClass}
              />
              <select
                value={prnForm.year}
                onChange={(event) =>
                  setPrnForm({ ...prnForm, year: event.target.value as Year })
                }
                className={inputClass}
              >
                <option value="FE">FE</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </select>
              <Button
                disabled={prnMutation.isPending}
                variant="primary"
              >
                {prnMutation.isPending ? "Adding..." : "Add PRN"}
              </Button>
            </form>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                transferMutation.mutate();
              }}
              className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800"
            >
              <label className="text-sm">
                Transfer master admin to user ID
                <input
                  required
                  value={newMasterUserId}
                  onChange={(event) => setNewMasterUserId(event.target.value)}
                  placeholder="User ObjectId"
                  className={`${inputClass} mt-1`}
                />
              </label>
              <Button
                disabled={transferMutation.isPending}
                className="mt-3"
                variant="danger"
              >
                {transferMutation.isPending ? "Transferring..." : "Transfer role"}
              </Button>
            </form>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Master-admin registry</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Managed clubs loaded: {adminClubsQuery.data?.length ?? 0}.
            </p>
            <PrnList />
          </Card>
        </section>
      )}

      {(canCreateEvent || canApproveEvent || canDelistEvent) && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Activity management</h2>
          {canCreateEvent && (
            <Card>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  createEventMutation.mutate();
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <input
                  required
                  value={eventForm.title}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, title: event.target.value })
                  }
                  placeholder="Activity title"
                  className={inputClass}
                />
                <input
                  required
                  value={eventForm.venue}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, venue: event.target.value })
                  }
                  placeholder="Venue or meeting link"
                  className={inputClass}
                />
                <input
                  type="url"
                  value={eventForm.bannerUrl}
                  onChange={(event) =>
                    setEventForm({
                      ...eventForm,
                      bannerUrl: event.target.value,
                    })
                  }
                  placeholder="Banner image URL"
                  className={`${inputClass} sm:col-span-2`}
                />
                <textarea
                  required
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm({
                      ...eventForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Description"
                  className={`${inputClass} min-h-24 sm:col-span-2`}
                />
                <select
                  value={eventForm.mode}
                  onChange={(event) =>
                    setEventForm({
                      ...eventForm,
                      mode: event.target.value as EventMode,
                    })
                  }
                  className={inputClass}
                >
                  <option value="OFFLINE">Offline</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
                <input
                  required
                  min="1"
                  type="number"
                  value={eventForm.capacity}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, capacity: event.target.value })
                  }
                  placeholder="Capacity"
                  className={inputClass}
                />
                <label className="text-sm">
                  Starts
                  <input
                    required
                    type="datetime-local"
                    value={eventForm.startDate}
                    onChange={(event) =>
                      setEventForm({
                        ...eventForm,
                        startDate: event.target.value,
                      })
                    }
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="text-sm">
                  Ends
                  <input
                    required
                    type="datetime-local"
                    value={eventForm.endDate}
                    onChange={(event) =>
                      setEventForm({
                        ...eventForm,
                        endDate: event.target.value,
                      })
                    }
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  Registration deadline
                  <input
                    required
                    type="datetime-local"
                    value={eventForm.registrationDeadline}
                    onChange={(event) =>
                      setEventForm({
                        ...eventForm,
                        registrationDeadline: event.target.value,
                      })
                    }
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <Button
                  disabled={createEventMutation.isPending}
                  className="sm:col-span-2"
                  variant="primary"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create activity"}
                </Button>
              </form>
            </Card>
          )}
          {eventsQuery.isLoading && <Spinner />}
          {eventsQuery.isError && (
            <ErrorMessage message="Failed to load club activities." />
          )}
          <div className="mt-4 space-y-3">
            {eventsQuery.data?.events.map((event) => (
              <Card
                key={event._id}
                className="flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={event.status} />
                  {canApproveEvent && event.status === "PENDING_APPROVAL" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => approveEventMutation.mutate(event._id)}
                    >
                      Approve
                    </Button>
                  )}
                  {canDelistEvent && event.status === "PUBLISHED" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => delistEventMutation.mutate(event._id)}
                    >
                      Delist
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PrnList() {
  const query = useQuery({
    queryKey: ["admin", "prns"],
    queryFn: () => listWhitelistedPrns({ limit: 10 }),
  });
  if (query.isLoading) return <Spinner />;
  if (query.isError)
    return <ErrorMessage message="Failed to load whitelisted PRNs." />;
  return (
    <div className="mt-5 space-y-2">
      {query.data?.items.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm dark:border-gray-700"
        >
          <span>
            {item.prn}
            <span className="ml-2 text-gray-500">{item.name}</span>
          </span>
          <span className="text-xs text-gray-500">
            {item.isRegistered ? "Registered" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}
