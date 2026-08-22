# Gap: Online Exam Taking (student side)
**Status:** Partial (feature "Exams": teacher management Implemented, student taking Missing)
## Current state
- Teacher-side complete: `api.php` L735-742 (`/teacher/exams` CRUD, status, results, absent), `TeacherExamController`, `App\Services\Teachers\ExamService`; migrations `2024_01_02_000005_create_exams_table.php`, `_000006_create_exam_results_table.php`; UI `TeacherExamsPage.tsx`, `TeacherExamDetailPage.tsx`.
- `exams` table has no questions entity (only `settings` json); results are manually entered marks.
- Quizzes already prove the pattern end-to-end: `quiz_questions`, `QuizService::submitAttempt()`, `QuizTakerPage.tsx`.
## What's missing
- `exam_questions` (+ options) model/migration/seeder.
- Student routes: `GET /exams/{id}` (questions, time-boxed), `POST /exams/{id}/submit` with auto-scoring, attempt guard.
- Student UI page (reuse QuizTakerPage patterns) + router entry.
## Suggested approach
- Mirror the Quiz subsystem: clone migration trio, extend `ExamService` with `startAttempt/submitAttempt`, add `role:student` route group, build `StudentExamPage` from `QuizTakerPage.tsx`. Reuse quiz auto-grading helpers.
## Dependencies
- None technically; Parent Portal "results" and School "assessments" read richer data once exams are taken online.
