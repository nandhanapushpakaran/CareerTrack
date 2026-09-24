import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Plus,
  Send,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DashboardStats } from '../types';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/dashboard/StatCard';
import { StatusChart } from '../components/dashboard/StatusChart';
import { TrendChart } from '../components/dashboard/TrendChart';
import { UpcomingInterviews } from '../components/dashboard/UpcomingInterviews';
import { StatusBadge } from '../components/applications/StatusBadge';
import { formatDate, getCompanyInitials } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openAddModal } = useOutletContext<{ openAddModal: () => void }>();

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {user?.full_name ? user.full_name.split(' ')[0] : 'there'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's an overview of your job search progress.
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

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          title="Total"
          value={isLoading ? '—' : stats?.total_applications ?? 0}
          icon={Layers}
          color="indigo"
          subtitle="Opportunities"
        />
        <StatCard
          title="Applied"
          value={isLoading ? '—' : stats?.applied ?? 0}
          icon={Send}
          color="blue"
          subtitle="Awaiting response"
        />
        <StatCard
          title="Interviews"
          value={isLoading ? '—' : stats?.interviews ?? 0}
          icon={Clock}
          color="purple"
          subtitle={`${stats?.response_rate ?? 0}% response rate`}
        />
        <StatCard
          title="Offers"
          value={isLoading ? '—' : stats?.offers ?? 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${stats?.offer_rate ?? 0}% offer rate`}
        />
        <StatCard
          title="Rejected"
          value={isLoading ? '—' : stats?.rejected ?? 0}
          icon={XCircle}
          color="rose"
          subtitle="Archived"
        />
        <StatCard
          title="Withdrawn"
          value={isLoading ? '—' : stats?.withdrawn ?? 0}
          icon={Briefcase}
          color="slate"
          subtitle="Opted out"
        />
      </div>

      {/* Visual Analytics Row: Status Breakdown + Application Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Applications by Status
            </h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>
          {stats?.status_distribution ? (
            <StatusChart data={stats.status_distribution} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
          )}
        </div>

        {/* Momentum / Applications Over Time */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Application Momentum
            </h3>
            <span className="text-xs text-slate-400">Past 6 Months</span>
          </div>
          {stats?.application_trend ? (
            <TrendChart data={stats.application_trend} />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
          )}
        </div>
      </div>

      {/* Bottom Section: Upcoming Interviews + Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Interviews Widget */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Upcoming Interviews
                </h3>
              </div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {stats?.upcoming_interviews?.length ?? 0} scheduled
              </span>
            </div>
            <UpcomingInterviews interviews={stats?.upcoming_interviews || []} />
          </div>
        </div>

        {/* Recent Applications Widget */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Applications
            </h3>
            <Link
              to="/applications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>View all applications</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats?.recent_applications && stats.recent_applications.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {stats.recent_applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                      {getCompanyInitials(app.company_name)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/applications/${app.id}`}
                        className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                      >
                        {app.company_name}
                      </Link>
                      <span className="text-xs text-slate-400 truncate block">
                        {app.position} · {app.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={app.status} size="sm" />
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {formatDate(app.application_date)}
                    </span>
                    <Link
                      to={`/applications/${app.id}`}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No job applications added yet
              </p>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                Start tracking your opportunities to populate your dashboard analytics.
              </p>
              <Button variant="primary" size="sm" onClick={openAddModal}>
                Add Your First Application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
