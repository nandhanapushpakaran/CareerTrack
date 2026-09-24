import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../src/components/applications/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders Applied status correctly', () => {
    render(<StatusBadge status="Applied" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders Interview status correctly', () => {
    render(<StatusBadge status="Interview" />);
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('renders Offer status correctly', () => {
    render(<StatusBadge status="Offer" />);
    expect(screen.getByText('Offer')).toBeInTheDocument();
  });

  it('renders Rejected status correctly', () => {
    render(<StatusBadge status="Rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders Withdrawn status correctly', () => {
    render(<StatusBadge status="Withdrawn" />);
    expect(screen.getByText('Withdrawn')).toBeInTheDocument();
  });
});
