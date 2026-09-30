import { api } from '@/lib/api';
import type { ApiResponse, AuthInfo, Tokens, User, Year } from '@/types/api';

export interface RegisterPayload {
  prn: string;
  email: string;
  name: string;
  password: string;
  branch: string;
  year: Year;
}

export interface LoginPayload {
  prn: string;
  password: string;
  prnOrEmail?: string;
}

export interface RoleLoginPayload {
  username: string;
  password: string;
}

export interface StudentDummyLoginPayload {
  prn: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface SessionData {
  user: User;
  auth: AuthInfo;
  tokens: Tokens;
}

export interface UserProfileResponse {
  user: User;
  auth: AuthInfo;
  memberships?: AuthInfo['memberships'];
}

export const registerStudent = (payload: RegisterPayload) =>
  api.post<ApiResponse<SessionData>>('/auth/register', payload).then((r) => r.data.data);

export const login = (payload: LoginPayload) =>
  api
    .post<ApiResponse<SessionData>>('/auth/login', {
      prn: payload.prn,
      prnOrEmail: payload.prnOrEmail ?? payload.prn,
      password: payload.password,
    })
    .then((r) => r.data.data);

export const loginStudent = (payload: StudentDummyLoginPayload) =>
  login({ prn: payload.prn, password: 'Password123!' });

export const loginFaculty = (payload: RoleLoginPayload) => {
  const username = payload.username.trim();
  const prnOrEmail =
    username.toLowerCase() === 'faculty'
      ? 'OWASP-PRES-001'
      : username;
  const password =
    payload.password === 'faculty'
      ? 'Password123!'
      : payload.password;
  return login({ prn: prnOrEmail, prnOrEmail, password });
};

export const loginClubPresident = (payload: RoleLoginPayload) => {
  const username = payload.username.trim();
  const prnOrEmail =
    username.toLowerCase() === 'president'
      ? 'ACM-PRES-001'
      : username;
  const password =
    payload.password === 'president'
      ? 'Password123!'
      : payload.password;
  return login({ prn: prnOrEmail, prnOrEmail, password });
};

export const loginAdmin = (payload: RoleLoginPayload) => {
  const username = payload.username.trim();
  const prnOrEmail =
    username.toLowerCase() === 'admin'
      ? 'MASTER-ADMIN-001'
      : username;
  const password =
    payload.password === 'admin'
      ? 'Password123!'
      : payload.password;
  return login({ prn: prnOrEmail, prnOrEmail, password });
};

export const logout = (refreshToken: string) =>
  api.post<ApiResponse<null>>('/auth/logout', { refreshToken }).then((r) => r.data.data);

export const getMe = () =>
  api
    .get<ApiResponse<{ user: User; auth: AuthInfo }>>('/auth/me')
    .then((r) => r.data.data);

export const getUserProfile = () =>
  api.get<ApiResponse<UserProfileResponse>>('/users/me').then((r) => r.data.data);

export interface UpdateUserProfilePayload {
  name?: string;
  email?: string;
  branch?: string;
  year?: Year;
  profilePicture?: string;
  cardBackground?: string;
}

export const updateUserProfile = (payload: UpdateUserProfilePayload) =>
  api.patch<ApiResponse<UserProfileResponse>>('/users/me', payload).then((r) => r.data.data);

export const updateProfilePicture = (profilePicture: string) =>
  api
    .patch<ApiResponse<UserProfileResponse>>('/users/me/profile-picture', { profilePicture })
    .then((r) => r.data.data);

export const removeProfilePicture = () =>
  api.delete<ApiResponse<UserProfileResponse>>('/users/me/profile-picture').then((r) => r.data.data);

export const updateCardBackground = (cardBackground: string) =>
  api
    .patch<ApiResponse<UserProfileResponse>>('/users/me/card-background', { cardBackground })
    .then((r) => r.data.data);

export const removeCardBackground = () =>
  api.delete<ApiResponse<UserProfileResponse>>('/users/me/card-background').then((r) => r.data.data);

export const forgotPassword = (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
  api
    .post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', payload)
    .then((r) => r.data.data);

export const resetPassword = (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> =>
  api
    .post<ApiResponse<ResetPasswordResponse>>('/auth/reset-password', payload)
    .then((r) => r.data.data);

