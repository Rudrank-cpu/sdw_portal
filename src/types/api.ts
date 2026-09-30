// ---------------------------------------------------------------------------
// Shared types generated from docs/api.md. Everyone imports from here instead
// of redefining these shapes inside their own feature folder.
// ---------------------------------------------------------------------------

export interface ApiError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiError[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// --- Core enums (section 3 of docs/api.md) --------------------------------

export type ClubCode = 'ACM' | 'OWASP' | 'GDGC' | 'LFDT' | 'ACM-W' | 'IIRIS';

export type AchievementStatus =
  | 'SUBMITTED'
  | 'PENDING_DOCUMENTATION_REVIEW'
  | 'APPROVED_BY_DOCUMENTATION'
  | 'EVIDENCE_REQUESTED'
  | 'REJECTED_BY_DOCUMENTATION'
  | 'REJECTED'
  | 'PENDING_SECRETARY_APPROVAL'
  | 'AUTHENTICATED'
  | 'REJECTED_BY_SECRETARY';

export type EventStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'DELISTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type EventRegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'ATTENDED';

export type EventMode = 'OFFLINE' | 'ONLINE' | 'HYBRID';

export type Year = 'FE' | 'SE' | 'TE' | 'BE';

// --- Auth / user -------------------------------------------------------

export interface User {
  id: string;
  _id?: string;
  prn: string;
  email: string;
  name: string;
  branch: string;
  year: Year;
  avatar?: string;
  profilePicture?: string;
  cardBackground?: string;
  isMasterAdmin?: boolean;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface ClubRole {
  id: string;
  name: string;
  scope: 'CESA' | 'CLUB';
}

export interface ClubMembership {
  clubId: string;
  clubCode: ClubCode;
  clubName: string;
  isCoordinator: boolean;
  roles: ClubRole[];
  permissions: string[];
}

export interface CesaRole {
  roleName: string;
  clubCode: ClubCode;
}

export interface AuthInfo {
  isMasterAdmin?: boolean;
  isCesaAdmin: boolean;
  isClubAdmin?: boolean;
  adminClubs?: string[];
  adminClubCodes?: string[];
  cesaRoles: CesaRole[];
  memberships: ClubMembership[];
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// --- Club / Event ---------------------------------------------------------

export interface Club {
  _id: string;
  code: ClubCode;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string;
  isCoordinator: boolean;
  isActive: boolean;
}

export interface EventSummary {
  _id: string;
  title: string;
  category?: string;
  description: string;
  bannerUrl: string;
  venue: string;
  mode: EventMode;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  clubId: Pick<Club, '_id' | 'code' | 'name' | 'logoUrl'>;
}
