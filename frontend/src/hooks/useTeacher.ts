import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, teacherApi } from '@/lib/teacherApi';
import type {
  AssignmentInput,
  AttendanceEntry,
  CalendarEventInput,
  ClassInput,
  ExamInput,
  ExamResultEntry,
  GradebookEntryInput,
  LessonNoteInput,
} from '@/types/teacher';

// Dashboard
export function useTeacherDashboard() {
  return useQuery({
    queryKey: ['teacher', 'dashboard'],
    queryFn: () => teacherApi.dashboard(),
  });
}

// Classes
export function useTeacherClasses(params?: { page?: number; per_page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['teacher', 'classes', params],
    queryFn: () => teacherApi.classes(params),
  });
}

export function useTeacherClass(id: number) {
  return useQuery({
    queryKey: ['teacher', 'class', id],
    queryFn: () => teacherApi.class(id),
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClassInput) => teacherApi.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      toast.success('Class created successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateClass(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ClassInput>) => teacherApi.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'class', id] });
      toast.success('Class updated successfully');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'classes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      toast.success('Class deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useClassRoster(id: number, date: string) {
  return useQuery({
    queryKey: ['teacher', 'class', id, 'roster', date],
    queryFn: () => teacherApi.roster(id, date),
    enabled: !!id,
  });
}

export function useRecordAttendance(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, entries }: { date: string; entries: AttendanceEntry[] }) =>
      teacherApi.recordAttendance(id, date, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'class'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      toast.success('Attendance saved');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Assignments
export function useTeacherAssignments(params?: { page?: number; per_page?: number; class_id?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['teacher', 'assignments', params],
    queryFn: () => teacherApi.assignments(params),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignmentInput) => teacherApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      toast.success('Assignment created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAssignment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AssignmentInput>) => teacherApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      toast.success('Assignment updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      toast.success('Assignment deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function usePublishAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.publishAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      toast.success('Assignment published');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useCloseAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.closeAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      toast.success('Assignment closed');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAssignmentSubmissions(id: number, params?: { page?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['teacher', 'assignments', id, 'submissions', params],
    queryFn: () => teacherApi.submissions(id, params),
    enabled: !!id,
  });
}

export function useGradeSubmission(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: number; data: { score: number; feedback?: string } }) =>
      teacherApi.gradeSubmission(id, submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      toast.success('Submission graded');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Exams
export function useTeacherExams(params?: { page?: number; per_page?: number; class_id?: number; type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['teacher', 'exams', params],
    queryFn: () => teacherApi.exams(params),
  });
}

export function useTeacherExam(id: number) {
  return useQuery({
    queryKey: ['teacher', 'exam', id],
    queryFn: () => teacherApi.exam(id),
    enabled: !!id,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamInput) => teacherApi.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      toast.success('Exam created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateExam(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ExamInput>) => teacherApi.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      toast.success('Exam updated');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      toast.success('Exam deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useGradeExamResults(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: ExamResultEntry[]) => teacherApi.gradeExamResults(id, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exam', id] });
      toast.success('Exam results saved');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Gradebook
export function useGradebookEntries(classId: number, params?: { page?: number; component?: string; student_id?: number }) {
  return useQuery({
    queryKey: ['teacher', 'gradebook', classId, params],
    queryFn: () => teacherApi.gradebookEntries(classId, params),
    enabled: !!classId,
  });
}

export function useCreateGradebookEntry(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GradebookEntryInput) => teacherApi.createGradebookEntry(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'gradebook', classId] });
      toast.success('Grade entry added');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useBulkGradebook(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: GradebookEntryInput[]) => teacherApi.bulkGradebookEntries(classId, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'gradebook', classId] });
      toast.success('Grades added in bulk');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useClassGradeSummary(classId: number) {
  return useQuery({
    queryKey: ['teacher', 'gradebook', classId, 'summary'],
    queryFn: () => teacherApi.classGradeSummary(classId),
    enabled: !!classId,
  });
}

// Lesson notes
export function useLessonNotes(params?: { page?: number; per_page?: number; class_id?: number; search?: string }) {
  return useQuery({
    queryKey: ['teacher', 'lesson-notes', params],
    queryFn: () => teacherApi.lessonNotes(params),
  });
}

export function useCreateLessonNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LessonNoteInput) => teacherApi.createLessonNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lesson-notes'] });
      toast.success('Lesson note created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteLessonNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteLessonNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lesson-notes'] });
      toast.success('Lesson note deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useAttachLessonNoteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => teacherApi.attachLessonNoteFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lesson-notes'] });
      toast.success('Material attached');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Calendar
export function useCalendarEvents(params?: { from?: string; to?: string; class_id?: number; event_type?: string }) {
  return useQuery({
    queryKey: ['teacher', 'calendar', params],
    queryFn: () => teacherApi.calendarEvents(params),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CalendarEventInput) => teacherApi.createCalendarEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'calendar'] });
      toast.success('Event created');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherApi.deleteCalendarEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'calendar'] });
      toast.success('Event deleted');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}

// Analytics & reports
export function useTeacherAnalytics() {
  return useQuery({
    queryKey: ['teacher', 'analytics'],
    queryFn: () => teacherApi.analytics(),
  });
}

export function useClassReport(classId: number, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['teacher', 'reports', 'class', classId, params],
    queryFn: () => teacherApi.classReport(classId, params),
    enabled: !!classId,
  });
}

export function useTeacherReportSummary() {
  return useQuery({
    queryKey: ['teacher', 'reports', 'summary'],
    queryFn: () => teacherApi.reportSummary(),
  });
}
