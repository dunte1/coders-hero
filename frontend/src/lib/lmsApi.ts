import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  AiTutorConversation,
  AiTutorConversationInput,
  AiTutorMessage,
  AiTutorSendResult,
  BookmarkType,
  CodingAiResult,
  CodingExercise,
  CodingLanguage,
  CodingLeaderboardForCourse,
  CodingLeaderboardForExercise,
  CodingProgress,
  CodingSubmission,
  CodingWorkspace,
  CodingWorkspaceFile,
  CodingWorkspaceSnapshot,
  CourseProgress,
  CourseRating,
  ForumPost,
  ForumThread,
  ForumThreadInput,
  PlaygroundRunResult,
  RatingSummary,
  VideoProgress,
} from '@/types/lms';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const lmsApi = {
  // Forum
  forumThreads: (courseId: number, params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<{ data: ForumThread[]; meta: PaginationMeta }>(`/lms/courses/${courseId}/forum`, { params }).then(unwrapPage<ForumThread>),

  createThread: (courseId: number, data: ForumThreadInput) =>
    api.post<{ data: ForumThread }>(`/lms/courses/${courseId}/forum`, data).then(unwrap<ForumThread>),

  forumThread: (id: number) => api.get<{ data: ForumThread }>(`/lms/forum/threads/${id}`).then(unwrap<ForumThread>),

  updateThread: (id: number, data: Partial<ForumThreadInput>) =>
    api.put<{ data: ForumThread }>(`/lms/forum/threads/${id}`, data).then(unwrap<ForumThread>),

  deleteThread: (id: number) => api.delete(`/lms/forum/threads/${id}`).then(() => undefined),

  createPost: (threadId: number, content: string, parentId?: number) =>
    api.post<{ data: ForumPost }>(`/lms/forum/threads/${threadId}/posts`, { content, parent_id: parentId ?? null }).then(unwrap<ForumPost>),

  deletePost: (postId: number) => api.delete(`/lms/forum/posts/${postId}`).then(() => undefined),

  // Bookmarks
  bookmarks: (params?: { page?: number; per_page?: number; type?: string }) =>
    api.get<{ data: Array<{ id: number; bookmarkable: unknown; created_at: string }>; meta: PaginationMeta }>('/lms/bookmarks', { params }).then(unwrapPage<{ id: number; bookmarkable: unknown; created_at: string }>),

  toggleBookmark: (type: BookmarkType, bookmarkableId: number) =>
    api.post<{ data: { bookmarked: boolean } }>('/lms/bookmarks/toggle', { type, bookmarkable_id: bookmarkableId }).then(unwrap<{ bookmarked: boolean }>),

  bookmarkStatus: (type: BookmarkType, bookmarkableId: number) =>
    api.get<{ data: { bookmarked: boolean } }>('/lms/bookmarks/status', { params: { type, bookmarkable_id: bookmarkableId } }).then(unwrap<{ bookmarked: boolean }>),

  // Ratings
  ratings: (courseId: number, params?: { page?: number; per_page?: number }) =>
    api.get<{ data: CourseRating[]; meta: PaginationMeta }>(`/lms/courses/${courseId}/ratings`, { params }).then(unwrapPage<CourseRating>),

  rateCourse: (courseId: number, rating: number, review?: string) =>
    api.post<{ data: CourseRating }>(`/lms/courses/${courseId}/ratings`, { rating, review: review ?? null }).then(unwrap<CourseRating>),

  myRating: (courseId: number) => api.get<{ data: CourseRating | null }>(`/lms/courses/${courseId}/ratings/my`).then(unwrap<CourseRating | null>),

  ratingSummary: (courseId: number) => api.get<{ data: RatingSummary }>(`/lms/courses/${courseId}/ratings/summary`).then(unwrap<RatingSummary>),

  // Coding exercises
  codingExercises: (courseId: number, params?: { page?: number; per_page?: number; difficulty?: string; language?: string }) =>
    api.get<{ data: CodingExercise[]; meta: PaginationMeta }>(`/lms/courses/${courseId}/coding-exercises`, { params }).then(unwrapPage<CodingExercise>),

  codingExercise: (id: number) => api.get<{ data: CodingExercise }>(`/lms/coding-exercises/${id}`).then(unwrap<CodingExercise>),

  submitCoding: (id: number, code: string) =>
    api.post<{ data: CodingSubmission }>(`/lms/coding-exercises/${id}/submit`, { code }).then(unwrap<CodingSubmission>),

  codingSubmissions: (id: number, params?: { page?: number; per_page?: number }) =>
    api.get<{ data: CodingSubmission[]; meta: PaginationMeta }>(`/lms/coding-exercises/${id}/submissions`, { params }).then(unwrapPage<CodingSubmission>),

  codingProgress: (courseId: number) =>
    api.get<{ data: CodingProgress }>(`/lms/courses/${courseId}/coding-progress`).then(unwrap<CodingProgress>),

  // AI Tutor
  tutorConversations: (params?: { page?: number; per_page?: number }) =>
    api.get<{ data: AiTutorConversation[]; meta: PaginationMeta }>('/lms/ai-tutor/conversations', { params }).then(unwrapPage<AiTutorConversation>),

  createConversation: (data: AiTutorConversationInput) =>
    api.post<{ data: AiTutorConversation }>('/lms/ai-tutor/conversations', data).then(unwrap<AiTutorConversation>),

  conversation: (id: number) => api.get<{ data: AiTutorConversation }>(`/lms/ai-tutor/conversations/${id}`).then(unwrap<AiTutorConversation>),

  renameConversation: (id: number, title: string) =>
    api.put<{ data: AiTutorConversation }>(`/lms/ai-tutor/conversations/${id}`, { title }).then(unwrap<AiTutorConversation>),

  deleteConversation: (id: number) => api.delete(`/lms/ai-tutor/conversations/${id}`).then(() => undefined),

  sendTutorMessage: (id: number, content: string) =>
    api.post<{ data: AiTutorSendResult }>(`/lms/ai-tutor/conversations/${id}/messages`, { content }).then(unwrap<AiTutorSendResult>),

  // Video & course progress
  updateVideoProgress: (lessonId: number, data: { watched_seconds: number; duration_seconds?: number; completed?: boolean }) =>
    api.put<{ data: VideoProgress }>(`/lms/lessons/${lessonId}/video-progress`, data).then(unwrap<VideoProgress>),

  videoProgressForLesson: (lessonId: number) =>
    api.get<{ data: VideoProgress | null }>(`/lms/lessons/${lessonId}/video-progress`).then(unwrap<VideoProgress | null>),

  videoProgressForCourse: (courseId: number) =>
    api.get<{ data: VideoProgress[] }>(`/lms/courses/${courseId}/video-progress`).then(unwrap<VideoProgress[]>),

  courseLessons: (courseId: number) =>
    api.get<{ data: any[] }>(`/courses/${courseId}/lessons`).then(unwrap<any[]>),

  markLessonCompleted: (courseId: number, lessonId: number) =>
    api.post<{ data: CourseProgress }>(`/lms/courses/${courseId}/lessons/complete`, { lesson_id: lessonId }).then(unwrap<CourseProgress>),

  // Coding playground
  runPlaygroundCode: (data: { language: CodingLanguage; code: string; stdin?: string }) =>
    api.post<{ data: PlaygroundRunResult }>('/lms/playground/run', data).then(unwrap<PlaygroundRunResult>),

  saveWorkspace: (data: { name: string; language: CodingLanguage; files: CodingWorkspaceFile[]; active_file?: string | null }) =>
    api.post<{ data: CodingWorkspace }>('/lms/playground/workspaces', data).then(unwrap<CodingWorkspace>),

  updateWorkspace: (workspaceId: number, data: { name: string; language: CodingLanguage; files: CodingWorkspaceFile[]; active_file?: string | null }) =>
    api.put<{ data: CodingWorkspace }>(`/lms/playground/workspaces/${workspaceId}`, data).then(unwrap<CodingWorkspace>),

  deleteWorkspace: (workspaceId: number) =>
    api.delete<{ data: null }>(`/lms/playground/workspaces/${workspaceId}`).then(() => undefined),

  loadWorkspace: (workspaceId: number) =>
    api.get<{ data: CodingWorkspaceSnapshot }>(`/lms/playground/workspaces/${workspaceId}/load`).then(unwrap<CodingWorkspaceSnapshot>),

  listWorkspaces: () =>
    api.get<{ data: CodingWorkspace[] }>('/lms/playground/workspaces').then(unwrap<CodingWorkspace[]>),

  // Coding leaderboard
  codingLeaderboardForExercise: (exerciseId: number) =>
    api.get<{ data: CodingLeaderboardForExercise }>(`/coding-leaderboard/for-exercise/${exerciseId}`).then(unwrap<CodingLeaderboardForExercise>),

  codingLeaderboardForCourse: (courseId: number) =>
    api.get<{ data: CodingLeaderboardForCourse }>(`/coding-leaderboard/for-course/${courseId}`).then(unwrap<CodingLeaderboardForCourse>),

  // Coding AI
  codingHint: (data: { code: string; error_message: string }) =>
    api.post<{ data: CodingAiResult }>('/coding-ai/hint', data).then(unwrap<CodingAiResult>),

  codingDebug: (data: { code: string; error_output: string }) =>
    api.post<{ data: CodingAiResult }>('/coding-ai/debug', data).then(unwrap<CodingAiResult>),
};

export type { AiTutorMessage };
export { getErrorMessage } from '@/lib/studentsApi';
