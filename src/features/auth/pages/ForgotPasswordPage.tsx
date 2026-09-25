import { useRef, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api';
import { ErrorMessage } from '@/components/ui/Feedback';
import { MailIcon, ArrowLeftIcon } from '@/components/ui/Icons';

// Step 1: Enter PRN / email
const emailSchema = z.object({
  prnOrEmail: z.string().min(1, 'PRN or email is required'),
});
type EmailForm = z.infer<typeof emailSchema>;

// Step 2: Enter 6-digit security code + new password
const resetSchema = z
  .object({
    code: z
      .string()
      .min(4, 'Security code is required')
      .max(10, 'Code looks too long'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type ResetForm = z.infer<typeof resetSchema>;

type Step = 'request' | 'verify' | 'done';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [prnOrEmail, setPrnOrEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  // ── Step 1 form ─────────────────────────────────────────────────────────────
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });

  const requestMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, variables) => {
      setPrnOrEmail(variables.prnOrEmail);
      setStep('verify');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    },
  });

  // ── Step 2 form ─────────────────────────────────────────────────────────────
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const resetMutation = useMutation({
    mutationFn: (values: ResetForm) =>
      resetPassword({ prnOrEmail, code: values.code, newPassword: values.newPassword }),
    onSuccess: () => {
      setStep('done');
    },
  });

  const onRequestSubmit = (values: EmailForm) => {
    requestMutation.mutate(values);
  };

  const onResetSubmit = (values: ResetForm) => {
    resetMutation.mutate(values);
  };

  // ── Step 1: request code ────────────────────────────────────────────────────
  if (step === 'request') {
    return (
      <div className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Forgot password
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter your student PRN or registered institutional email. We&apos;ll send a security
            code to your email address.
          </p>
        </div>

        <form onSubmit={emailForm.handleSubmit(onRequestSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">PRN or Institutional Email</label>
            <input
              {...emailForm.register('prnOrEmail')}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="STU-2026-001 or you@institution.edu"
              autoFocus
            />
            {emailForm.formState.errors.prnOrEmail && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {emailForm.formState.errors.prnOrEmail.message}
              </p>
            )}
          </div>

          {requestMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/40">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {axios.isAxiosError(requestMutation.error) && requestMutation.error.response?.status === 404
                  ? 'Password reset is not available yet'
                  : axios.isAxiosError(requestMutation.error) && !requestMutation.error.response
                  ? 'Cannot connect to the server. Please check your connection.'
                  : axios.isAxiosError(requestMutation.error)
                  ? requestMutation.error.response?.data?.message || 'Failed to send reset code'
                  : 'Failed to send reset code'}
              </p>
              {axios.isAxiosError(requestMutation.error) && requestMutation.error.response?.status === 404 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  The password reset feature is not yet enabled on the backend. Please contact CESA admin at{' '}
                  <span className="font-semibold">support@cesa-sdw.org</span> to reset your password.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={requestMutation.isPending}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {requestMutation.isPending ? 'Sending code...' : 'Send security code'}
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
      </div>
    );
  }

  // ── Step 2: enter code + new password ───────────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
        {/* Email sent notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Security code sent!
            </p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              A 6-digit code was sent to the email linked with{' '}
              <span className="font-semibold">{prnOrEmail}</span>. Check your inbox and spam
              folder. The code is valid for&nbsp;<strong>15 minutes</strong>.
            </p>
          </div>
        </div>

        <h1 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Enter security code &amp; new password
        </h1>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Copy the code from your email and set your new password below.
        </p>

        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
          {/* Code */}
          <div>
            <label className="mb-1 block text-sm font-medium">Security Code</label>
            <input
              {...resetForm.register('code')}
              ref={(el) => {
                resetForm.register('code').ref(el);
                codeInputRef.current = el;
              }}
              className="w-full rounded-md border px-3 py-2 text-center text-lg font-mono tracking-widest dark:border-gray-700 dark:bg-gray-900"
              placeholder="• • • • • •"
              maxLength={10}
              autoComplete="one-time-code"
            />
            {resetForm.formState.errors.code && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {resetForm.formState.errors.code.message}
              </p>
            )}
          </div>

          {/* New password */}
          <div>
            <label className="mb-1 block text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                {...resetForm.register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-md border px-3 py-2 pr-10 text-sm dark:border-gray-700 dark:bg-gray-900"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <span className="text-xs font-medium">Hide</span>
                ) : (
                  <span className="text-xs font-medium">Show</span>
                )}
              </button>
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                {...resetForm.register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                className="w-full rounded-md border px-3 py-2 pr-10 text-sm dark:border-gray-700 dark:bg-gray-900"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <span className="text-xs font-medium">Hide</span>
                ) : (
                  <span className="text-xs font-medium">Show</span>
                )}
              </button>
            </div>
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
                  : 'Failed to reset password. Please check your code and try again.'
              }
            />
          )}

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {resetMutation.isPending ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center">
          <button
            type="button"
            onClick={() => {
              setStep('request');
              emailForm.reset();
              resetForm.reset();
            }}
            className="block w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Didn&apos;t receive the code? Try a different PRN or email
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Step 3: success ──────────────────────────────────────────────────────────
  return (
    <div className="ui-card mx-auto mt-12 max-w-md sm:mt-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
        <svg
          className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Password reset successful
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        Your password has been updated. You can now log in with your new password.
      </p>
      <button
        type="button"
        onClick={() => navigate('/login', { replace: true })}
        className="inline-flex w-full items-center justify-center rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
      >
        Go to login
      </button>
    </div>
  );
}

