import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuthStore } from '@/store/auth';
import { EyeIcon, EyeOffIcon, UserIcon } from '@/components/ui/Icons';

const schema = z.object({
  prnOrEmail: z.string().min(1, 'PRN or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, setGuestSession, isAuthenticated, isGuest } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(
    () => (location.state?.error as string | undefined) || null
  );
  const [showPassword, setShowPassword] = useState(false);

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

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthError(null);
      setSession(data.user, data.auth, data.tokens.accessToken, data.tokens.refreshToken);
      const destination = (location.state?.from?.pathname as string | undefined) || '/dashboard';
      navigate(destination);
    },
    onError: (error) => {
      let message = 'wrong password entered';
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          message = 'Unable to connect to the backend server. Please make sure the backend is running.';
        } else {
          // Status 401, 400, 404 or invalid credentials
          message = 'wrong password entered';
        }
      }
      setAuthError(message);
      setValue('password', '');
      navigate('/login', { replace: true });
      setTimeout(() => setFocus('password'), 50);
    },
  });

  const onSubmit = (values: FormValues) => {
    setAuthError(null);
    mutation.mutate(values);
  };

  const handleGuestLogin = () => {
    setGuestSession();
    const destination = (location.state?.from?.pathname as string | undefined) || '/';
    navigate(destination);
  };

  return (
    <div className="ui-card mx-auto mt-12 max-w-sm sm:mt-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Sign in to access your student portal and manage club activities
        </p>
      </div>

      {isGuest && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          You are currently in Guest Mode. Log in to access your registered student profile.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">PRN or Email</label>
          <input
            {...register('prnOrEmail')}
            className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            placeholder="eg. 125B1B333"
          />
          {errors.prnOrEmail && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.prnOrEmail.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:text-brand-500 hover:underline dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password', {
                onChange: () => {
                  if (authError) setAuthError(null);
                },
              })}
              type={showPassword ? 'text' : 'password'}
              className={`w-full rounded-md border px-3 py-2 pr-10 text-sm dark:bg-gray-900 ${
                authError === 'wrong password entered'
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
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
          ) : authError === 'wrong password entered' ? (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">wrong password entered</p>
          ) : null}
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
          {mutation.isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {/* Guest Mode Option */}
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
    </div>
  );
}
