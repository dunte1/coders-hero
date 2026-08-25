import api from '@/lib/axios';
import type { Page, PaginationMeta } from '@/types/cms';
import type {
  AnalyticsOverview,
  Assignment,
  AssignmentInput,
  AssignmentSubmission,
  AttendanceEntry,
  AttendanceTrendPoint,
  CalendarEvent,
  CalendarEventInput,
  ClassAttendanceSummary,
  ClassGradeSummary,
  ClassInput,
  ClassPerformanceRow,
  ClassReport,
  ClassRosterEntry,
  Exam,
  ExamInput,
  ExamResultEntry,
  ExamResultSummary,
  GradeComponent,
  GradeDistribution,
  GradebookEntry,
  GradebookEntryInput,
  LessonNote,
  LessonNoteInput,
  SchoolClass,
  StudentGradeSummary,
  StudentReport,
  StudentSummary,
  TeacherDashboardSummary,
  TeacherReportSummary,
} from '@/types/teacher';

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

const unwrapPage = <T>(res: { data: { data: T[]; meta: PaginationMeta } }): Page<T> => ({
  results: res.data.data,
  meta: res.data.meta,
});

export const teacherApi = {
  // Dashboard
  dashboard: () => api.get<{ data: TeacherDashboardSummary }>('/teacher/dashboard').then(unwrap<TeacherDashboardSummary>),

  // Classes
  classes: (params?: { page?: number; per_page?: number; search?: string; status?: string }) =>
    api.get<{ data: SchoolClass[]; meta: PaginationMeta }>('/teacher/classes', { params }).then(unwrapPage<SchoolClass>),

  classGrades: () => api.get<{ data: string[] }>('/teacher/classes/grades').then(unwrap<string[]>),

  availableStudents: (grade?: string) =>
    api.get<{ data: StudentSummary[] }>('/teacher/classes/available-students', { params: grade ? { grade } : undefined }).then(unwrap<StudentSummary[]>),

  class: (id: number) => api.get<{ data: SchoolClass }>(`/teacher/classes/${id}`).then(unwrap<SchoolClass>),

  createClass: (data: ClassInput) => api.post<{ data: SchoolClass }>('/teacher/classes', data).then(unwrap<SchoolClass>),

  updateClass: (id: number, data: Partial<ClassInput>) =>
    api.put<{ data: SchoolClass }>(`/teacher/classes/${id}`, data).then(unwrap<SchoolClass>),

  deleteClass: (id: number) => api.delete(`/teacher/classes/${id}`).then(() => undefined),

  addClassStudents: (id: number, studentIds: number[]) =>
    api.post<{ data: SchoolClass }>(`/teacher/classes/${id}/students`, { student_ids: studentIds }).then(unwrap<SchoolClass>),

  removeClassStudent: (id: number, studentId: number) =>
    api.delete<{ data: SchoolClass }>(`/teacher/classes/${id}/students/${studentId}`).then(unwrap<SchoolClass>),

  roster: (id: number, date: string) =>
    api.get<{ data: { date: string; roster: ClassRosterEntry[] } }>(`/teacher/classes/${id}/roster`, { params: { date } }).then(unwrap<{ date: string; roster: ClassRosterEntry[] }>),

  recordAttendance: (id: number, date: string, entries: AttendanceEntry[]) =>
    api.post<{ data: AttendanceEntry[] }>(`/teacher/classes/${id}/attendance`, { date, entries }).then(unwrap<AttendanceEntry[]>),

  attendanceSummary: (id: number, month?: string) =>
    api.get<{ data: ClassAttendanceSummary }>(`/teacher/classes/${id}/attendance`, { params: month ? { month } : undefined }).then(unwrap<ClassAttendanceSummary>),

  // Assignments
  assignments: (params?: { page?: number; per_page?: number; class_id?: number; status?: string; search?: string }) =>
    api.get<{ data: Assignment[]; meta: PaginationMeta }>('/teacher/assignments', { params }).then(unwrapPage<Assignment>),

  assignment: (id: number) => api.get<{ data: Assignment }>(`/teacher/assignments/${id}`).then(unwrap<Assignment>),

  createAssignment: (data: AssignmentInput) => api.post<{ data: Assignment }>('/teacher/assignments', data).then(unwrap<Assignment>),

  updateAssignment: (id: number, data: Partial<AssignmentInput>) =>
    api.put<{ data: Assignment }>(`/teacher/assignments/${id}`, data).then(unwrap<Assignment>),

  deleteAssignment: (id: number) => api.delete(`/teacher/assignments/${id}`).then(() => undefined),

  publishAssignment: (id: number) => api.put<{ data: Assignment }>(`/teacher/assignments/${id}/publish`).then(unwrap<Assignment>),

  closeAssignment: (id: number) => api.put<{ data: Assignment }>(`/teacher/assignments/${id}/close`).then(unwrap<Assignment>),

  submissions: (id: number, params?: { page?: number; per_page?: number; status?: string; search?: string }) =>
    api.get<{ data: AssignmentSubmission[]; meta: PaginationMeta }>(`/teacher/assignments/${id}/submissions`, { params }).then(unwrapPage<AssignmentSubmission>),

  gradeSubmission: (id: number, submissionId: number, data: { score: number; feedback?: string }) =>
    api.put<{ data: AssignmentSubmission }>(`/teacher/assignments/${id}/submissions/${submissionId}/grade`, data).then(unwrap<AssignmentSubmission>),

  missingSubmissions: (id: number) => api.get<{ data: StudentSummary[] }>(`/teacher/assignments/${id}/missing`).then(unwrap<StudentSummary[]>),

  // Exams
  exams: (params?: { page?: number; per_page?: number; class_id?: number; type?: string; status?: string; search?: string }) =>
    api.get<{ data: Exam[]; meta: PaginationMeta }>('/teacher/exams', { params }).then(unwrapPage<Exam>),

  exam: (id: number) =>
    api.get<{ data: { exam: Exam; summary: ExamResultSummary } }>(`/teacher/exams/${id}`).then(unwrap<{ exam: Exam; summary: ExamResultSummary }>),

  createExam: (data: ExamInput) => api.post<{ data: Exam }>('/teacher/exams', data).then(unwrap<Exam>),

  updateExam: (id: number, data: Partial<ExamInput>) =>
    api.put<{ data: Exam }>(`/teacher/exams/${id}`, data).then(unwrap<Exam>),

  deleteExam: (id: number) => api.delete(`/teacher/exams/${id}`).then(() => undefined),

  changeExamStatus: (id: number, status: ExamInput['status']) =>
    api.put<{ data: Exam }>(`/teacher/exams/${id}/status`, { status }).then(unwrap<Exam>),

  gradeExamResults: (id: number, entries: ExamResultEntry[]) =>
    api.post<{ data: Exam }>(`/teacher/exams/${id}/results`, { entries }).then(unwrap<Exam>),

  markExamAbsent: (id: number, studentIds: number[]) =>
    api.post<{ data: Exam }>(`/teacher/exams/${id}/absent`, { student_ids: studentIds }).then(unwrap<Exam>),

  // Gradebook
  gradebookEntries: (classId: number, params?: { page?: number; per_page?: number; student_id?: number; component?: string }) =>
    api.get<{ data: GradebookEntry[]; meta: PaginationMeta }>(`/teacher/gradebook/classes/${classId}/entries`, { params }).then(unwrapPage<GradebookEntry>),

  createGradebookEntry: (classId: number, data: GradebookEntryInput) =>
    api.post<{ data: GradebookEntry }>(`/teacher/gradebook/classes/${classId}/entries`, data).then(unwrap<GradebookEntry>),

  bulkGradebookEntries: (classId: number, entries: GradebookEntryInput[]) =>
    api.post<{ data: GradebookEntry[] }>(`/teacher/gradebook/classes/${classId}/entries/bulk`, { entries }).then(unwrap<GradebookEntry[]>),

  updateGradebookEntry: (classId: number, entryId: number, data: Partial<GradebookEntryInput>) =>
    api.put<{ data: GradebookEntry }>(`/teacher/gradebook/classes/${classId}/entries/${entryId}`, data).then(unwrap<GradebookEntry>),

  deleteGradebookEntry: (classId: number, entryId: number) =>
    api.delete(`/teacher/gradebook/classes/${classId}/entries/${entryId}`).then(() => undefined),

  studentGradeSummary: (classId: number, studentId: number) =>
    api.get<{ data: StudentGradeSummary }>(`/teacher/gradebook/classes/${classId}/students/${studentId}`).then(unwrap<StudentGradeSummary>),

  classGradeSummary: (classId: number) =>
    api.get<{ data: ClassGradeSummary }>(`/teacher/gradebook/classes/${classId}/summary`).then(unwrap<ClassGradeSummary>),

  gradeComponents: () => api.get<{ data: GradeComponent[] }>('/teacher/gradebook/components').then(unwrap<GradeComponent[]>),

  // Lesson notes
  lessonNotes: (params?: { page?: number; per_page?: number; class_id?: number; search?: string }) =>
    api.get<{ data: LessonNote[]; meta: PaginationMeta }>('/teacher/lesson-notes', { params }).then(unwrapPage<LessonNote>),

  lessonNote: (id: number) => api.get<{ data: LessonNote }>(`/teacher/lesson-notes/${id}`).then(unwrap<LessonNote>),

  createLessonNote: (data: LessonNoteInput) => api.post<{ data: LessonNote }>('/teacher/lesson-notes', data).then(unwrap<LessonNote>),

  updateLessonNote: (id: number, data: Partial<LessonNoteInput>) =>
    api.put<{ data: LessonNote }>(`/teacher/lesson-notes/${id}`, data).then(unwrap<LessonNote>),

  deleteLessonNote: (id: number) => api.delete(`/teacher/lesson-notes/${id}`).then(() => undefined),

  attachLessonNoteFile: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<{ data: LessonNote }>(`/teacher/lesson-notes/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap<LessonNote>);
  },

  // Calendar
  calendarEvents: (params?: { from?: string; to?: string; class_id?: number; event_type?: string }) =>
    api.get<{ data: CalendarEvent[] }>('/teacher/calendar', { params }).then(unwrap<CalendarEvent[]>),

  createCalendarEvent: (data: CalendarEventInput) => api.post<{ data: CalendarEvent }>('/teacher/calendar', data).then(unwrap<CalendarEvent>),

  updateCalendarEvent: (id: number, data: Partial<CalendarEventInput>) =>
    api.put<{ data: CalendarEvent }>(`/teacher/calendar/${id}`, data).then(unwrap<CalendarEvent>),

  deleteCalendarEvent: (id: number) => api.delete(`/teacher/calendar/${id}`).then(() => undefined),

  // Analytics
  analytics: () => api.get<{ data: {
    overview: AnalyticsOverview;
    attendance_trend: AttendanceTrendPoint[];
    grade_distribution: GradeDistribution;
    class_performance: ClassPerformanceRow[];
  } }>('/teacher/analytics').then(unwrap<{
    overview: AnalyticsOverview;
    attendance_trend: AttendanceTrendPoint[];
    grade_distribution: GradeDistribution;
    class_performance: ClassPerformanceRow[];
  }>),

  analyticsOverview: () => api.get<{ data: AnalyticsOverview }>('/teacher/analytics/overview').then(unwrap<AnalyticsOverview>),

  attendanceTrend: (days = 30) =>
    api.get<{ data: AttendanceTrendPoint[] }>('/teacher/analytics/attendance-trend', { params: { days } }).then(unwrap<AttendanceTrendPoint[]>),

  gradeDistribution: (classId?: number) =>
    api.get<{ data: GradeDistribution }>('/teacher/analytics/grade-distribution', { params: classId ? { class_id: classId } : undefined }).then(unwrap<GradeDistribution>),

  classPerformance: (classId?: number) =>
    api.get<{ data: ClassPerformanceRow[] }>('/teacher/analytics/class-performance', { params: classId ? { class_id: classId } : undefined }).then(unwrap<ClassPerformanceRow[]>),

  // Reports
  reportSummary: (params?: { from?: string; to?: string }) =>
    api.get<{ data: TeacherReportSummary }>('/teacher/reports/summary', { params }).then(unwrap<TeacherReportSummary>),

  classReport: (classId: number, params?: { from?: string; to?: string }) =>
    api.get<{ data: ClassReport }>(`/teacher/reports/classes/${classId}`, { params }).then(unwrap<ClassReport>),

  studentReport: (classId: number, studentId: number, params?: { from?: string; to?: string }) =>
    api.get<{ data: StudentReport }>(`/teacher/reports/classes/${classId}/students/${studentId}`, { params }).then(unwrap<StudentReport>),
};

export { getErrorMessage } from '@/lib/studentsApi';
