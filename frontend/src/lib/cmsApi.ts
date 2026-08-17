import api from '@/lib/axios';
import type {
  AnalyticsData,
  BlogPost,
  BlogPostDetail,
  BlogPostInput,
  ChatSettingsInput,
  ChatSettingsPayload,
  ContactMessage,
  ContactMessageStats,
  ContactMessageStatus,
  CurriculumPhase,
  Faq,
  FaqInput,
  GalleryItem,
  GalleryItemInput,
  Page,
  PaginationMeta,
  Program,
  ProgramDetail,
  ProgramInput,
  Service,
  ServiceInput,
  SiteSection,
  SiteSectionInput,
  SiteSettingsPayload,
  SiteSettingsUpdate,
  SiteSetting,
  Testimonial,
  TestimonialInput,
} from '@/types/cms';

export interface CmsListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category?: string;
}

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export function getErrorMessage(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } };
  return error.response?.data?.message || 'Something went wrong';
}

export interface ReorderItem {
  id: number;
  sort_order: number;
}

export const cmsApi = {
  siteSettings: {
    get: () => api.get<{ data: SiteSettingsPayload }>('/admin/site/settings').then(unwrap<SiteSettingsPayload>),
    update: (settings: SiteSettingsUpdate[]) =>
      api.put<{ data: SiteSetting[] }>('/admin/site/settings', { settings }).then(unwrap<SiteSetting[]>),
  },

  siteSections: {
    get: () => api.get<{ data: SiteSection[] }>('/admin/site/sections').then(unwrap<SiteSection[]>),
    create: (data: SiteSectionInput) =>
      api.post<{ data: SiteSection }>('/admin/site/sections', data).then(unwrap<SiteSection>),
    update: (id: number, data: Partial<SiteSectionInput>) =>
      api.put<{ data: SiteSection }>(`/admin/site/sections/${id}`, data).then(unwrap<SiteSection>),
    reorder: (sections: ReorderItem[]) =>
      api.put<{ data: SiteSection[] }>('/admin/site/sections/reorder', { sections }).then(unwrap<SiteSection[]>),
    remove: (id: number) => api.delete(`/admin/site/sections/${id}`).then(() => undefined),
  },

  services: {
    get: () => api.get<{ data: Service[] }>('/admin/services').then(unwrap<Service[]>),
    create: (data: ServiceInput) =>
      api.post<{ data: Service }>('/admin/services', data).then(unwrap<Service>),
    update: (id: number, data: Partial<ServiceInput>) =>
      api.put<{ data: Service }>(`/admin/services/${id}`, data).then(unwrap<Service>),
    reorder: (services: ReorderItem[]) =>
      api.put<{ data: Service[] }>('/admin/services/reorder', { services }).then(unwrap<Service[]>),
    remove: (id: number) => api.delete(`/admin/services/${id}`).then(() => undefined),
  },

  programs: {
    list: (params?: CmsListParams) =>
      api.get<{ data: Program[]; meta: PaginationMeta }>('/admin/programs', { params }).then(unwrapPage<Program>),
    get: (id: number) =>
      api.get<{ data: ProgramDetail }>(`/admin/programs/${id}`).then(unwrap<ProgramDetail>),
    create: (data: ProgramInput) =>
      api.post<{ data: ProgramDetail }>('/admin/programs', data).then(unwrap<ProgramDetail>),
    update: (id: number, data: ProgramInput) =>
      api.put<{ data: ProgramDetail }>(`/admin/programs/${id}`, data).then(unwrap<ProgramDetail>),
    toggleFeatured: (id: number) =>
      api.put<{ data: Program }>(`/admin/programs/${id}/toggle-featured`).then(unwrap<Program>),
    toggleActive: (id: number) =>
      api.put<{ data: Program }>(`/admin/programs/${id}/toggle-active`).then(unwrap<Program>),
    remove: (id: number) => api.delete(`/admin/programs/${id}`).then(() => undefined),
  },

  gallery: {
    list: (params?: CmsListParams) =>
      api.get<{ data: GalleryItem[]; meta: PaginationMeta }>('/admin/gallery', { params }).then(unwrapPage<GalleryItem>),
    create: (data: GalleryItemInput) =>
      api.post<{ data: GalleryItem }>('/admin/gallery', data).then(unwrap<GalleryItem>),
    update: (id: number, data: Partial<GalleryItemInput>) =>
      api.put<{ data: GalleryItem }>(`/admin/gallery/${id}`, data).then(unwrap<GalleryItem>),
    remove: (id: number) => api.delete(`/admin/gallery/${id}`).then(() => undefined),
  },

  testimonials: {
    get: () => api.get<{ data: Testimonial[] }>('/admin/testimonials').then(unwrap<Testimonial[]>),
    create: (data: TestimonialInput) =>
      api.post<{ data: Testimonial }>('/admin/testimonials', data).then(unwrap<Testimonial>),
    update: (id: number, data: Partial<TestimonialInput>) =>
      api.put<{ data: Testimonial }>(`/admin/testimonials/${id}`, data).then(unwrap<Testimonial>),
    remove: (id: number) => api.delete(`/admin/testimonials/${id}`).then(() => undefined),
  },

  blog: {
    list: (params?: CmsListParams) =>
      api.get<{ data: BlogPost[]; meta: PaginationMeta }>('/admin/blog', { params }).then(unwrapPage<BlogPost>),
    get: (id: number) =>
      api.get<{ data: BlogPostDetail }>(`/admin/blog/${id}`).then(unwrap<BlogPostDetail>),
    create: (data: BlogPostInput) =>
      api.post<{ data: BlogPostDetail }>('/admin/blog', data).then(unwrap<BlogPostDetail>),
    update: (id: number, data: BlogPostInput) =>
      api.put<{ data: BlogPostDetail }>(`/admin/blog/${id}`, data).then(unwrap<BlogPostDetail>),
    publish: (id: number) => api.put<{ data: BlogPost }>(`/admin/blog/${id}/publish`).then(unwrap<BlogPost>),
    unpublish: (id: number) => api.put<{ data: BlogPost }>(`/admin/blog/${id}/unpublish`).then(unwrap<BlogPost>),
    remove: (id: number) => api.delete(`/admin/blog/${id}`).then(() => undefined),
  },

  faqs: {
    get: () => api.get<{ data: Faq[] }>('/admin/faqs').then(unwrap<Faq[]>),
    create: (data: FaqInput) =>
      api.post<{ data: Faq }>('/admin/faqs', data).then(unwrap<Faq>),
    update: (id: number, data: Partial<FaqInput>) =>
      api.put<{ data: Faq }>(`/admin/faqs/${id}`, data).then(unwrap<Faq>),
    reorder: (faqs: ReorderItem[]) =>
      api.put<{ data: Faq[] }>('/admin/faqs/reorder', { faqs }).then(unwrap<Faq[]>),
    remove: (id: number) => api.delete(`/admin/faqs/${id}`).then(() => undefined),
  },

  contactMessages: {
    list: (params?: CmsListParams) =>
      api
        .get<{ data: ContactMessage[]; meta: PaginationMeta }>('/admin/contact-messages', { params })
        .then(unwrapPage<ContactMessage>),
    stats: () => api.get<{ data: ContactMessageStats }>('/admin/contact-messages/stats').then(unwrap<ContactMessageStats>),
    get: (id: number) =>
      api.get<{ data: ContactMessage }>(`/admin/contact-messages/${id}`).then(unwrap<ContactMessage>),
    updateStatus: (id: number, status: ContactMessageStatus) =>
      api
        .put<{ data: ContactMessage }>(`/admin/contact-messages/${id}/status`, { status })
        .then(unwrap<ContactMessage>),
    remove: (id: number) => api.delete(`/admin/contact-messages/${id}`).then(() => undefined),
  },

  chatSettings: {
    get: () => api.get<{ data: ChatSettingsPayload }>('/admin/chat-settings').then(unwrap<ChatSettingsPayload>),
    update: (settings: ChatSettingsInput) =>
      api
        .put<{ data: ChatSettingsPayload['settings'] }>('/admin/chat-settings', { settings })
        .then(unwrap<ChatSettingsPayload['settings']>),
  },

  analytics: {
    site: () => api.get<{ data: AnalyticsData }>('/admin/analytics/site').then(unwrap<AnalyticsData>),
  },
};

export type { CurriculumPhase };
