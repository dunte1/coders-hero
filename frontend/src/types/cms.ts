export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface Page<T> {
  results: T[];
  meta: PaginationMeta;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  group: string;
  is_public: boolean;
  sort_order: number;
}

export interface SiteSettingsPayload {
  settings: SiteSetting[];
  groups: string[];
}

export interface SiteSettingsUpdate {
  key: string;
  value: string;
  group?: string;
  is_public?: boolean;
}

export interface SiteSection {
  id: number;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image: string | null;
  image_url: string | null;
  badge: string | null;
  button_label: string | null;
  button_url: string | null;
  meta: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSectionInput {
  section_key?: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image?: string | null;
  badge?: string | null;
  button_label?: string | null;
  button_url?: string | null;
  meta?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  icon: string | null;
  image: string | null;
  image_url: string | null;
  features: string[];
  sort_order: number;
  is_active: boolean;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ServiceInput {
  name: string;
  short_description?: string;
  icon?: string;
  image?: string;
  features?: string[];
  sort_order?: number;
  is_active?: boolean;
  meta?: Record<string, unknown>;
}

export type ProgramCategory = 'coding' | 'robotics' | 'stem';

export interface Program {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  category: ProgramCategory;
  level: string | null;
  age_group: string | null;
  duration_weeks: number | null;
  sessions_per_week: number | null;
  price: number | null;
  price_suffix: string | null;
  image: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CurriculumPhase {
  title: string;
  description: string;
  topics: string[];
}

export interface ProgramDetail extends Program {
  long_description: string | null;
  curriculum: CurriculumPhase[];
  outcomes: string[];
  meta: Record<string, unknown>;
}

export interface ProgramInput {
  name: string;
  tagline?: string;
  description: string;
  long_description?: string;
  category: ProgramCategory;
  level?: string;
  age_group?: string;
  duration_weeks?: number;
  sessions_per_week?: number;
  price?: number;
  price_suffix?: string;
  image?: string;
  curriculum?: CurriculumPhase[];
  outcomes?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  meta?: Record<string, unknown>;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  image: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemInput {
  title: string;
  description?: string;
  category?: string;
  image?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  avatar: string | null;
  avatar_url: string | null;
  content: string;
  rating: number | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialInput {
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number;
  is_featured?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogAuthor {
  id: number;
  name: string;
  avatar: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  tags: string[];
  cover_image: string | null;
  cover_url: string | null;
  status: BlogStatus;
  is_featured: boolean;
  published_at: string | null;
  author: BlogAuthor | null;
  views: number;
  reading_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  meta: Record<string, unknown>;
}

export interface BlogPostInput {
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  status: BlogStatus;
  is_featured?: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqInput {
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
}

export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageStats {
  new: number;
  read: number;
  replied: number;
  archived: number;
  total: number;
}

export interface ChatWidgetSettings {
  widget_title?: string;
  widget_subtitle?: string;
  welcome_message?: string;
  primary_color?: string;
  enabled?: string;
}

export interface ChatSettingsPayload {
  settings: ChatWidgetSettings;
  llm_configured: boolean;
  model: string;
  enabled: boolean;
}

export interface ChatSettingsInput {
  widget_title?: string;
  widget_subtitle?: string;
  welcome_message?: string;
  primary_color?: string;
  enabled?: boolean;
}

export interface AnalyticsData {
  totals: {
    page_views: number;
    unique_visitors: number;
    page_views_today: number;
    page_views_7d: number;
    page_views_30d: number;
    contact_messages: number;
    unread_contact_messages: number;
  };
  views_by_day: { date: string; views: number }[];
  top_pages: { path: string; views: number }[];
  devices: { mobile: number; desktop: number };
  blog: {
    total_views: number;
    top_posts: { title: string; slug: string; views: number }[];
  };
  contact_message_stats: {
    new: number;
    read: number;
    replied: number;
    archived: number;
  };
}
