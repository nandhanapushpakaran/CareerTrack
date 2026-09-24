import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { Application } from '../types';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/applications/StatusBadge';
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  formatDate,
  formatDateTime,
  formatSalaryRange,
  getCompanyInitials,
} from '../lib/utils';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: application, isLoading, isError } = useQuery<Application>({
    queryKey: ['application', id],
    queryFn: () => api.get<Application>(`/applications/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/applications');
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-400">
        Loading application details...
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
          Application not found or you don't have permission to view it.
        </p>
        <Link to="/applications">
          <Button variant="outline" size="sm">
            Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate timeline states
  const isInterviewStep =
    application.status === 'Interview' ||
    application.status === 'Offer' ||
    !!application.interview_date;

  const isFinalStep =
    application.status === 'Offer' ||
    application.status === 'Rejected' ||
    application.status === 'Withdrawn';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 font-black text-xl text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 shadow-sm">
              {getCompanyInitials(application.company_name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {application.company_name}
                </h1>
                <StatusBadge status={application.status} size="md" />
              </div>
              <p className="text-base text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {application.position}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                {application.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {application.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {application.employment_type}
                </span>
                {(application.salary_min || application.salary_max) && (
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                    <DollarSign className="w-3.5 h-3.5" />
                    {formatSalaryRange(
                      application.salary_min,
                      application.salary_max,
                      application.currency
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            {application.job_url && (
              <a
                href={application.job_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex"
              >
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Job Posting
                </Button>
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Timeline & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline & Dates */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6">
              Application Lifecycle
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Step 1: Applied */}
              <div className="relative">
                <span className="absolute -left-6 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Application Submitted
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDate(application.application_date)}
                  </p>
                </div>
              </div>

              {/* Step 2: Interview */}
              <div className="relative">
                <span
                  className={`absolute -left-6 top-0 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    isInterviewStep
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-transparent'
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                </span>
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      isInterviewStep
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-slate-400'
                    }`}
                  >
                    Interview Stage
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {application.interview_date
                      ? formatDateTime(application.interview_date)
                      : isInterviewStep
                      ? 'In progress'
                      : 'Pending scheduling'}
                  </p>
                </div>
              </div>

              {/* Step 3: Decision */}
              <div className="relative">
                <span
                  className={`absolute -left-6 top-0 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    application.status === 'Offer'
                      ? 'bg-emerald-600 text-white'
                      : application.status === 'Rejected'
                      ? 'bg-rose-600 text-white'
                      : application.status === 'Withdrawn'
                      ? 'bg-slate-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-transparent'
                  }`}
                >
                  {application.status === 'Offer' ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <XCircle className="w-2.5 h-2.5" />
                  )}
                </span>
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      application.status === 'Offer'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : application.status === 'Rejected'
                        ? 'text-rose-600 dark:text-rose-400'
                        : application.status === 'Withdrawn'
                        ? 'text-slate-600 dark:text-slate-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {application.status === 'Offer'
                      ? 'Offer Received!'
                      : application.status === 'Rejected'
                      ? 'Application Rejected'
                      : application.status === 'Withdrawn'
                      ? 'Application Withdrawn'
                      : 'Decision Pending'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isFinalStep
                      ? `Status updated to ${application.status}`
                      : 'Awaiting outcome'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Recruiter & Interview Contacts
            </h3>

            {application.contacts && application.contacts.length > 0 ? (
              <div className="space-y-3">
                {application.contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{contact.name}</span>
                      {contact.role && (
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({contact.role})
                        </span>
                      )}
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No recruiter or hiring manager contacts recorded for this application.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Notes & Interview Prep */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Notes & Interview Prep
            </h3>

            {application.notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50/60 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                {application.notes}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400">
                  No notes recorded yet. Edit this application to add interview questions, talking points, or company research.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ApplicationFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={application}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete Application"
        message={`Are you sure you want to delete "${application.position}" at "${application.company_name}"?`}
      />
    </div>
  );
};
