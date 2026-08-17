export type BookmarkType = 'course' | 'lesson' | 'thread';
export type CodingDifficulty = 'easy' | 'medium' | 'hard';
export type CodingSubmissionStatus = 'correct' | 'partial' | 'incorrect' | 'pending';
export type CodingLanguage = 'python' | 'javascript';

export interface CodingWorkspaceFile {
  name: string;
  content: string;
}

export interface CodingWorkspace {
  id: number;
  user_id: string;
  course_id: number | null;
  name: string;
  language: CodingLanguage;
  files: CodingWorkspaceFile[];
  active_file: string | null;
  saved_at: string;
  created_at?: string;
  updated_at?: string;
}

export type CodingWorkspaceSnapshot = Pick<
  CodingWorkspace,
  'name' | 'language' | 'files' | 'active_file' | 'saved_at'
>;

export interface PlaygroundRunResult {
  stdout: string;
  stderr: string;
  output: string;
  exit_code: number;
  timed_out: boolean;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  score: number;
  submitted_at: string;
}

export interface CodingLeaderboardForExercise {
  exercise_id: number;
  period: string;
  leaderboard: LeaderboardEntry[];
}

export interface CodingLeaderboardForCourse {
  course_id: number;
  period: string;
  leaderboard: Record<
    string,
    {
      exercise_title: string;
      solved_count: number;
      users: LeaderboardEntry[];
    }
  >;
}

export interface CodingAiResult {
  content: string;
  meta: { model?: string; fallback?: boolean } | null;
}

export interface ForumUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ForumThread {
  id: number;
  course_id: number;
  user: ForumUser | null;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  posts_count?: number;
  posts?: ForumPost[];
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: number;
  thread_id: number;
  user: ForumUser | null;
  content: string;
  parent_id: number | null;
  replies?: ForumPost[];
  created_at: string;
}

export interface CourseRating {
  id: number;
  course_id: number;
  user: ForumUser | null;
  rating: number;
  review: string | null;
  created_at: string;
}

export interface RatingSummary {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CodingExercise {
  id: number;
  lesson_id: number | null;
  course_id: number | null;
  title: string;
  description: string;
  instructions: string | null;
  starter_code: string | null;
  solution_code?: string | null;
  language: string | null;
  difficulty: CodingDifficulty;
  test_cases: unknown[] | null;
  status: string;
  submissions_count?: number;
  user_submissions_count?: number;
  created_at?: string;
}

export interface CodingSubmission {
  id: number;
  exercise_id: number;
  code: string;
  status: CodingSubmissionStatus;
  score: number;
  result: Array<{ index: number; input: unknown; expected: unknown; actual: unknown; passed: boolean }>;
  feedback: string;
  submitted_at: string;
  created_at: string;
}

export interface CodingProgress {
  total_exercises: number;
  solved: number;
  attempted: number;
  solved_exercise_ids: number[];
  attempted_exercise_ids: number[];
}

export interface AiTutorMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface AiTutorConversation {
  id: number;
  course_id: number | null;
  lesson_id: number | null;
  title: string;
  course?: { id: number; title: string } | null;
  lesson?: { id: number; title: string } | null;
  messages_count?: number;
  messages?: AiTutorMessage[];
  created_at: string;
  updated_at: string;
}

export interface AiTutorSendResult {
  user_message: AiTutorMessage;
  assistant_message: AiTutorMessage;
  title: string;
}

export interface VideoProgress {
  id: number;
  lesson_id: number;
  watched_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  progress: number;
  last_watched_at: string | null;
}

export interface CourseProgress {
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  completed_lesson_ids: number[];
}

export interface ForumThreadInput {
  title: string;
  content: string;
}

export interface AiTutorConversationInput {
  course_id?: number | null;
  lesson_id?: number | null;
  title?: string;
}
