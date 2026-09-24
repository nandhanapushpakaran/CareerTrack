import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../src/components/applications/FilterBar';
import { ApplicationTable } from '../src/components/applications/ApplicationTable';
import { BrowserRouter } from 'react-router-dom';
import { Application } from '../src/types';

describe('Applications Management Component Tests', () => {
  const mockFilters = {
    search: '',
    status: '',
    employment_type: '',
    sort_by: 'newest',
  };

  it('renders filter bar and triggers search callbacks', () => {
    const onFilterChange = vi.fn();
    const onClearAll = vi.fn();
    const onViewModeChange = vi.fn();

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={onFilterChange}
        onClearAll={onClearAll}
        viewMode="table"
        onViewModeChange={onViewModeChange}
        totalResults={5}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by company, position/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Google' } });
    expect(onFilterChange).toHaveBeenCalledWith({ search: 'Google' });
  });

  it('renders application table with items and company details', () => {
    const mockApps: Application[] = [
      {
        id: 101,
        user_id: 1,
        company_name: 'Stripe',
        position: 'Staff Engineer',
        location: 'Remote',
        employment_type: 'Full-time',
        status: 'Interview',
        currency: 'USD',
        salary_min: 200000,
        salary_max: 250000,
        application_date: '2026-09-01T00:00:00Z',
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-09-01T00:00:00Z',
      },
    ];

    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <BrowserRouter>
        <ApplicationTable
          applications={mockApps}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Staff Engineer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getAllByText('Interview').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/200,000/)).toBeInTheDocument();
  });
});
