# GAP DOC: Student Projects Foundation (prerequisite for most Lab items)
This module does not exist as such. Recommended foundation:
- Migration `student_projects`: id(uuid), student_id FK, title, problem_statement, description, technologies (json), repo_url, demo_url, source_path, final_score, is_published, published_at, status enum(planning/in_progress/completed/archived), timestamps.
- Media: `project_media` (project_id, type, path, sort_order).
- Controller `StudentProjectController` (index/store/show/update/destroy + publish toggle + media upload) under `role:student` ownership scoping, mirroring `RoboticsProjectService` conventions.
- Review endpoints reuse robotics review request shape (status/score/feedback) with `role:teacher|instructor|admin|super_admin`.
- Frontend: `/my-projects` pages (list/create/edit/detail) modeled on `RoboticsProjectsPage.tsx`; api client additions in `lib/api.ts`.
Covers gap slugs: lab-project-title, lab-problem-being-solved, lab-project-description-field, lab-technologies-used, lab-images-videos-upload, lab-source-code-upload-link, lab-teacher-feedback, lab-project-score, lab-version-history, lab-publish-toggle.
