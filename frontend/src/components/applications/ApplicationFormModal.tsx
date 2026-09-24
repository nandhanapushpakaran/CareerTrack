import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { api } from '../../lib/api';
import { Application } from '../../types';

const applicationSchema = z
  .object({
    company_name: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required'),
    job_url: z
      .string()
      .url('Must be a valid URL (starting with http:// or https://)')
      .optional()
      .or(z.literal('')),
    location: z.string().optional().or(z.literal('')),
    employment_type: z.enum([
      'Full-time',
      'Part-time',
      'Contract',
      'Internship',
      'Temporary',
    ]),
    salary_min: z
      .union([z.number().min(0, 'Salary cannot be negative'), z.nan()])
      .optional()
      .nullable(),
    salary_max: z
      .union([z.number().min(0, 'Salary cannot be negative'), z.nan()])
      .optional()
      .nullable(),
    currency: z.string().min(1).default('USD'),
    status: z.enum(['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn']),
    application_date: z.string().optional(),
    interview_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (
        data.salary_min !== null &&
        data.salary_min !== undefined &&
        !isNaN(data.salary_min) &&
        data.salary_max !== null &&
        data.salary_max !== undefined &&
        !isNaN(data.salary_max)
      ) {
        return data.salary_min <= data.salary_max;
      }
      return true;
    },
    {
      message: 'Salary minimum cannot exceed salary maximum',
      path: ['salary_min'],
    }
  );

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Application | null;
  onSuccess?: () => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const defaultValues: Partial<ApplicationFormData> = {
    company_name: '',
    position: '',
    job_url: '',
    location: '',
    employment_type: 'Full-time',
    salary_min: null,
    salary_max: null,
    currency: 'USD',
    status: 'Applied',
    application_date: new Date().toISOString().split('T')[0],
    interview_date: '',
    notes: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        company_name: initialData.company_name,
        position: initialData.position,
        job_url: initialData.job_url || '',
        location: initialData.location || '',
        employment_type: initialData.employment_type,
        salary_min: initialData.salary_min ?? null,
        salary_max: initialData.salary_max ?? null,
        currency: initialData.currency || 'USD',
        status: initialData.status,
        application_date: initialData.application_date
          ? new Date(initialData.application_date).toISOString().split('T')[0]
          : '',
        interview_date: initialData.interview_date
          ? new Date(initialData.interview_date).toISOString().slice(0, 16)
          : '',
        notes: initialData.notes || '',
      });
    } else {
      reset(defaultValues);
    }
    setServerError(null);
  }, [initialData, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      // Format payload dates
      const payload: any = {
        ...data,
        job_url: data.job_url && data.job_url.trim() ? data.job_url.trim() : null,
        location: data.location && data.location.trim() ? data.location.trim() : null,
        notes: data.notes && data.notes.trim() ? data.notes.trim() : null,
        salary_min:
          data.salary_min !== null && !isNaN(data.salary_min as number)
            ? Number(data.salary_min)
            : null,
        salary_max:
          data.salary_max !== null && !isNaN(data.salary_max as number)
            ? Number(data.salary_max)
            : null,
        application_date: data.application_date
          ? new Date(data.application_date).toISOString()
          : new Date().toISOString(),
        interview_date:
          data.interview_date && data.interview_date.trim()
            ? new Date(data.interview_date).toISOString()
            : null,
      };

      if (isEditing && initialData) {
        return api.put<Application>(`/applications/${initialData.id}`, payload);
      } else {
        return api.post<Application>('/applications', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      if (initialData) {
        queryClient.invalidateQueries({ queryKey: ['application', initialData.id] });
      }
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setServerError(err.message || 'Failed to save application');
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job Application' : 'Add New Job Application'}
      description={
        isEditing
          ? 'Update details, status, or timeline for this application.'
          : 'Track a new opportunity in your job search workspace.'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {serverError}
          </div>
        )}

        {/* Company & Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            placeholder="e.g. Google, Stripe"
            {...register('company_name')}
            error={errors.company_name?.message}
          />
          <Input
            label="Position Title *"
            placeholder="e.g. Software Engineer"
            {...register('position')}
            error={errors.position?.message}
          />
        </div>

        {/* Job URL & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Posting URL"
            placeholder="https://..."
            {...register('job_url')}
            error={errors.job_url?.message}
          />
          <Input
            label="Location"
            placeholder="e.g. Remote, New York, NY"
            {...register('location')}
            error={errors.location?.message}
          />
        </div>

        {/* Status & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Application Status *
            </label>
            <select
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              {...register('status')}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
            {errors.status?.message && (
              <p className="text-xs text-rose-600">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Employment Type *
            </label>
            <select
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              {...register('employment_type')}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
        </div>

        {/* Compensation (Min, Max, Currency) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Salary Min"
            type="number"
            placeholder="e.g. 120000"
            {...register('salary_min', { valueAsNumber: true })}
            error={errors.salary_min?.message}
          />
          <Input
            label="Salary Max"
            type="number"
            placeholder="e.g. 150000"
            {...register('salary_max', { valueAsNumber: true })}
            error={errors.salary_max?.message}
          />
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Currency
            </label>
            <select
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              {...register('currency')}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Application Date"
            type="date"
            {...register('application_date')}
            error={errors.application_date?.message}
          />
          <Input
            label="Interview Date / Time"
            type="datetime-local"
            {...register('interview_date')}
            error={errors.interview_date?.message}
          />
        </div>

        {/* Notes */}
        <Textarea
          label="Notes & Interview Prep"
          placeholder="Key details, interview stages, recruiter contacts, or referral info..."
          rows={3}
          {...register('notes')}
          error={errors.notes?.message}
        />

        {/* Actions */}
        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            {isEditing ? 'Save Changes' : 'Create Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
