# Gap: Images/videos upload on projects
**Status:** Missing
## Current state
- `robotics_project_submissions.files` JSON column stores an unvalidated array; `SubmitRoboticsProjectRequest` has no file rules; service never touches `Storage`; submission dialog has no file picker. Nothing serves project media.
## What's missing
- Real UploadedFile handling (validate mime/size), disk storage, serving URLs, gallery UI.
## Suggested approach
- `project_media` table (project_id, path, type image/video, sort) OR reuse pattern of `AuthController::uploadPhoto`/`StudentController::uploadPhoto` (`storeAs` on `public` disk). Validate `mimes:jpg,jpeg,png,webp,mp4|max:20480`. Render grid with lightbox on detail page.
## Dependencies
- student_projects foundation model; storage:link verified on server.
