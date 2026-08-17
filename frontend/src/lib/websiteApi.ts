import api from '@/lib/axios';
import type {
  BlogPost,
  BlogPostDetail,
  CalendarEvent,
  ChatMessage,
  ChatResponse,
  ContactInput,
  Faq,
  GalleryItem,
  HomeData,
  Program,
  ProgramCategory,
  ProgramDetail,
  PublicPage,
  PublicPageMeta,
  Service,
  Testimonial,
} from '@/types/website';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PublicPageMeta } }): PublicPage<T> => ({
  data: res.data.data,
  meta: res.data.meta,
});

export interface ListParams {
  page?: number;
  per_page?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  tag?: string;
}

export const websiteApi = {
  site: {
    get: () => api.get<{ data: HomeData }>('/public/site').then(unwrap<HomeData>),
  },

  services: {
    list: () => api.get<{ data: Service[] }>('/public/services').then(unwrap<Service[]>),
  },

  programs: {
    list: (params?: ListParams) =>
      api
        .get<{ data: Program[]; meta: PublicPageMeta }>('/public/programs', { params })
        .then(unwrapPage<Program>),
    get: (slug: string) =>
      api.get<{ data: ProgramDetail }>(`/public/programs/${slug}`).then(unwrap<ProgramDetail>),
  },

  gallery: {
    list: (params?: ListParams) =>
      api
        .get<{ data: GalleryItem[]; meta: PublicPageMeta }>('/public/gallery', { params })
        .then(unwrapPage<GalleryItem>),
  },

  testimonials: {
    list: () => api.get<{ data: Testimonial[] }>('/public/testimonials').then(unwrap<Testimonial[]>),
  },

  faqs: {
    list: () => api.get<{ data: Faq[] }>('/public/faqs').then(unwrap<Faq[]>),
  },

  events: {
    list: (params?: ListParams) =>
      api
        .get<{ data: CalendarEvent[] }>('/public/events', { params })
        .then(unwrap<CalendarEvent[]>),
  },

  courses: {
    list: (params?: ListParams) =>
      api
        .get<{ data: Course[] }>('/public/courses', { params })
        .then(unwrap<Course[]>),
  },

  admissions: {
    submit: (data: Record<string, unknown>) =>
      api
        .post<{ data: { id: number } }>('/public/admissions', data)
        .then(unwrap<{ id: number }>),
  },

  blog: {
    list: (params?: ListParams) =>
      api
        .get<{ data: BlogPost[]; meta: PublicPageMeta }>('/public/blog', { params })
        .then(unwrapPage<BlogPost>),
    get: (slug: string) =>
      api.get<{ data: BlogPostDetail }>(`/public/blog/${slug}`).then(unwrap<BlogPostDetail>),
    related: (slug: string) =>
      api.get<{ data: BlogPost[] }>(`/public/blog/${slug}/related`).then(unwrap<BlogPost[]>),
  },

  contact: {
    submit: (data: ContactInput) =>
      api.post<{ data: { id: number } }>('/public/contact', data).then(unwrap<{ id: number }>),
  },

  partnerSchools: {
    list: () =>
      api.get<{ data: PartnerSchool[] }>('/public/partner-schools').then(unwrap<PartnerSchool[]>),
  },

  chat: {
    send: (message: string, history: ChatMessage[]) =>
      api
        .post<{ data: ChatResponse }>('/public/chat', { message, history })
        .then(unwrap<ChatResponse>),
  },

  pageViews: {
    record: (path: string) =>
      api.post<{ data: null }>('/public/analytics/page-view', { path }).then(unwrap<null>),
  },
};

export const categoryLabels: Record<string, string> = {
  coding: 'Coding',
  robotics: 'Robotics',
  stem: 'STEM',
};

export function isProgramCategory(value: string | undefined): value is ProgramCategory {
  return value === 'coding' || value === 'robotics' || value === 'stem';
}
