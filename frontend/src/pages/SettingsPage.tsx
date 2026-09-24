import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Laptop, Lock, Moon, Sun, User as UserIcon } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { formatDate } from '../lib/utils';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-\/\\~`+=';[\]]/,
        'Must contain at least one special character'
      ),
    confirm_new_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'New passwords do not match',
    path: ['confirm_new_password'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    setProfileError(null);
    setProfileSuccess(null);
    setIsUpdatingProfile(true);
    try {
      const updated = await api.put('/users/me', data);
      updateUser(updated);
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsUpdatingPassword(true);
    try {
      await api.put('/users/me/password', data);
      setPasswordSuccess('Password changed successfully.');
      resetPasswordForm();
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal account, security credentials, and application theme.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <UserIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Profile Information
          </h2>
        </div>

        {profileSuccess && (
          <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {profileSuccess}
          </div>
        )}

        {profileError && (
          <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 max-w-lg">
          <Input
            label="Full Name"
            defaultValue={user?.full_name}
            {...registerProfile('full_name')}
            error={profileErrors.full_name?.message}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address (Account Identifier)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={isUpdatingProfile}>
            Save Profile
          </Button>
        </form>
      </div>

      {/* Appearance Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <Sun className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Appearance
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose your interface theme. Selected theme is saved automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              theme === 'light'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Light
              </span>
              <span className="text-[11px] text-slate-400">Clean bright view</span>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              theme === 'dark'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Dark
              </span>
              <span className="text-[11px] text-slate-400">Easy on the eyes</span>
            </div>
          </button>

          {/* System Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              theme === 'system'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                System
              </span>
              <span className="text-[11px] text-slate-400">Sync with OS</span>
            </div>
          </button>
        </div>
      </div>

      {/* Security & Password Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Security & Password
          </h2>
        </div>

        {passwordSuccess && (
          <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4 max-w-lg">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            {...registerPassword('current_password')}
            error={passwordErrors.current_password?.message}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            helperText="At least 8 chars with uppercase, lowercase, digit, and symbol"
            {...registerPassword('new_password')}
            error={passwordErrors.new_password?.message}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            {...registerPassword('confirm_new_password')}
            error={passwordErrors.confirm_new_password?.message}
          />

          <Button type="submit" variant="primary" size="md" isLoading={isUpdatingPassword}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
