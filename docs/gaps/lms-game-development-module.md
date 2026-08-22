# Gap: Game Development Module
**Status:** Partial
## Current state
- Only trace: lesson "Building a Simple Game" inside the seeded course "Scratch Coding Adventures" (`backend/database/seeders/CourseSeeder.php`), plus blog marketing copy (`BlogPostSeeder.php`).
- Delivery pipeline fully supports adding it: categories -> courses -> modules -> lessons (`CategorySeeder.php`, `CourseSeeder.php`, `GET /courses/{id}/lessons`, `LmsCoursePlayerPage.tsx`).
## What's missing
- No dedicated "Game Development" category/course/module with its own curriculum.
- No game-oriented code runner (playground executes Python/JS only via `PistonCodeRunner.php`).
## Suggested approach
- Add a `Game Development` entry to `CategorySeeder` and a full course (e.g. "Game Development with JavaScript/Scratch") to `CourseSeeder` following existing `firstOrCreate/updateOrCreate` patterns. Optionally add `piston` language mapping if a runner is wanted.
## Dependencies
- None (pure content on existing pipeline).
