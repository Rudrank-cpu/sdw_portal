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
  prnOrEmail: string;
  password: string;
}

export interface ForgotPasswordPayload {
  prnOrEmail: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetCodePayload {
  prnOrEmail: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  valid: boolean;
  resetToken?: string;
  message?: string;
}

export interface ResetPasswordPayload {
  prnOrEmail: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

interface SessionData {
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
  api.post<ApiResponse<SessionData>>('/auth/login', payload).then((r) => r.data.data);

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

