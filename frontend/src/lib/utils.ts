import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApplicationStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount?: number | null,
  currency: string = 'USD'
): string {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  currency: string = 'USD'
): string {
  if (!min && !max) return 'Not disclosed';
  if (min && !max) return `From ${formatCurrency(min, currency)}`;
  if (!min && max) return `Up to ${formatCurrency(max, currency)}`;
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function getStatusTheme(status: ApplicationStatus) {
  switch (status) {
    case 'Applied':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/60',
        dot: 'bg-blue-500',
        pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      };
    case 'Interview':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800/60',
        dot: 'bg-purple-500',
        pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      };
    case 'Offer':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
        pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-500',
        pill: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      };
    case 'Withdrawn':
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-900/40',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800/60',
        dot: 'bg-slate-400',
        pill: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      };
  }
}

export function getCompanyInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
