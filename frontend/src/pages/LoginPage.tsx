import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, ArrowLeft, Briefcase, CheckCircle, ExternalLink, Lock, Mail } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const isExpired = searchParams.get('expired') === 'true';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setLoginSuccessNotice(null);
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.remember_me);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(getValues('email') || '');
    setForgotError(null);
    setForgotSuccess(null);
    setDevResetUrl(null);
    setIsForgotOpen(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setDevResetUrl(null);

    const email = forgotEmail.trim();
    if (!email) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setForgotSuccess(
        response.message ||
          'If an account exists for this email, password reset instructions have been sent.'
      );
      if (response.dev_reset_url) {
        setDevResetUrl(response.dev_reset_url);
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Navigation to Landing Page */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              CareerTrack
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to your job search workspace
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
          {isExpired && (
            <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              Your session has expired. Please log in again.
            </div>
          )}

          {loginSuccessNotice && (
            <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{loginSuccessNotice}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  {...register('remember_me')}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium cursor-pointer transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md shadow-indigo-500/20"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Forgot Password"
        description="Enter your registered email address and we will send you a secure link to reset your password."
        maxWidth="md"
      >
        {forgotSuccess ? (
          <div className="py-3 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Check your email
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                {forgotSuccess}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                The link is time-limited and will expire in 30 minutes for security.
              </p>

              {devResetUrl && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-left text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span>Local Development Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    No SMTP mail server is configured in <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono text-[10px]">.env</code>, so real emails cannot be dispatched across the internet to external inboxes.
                  </p>
                  <div className="pt-1">
                    <a
                      href={devResetUrl}
                      onClick={() => setIsForgotOpen(false)}
                      className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                    >
                      <span>Click here to test Reset Password</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setForgotSuccess(null)}
              >
                Send to different email
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsForgotOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
            {forgotError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {forgotError}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="We will send password reset instructions to this address."
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsForgotOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={forgotLoading}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
