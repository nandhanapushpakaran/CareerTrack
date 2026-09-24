import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { UpcomingInterview } from '../../types';
import { formatDateTime, getCompanyInitials } from '../../lib/utils';

interface UpcomingInterviewsProps {
  interviews: UpcomingInterview[];
}

export const UpcomingInterviews: React.FC<UpcomingInterviewsProps> = ({ interviews }) => {
  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          No upcoming interviews scheduled
        </p>
        <span className="text-[11px] text-slate-400 mt-0.5">
          Add interview dates to your applications to see reminders here.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interviews.map((item) => (
        <Link
          key={item.id}
          to={`/applications/${item.id}`}
          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-800/60 shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-900">
              {getCompanyInitials(item.company_name)}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors block truncate">
                {item.company_name}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {item.position}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 ml-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDateTime(item.interview_date)}</span>
            </div>
            {item.location && (
              <span className="text-[11px] text-slate-400 block truncate max-w-[120px] mt-0.5">
                {item.location}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
