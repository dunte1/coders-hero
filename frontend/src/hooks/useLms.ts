import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, lmsApi } from '@/lib/lmsApi';
import type { AiTutorConversationInput, BookmarkType, CodingLanguage, CodingWorkspaceFile, ForumThreadInput } from '@/types/lms';

// Forum
export function useForumThreads(courseId: number, params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ['lms', 'forum', courseId, params],
    queryFn: () => lmsApi.forumThreads(courseId, params),
    enabled: !!courseId,
  });
}

export function useForumThread(id: number) {
  return useQuery({
    queryKey: ['lms', 'forum', 'thread', id],
    queryFn: () => lmsApi.forumThread(id),
    enabled: !!id,
  });
}

export function useCreateThread(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ForumThreadInput) => lmsApi.createThread(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'forum', courseId] });
      toast.success('Thread created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCreatePost(threadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: number }) =>
      lmsApi.createPost(threadId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'forum', 'thread', threadId] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lmsApi.deleteThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'forum'] });
      toast.success('Thread deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Bookmarks
export function useBookmarks(params?: { page?: number; type?: string }) {
  return useQuery({
    queryKey: ['lms', 'bookmarks', params],
    queryFn: () => lmsApi.bookmarks(params),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: BookmarkType; id: number }) => lmsApi.toggleBookmark(type, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'bookmarks'] });
      toast.success(data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Ratings
export function useCourseRatings(courseId: number, params?: { page?: number }) {
  return useQuery({
    queryKey: ['lms', 'ratings', courseId, params],
    queryFn: () => lmsApi.ratings(courseId, params),
    enabled: !!courseId,
  });
}

export function useRatingSummary(courseId: number) {
  return useQuery({
    queryKey: ['lms', 'ratings', courseId, 'summary'],
    queryFn: () => lmsApi.ratingSummary(courseId),
    enabled: !!courseId,
  });
}

export function useRateCourse(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, review }: { rating: number; review?: string }) =>
      lmsApi.rateCourse(courseId, rating, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'ratings', courseId] });
      toast.success('Rating submitted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Coding exercises
export function useCodingExercises(courseId: number, params?: { page?: number; difficulty?: string }) {
  return useQuery({
    queryKey: ['lms', 'coding', courseId, params],
    queryFn: () => lmsApi.codingExercises(courseId, params),
    enabled: !!courseId,
  });
}

export function useCodingExercise(id: number) {
  return useQuery({
    queryKey: ['lms', 'coding', id],
    queryFn: () => lmsApi.codingExercise(id),
    enabled: !!id,
  });
}

export function useSubmitCoding(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => lmsApi.submitCoding(id, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'coding'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCodingProgress(courseId: number) {
  return useQuery({
    queryKey: ['lms', 'coding', courseId, 'progress'],
    queryFn: () => lmsApi.codingProgress(courseId),
    enabled: !!courseId,
  });
}

// Coding playground
export function useRunPlaygroundCode() {
  return useMutation({
    mutationFn: (data: { language: CodingLanguage; code: string; stdin?: string }) =>
      lmsApi.runPlaygroundCode(data),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSaveWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; language: CodingLanguage; files: CodingWorkspaceFile[]; active_file?: string | null }) =>
      lmsApi.saveWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'playground', 'workspaces'] });
      toast.success('Workspace saved');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: number; data: { name: string; language: CodingLanguage; files: CodingWorkspaceFile[]; active_file?: string | null } }) =>
      lmsApi.updateWorkspace(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'playground', 'workspaces'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: number) => lmsApi.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'playground', 'workspaces'] });
      toast.success('Workspace deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useLoadWorkspace(workspaceId: number) {
  return useQuery({
    queryKey: ['lms', 'playground', 'workspaces', workspaceId],
    queryFn: () => lmsApi.loadWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useListWorkspaces() {
  return useQuery({
    queryKey: ['lms', 'playground', 'workspaces'],
    queryFn: () => lmsApi.listWorkspaces(),
  });
}

// Coding leaderboard
export function useCodingLeaderboardForExercise(exerciseId: number) {
  return useQuery({
    queryKey: ['lms', 'coding', 'leaderboard', 'exercise', exerciseId],
    queryFn: () => lmsApi.codingLeaderboardForExercise(exerciseId),
    enabled: !!exerciseId,
  });
}

export function useCodingLeaderboardForCourse(courseId: number) {
  return useQuery({
    queryKey: ['lms', 'coding', 'leaderboard', 'course', courseId],
    queryFn: () => lmsApi.codingLeaderboardForCourse(courseId),
    enabled: !!courseId,
  });
}

// Coding AI
export function useCodingHint() {
  return useMutation({
    mutationFn: (data: { code: string; error_message: string }) => lmsApi.codingHint(data),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCodingDebug() {
  return useMutation({
    mutationFn: (data: { code: string; error_output: string }) => lmsApi.codingDebug(data),
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// AI Tutor
export function useTutorConversations(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['lms', 'tutor', 'conversations', params],
    queryFn: () => lmsApi.tutorConversations(params),
  });
}

export function useTutorConversation(id: number) {
  return useQuery({
    queryKey: ['lms', 'tutor', 'conversation', id],
    queryFn: () => lmsApi.conversation(id),
    enabled: !!id,
    refetchInterval: false,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AiTutorConversationInput) => lmsApi.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'tutor', 'conversations'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useSendTutorMessage(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => lmsApi.sendTutorMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'tutor', 'conversation', id] });
      queryClient.invalidateQueries({ queryKey: ['lms', 'tutor', 'conversations'] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lmsApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'tutor', 'conversations'] });
      toast.success('Conversation deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Video progress
export function useMarkLessonCompleted(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: number) => lmsApi.markLessonCompleted(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Lesson completed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
