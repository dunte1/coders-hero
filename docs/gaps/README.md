# Coders-Hero Feature Gap Analysis

Audit date: 2026-08-22 · Scope: full backend (Laravel 12) + frontend (React) + Flutter mobile.
Method: every feature verified against actual routes, controllers, models/migrations and frontend pages — not file names.

## Totals

| Status | Count |
|---|---|
| Implemented | 39 |
| Partial | 23 |
| Missing | 11 |
| **Checked** | **73** |

---

## Status table (condensed; per-feature detail in the matching gap doc)

### A. Coder's Hero LMS
| Feature | Status | Evidence (verified) | Notes |
|---|---|---|---|
| Coding lessons | Implemented | CourseSeeder, GET /courses/{id}/lessons, LmsCoursePlayerPage, /lms/playground (Piston python/js) | — |
| Robotics lessons | Implemented | "Robotics & Arduino Programming" course + robotics lab routes/pages | — |
| Scratch module | Implemented | CourseSeeder "Scratch Coding Adventures" (full course) | Content-only (no runner) |
| Python module | Implemented | "Python Fundamentals", "Python for Data Science", python Piston runner | — |
| HTML module | Implemented | "HTML & Web Fundamentals" course | — |
| CSS module | Implemented | "CSS Mastery & Animations" course | — |
| JavaScript module | Implemented | "JavaScript for Beginners" course + js runner | — |
| AI module | Implemented | "AI & Machine Learning for Teens" (Foundations→Neural Networks) | — |
| Game development module | Partial | Only one Scratch lesson ("Building a Simple Game") | No dedicated course → docs/gaps/lms-game-development-module.md |
| Web development module | Implemented | Laravel/React/HTML/CSS/JS/PHP courses under Web Development category | — |
| Electronics/Arduino module | Implemented | Arduino course modules + kit tracking (RoboticsSeeder ARDUINO-UNO-STARTER) | Bundled in Robotics; no standalone category |
| Quizzes | Implemented | QuizService::submitAttempt scoring, quiz_questions tables, QuizTakerPage | Slash-mismatch caveat on FE calls |
| Assignments | Implemented | student/assignments routes+controller, submissions upsert, teacher grading | No draft autosave yet |
| Exams | Partial | Teacher CRUD+results only; no student exam engine | docs/gaps/lms-exams-student-online-taking.md |

### B. Student Innovation Lab
| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Project title field | Partial | robotics_projects.title only | docs/gaps/lab-project-title.md |
| Problem-being-solved field | Missing | no column anywhere | docs/gaps/lab-problem-being-solved.md |
| Description field | Partial | robotics/staff PM only | docs/gaps/lab-project-description-field.md |
| Technologies-used field | Missing | no column/form | docs/gaps/lab-technologies-used.md |
| Images/videos upload | Missing | files JSON inert, no Storage calls | docs/gaps/lab-images-videos-upload.md |
| Source code upload/link | Partial | repo/demo URLs (robotics); no file upload | docs/gaps/lab-source-code-upload-link.md |
| Teacher feedback field | Partial | write path ok; never shown to student | docs/gaps/lab-teacher-feedback.md |
| Project score field | Partial | per-submission score, robotics only | docs/gaps/lab-project-score.md |
| Version history | Partial | submission rows as versions | docs/gaps/lab-version-history.md |
| Published/unpublished toggle | Missing | no is_published column on projects | docs/gaps/lab-publish-toggle.md |

Foundation doc: docs/gaps/lab-project-foundation.md (new `student_projects` model).

### C. Student Dashboard navigation flow
Flow: My Classes ✗ · My Lessons (via My Courses player, no nav item) · Playground ✓ · Assignments ✓ · Projects ✓ (robotics only) · Exams ✗ · Progress (page orphaned) · Certificates ✓ · Portfolio ✗ → **Partial**
| Item | Status | Doc |
|---|---|---|
| My Classes page/link | Partial | dash-nav-flow-my-classes.md |
| Progress link (orphan fix) | Partial | dash-nav-flow-progress-link.md |
| Teachers upload PDF materials | Partial (backend-only endpoint) | teacher-pdf-material-upload.md |
| Students access exams online | Missing | lms-exams-student-online-taking.md |
| Online classes live/recorded | Partial (video_url lessons; zero live integration) | online-classes-live-recorded.md |
| Portfolio | Missing | portfolio-page.md |

### D. Parent Portal
| Item | Status | Doc |
|---|---|---|
| attendance | Implemented | — (/parent/attendance) |
| courses | Partial | parent-courses-view.md |
| progress | Implemented | — (/parent/progress) |
| projects | Missing | parent-projects-view.md |
| teacher comments | Partial (+teacher-role chat bug) | parent-teacher-comments.md |
| assignments | Missing | parent-assignments-view.md |
| results | Implemented | — (/parent/report-cards) |
| certificates | Partial (own-not-child, not in nav) | parent-certificates-child-scoped.md |
| fees | Implemented | — (/parent/fees, payments, PDF receipts) |
| announcements | Partial (global nav only, not in portal) | parent-announcements-in-portal.md |
| competition participation | Missing | parent-competition-participation.md |

