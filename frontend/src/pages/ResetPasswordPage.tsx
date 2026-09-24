import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, ArrowLeft, Briefcase, Check, CheckCircle, Lock, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { apiRequest } from '../lib/api';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-\/\\~`+=';[\]]/,
        'Must contain at least one special character'
      ),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
    mode: 'onChange',
  });

  const currentPassword = watch('password', '');

  // Password Strength Checker
  const strengthChecks = useMemo(() => {
    return [
      { label: 'At least 8 characters', pass: currentPassword.length >= 8 },
      { label: 'One uppercase letter (A-Z)', pass: /[A-Z]/.test(currentPassword) },
      { label: 'One lowercase letter (a-z)', pass: /[a-z]/.test(currentPassword) },
      { label: 'One number (0-9)', pass: /\d/.test(currentPassword) },
      {
        label: 'One special character (!@#$...)',
        pass: /[!@#$%^&*(),.?":{}|<>_\-\/\\~`+=';[\]]/.test(currentPassword),
      },
    ];
  }, [currentPassword]);

  const passedCount = strengthChecks.filter((c) => c.pass).length;
  const strengthPercentage = (passedCount / 5) * 100;

  const strengthColor =
    passedCount <= 2
      ? 'bg-rose-500'
      : passedCount <= 4
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError('Missing reset token. Please request a new password reset email.');
      return;
    }

    setServerError(null);
    setIsLoading(true);

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          new_password: data.password,
          confirm_new_password: data.confirm_password,
        }),
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setServerError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Navigation to Login */}
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
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
            Set new password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose a strong, secure password for your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl">
          {!token ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Invalid or Missing Reset Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This password reset link is invalid or incomplete. Please request a new link from the login page.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => navigate('/login')}
              >
                Go to Sign In
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your password has been updated. Redirecting you to sign in...
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => navigate('/login')}
              >
                Sign In Now
              </Button>
            </div>
          ) : (
            <>
              {serverError && (
                <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  {...register('password')}
                  error={errors.password?.message}
                />

                {/* Password Strength Meter */}
                {currentPassword && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Password strength:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {passedCount <= 2 ? 'Weak' : passedCount <= 4 ? 'Moderate' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1 pt-1 text-[11px]">
                      {strengthChecks.map((check, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 ${
                            check.pass
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {check.pass ? (
                            <Check className="w-3 h-3 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 shrink-0" />
                          )}
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  {...register('confirm_password')}
                  error={errors.confirm_password?.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center shadow-md shadow-indigo-500/20"
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
