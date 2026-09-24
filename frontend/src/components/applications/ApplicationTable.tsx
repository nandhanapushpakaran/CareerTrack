import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit, ExternalLink, Trash2 } from 'lucide-react';
import { Application } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatSalaryRange, getCompanyInitials } from '../../lib/utils';

interface ApplicationTableProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th scope="col" className="py-3.5 pl-6 pr-3">Company</th>
            <th scope="col" className="px-3 py-3.5">Position</th>
            <th scope="col" className="px-3 py-3.5">Location</th>
            <th scope="col" className="px-3 py-3.5">Status</th>
            <th scope="col" className="px-3 py-3.5">Applied</th>
            <th scope="col" className="px-3 py-3.5">Interview</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {applications.map((app) => (
            <tr
              key={app.id}
              className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              {/* Company with Initials Avatar */}
              <td className="py-4 pl-6 pr-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                    {getCompanyInitials(app.company_name)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/applications/${app.id}`}
                      className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block max-w-[180px]"
                    >
                      {app.company_name}
                    </Link>
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[11px] text-slate-400 hover:text-indigo-500 flex items-center gap-1 mt-0.5"
                      >
                        Posting <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </td>

              {/* Position & Compensation */}
              <td className="px-3 py-4">
                <div className="min-w-0">
                  <span className="font-medium text-slate-900 dark:text-slate-100 block truncate max-w-[200px]">
                    {app.position}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {app.employment_type}
                    {(app.salary_min || app.salary_max) && (
                      <> · {formatSalaryRange(app.salary_min, app.salary_max, app.currency)}</>
                    )}
                  </span>
                </div>
              </td>

              {/* Location */}
              <td className="px-3 py-4 text-xs text-slate-600 dark:text-slate-300">
                {app.location || '—'}
              </td>

              {/* Status */}
              <td className="px-3 py-4">
                <StatusBadge status={app.status} size="sm" />
              </td>

              {/* Application Date */}
              <td className="px-3 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatDate(app.application_date)}
              </td>

              {/* Interview Date */}
              <td className="px-3 py-4 text-xs whitespace-nowrap">
                {app.interview_date ? (
                  <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(app.interview_date)}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/applications/${app.id}`}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View details"
                    aria-label={`View details for ${app.company_name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onEdit(app)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit application"
                    aria-label={`Edit application for ${app.company_name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(app)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete application"
                    aria-label={`Delete application for ${app.company_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