### E. School Portal (school_admin flow)
| Step | Status | Doc |
|---|---|---|
| Admin dashboard | Partial (orphaned /school/dashboard endpoint) | school-admin-dashboard-page.md |
| Manage teachers | Partial (backend allows, UI gates exclude) | school-admin-teachers-ui-access.md |
| Manage students | Implemented | students/* routes+pages |
| Manage classes | Implemented | via teacher/classes incl. school_admin |
| Manage courses | Partial (create/edit route gate) | school-admin-course-create-access.md |
| Attendance management | Implemented | attendance/* + pages |
| Assessments | Implemented | teacher exams/gradebook/quizzes |
| Reports | Implemented (generated-reports UI unwired) | downloadable-generated-reports-wiring.md |

### F. Teacher/Tutor Portal
Implemented: view classes, take attendance, give assignments(+grading), mark projects (robotics review), gradebook grading, comments (feedback fields), track progress (analytics), reports. 
Partial: upload lessons/materials → docs/gaps/teacher-lesson-materials-authoring.md (also F7 note: report-card comment entry is admin-only).

### G. Innovation Marketplace
| Feature | Status | Doc |
|---|---|---|
| Public project hub | Missing | marketplace-public-hub.md |

### H. Business/Administration ERP
| Feature | Status | Doc |
|---|---|---|
| CRM | Missing | crm-pipeline.md |
| School contracts | Partial (directory only) | school-contracts-entity.md |
| Invoicing | Implemented | finance/invoices + InvoiceService |
| Fees | Implemented | fee structures/student fees/payments |
| M-Pesa integration | Implemented | MpesaService STK push + idempotent callbacks + reconciliation |
| Payroll | Implemented (statutory deductions hardcoded 0) | — |
| HR | Implemented | employees/contracts/leave/documents/reviews |
| Staff attendance | Implemented (admin-recorded; no self punch-clock) | — |
| Inventory | Implemented | assets/stock/movements/QR |
| Robotics equipment tracking | Implemented | equipment/reservations/maintenance services |
| Branch management | Implemented | organization/branches CRUD |
| Expenses | Partial (no approval workflow) | expenses-approval-workflow.md |
| Procurement | Missing | procurement-domain.md |
| Reports | Implemented | finance/HR/inventory/admin report endpoints + exports |
| SMS/WhatsApp notifications | Partial (SMS yes (Africa's Talking, disabled by default); WhatsApp absent) | whatsapp-channel.md |

---

## Phase plan

### Phase 1 — Foundations (unblock everything else) ~10 items
1. `student_projects` foundation model + CRUD (lab-project-foundation) — unblocks B*, marketplace, portfolio, parent projects
2. Publish/unpublish flag + toggle (lab-publish-toggle)
3. Student exam engine: exam_questions/attempts models + student routes (lms-exams-student-online-taking) — unblocks C/D/E exam visibility
4. Role-gate bug fixes batch: school_admin users/course UI access (school-admin-teachers-ui-access, school-admin-course-create-access), parent-chat teacher role fix (parent-teacher-comments), teacher included in lesson authoring (teacher-lesson-materials-authoring)
5. Nav wiring fixes: Progress/achievements links, My Finance group visibility for student/parent (dash-nav-flow-progress-link)

### Phase 2 — Core teaching/learning flow ~9 items
6. Innovation Lab UX: media uploads, tech-stack field, feedback display, score rollup (lab-images-videos-upload, lab-technologies-used, lab-teacher-feedback, lab-project-score)
7. Draft auto-save for assignments (schema already has draft status)
8. Student exam-taking UI (reuse QuizTakerPage)
9. Lesson material upload UI + downloads (teacher-pdf-material-upload)
10. My Classes + My Lessons student pages (dash-nav-flow-my-classes)
11. Game development module content (lms-game-development-module)
12. Version labels for project submissions (lab-version-history)
13. Source-code zip upload (lab-source-code-upload-link)
14. School admin dashboard page (school-admin-dashboard-page)

### Phase 3 — Portals on top of Phase 1–2 data ~8 items
15. Parent: assignments view (parent-assignments-view)
16. Parent: projects view (parent-projects-view)
17. Parent: competitions participation (parent-competition-participation)
18. Parent: child certificates (parent-certificates-child-scoped)
19. Parent: courses list (parent-courses-view)
20. Parent: announcements inside portal (parent-announcements-in-portal)
21. Generated/downloadable reports wiring (downloadable-generated-reports-wiring)
22. Student portfolio public page (portfolio-page)

### Phase 4 — Marketplace & ERP/business (independent shippable) ~7 items
23. Innovation Marketplace public hub (marketplace-public-hub) — needs Phase 1 #1+#2
24. CRM pipeline (crm-pipeline)
25. WhatsApp channel (whatsapp-channel)
26. Procurement domain (procurement-domain)
27. Expense approval workflow (expenses-approval-workflow)
28. School contracts entity (school-contracts-entity)
29. Live-class integration (online-classes-live-recorded phase B) + payroll statutory deductions hardening
