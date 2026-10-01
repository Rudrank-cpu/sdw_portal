import { api } from '@/lib/api';
import type { ApiResponse, EventMode, EventStatus, EventSummary, PaginationMeta, EventReport, EventReportImage, GeneratedContent } from '@/types/api';

export interface EventListParams {
  clubId?: string;
  status?: EventStatus;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}

export interface EventDetail {
  event: EventSummary;
  userRegistration?: {
    ticketCode: string;
    status: 'REGISTERED' | 'CANCELLED' | 'ATTENDED';
    checkedIn: boolean;
  };
}

export interface CreateEventPayload {
  title: string;
  description: string;
  bannerUrl: string;
  venue: string;
  mode: EventMode;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  capacity: number;
  autoPublish?: boolean;
}

export const getEvents = (params: EventListParams = {}) =>
  api
    .get<ApiResponse<EventSummary[]>>('/events', { params })
    .then((r) => ({ events: r.data.data, meta: r.data.meta as PaginationMeta }));

export const getClubEvents = (clubId: string, params: Omit<EventListParams, 'clubId'> = {}) =>
  api
    .get<ApiResponse<EventSummary[]>>(`/clubs/${clubId}/events`, { params })
    .then((r) => ({ events: r.data.data, meta: r.data.meta as PaginationMeta }));

export const getEventById = (eventId: string) =>
  api.get<ApiResponse<EventDetail>>(`/events/${eventId}`).then((r) => r.data.data);

export const createEvent = (clubId: string, payload: CreateEventPayload) =>
  api.post<ApiResponse<EventSummary>>(`/clubs/${clubId}/events`, payload).then((r) => r.data.data);

export const approveEvent = (clubId: string, eventId: string) =>
  api
    .patch<ApiResponse<EventSummary>>(`/clubs/${clubId}/events/${eventId}/approve`)
    .then((r) => r.data.data);

export const registerForEvent = (eventId: string) =>
  api.post<ApiResponse<{ ticketCode: string; qrData: string }>>(`/events/${eventId}/register`).then(
    (r) => r.data.data
  );

export const cancelRegistration = (eventId: string) =>
  api.delete<ApiResponse<{ message: string }>>(`/events/${eventId}/register`).then((r) => r.data.data);

export const checkIn = (eventId: string, payload: { ticketCode?: string; prn?: string }) =>
  api.post<ApiResponse<unknown>>(`/events/${eventId}/check-in`, payload).then((r) => r.data.data);

export const delistEvent = (clubId: string, eventId: string, reason: string) =>
  api
    .post<ApiResponse<EventSummary>>(`/clubs/${clubId}/events/${eventId}/delist`, { reason })
    .then((r) => r.data.data);

export const undelistEvent = (clubId: string, eventId: string) =>
  api
    .post<ApiResponse<EventSummary>>(`/clubs/${clubId}/events/${eventId}/undelist`)
    .then((r) => r.data.data);

// Event Report
export interface EventReportPayload {
  actualAttendeeCount: number;
  topic?: string;
  activities?: string;
  objectives?: string;
  outcomes?: string;
  organizers?: string;
  speakers?: string;
  agenda?: string;
  notes?: string;
  images?: EventReportImage[];
}

export const postEventReport = (clubId: string, eventId: string, payload: EventReportPayload) =>
  api.post<ApiResponse<EventReport>>(`/clubs/${clubId}/events/${eventId}/report`, payload).then((r) => r.data.data);

export const getEventReport = (clubId: string, eventId: string) =>
  api.get<ApiResponse<EventReport>>(`/clubs/${clubId}/events/${eventId}/report`).then((r) => r.data.data);

export const updateEventReport = (
  clubId: string,
  eventId: string,
  payload: Partial<EventReportPayload> & { status?: 'DRAFT' | 'FINAL'; generatedContent?: GeneratedContent }
) =>
  api.patch<ApiResponse<EventReport>>(`/clubs/${clubId}/events/${eventId}/report`, payload).then((r) => r.data.data);

export const downloadEventReportPdf = (clubId: string, eventId: string) =>
  api.get(`/clubs/${clubId}/events/${eventId}/report.pdf`, { responseType: 'blob' }).then((r) => r.data);
