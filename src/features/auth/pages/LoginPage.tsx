import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  login,
  loginFaculty,
  loginClubPresident,
  loginAdmin,
  type RoleLoginPayload,
  type SessionData,
} from '../api';
import { useAuthStore } from '@/store/auth';
import { EyeIcon, EyeOffIcon, UserIcon } from '@/components/ui/Icons';

const PRN_REGEX = /^\d{2,4}[A-Za-z]\d[A-Za-z0-9]\d{3,4}$/i;

const studentSchema = z.object({
  prn: z
    .string()
    .min(1, 'PRN is required')
    .regex(PRN_REGEX, 'Enter a valid PRN (e.g. 123B1B001)'),
  password: z.string().min(1, 'Password is required'),
});

const roleSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type StudentFormValues = z.infer<typeof studentSchema>;
type RoleFormValues = z.infer<typeof roleSchema>;

export type LoginRole = 'student' | 'faculty' | 'club-president' | 'admin';

const ROLES: { id: LoginRole; label: string; path: string }[] = [
  { id: 'student', label: 'Student', path: '/login/student' },
  { id: 'faculty', label: 'Faculty', path: '/login/faculty' },
  { id: 'club-president', label: 'Club President', path: '/login/club-president' },
  { id: 'admin', label: 'Admin', path: '/login/admin' },
];

const ROLE_CREDENTIALS: Record<
  Exclude<LoginRole, 'student'>,
  { username: string; prn: string; label: string }
