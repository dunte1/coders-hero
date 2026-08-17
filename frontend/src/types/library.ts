export type LibraryResourceType = 'ebook' | 'video' | 'notes' | 'past_paper' | 'coding_resource' | 'robotics_manual';

export type BorrowingStatus = 'borrowed' | 'returned' | 'overdue';

export type ReservationStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface LibraryCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  resources_count?: number;
  created_at?: string;
}

export interface LibraryAuthor {
  id: number;
  name: string;
  bio: string | null;
  resources_count?: number;
  created_at?: string;
}

export interface LibraryResource {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  resource_type: LibraryResourceType;
  category_id: number | null;
  category?: LibraryCategory | null;
  author_id: number | null;
  author?: LibraryAuthor | null;
  file_size: number | null;
  file_size_human: string | null;
  mime_type: string | null;
  cover_image: string | null;
  cover_image_url: string | null;
  language: string;
  is_public: boolean;
  download_allowed: boolean;
  is_active: boolean;
  view_count: number;
  is_borrowed: boolean;
  active_borrowing?: LibraryBorrowing | null;
  download_url: string | null;
  stream_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryBorrowing {
  id: number;
  resource_id: number;
  resource?: LibraryResource | null;
  user_id: string;
  user?: { id: string; name: string } | null;
  borrowed_at: string;
  due_at: string | null;
  returned_at: string | null;
  status: BorrowingStatus;
  is_overdue: boolean;
  note: string | null;
  created_at?: string;
}

export interface LibraryReservation {
  id: number;
  resource_id: number;
  resource?: LibraryResource | null;
  user_id: string;
  user?: { id: string; name: string } | null;
  reserved_at: string;
  expires_at: string | null;
  status: ReservationStatus;
  note: string | null;
  created_at?: string;
}

export interface LibraryReadingHistory {
  id: number;
  resource_id: number;
  resource?: LibraryResource | null;
  read_at: string;
  times_read: number;
  created_at?: string;
}

export interface LibrarySummary {
  total_resources: number;
  active_resources: number;
  public_resources: number;
  total_categories: number;
  active_borrowings: number;
  overdue_borrowings: number;
  pending_reservations: number;
  total_reads: number;
  resources_by_type: Record<string, number>;
}

export interface LibraryQueryParams {
  search?: string;
  type?: LibraryResourceType | 'all';
  category_id?: number | string;
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
