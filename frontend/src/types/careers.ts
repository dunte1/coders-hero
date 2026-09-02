export type JobEmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship';
export type JobStatus = 'draft' | 'published' | 'closed';
export type ApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface JobListing {
  id: number;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: JobEmploymentType;
  description: string;
  requirements: string | null;
  status: JobStatus;
  is_featured: boolean;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_listing_id: number;
  name: string;
  email: string;
  phone: string | null;
  resume_path: string | null;
  cover_letter: string | null;
  portfolio_url: string | null;
  status: ApplicationStatus;
  job_listing?: JobListing;
  created_at: string;
}

export interface JobListingInput {
  title: string;
  department?: string;
  location?: string;
  employment_type?: JobEmploymentType;
  description: string;
  requirements?: string;
  status?: JobStatus;
  is_featured?: boolean;
}
