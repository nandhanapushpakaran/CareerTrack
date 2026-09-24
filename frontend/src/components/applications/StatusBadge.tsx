import React from 'react';
import { ApplicationStatus } from '../../types';
import { cn, getStatusTheme } from '../../lib/utils';

export interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const theme = getStatusTheme(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none',
        theme.bg,
        theme.text,
        theme.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', theme.dot)} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
