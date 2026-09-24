export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary';

export interface Contact {
  id?: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  created_at?: string;
}

export interface Application {
  id: number;
  user_id: number;
  company_name: string;
  position: string;
  job_url?: string | null;
  location?: string | null;
  employment_type: EmploymentType;
  salary_min?: number | null;
  salary_max?: number | null;
  currency: string;
  status: ApplicationStatus;
  application_date?: string | null;
  interview_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  contacts?: Contact[];
}

export interface ApplicationPaginationResponse {
  items: Application[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface StatusMetric {
  status: ApplicationStatus;
  count: number;
  percentage: number;
  color: string;
}

export interface TimelinePoint {
  period: string;
  count: number;
}

export interface UpcomingInterview {
  id: number;
  company_name: string;
  position: string;
  interview_date: string;
  location?: string | null;
}

export interface DashboardStats {
  total_applications: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  withdrawn: number;
  response_rate: number;
  offer_rate: number;
  status_distribution: StatusMetric[];
  application_trend: TimelinePoint[];
  upcoming_interviews: UpcomingInterview[];
  recent_applications: Application[];
}
