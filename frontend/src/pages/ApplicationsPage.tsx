import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { Application, ApplicationPaginationResponse } from '../types';
import { Button } from '../components/common/Button';
import { FilterBar, FilterState } from '../components/applications/FilterBar';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { ApplicationCards } from '../components/applications/ApplicationCards';
import { ApplicationFormModal } from '../components/applications/ApplicationFormModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { openAddModal } = useOutletContext<{ openAddModal: () => void }>();

  // Filter & pagination state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    employment_type: '',
    sort_by: 'newest',
  });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // View state: 'table' or 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Edit modal state
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  // Delete modal state
  const [deletingApplication, setDeletingApplication] = useState<Application | null>(null);

  // Fetch applications with query parameters
  const { data, isLoading, isError, error } = useQuery<ApplicationPaginationResponse>({
    queryKey: ['applications', filters, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.status) params.append('status', filters.status);
      if (filters.employment_type) params.append('employment_type', filters.employment_type);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      return api.get<ApplicationPaginationResponse>(`/applications?${params.toString()}`);
    },
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page upon filter change
  };

  const handleClearAll = () => {
    setFilters({
      search: '',
      status: '',
      employment_type: '',
      sort_by: 'newest',
    });
    setPage(1);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeletingApplication(null);
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Keep track of every opportunity in one place.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-indigo-500/25"
        >
          Add Application
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={data?.total ?? 0}
      />

      {/* Loading & Content States */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-400">
          Loading applications...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 text-center text-xs text-rose-700 dark:text-rose-300">
          Error loading applications: {(error as any)?.message || 'Please try again.'}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="space-y-5">
          {viewMode === 'table' ? (
            <ApplicationTable
              applications={data.items}
              onEdit={(app) => setEditingApplication(app)}
              onDelete={(app) => setDeletingApplication(app)}
            />
          ) : (
            <ApplicationCards
              applications={data.items}
              onEdit={(app) => setEditingApplication(app)}
              onDelete={(app) => setDeletingApplication(app)}
            />
          )}

          {/* Pagination Controls */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 px-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing Page <strong className="text-slate-700 dark:text-slate-200">{data.page}</strong> of{' '}
                <strong className="text-slate-700 dark:text-slate-200">{data.total_pages}</strong> ({data.total} total)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, data.total_pages))}
                  disabled={page >= data.total_pages}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-16 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
            <Briefcase className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {filters.search || filters.status || filters.employment_type
              ? 'No matching applications found'
              : 'No applications in your tracker'}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {filters.search || filters.status || filters.employment_type
              ? 'Try adjusting your search criteria or clearing active filters.'
              : 'Start logging jobs you have applied to, schedule interviews, and track offers.'}
          </p>
          <div className="mt-6 flex gap-3">
            {filters.search || filters.status || filters.employment_type ? (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear All Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={openAddModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Your First Application
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      <ApplicationFormModal
        isOpen={!!editingApplication}
        onClose={() => setEditingApplication(null)}
        initialData={editingApplication}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingApplication}
        onClose={() => setDeletingApplication(null)}
        onConfirm={() => {
          if (deletingApplication) {
            deleteMutation.mutate(deletingApplication.id);
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Application"
        message={`Are you sure you want to delete your application for "${deletingApplication?.position}" at "${deletingApplication?.company_name}"? This action cannot be undone.`}
      />
    </div>
  );
};