> = {
  faculty: {
    username: 'faculty',
    prn: 'OWASP-PRES-001',
    label: 'Faculty / Coordinator (OWASP)',
  },
  'club-president': {
    username: 'president',
    prn: 'ACM-PRES-001',
    label: 'Club President (ACM)',
  },
  admin: {
    username: 'admin',
    prn: 'MASTER-ADMIN-001',
    label: 'Master Admin',
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, setGuestSession, isAuthenticated, isGuest } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(
    () => (location.state?.error as string | undefined) || null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Derive active role from URL path
  const activeRole: LoginRole = location.pathname.endsWith('/faculty')
    ? 'faculty'
    : location.pathname.endsWith('/club-president')
      ? 'club-president'
      : location.pathname.endsWith('/admin')
        ? 'admin'
        : 'student';

  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      const destination = (location.state?.from?.pathname as string | undefined) || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isGuest, navigate, location.state]);

  useEffect(() => {
    if (location.state?.error) {
      setAuthError(location.state.error);
    }
  }, [location.state]);

  // Student form
  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  // Role login form (Faculty, Club President, Admin)
  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });

  const mutation = useMutation({
    mutationFn: async (vars: { role: LoginRole; studentData?: StudentFormValues; roleData?: RoleLoginPayload }) => {
      switch (vars.role) {
        case 'faculty':
          return loginFaculty(vars.roleData!);
        case 'club-president':
          return loginClubPresident(vars.roleData!);
        case 'admin':
          return loginAdmin(vars.roleData!);
        case 'student':
        default: {
          const prnNormalized = vars.studentData!.prn.trim().toUpperCase();
          return login({
            prn: prnNormalized,
            prnOrEmail: prnNormalized,
            password: vars.studentData!.password,
          });
        }
      }
    },
    onSuccess: (data: SessionData, variables) => {
      setAuthError(null);
      setSession(data.user, data.auth, data.tokens.accessToken, data.tokens.refreshToken);
      const redirectFrom = location.state?.from?.pathname as string | undefined;
      if (redirectFrom && redirectFrom !== '/login' && !redirectFrom.startsWith('/login/')) {
        navigate(redirectFrom);
        return;
      }

      // Route based on returned session / RBAC
      if (
        variables.role === 'admin' &&
        (data.auth?.isMasterAdmin ||
          (data.user as { isMasterAdmin?: boolean })?.isMasterAdmin ||
          (data.user as { role?: string })?.role === 'MASTER_ADMIN')
      ) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error, variables) => {
      const isNetworkError = axios.isAxiosError(error) && (error.code === 'ERR_NETWORK' || !error.response);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const serverMessage = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      const message = isNetworkError
        ? 'Unable to reach the server. Please try again.'
        : status === 400 || status === 401
          ? variables.role === 'student'
            ? 'Invalid PRN or password.'
            : 'Invalid credentials.'
          : serverMessage || 'Unable to log in right now. Please try again.';

      setAuthError(message);
      if (variables.role === 'student') {
        studentForm.setValue('password', '');
      } else {
        roleForm.setValue('password', '');
      }
      navigate(location.pathname, { replace: true });
      setTimeout(() => {
        const pwdEl = document.getElementById('login-password') as HTMLInputElement | null;
        pwdEl?.focus();
      }, 50);
    },
  });

  const onStudentSubmit = (values: StudentFormValues) => {
    setAuthError(null);
    mutation.mutate({ role: 'student', studentData: values });
  };

  const onRoleSubmit = (values: RoleFormValues) => {
    setAuthError(null);
    mutation.mutate({
      role: activeRole,
      roleData: {
        username: values.username.trim(),
        password: values.password,
      },
    });
  };

  const handleRoleChange = (rolePath: string) => {
    setAuthError(null);
    navigate(rolePath, { replace: true, state: location.state });
  };

  const handleGuestLogin = () => {
    setGuestSession();
    const destination = (location.state?.from?.pathname as string | undefined) || '/';
    navigate(destination);
  };

  return (
    <div className="ui-card mx-auto mt-10 max-w-md sm:mt-14">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">
          {activeRole === 'student' && 'Student Log in'}
          {activeRole === 'faculty' && 'Faculty / Coordinator Log in'}
          {activeRole === 'club-president' && 'Club President Log in'}
          {activeRole === 'admin' && 'Admin Log in'}
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {activeRole === 'student' && 'Sign in with your student PRN to access your portal'}
          {activeRole === 'faculty' && 'Sign in with coordinator credentials to manage club operations'}
          {activeRole === 'club-president' && 'Sign in to manage your club and executive activities'}
          {activeRole === 'admin' && 'Sign in with administrator credentials for master oversight'}
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 sm:grid-cols-4">
        {ROLES.map((tab) => {
          const isActive = activeRole === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleRoleChange(tab.path)}
              className={`rounded-md px-2.5 py-1.5 text-center text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isGuest && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          You are currently in Guest Mode. Log in to access your registered student profile.
        </div>
      )}

      {/* Credentials Card for Faculty, Club President, Admin */}
      {activeRole !== 'student' && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
          <div className="font-semibold text-blue-950 dark:text-blue-200">
            {ROLE_CREDENTIALS[activeRole].label} Credentials
          </div>
          <div className="mt-1 font-mono text-[11px] text-blue-800 dark:text-blue-300">
            <div>
              Username: <span className="font-bold">{ROLE_CREDENTIALS[activeRole].username}</span>{' '}
              <span className="text-gray-500 dark:text-gray-400">
                (or {ROLE_CREDENTIALS[activeRole].prn})
              </span>
            </div>
            <div>
              Password: <span className="font-bold">Password123!</span>
            </div>
          </div>
        </div>
      )}

      {/* Student Login Form */}
      {activeRole === 'student' && (
        <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
          <div>
            <label htmlFor="login-prn" className="mb-1 block text-sm font-medium">
              PRN
            </label>
            <input
              id="login-prn"
              {...studentForm.register('prn')}
              type="text"
              autoComplete="username"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="e.g. 123B1B001"
              onBlur={() => studentForm.trigger('prn')}
            />
            {studentForm.formState.errors.prn && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {studentForm.formState.errors.prn.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand-600 hover:text-brand-500 hover:underline dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                {...studentForm.register('password', {
                  onChange: () => {
                    if (authError) setAuthError(null);
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`w-full rounded-md border px-3 py-2 pr-10 text-sm dark:bg-gray-900 ${
                  authError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-500'
                    : 'dark:border-gray-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {studentForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {studentForm.formState.errors.password.message}
              </p>
            )}
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-400"
            >
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Logging in...' : 'Log in as Student'}
          </button>
        </form>
      )}

      {/* Role Login Form (Faculty, Club President, Admin) */}
      {activeRole !== 'student' && (
        <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
          <div>
            <label htmlFor="login-username" className="mb-1 block text-sm font-medium">
              Username or PRN
            </label>
            <input
              id="login-username"
              {...roleForm.register('username')}
              type="text"
              autoComplete="username"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder={`e.g. ${ROLE_CREDENTIALS[activeRole].username} or ${ROLE_CREDENTIALS[activeRole].prn}`}
            />
            {roleForm.formState.errors.username && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {roleForm.formState.errors.username.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="login-password"
                {...roleForm.register('password', {
                  onChange: () => {
                    if (authError) setAuthError(null);
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`w-full rounded-md border px-3 py-2 pr-10 text-sm dark:bg-gray-900 ${
                  authError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-500'
                    : 'dark:border-gray-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {roleForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {roleForm.formState.errors.password.message}
              </p>
            )}
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-400"
            >
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending
              ? 'Logging in...'
              : activeRole === 'faculty'
                ? 'Log in as Faculty'
                : activeRole === 'club-president'
                  ? 'Log in as Club President'
                  : 'Log in as Admin'}
          </button>
        </form>
      )}

      {/* Guest Mode Option (Student tab) */}
      {activeRole === 'student' && (
        <>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                or explore
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <UserIcon className="h-4 w-4" />
            <span>Continue as Guest</span>
          </button>

          <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
              Register
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
