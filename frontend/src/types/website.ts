export interface PublicPageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PublicPage<T> {
  data: T[];
  meta: PublicPageMeta;
}

export interface PublicSiteSettings {
  general?: Record<string, string>;
  social?: Record<string, string>;
  seo?: Record<string, string>;
  analytics?: Record<string, string>;
  chat?: Record<string, string>;
  [group: string]: Record<string, string> | undefined;
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

export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  image: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
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
}

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
  status: string;
  is_featured: boolean;
  published_at: string | null;
  author: BlogAuthor | null;
  views: number;
  reading_minutes: number | null;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  meta: Record<string, unknown>;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface HomeData {
  settings: PublicSiteSettings;
  sections: Record<string, SiteSection>;
  services: Service[];
  programs: Program[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  blog_posts: BlogPost[];
  faqs: Faq[];
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  source: 'llm' | 'faq' | 'fallback';
  matched_question?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  event_type: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  color: string | null;
}

export interface Course {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  thumbnail: string | null;
  category_id: number | null;
  instructor_id: number | null;
  level: string | null;
  duration: string | null;
  price: number | null;
}

export function getSetting(
  settings: PublicSiteSettings | undefined,
  key: string,
  fallback = ''
): string {
  const [group, setting] = key.split('.');
  return settings?.[group]?.[setting] ?? fallback;
}

export interface PartnerSchool {
  id: number;
  name: string;
  contact_person: string | null;
  city: string | null;
  country: string | null;
  partnership_type: 'feeder' | 'sibling' | 'affiliate' | 'other';
  notes: string | null;
}
