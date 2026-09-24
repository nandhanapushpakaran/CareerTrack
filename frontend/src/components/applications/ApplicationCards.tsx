import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Edit, ExternalLink, MapPin, Trash2 } from 'lucide-react';
import { Application } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatSalaryRange, getCompanyInitials } from '../../lib/utils';

interface ApplicationCardsProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

export const ApplicationCards: React.FC<ApplicationCardsProps> = ({
  applications,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
        >
          <div>
            {/* Header: Company, Initials, Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                  {getCompanyInitials(app.company_name)}
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/applications/${app.id}`}
                    className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                  >
                    {app.company_name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {app.position}
                  </p>
                </div>
              </div>
              <StatusBadge status={app.status} size="sm" />
            </div>

            {/* Details list */}
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {app.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{app.location}</span>
                </div>
              )}
              {(app.salary_min || app.salary_max) && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatSalaryRange(app.salary_min, app.salary_max, app.currency)}</span>
                </div>
              )}
              {app.interview_date && (
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Interview: {formatDate(app.interview_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer: Applied Date and Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Applied {formatDate(app.application_date)}
            </span>
            <div className="flex items-center gap-1">
              <Link
                to={`/applications/${app.id}`}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Details"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onEdit(app)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(app)}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
