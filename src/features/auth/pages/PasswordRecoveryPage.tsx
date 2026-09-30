import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api';
import { ErrorMessage } from '@/components/ui/Feedback';
import { ArrowLeftIcon, MailIcon } from '@/components/ui/Icons';

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type EmailForm = z.infer<typeof emailSchema>;

const resetSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type ResetForm = z.infer<typeof resetSchema>;

export function PasswordRecoveryPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const queryEmail = searchParams.get('email') ?? '';
  const isResetRoute = location.pathname === '/reset-password';
  const [sentEmail, setSentEmail] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: queryEmail },
  });

  const requestMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, variables) => setSentEmail(variables.email),
  });

  const resetMutation = useMutation({
    mutationFn: (values: ResetForm) =>
      resetPassword({
        email: values.email,
        token,
        newPassword: values.newPassword,
      }),
    onSuccess: () => setResetComplete(true),
  });

  if (token && resetComplete) {
    return (
      <section className="ui-card mx-auto mt-12 max-w-md text-center sm:mt-16">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Password reset successful
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Go to login
        </button>
      </section>
    );
  }

  if (token) {
    return (
      <section className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Enter the email address that received your reset link and choose a new password.
        </p>

        <form onSubmit={resetForm.handleSubmit((values) => resetMutation.mutate(values))} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              {...resetForm.register('email')}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            {resetForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {resetForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...resetForm.register('newPassword')}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="At least 8 characters, one uppercase letter and one number"
            />
            {resetForm.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              {...resetForm.register('confirmPassword')}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {resetMutation.isError && (
            <ErrorMessage
              message={
                axios.isAxiosError(resetMutation.error)
                  ? resetMutation.error.response?.data?.message || resetMutation.error.message
                  : 'Could not reset the password. Request a new reset link and try again.'
              }
            />
          )}

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {resetMutation.isPending ? 'Updating password...' : 'Update password'}
          </button>
        </form>
      </section>
    );
  }

  if (isResetRoute) {
    return (
      <section className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Reset link is missing
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Request a new password reset email to continue.
        </p>
        <Link to="/forgot-password" className="ui-button ui-button-primary mt-5">
          Request a new link
        </Link>
      </section>
    );
  }

  if (sentEmail) {
    return (
      <section className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-gray-800 dark:text-brand-300">
          <MailIcon className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          If an account exists for <span className="font-semibold">{sentEmail}</span>, a password
          reset link has been sent. Check your inbox and spam folder, then open the link to set a
          new password.
        </p>
        <button
          type="button"
          onClick={() => {
            setSentEmail('');
            requestMutation.reset();
            emailForm.reset();
          }}
          className="mt-5 block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Try another email
        </button>
      </section>
    );
  }

  return (
    <section className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Forgot password
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Enter your registered email address and we&apos;ll send you a password reset link.
        </p>
      </div>

      <form onSubmit={emailForm.handleSubmit((values) => requestMutation.mutate(values))} className="space-y-4">
        <div>
          <label htmlFor="recovery-email" className="mb-1 block text-sm font-medium">
            Institutional email
          </label>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            autoFocus
            {...emailForm.register('email')}
            className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            placeholder="you@institution.edu"
          />
          {emailForm.formState.errors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>

        {requestMutation.isError && (
          <ErrorMessage
            message={
              axios.isAxiosError(requestMutation.error)
                ? requestMutation.error.response?.data?.message || requestMutation.error.message
                : 'Could not request a reset link. Please try again.'
            }
          />
        )}

        <button
          type="submit"
          disabled={requestMutation.isPending}
          className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {requestMutation.isPending ? 'Sending reset link...' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-4 text-center dark:border-gray-800">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to login</span>
        </Link>
      </div>
    </section>
  );
}