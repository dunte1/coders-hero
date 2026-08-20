# CODER'S HERO — UPGRADE IMPLEMENTATION GUIDE

**Version:** 1.0
**Date:** August 2026
**Source:** CODERS_HERO_COMPETITIVE_AUDIT.md

---

## QUICK REFERENCE

| Phase | Name | Priority | Est. Duration | Tasks |
|-------|------|----------|---------------|-------|
| 0 | Bug Fixes & Design System | P0 | 2 weeks | 15 |
| 1 | Public Website | P1 | 4 weeks | 10 |
| 2 | Auth & Onboarding | P1 | 3 weeks | 6 |
| 3 | Course Catalog & Enrollment | P1 | 5 weeks | 5 |
| 4 | Student Experience | P1 | 6 weeks | 6 |
| 5 | Parent Experience | P1 | 4 weeks | 5 |
| 6 | Teacher Experience | P1 | 4 weeks | 5 |
| 7 | School Experience | P2 | 4 weeks | 5 |
| 8 | Admin/Superadmin | P2 | 3 weeks | 5 |
| 9 | LMS Advanced | P2 | 6 weeks | 6 |
| 10 | Payments & Commercial | P2 | 4 weeks | 5 |
| 11 | Communication & Notifications | P2 | 3 weeks | 5 |
| 12 | Analytics & Reporting | P2 | 4 weeks | 4 |
| 13 | Mobile Application | P2 | 6 weeks | 5 |
| 14 | Security & Performance | P1 | 3 weeks | 5 |
| 15 | End-to-End Testing | P1 | 3 weeks | 5 |
| 16 | Production Launch | P1 | 2 weeks | 5 |

**Phase Dependencies:**
```
Phase 0 → Phase 1, 2
Phase 1 → Phase 3
Phase 2 → Phase 4, 5, 6, 7, 8
Phase 3, 4 → Phase 10
Phase 4, 5, 6 → Phase 11
Phase 4-8 → Phase 12
Phase 4-6 → Phase 13
All phases → Phase 14
Phase 14 → Phase 15
Phase 15 → Phase 16
```

---

# PHASE 0 — BUG FIXES & DESIGN SYSTEM

**Priority:** P0
**Duration:** 2 weeks
**Dependencies:** None

---

## TASK-001: Fix Dashboard Crash Bug

- **File:** `frontend/src/pages/DashboardPage.tsx:97`
- **Current:** `const { data: stats, isLoading } = useDashboard();` — `error` is never destructured
- **Line 105:** `if (error) return (` — `error` is undefined, causes `ReferenceError`
- **Change:**
  ```tsx
  // Line 97 — add `error` and `isError` to destructuring
  const { data: stats, isLoading, isError, error } = useDashboard();

  // Line 105 — change `error` to `isError`
  if (isError) return (
  ```
- **Test:** Simulate API failure (disconnect backend). Dashboard should show error state, not crash.
- **Priority:** P0

---

## TASK-002: Fix "Remember Me" Checkbox

- **File:** `frontend/src/components/features/auth/LoginForm.tsx:122-129`
- **Current:** Checkbox has no `checked`, no `onChange`, no state — it renders but does nothing
- **Change:** Wire to form state or remove entirely
  ```tsx
  // Option A: Wire to form (add `remember_me` to Zod schema)
  <input
    type="checkbox"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
  />

  // Option B: Remove the entire <label> block (lines 122-129)
  ```
- **Test:** Check/uncheck box, submit login, verify behavior persists or is removed cleanly.
- **Priority:** P0

---

## TASK-003: Fix Gallery Lightbox Close Button

- **File:** `frontend/src/pages/website/GalleryPage.tsx:154-159`
- **Current:** Close button has `aria-label="Close"` but no `onClick` handler
- **Change:**
  ```tsx
  // Line 154 — add onClick
  <button
    type="button"
    onClick={() => setLightbox(null)}
    className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
    aria-label="Close"
  >
  ```
- **Test:** Open lightbox, click X button — should close. Click backdrop — should also close.
- **Priority:** P0

---

## TASK-004: Fix QuickActions Role Fallback

- **File:** `frontend/src/components/features/dashboard/QuickActions.tsx:42-46`
- **Current:** `const actions = isAdmin ? adminActions : instructorActions;` — students/parents get instructor actions
- **Change:**
  ```tsx
  export function QuickActions({ userRole }: QuickActionsProps) {
    const navigate = useNavigate();
    const role = userRole?.toLowerCase();
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'director' || role === 'branch_manager' || role === 'school_admin';
    const isInstructor = role === 'instructor' || role === 'teacher';
    const isStudent = role === 'student';
    const isParent = role === 'parent';

    let actions = instructorActions; // default
    if (isAdmin) actions = adminActions;
    else if (isStudent) actions = studentActions;
    else if (isParent) actions = parentActions;

    // ... rest of component
  }
  ```
  Also add student and parent action arrays at the top of the file:
  ```tsx
  const studentActions = [
    { label: 'My Courses', icon: BookOpen, href: '/my-courses', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
    { label: 'Assignments', icon: FileText, href: '/student/assignments', color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
    { label: 'Certificates', icon: Award, href: '/certificates', color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  ];

  const parentActions = [
    { label: 'My Children', icon: Users, href: '/parent/children', color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
    { label: 'Attendance', icon: Calendar, href: '/parent/attendance', color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100' },
    { label: 'Fees', icon: CreditCard, href: '/parent/fees', color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
  ];
  ```
- **Test:** Login as student — see student quick actions. Login as parent — see parent quick actions.
- **Priority:** P0

---

## TASK-005: Fix SPA Navigation Links

- **File:** `frontend/src/pages/website/ProgramsPage.tsx:138-143`
- **Current:** `<a href="/contact">` causes full page reload
- **Change:**
  ```tsx
  // Line 138 — replace <a> with <Link>
  import { Link } from 'react-router-dom';
  // ...
  <Link
    to="/contact"
    className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
  >
    Book a Free Trial
  </Link>
  ```

- **File:** `frontend/src/pages/website/PartnerSchoolsPage.tsx:77-82`
- **Current:** `<a href="/contact">` causes full page reload
- **Change:**
  ```tsx
  // Line 77 — replace <a> with <Link>
  import { Link } from 'react-router-dom';
  // ...
  <Link
    to="/contact"
    className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
  >
    Contact Us
  </Link>
  ```
- **Test:** Click "Book a Free Trial" on Programs page — should navigate without full reload (check Network tab).
- **Priority:** P0

---

## TASK-006: Fix /search Route

- **File:** `frontend/src/components/layout/Header.tsx:40`
- **Current:** `navigate(`/search?q=...`)` — no `/search` route exists in router
- **Option A (Recommended):** Remove search bar from Header until search page is built
  ```tsx
  // Remove lines 86-97 (search form) from Header.tsx
  ```
- **Option B:** Create a basic SearchPage
  ```tsx
  // frontend/src/pages/SearchPage.tsx — new file
  // frontend/src/router/routes.ts — add route
  ```
- **Test:** If Option A: no search bar in header. If Option B: search returns results.
- **Priority:** P0

---

## TASK-007: Create Skeleton Component

- **File:** `frontend/src/components/ui/Skeleton.tsx` — NEW
- **Change:** Create skeleton loading primitives
  ```tsx
  import { cn } from '@/lib/utils';

  function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        className={cn('animate-pulse rounded-md bg-slate-200', className)}
        {...props}
      />
    );
  }

  function SkeletonCard() {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-4 w-1/3 mb-3" />
        <Skeleton className="h-3 w-2/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    );
  }

  function SkeletonTableRow() {
    return (
      <div className="flex items-center gap-4 py-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    );
  }

  function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    );
  }

  export { Skeleton, SkeletonCard, SkeletonTableRow, SkeletonText };
  ```
- **Test:** Import and render each variant — should show pulsing gray placeholders.
- **Priority:** P0

---

## TASK-008: Create Alert Component

- **File:** `frontend/src/components/ui/Alert.tsx` — NEW
- **Change:**
  ```tsx
  import { cva, type VariantProps } from 'class-variance-authority';
  import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
  import { cn } from '@/lib/utils';

  const alertVariants = cva(
    'relative w-full rounded-lg border p-4 flex items-start gap-3',
    {
      variants: {
        variant: {
          default: 'bg-slate-50 border-slate-200 text-slate-900',
          success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          error: 'bg-red-50 border-red-200 text-red-900',
          warning: 'bg-amber-50 border-amber-200 text-amber-900',
          info: 'bg-blue-50 border-blue-200 text-blue-900',
        },
      },
      defaultVariants: { variant: 'default' },
    }
  );

  const icons = {
    default: Info,
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  interface AlertProps extends VariantProps<typeof alertVariants> {
    title?: string;
    children: React.ReactNode;
  }

  export function Alert({ variant = 'default', title, children }: AlertProps) {
    const Icon = icons[variant || 'default'];
    return (
      <div className={cn(alertVariants({ variant }))}>
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h5 className="font-medium mb-1">{title}</h5>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    );
  }
  ```
- **Test:** Render each variant — should show correct color and icon.
- **Priority:** P0

---

## TASK-009: Create ConfirmationDialog Component

- **File:** `frontend/src/components/ui/ConfirmationDialog.tsx` — NEW
- **Change:**
  ```tsx
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/Dialog';
  import { Button } from '@/components/ui/Button';
  import { AlertTriangle } from 'lucide-react';

  interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'destructive' | 'default';
    onConfirm: () => void;
    loading?: boolean;
  }

  export function ConfirmationDialog({
    open, onOpenChange, title, description,
    confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    variant = 'destructive', onConfirm, loading,
  }: ConfirmationDialogProps) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {variant === 'destructive' && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              )}
              <div>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  ```
- **Test:** Open dialog, click confirm — should call onConfirm. Click cancel — should close.
- **Priority:** P0

---

## TASK-010: Fix DataTable Loading State

- **File:** `frontend/src/components/ui/DataTable.tsx:131-136`
- **Current:** Shows plain text `"Loading..."`
- **Change:**
  ```tsx
  // Line 131-136 — replace with skeleton rows
  import { Skeleton } from '@/components/ui/Skeleton';

  // Replace:
  loading ? (
    <tr>
      <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-slate-500">
        Loading...
      </td>
    </tr>
  ) : (

  // With:
  loading ? (
    <tr>
      <td colSpan={columns.length + (rowActions ? 1 : 0)} className="p-0">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </td>
    </tr>
  ) : (
  ```
- **Test:** Load any DataTable page — should see skeleton rows instead of "Loading..." text.
- **Priority:** P0

---

## TASK-011: Reduce Header Height

- **File:** `frontend/src/components/layout/Header.tsx:45`
- **Current:** `h-[100px]`
- **Change:**
  ```tsx
  // Line 45 — change height
  <header className="sticky top-0 z-50 flex h-16 items-center gap-4 px-4 lg:px-6" ...>
  ```
- **Test:** All dashboard pages should show a compact header. No content should be cut off.
- **Priority:** P0

---

## TASK-012: Fix FaqAccordion Accessibility

- **File:** `frontend/src/components/website/FaqAccordion.tsx:21-33`
- **Current:** Missing `aria-expanded` and `aria-controls`
- **Change:**
  ```tsx
  // Line 21 — add aria attributes
  <button
    type="button"
    onClick={() => setOpenIndex(isOpen ? null : index)}
    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
    aria-expanded={isOpen}
    aria-controls={`faq-answer-${faq.id}`}
  >
    <span className="font-medium text-slate-900">{faq.question}</span>
  // ...

  // Line 34 — add id to answer panel
  {isOpen ? (
    <div
      id={`faq-answer-${faq.id}`}
      role="region"
      className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600"
    >
      {faq.answer}
    </div>
  ) : null}
  ```
- **Test:** Inspect FAQ buttons in browser — should have `aria-expanded="true/false"`. Screen reader should announce state.
- **Priority:** P0

---

## TASK-013: Standardize EmptyState Usage

- **Files to audit and fix:**
  - `frontend/src/pages/CourseDetailPage.tsx:78` — replace plain text with `<EmptyState>`
  - `frontend/src/pages/CourseDetailPage.tsx:23` — replace plain div with `<EmptyState>`
  - `frontend/src/pages/QuizTakerPage.tsx:20` — replace plain div with `<EmptyState>`
- **Change:** Import and use `EmptyState` component consistently
  ```tsx
  import { EmptyState } from '@/components/ui/EmptyState';
  import { BookOpen } from 'lucide-react';

  // Replace plain text divs:
  <EmptyState
    icon={BookOpen}
    title="No lessons yet"
    description="This course doesn't have any lessons yet."
  />
  ```
- **Test:** All empty states should show icon + title + description consistently.
- **Priority:** P0

---

## TASK-014: Standardize Loading Components

- **Files to audit:**
  - `frontend/src/pages/teacher/TeacherDashboardPage.tsx:23` — uses bare `<Spinner />`
  - Any other page using `<Spinner />` instead of `<PageSpinner />`
- **Change:**
  ```tsx
  // Replace: import { Spinner } from '@/components/ui/Spinner';
  // With: import { PageSpinner } from '@/components/ui/Spinner';

  // Replace: <Spinner />
  // With: <PageSpinner />
  ```
- **Test:** All page-level loading states should show full-page spinner consistently.
- **Priority:** P0

---

## TASK-015: Fix Sidebar Touch Flyout

- **File:** `frontend/src/components/layout/SidebarGroup.tsx:42-50`
- **Current:** Collapsed flyout uses `group-hover/nav:block` — doesn't work on touch
- **Change:** Add click/tap handler for touch devices
  ```tsx
  const [touchOpen, setTouchOpen] = useState(false);

  // On the flyout trigger element, add:
  onClick={() => setTouchOpen(!touchOpen)}
  onMouseLeave={() => setTouchOpen(false)}

  // Change the flyout visibility condition from:
  className="... group-hover/nav:block ..."
  // To:
  className={cn("...", (touchOpen || undefined) && "block")}
  ```
- **Test:** Collapse sidebar on mobile/touch device — tap group should show flyout menu.
- **Priority:** P0

---

## PHASE 0 ACCEPTANCE CRITERIA

- [ ] Dashboard loads without crash on API error
- [ ] "Remember me" checkbox is functional or removed
- [ ] Gallery lightbox close button works
- [ ] Student/parent see correct quick actions
- [ ] Programs/PartnerSchools links navigate without full reload
- [ ] Header search is removed or /search route exists
- [ ] Skeleton component renders correctly
- [ ] Alert component renders all variants
- [ ] ConfirmationDialog opens and closes correctly
- [ ] DataTable shows skeleton rows while loading
- [ ] Header height is 64px (h-16)
- [ ] FAQ accordion has aria-expanded
- [ ] All empty states use EmptyState component
- [ ] All page loading uses PageSpinner
- [ ] Sidebar flyout works on touch devices

---

# PHASE 1 — PUBLIC WEBSITE TRANSFORMATION

**Priority:** P1
**Duration:** 4 weeks
**Dependencies:** Phase 0

---

## TASK-101: Add Free Class Booking Page

- **New File:** `frontend/src/pages/website/FreeTrialPage.tsx`
- **New File:** `frontend/src/router/routes.ts` — add route
- **New File:** `backend/app/Http/Controllers/Api/Public/FreeTrialController.php`
- **New File:** `backend/app/Models/FreeTrialBooking.php`
- **New File:** `backend/database/migrations/xxxx_create_free_trial_bookings_table.php`
- **Change:**
  - Frontend: Form with phone number, grade selector (K-12), parent name, email
  - Backend: Store endpoint, admin listing endpoint
  - Database: `free_trial_bookings` table (id, name, phone, grade, email, status, notes, timestamps)
  - Navbar: Add "Free Trial" CTA button
- **Test:** Submit booking form → record saved in DB → success message shown
- **Priority:** P1

---

## TASK-102: Add Social Proof Counters to Homepage

- **File:** `frontend/src/pages/website/HomePage.tsx` — after hero section (~line 243)
- **Change:** Add counter section showing students, schools, courses, instructors
  ```tsx
  {/* Social Proof Counters */}
  <section className="py-8 bg-white border-y border-slate-100">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { label: 'Students Enrolled', value: stats?.total_students ?? '500+', icon: Users },
          { label: 'Partner Schools', value: stats?.total_schools ?? '15+', icon: Building2 },
          { label: 'Courses Available', value: stats?.total_courses ?? '50+', icon: BookOpen },
          { label: 'Expert Instructors', value: stats?.total_instructors ?? '20+', icon: GraduationCap },
        ].map((stat) => (
          <div key={stat.label}>
            <stat.icon className="h-8 w-8 mx-auto text-brand-600 mb-2" />
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
  ```
- **Test:** Homepage shows 4 stat counters between hero and services sections.
- **Priority:** P1

---

## TASK-103: Add JSON-LD Structured Data

- **File:** `frontend/src/pages/website/HomePage.tsx` — add `<script type="application/ld+json">`
- **File:** `frontend/src/pages/website/ProgramDetailPage.tsx` — add Course schema
- **File:** `frontend/src/pages/website/FaqPage.tsx` — add FAQPage schema
- **Change:**
  ```tsx
  // HomePage.tsx — EducationalOrganization schema
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": siteName,
      "url": window.location.origin,
      "description": "Premium coding and STEM education platform for children in Kenya",
      "address": { "@type": "PostalAddress", "addressCountry": "KE" },
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer service" }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [siteName]);
  ```
- **Test:** Run Google Rich Results Test — should detect EducationalOrganization schema.
- **Priority:** P1

---

## TASK-104: Add WhatsApp Contact Button

- **File:** `frontend/src/components/website/Footer.tsx` — add WhatsApp link
- **File:** `frontend/src/pages/website/ContactPage.tsx` — add WhatsApp button
- **Change:**
  ```tsx
  // Add WhatsApp button (replace phone link or add alongside)
  <a
    href="https://wa.me/254XXXXXXXXX?text=Hi%20Coder's%20Hero%2C%20I'm%20interested%20in%20your%20programs"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
  >
    <MessageCircle className="h-4 w-4" />
    Chat on WhatsApp
  </a>
  ```
- **Test:** Click WhatsApp button → opens WhatsApp with pre-filled message.
- **Priority:** P1

---

## TASK-105: Make About Page CMS-Driven

- **File:** `frontend/src/pages/website/AboutPage.tsx:12-40`
- **Current:** `values` and `stats` arrays are hardcoded
- **Change:** Fetch from API and render dynamically
  ```tsx
  // Replace hardcoded arrays with API data
  const { data: siteData } = useQuery({
    queryKey: ['site'],
    queryFn: () => websiteApi.site.get(),
  });

  const values = siteData?.sections?.find(s => s.key === 'about_values')?.items ?? [];
  const stats = siteData?.sections?.find(s => s.key === 'about_stats')?.items ?? [];
  ```
- **Test:** Update content via admin CMS → About page reflects changes.
- **Priority:** P1

---

## TASK-106: Add Meta Descriptions to All Pages

- **Files:** All pages in `frontend/src/pages/website/`
- **Current:** Only HomePage and BlogDetailPage set meta descriptions
- **Change:** Add `usePageMeta` with description to each page
  ```tsx
  import { usePageMeta } from '@/hooks/usePageMeta';
  import { useSiteBranding } from '@/hooks/usePublicSiteSettings';

  const { siteName } = useSiteBranding();
  usePageMeta({
    title: `Programs | ${siteName}`,
    description: 'Explore our coding, robotics, and STEM programs designed for children aged 5-18.',
    ogImage: '/og-programs.jpg',
  });
  ```
- **Test:** View page source for each page — should have meta description tag.
- **Priority:** P1

---

## TASK-107: Enhance Registration Form

- **File:** `frontend/src/pages/website/RegistrationPage.tsx`
- **Current:** No Zod validation, no program selection, uses raw HTML validation
- **Change:**
  ```tsx
  // Add Zod schema
  const schema = z.object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    grade: z.string().min(1, 'Grade is required'),
    program_id: z.string().min(1, 'Please select a program'), // NEW
    parent_name: z.string().min(2, 'Parent name is required'),
    parent_phone: z.string().min(10, 'Valid phone required'),
    parent_email: z.string().email('Invalid email'),
    address: z.string().optional(),
    notes: z.string().optional(),
  });

  // Add program selector field
  // Fetch programs from API and render as select dropdown
  ```
- **Test:** Submit empty form → validation errors shown. Submit valid form → success.
- **Priority:** P1

---

## TASK-108: Add Events RSVP & Calendar Download

- **File:** `frontend/src/pages/website/EventsPage.tsx`
- **Current:** Events are not clickable, no RSVP, no calendar download
- **Change:**
  - Make event cards clickable (link to detail or expand inline)
  - Add "Add to Calendar" button generating .ics file
  - Add RSVP button (records interest via API)
  ```tsx
  // Add to Calendar function
  const addToCalendar = (event: Event) => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:${new Date(event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${new Date(event.end_date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title}`, `DESCRIPTION:${event.description}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${event.title}.ics`; a.click();
  };
  ```
- **Test:** Click "Add to Calendar" → .ics file downloads. Click RSVP → record saved.
- **Priority:** P1

---

## TASK-109: Add CTA Sections to Pages Missing Them

- **Files:**
  - `frontend/src/pages/website/TestimonialsPage.tsx` — add CTA at bottom
  - `frontend/src/pages/website/BlogPage.tsx` — add CTA at bottom
  - `frontend/src/pages/website/GalleryPage.tsx` — add CTA at bottom
  - `frontend/src/pages/website/EventsPage.tsx` — add CTA at bottom
- **Change:** Add consistent CTA section to each page
  ```tsx
  {/* CTA Section */}
  <section className="bg-brand-600 py-16">
    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-white">Ready to Start Learning?</h2>
      <p className="mt-3 text-brand-100">Join hundreds of students mastering coding and robotics.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/free-trial" className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
          Book a Free Trial
        </Link>
        <Link to="/contact" className="inline-flex h-12 items-center rounded-xl border-2 border-white px-8 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  </section>
  ```
- **Test:** Visit Testimonials, Blog, Gallery, Events pages — each should have a CTA section at bottom.
- **Priority:** P1

---

## TASK-110: Add Partner Logos Section to Homepage

- **File:** `frontend/src/pages/website/HomePage.tsx` — add after social proof counters
- **Change:**
  ```tsx
  {/* Partner Logos */}
  <section className="py-12 bg-slate-50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-center text-sm font-medium text-slate-500 mb-8">In Partnership With</p>
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
        {/* Fetch partner logos from CMS or use static images */}
        {partnerLogos.map((logo) => (
          <img key={logo.id} src={logo.src} alt={logo.alt} className="h-12 w-auto" loading="lazy" />
        ))}
      </div>
    </div>
  </section>
  ```
- **Test:** Homepage shows partner logos section below social proof.
- **Priority:** P1

---

## PHASE 1 ACCEPTANCE CRITERIA

- [ ] Free trial booking page exists and submits correctly
- [ ] Homepage has social proof counters
- [ ] JSON-LD structured data passes Google Rich Results Test
- [ ] WhatsApp button on contact page and footer
- [ ] About page content is CMS-driven
- [ ] All public pages have meta descriptions
- [ ] Registration form has Zod validation and program selection
- [ ] Events page has RSVP and calendar download
- [ ] Testimonials, Blog, Gallery, Events pages have CTAs
- [ ] Homepage shows partner logos

---

# PHASE 2 — AUTH & ONBOARDING

**Priority:** P1
**Duration:** 3 weeks
**Dependencies:** Phase 0

---

## TASK-201: Add Password Strength Indicator

- **File:** `frontend/src/components/features/auth/RegisterForm.tsx`
- **Change:** Add real-time strength bar below password field
  ```tsx
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  // Render below password input:
  {watchedPassword && (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full', i <= strength ? strengthColors[strength - 1] : 'bg-slate-200')} />
        ))}
      </div>
      <p className="text-xs text-slate-500">{strengthLabels[strength - 1] || 'Too short'}</p>
    </div>
  )}
  ```
- **Test:** Type weak password → red bar. Type strong password → green bar.
- **Priority:** P1

---

## TASK-202: Add Terms of Service Checkbox

- **File:** `frontend/src/components/features/auth/RegisterForm.tsx`
- **Change:**
  ```tsx
  // Add to Zod schema:
  agree_to_terms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
  }),

  // Add before submit button:
  <label className="flex items-start gap-2">
    <input
      type="checkbox"
      {...register('agree_to_terms')}
      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
    />
    <span className="text-sm text-slate-600">
      I agree to the{' '}
      <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
      {' '}and{' '}
      <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
    </span>
  </label>
  {errors.agree_to_terms && (
    <p className="text-sm text-red-600">{errors.agree_to_terms.message}</p>
  )}
  ```
- **Test:** Try to submit without checking → validation error. Check and submit → success.
- **Priority:** P1

---

## TASK-203: Add Auto-Submit to 2FA Code Entry

- **File:** `frontend/src/components/features/auth/TwoFactorChallengeForm.tsx`
- **Change:** Auto-submit when 6 digits entered
  ```tsx
  const [code, setCode] = useState('');

  const handleChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
    if (cleaned.length === 6) {
      // Auto-submit
      handleSubmit(cleaned);
    }
  };

  // Update input:
  <input
    type="text"
    inputMode="numeric"
    maxLength={6}
    autoComplete="one-time-code"
    value={code}
    onChange={(e) => handleChange(e.target.value)}
    className="..."
  />
  ```
- **Test:** Enter 6 digits → form auto-submits without clicking button.
- **Priority:** P1

---

## TASK-204: Add "Signed Out" Banner

- **File:** `frontend/src/pages/LoginPage.tsx` or `LoginForm.tsx`
- **Change:** Check navigation state for session expiry message
  ```tsx
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;
  const signedOut = location.state?.signedOut;

  // Render banner above form:
  {sessionExpired && (
    <Alert variant="warning" title="Session Expired">
      Your session has expired. Please sign in again.
    </Alert>
  )}
  {signedOut && (
    <Alert variant="info" title="Signed Out">
      You have been signed out successfully.
    </Alert>
  )}
  ```
- **Test:** Trigger session expiry → login page shows warning banner.
- **Priority:** P1

---

## TASK-205: Unify Auth Page Layouts

- **Files:** All auth pages (Login, Register, ForgotPassword, ResetPassword, VerifyEmail, 2FA)
- **Current:** Login/Register use split-panel; others use centered card
- **Change:** Choose one layout and apply consistently. Recommended: keep split-panel for Login/Register, centered card for others (this is acceptable as long as the brand gradient is consistent).
- **Verify:** All auth pages share the same gradient background, logo placement, and typography.
- **Test:** Navigate through all auth pages — visual consistency confirmed.
- **Priority:** P1

---

## TASK-206: Add First-Login Onboarding

- **New File:** `frontend/src/pages/OnboardingPage.tsx`
- **New File:** `frontend/src/router/routes.ts` — add route
- **Backend:** Add `onboarding_completed` column to users table
- **Change:**
  - After login, check `user.onboarding_completed === false`
  - Redirect to `/onboarding` if not completed
  - Show 3-step wizard: Welcome → Profile Photo → Preferences
  - Mark as completed via API call
- **Test:** First login → onboarding wizard appears. Complete → redirected to dashboard. Subsequent logins → skip onboarding.
- **Priority:** P1

---

## PHASE 2 ACCEPTANCE CRITERIA

- [ ] Password strength indicator shows real-time feedback
- [ ] Registration has Terms of Service checkbox
- [ ] 2FA auto-submits on 6-digit entry
- [ ] Session expiry shows warning banner on login
- [ ] All auth pages have consistent visual design
- [ ] First login shows onboarding wizard

---

# PHASE 3 — COURSE CATALOG & ENROLLMENT

**Priority:** P1
**Duration:** 5 weeks
**Dependencies:** Phase 0, Phase 1

---

## TASK-301: Add Sorting & Filters to Course Listing

- **File:** `frontend/src/pages/website/PublicCoursesPage.tsx`
- **Change:** Add sort dropdown and level/age filters
  ```tsx
  const [sort, setSort] = useState('newest');
  const [level, setLevel] = useState('');
  const [ageGroup, setAgeGroup] = useState('');

  // Add filter bar above course grid
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <Select value={sort} onValueChange={setSort}>
      <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="rating">Highest Rated</SelectItem>
        <SelectItem value="price_low">Price: Low to High</SelectItem>
        <SelectItem value="price_high">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
    {/* Level filter, Age group filter */}
  </div>
  ```
- **Test:** Change sort order → courses reorder. Filter by level → only matching courses shown.
- **Priority:** P1

---

## TASK-302: Enhance Course Detail Page

- **File:** `frontend/src/pages/website/ProgramDetailPage.tsx`
- **Change:** Add sections inspired by SmartBrains pattern:
  - "What You'll Learn" bullet list
  - Instructor info card with photo and bio
  - Rating display (average stars)
  - "Try a Free Class" CTA button
  - Related programs section
- **Test:** Course detail page shows all new sections with data from API.
- **Priority:** P1

---

## TASK-303: Build Enrollment Wizard

- **New File:** `frontend/src/pages/enrollment/EnrollmentWizardPage.tsx`
- **New File:** `backend/app/Http/Controllers/Api/EnrollmentWizardController.php`
- **Change:** Multi-step enrollment flow:
  1. Select learner (for parents) or self (for students)
  2. Choose course/program
  3. Review pricing
  4. Payment (M-Pesa STK push)
  5. Confirmation + auto-enrollment
- **Test:** Complete enrollment flow end-to-end with M-Pesa sandbox.
- **Priority:** P1

---

## TASK-304: Add Instructor Profile Pages

- **New File:** `frontend/src/pages/website/InstructorPage.tsx`
- **New File:** `backend/app/Http/Controllers/Api/InstructorController.php`
- **Change:** Instructor profile with bio, qualifications, courses taught, ratings
- **Test:** Visit `/instructors/:id` → shows instructor profile with courses.
- **Priority:** P1

---

## TASK-305: Add Course Video Preview

- **File:** `frontend/src/pages/website/ProgramDetailPage.tsx`
- **Change:** Add video trailer section using HTML5 `<video>` or embed
  ```tsx
  {program.trailer_url && (
    <div className="aspect-video rounded-2xl overflow-hidden">
      <video controls poster={program.image} className="w-full h-full object-cover">
        <source src={program.trailer_url} type="video/mp4" />
      </video>
    </div>
  )}
  ```
- **Test:** Program with trailer URL shows video player on detail page.
- **Priority:** P1

---

## PHASE 3 ACCEPTANCE CRITERIA

- [ ] Course listing has sorting and filters
- [ ] Course detail has "What You'll Learn", instructor, rating, CTA
- [ ] Enrollment wizard works end-to-end
- [ ] Instructor profiles exist and display correctly
- [ ] Course video preview plays

---

# PHASE 4 — STUDENT EXPERIENCE

**Priority:** P1
**Duration:** 6 weeks
**Dependencies:** Phase 0, Phase 2

---

## TASK-401: Add Video Player to Course Player

- **File:** `frontend/src/pages/lms/LmsCoursePlayerPage.tsx:119-161`
- **Current:** Video lessons render as text — no actual video playback
- **Change:**
  ```tsx
  // Install: npm install react-player
  import ReactPlayer from 'react-player';

  // Replace the content rendering section:
  {selectedLesson.type === 'video' && selectedLesson.video_url ? (
    <div className="aspect-video rounded-xl overflow-hidden mb-4">
      <ReactPlayer
        url={selectedLesson.video_url}
        width="100%"
        height="100%"
        controls
        onProgress={({ playedSeconds }) => {
          // Update video progress via API
          updateVideoProgress.mutate({
            lessonId: selectedLesson.lesson_id,
            position: Math.floor(playedSeconds),
          });
        }}
      />
    </div>
  ) : null}

  // Keep the markdown content rendering for text lessons
  ```
- **Test:** Open video lesson → video player appears and plays. Progress tracked.
- **Priority:** P1

---

## TASK-402: Fix Markdown Parser in Course Player

- **File:** `frontend/src/pages/lms/LmsCoursePlayerPage.tsx:128-134`
- **Current:** Custom parser drops code blocks (`return null` on line 130)
- **Change:** Install and use `react-markdown`
  ```tsx
  // Install: npm install react-markdown
  import ReactMarkdown from 'react-markdown';

  // Replace custom parser:
  {selectedLesson.content ? (
    <div className="prose prose-sm max-w-none text-slate-700">
      <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-slate-500 italic">No content available for this lesson.</p>
  )}
  ```
- **Test:** Lesson with code blocks → code renders with syntax highlighting. Headers, bold, lists all render correctly.
- **Priority:** P1

---

## TASK-403: Add Lesson Navigation

- **File:** `frontend/src/pages/lms/LmsCoursePlayerPage.tsx`
- **Change:** Add Previous/Next buttons below lesson content
  ```tsx
  // After the "Mark as Complete" button section:
  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
    {prevLesson ? (
      <Button variant="outline" onClick={() => setSelectedLesson(prevLesson)}>
        <ArrowLeft className="mr-2 h-4 w-4" />Previous
      </Button>
    ) : <div />}
    {nextLesson ? (
      <Button onClick={() => setSelectedLesson(nextLesson)}>
        Next<ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    ) : <div />}
  </div>
  ```
- **Test:** Navigate through lessons using Previous/Next buttons.
- **Priority:** P1

---

## TASK-404: Create Quiz Results Page

- **New File:** `frontend/src/pages/lms/QuizResultsPage.tsx`
- **File:** `frontend/src/pages/QuizTakerPage.tsx:22-29` — redirect here instead of /quizzes
- **Change:**
  ```tsx
  // QuizTakerPage.tsx — change redirect
  const handleSubmit = async (answers: QuizSubmission[]) => {
    const result = await quizzesApi.submitQuiz(quiz.id, answers);
    navigate(`/quizzes/${quiz.id}/results`, { state: { result, answers } });
  };

  // QuizResultsPage.tsx — show score breakdown
  // - Overall score with pass/fail indicator
  // - Per-question breakdown (correct/incorrect)
  // - Time taken
  // - Retake button
  ```
- **Test:** Complete quiz → see results page with score and question breakdown.
- **Priority:** P1

---

## TASK-405: Fix Quiz Single-Quiz Fetch

- **File:** `frontend/src/pages/QuizTakerPage.tsx:13-16`
- **Current:** Fetches ALL quizzes then finds one by ID
  ```tsx
  queryFn: () => quizzesApi.getQuizzes({}).then((res) => res.results.find((q) => q.id === parseInt(id || '0'))),
  ```
- **Change:** Add single quiz endpoint
  ```tsx
  // Backend: Add GET /api/quizzes/:id endpoint
  // Frontend:
  queryFn: () => quizzesApi.getQuiz(parseInt(id || '0')),
  ```
- **Test:** Open quiz → loads directly without fetching all quizzes first.
- **Priority:** P1

---

## TASK-406: Add "Continue Learning" to Student Dashboard

- **File:** `frontend/src/pages/DashboardPage.tsx` — add student-specific section
- **Change:**
  ```tsx
  {/* For students: Continue Learning */}
  {role === 'student' && currentEnrollment && (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Continue Learning</p>
            <h3 className="text-lg font-bold text-slate-900">{currentEnrollment.course_title}</h3>
            <p className="text-sm text-slate-600">Last lesson: {currentEnrollment.last_lesson}</p>
          </div>
          <Button asChild>
            <Link to={`/lms/courses/${currentEnrollment.course_id}/player`}>
              Resume<ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Progress value={currentEnrollment.progress} className="mt-3" />
      </CardContent>
    </Card>
  )}
  ```
- **Test:** Student dashboard shows "Continue Learning" card with current course and progress.
- **Priority:** P1

---

## PHASE 4 ACCEPTANCE CRIDERIA

- [ ] Video lessons play in embedded player
- [ ] Markdown renders correctly with code blocks
- [ ] Lesson navigation (Previous/Next) works
- [ ] Quiz results page shows score breakdown
- [ ] Quiz loads by ID directly
- [ ] Student dashboard shows "Continue Learning"

---

# PHASE 5 — PARENT EXPERIENCE

**Priority:** P1
**Duration:** 4 weeks
**Dependencies:** Phase 0, Phase 2

---

## TASK-501: Add Attendance Summary to Parent Dashboard

- **File:** `frontend/src/pages/parent/ParentDashboardPage.tsx`
- **Change:** Add today's attendance status per child
  ```tsx
  {/* Per child attendance */}
  {students.map((child) => (
    <div key={child.id} className="flex items-center gap-3">
      <PortalAttendanceStatusBadge status={child.today_attendance ?? 'unknown'} />
      <span className="text-sm text-slate-600">{child.full_name} — {child.today_attendance ?? 'No data'}</span>
    </div>
  ))}
  ```
- **Test:** Parent dashboard shows today's attendance for each child.
- **Priority:** P1

---

## TASK-502: Add Activity Feed to Parent Dashboard

- **File:** `frontend/src/pages/parent/ParentDashboardPage.tsx`
- **Change:** Add recent learning activities section
  ```tsx
  {/* Recent Activity */}
  <Card>
    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
    <CardContent>
      {recentActivity.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 py-2 border-b last:border-0">
          <div className={cn('h-2 w-2 rounded-full', activityColor[activity.type])} />
          <div>
            <p className="text-sm text-slate-900">{activity.description}</p>
            <p className="text-xs text-slate-500">{formatRelativeDate(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
  ```
- **Test:** Parent dashboard shows recent activities (lessons completed, quizzes taken, etc.).
- **Priority:** P1

---

## TASK-503: Add Multi-Child Switcher

- **File:** `frontend/src/components/layout/Header.tsx`
- **Change:** Add child selector dropdown for parent role
  ```tsx
  {user?.role === 'parent' && (
    <Select value={selectedChildId} onValueChange={setSelectedChildId}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select child" />
      </SelectTrigger>
      <SelectContent>
        {children.map((child) => (
          <SelectItem key={child.id} value={child.id}>{child.full_name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
  ```
- **Test:** Parent can switch between children from header dropdown.
- **Priority:** P1

---

## TASK-504: Add Online Payment for Parents

- **File:** `frontend/src/pages/parent/ParentFeesPage.tsx`
- **Change:** Add "Pay Now" button that triggers M-Pesa STK push
  ```tsx
  <Button onClick={() => initiatePayment(fee.id)} loading={isPaying}>
    <CreditCard className="mr-2 h-4 w-4" />Pay with M-Pesa
  </Button>
  ```
- **Test:** Parent clicks "Pay Now" → M-Pesa STK push sent → payment confirmed → receipt generated.
- **Priority:** P1

---

## TASK-505: Add "Last Login" Indicator

- **File:** `frontend/src/pages/parent/ParentDashboardPage.tsx`
- **Change:** Show when each child last logged in
  ```tsx
  <p className="text-xs text-slate-400">
    Last active: {child.last_login_at ? formatRelativeDate(child.last_login_at) : 'Never'}
  </p>
  ```
- **Test:** Parent dashboard shows last login time for each child.
- **Priority:** P1

---

## PHASE 5 ACCEPTANCE CRITERIA

- [ ] Parent dashboard shows today's attendance per child
- [ ] Activity feed shows recent learning activities
- [ ] Multi-child switcher works in header
- [ ] Parent can pay fees via M-Pesa
- [ ] Last login indicator visible per child

---

# PHASE 6 — TEACHER EXPERIENCE

**Priority:** P1
**Duration:** 4 weeks
**Dependencies:** Phase 0, Phase 2

---

## TASK-601: Add "Mark Attendance" Quick Action

- **File:** `frontend/src/pages/teacher/TeacherDashboardPage.tsx`
- **Change:** Add prominent attendance button
  ```tsx
  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
    <Link to={`/teacher/classes/${todayClass?.id}/attendance`}>
      <UserCheck className="mr-2 h-4 w-4" />Mark Today's Attendance
    </Link>
  </Button>
  ```
- **Test:** Teacher dashboard shows "Mark Today's Attendance" button linking to attendance page.
- **Priority:** P1

---

## TASK-602: Add Ungraded Submissions Alert

- **File:** `frontend/src/pages/teacher/TeacherDashboardPage.tsx`
- **Change:** Show count of ungraded submissions with link
  ```tsx
  {ungradedCount > 0 && (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <div>
        <span className="font-medium">{ungradedCount} submissions</span> need grading
        <Link to="/teacher/assignments" className="ml-2 text-brand-600 underline">View All</Link>
      </div>
    </Alert>
  )}
  ```
- **Test:** Teacher dashboard shows warning when submissions are ungraded.
- **Priority:** P1

---

## TASK-603: Add Bulk Attendance Marking

- **File:** `frontend/src/pages/teacher/TeacherClassDetailPage.tsx`
- **Change:** Add "Mark All Present" button and individual toggles
  ```tsx
  <Button variant="outline" onClick={markAllPresent}>Mark All Present</Button>
  {roster.map((student) => (
    <div key={student.id} className="flex items-center justify-between py-2">
      <span>{student.full_name}</span>
      <Select value={attendance[student.id]} onValueChange={(v) => setAttendance(prev => ({ ...prev, [student.id]: v }))}>
        <SelectItem value="present">Present</SelectItem>
        <SelectItem value="absent">Absent</SelectItem>
        <SelectItem value="late">Late</SelectItem>
      </Select>
    </div>
  ))}
  ```
- **Test:** Teacher can mark all students present with one click, then adjust individual entries.
- **Priority:** P1

---

## TASK-604: Add View All Links to Truncated Lists

- **File:** `frontend/src/pages/teacher/TeacherDashboardPage.tsx`
- **Current:** Lists truncated to 5 items with no "View all"
- **Change:** Add "View All" link to each section header
  ```tsx
  <div className="flex items-center justify-between">
    <h3 className="font-semibold text-slate-900">Upcoming Assignments</h3>
    <Link to="/teacher/assignments" className="text-sm text-brand-600 hover:underline">View All</Link>
  </div>
  ```
- **Test:** All truncated lists on teacher dashboard have "View All" links.
- **Priority:** P1

---

## TASK-605: Add Personalized Greeting

- **File:** `frontend/src/pages/teacher/TeacherDashboardPage.tsx`
- **Change:**
  ```tsx
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // In page header:
  <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {user?.first_name}</h1>
  ```
- **Test:** Teacher dashboard shows time-based greeting with first name.
- **Priority:** P1

---

## PHASE 6 ACCEPTANCE CRITERIA

- [ ] "Mark Attendance" button on teacher dashboard
- [ ] Ungraded submissions warning displayed
- [ ] Bulk attendance marking works
- [ ] All truncated lists have "View All" links
- [ ] Personalized greeting shows on dashboard

---

# PHASE 7 — SCHOOL EXPERIENCE

**Priority:** P2
**Duration:** 4 weeks
**Dependencies:** Phase 0, Phase 2

---

## TASK-701: Create School Dashboard

- **New File:** `frontend/src/pages/school/SchoolDashboardPage.tsx`
- **New File:** `backend/app/Http/Controllers/Api/School/SchoolDashboardController.php`
- **Change:** School-scoped dashboard with:
  - Total students, teachers, active courses
  - Attendance rate chart
  - Enrollment trends
  - Recent activity
- **Test:** School admin logs in → sees school-specific dashboard.
- **Priority:** P2

---

## TASK-702: Add School-Scoped Student Listing

- **File:** `frontend/src/pages/school/SchoolStudentsPage.tsx` — NEW
- **Change:** Student listing filtered by school_id
- **Test:** School admin sees only their school's students.
- **Priority:** P2

---

## TASK-703: Add School Reports

- **New File:** `frontend/src/pages/school/SchoolReportsPage.tsx`
- **Change:** School-specific reports:
  - Student performance report
  - Attendance report
  - Fee collection report
  - Export to PDF/CSV
- **Test:** Generate and download school-specific reports.
- **Priority:** P2

---

## TASK-704: Add School Branding

- **File:** `frontend/src/components/layout/Sidebar.tsx`
- **Change:** Apply school logo and colors from settings
  ```tsx
  const { schoolBranding } = useSchoolBranding();
  // Apply to sidebar header:
  <img src={schoolBranding?.logo} alt="School Logo" className="h-8" />
  ```
- **Test:** School admin sees their school's logo in sidebar.
- **Priority:** P2

---

## TASK-705: Add Bulk Student Import

- **File:** `frontend/src/pages/school/SchoolStudentsPage.tsx`
- **New File:** `backend/app/Http/Controllers/Api/School/StudentImportController.php`
- **Change:** CSV upload for bulk student creation
- **Test:** Upload CSV → students created → count shown.
- **Priority:** P2

---

## PHASE 7 ACCEPTANCE CRITERIA

- [ ] School dashboard shows school-scoped metrics
- [ ] Student listing is filtered by school
- [ ] School reports generate correctly
- [ ] School branding applies to sidebar
- [ ] Bulk student import works

---

# PHASE 8 — ADMIN/SUPERADMIN EXPERIENCE

**Priority:** P2
**Duration:** 3 weeks
**Dependencies:** Phase 0, Phase 2

---

## TASK-801: Create Global Search (Command Palette)

- **New File:** `frontend/src/components/ui/CommandPalette.tsx`
- **File:** `frontend/src/components/layout/Header.tsx` — add Cmd+K trigger
- **Change:**
  ```tsx
  // Install: npm install cmdk
  import { Command } from 'cmdk';

  // Command palette with search across users, courses, schools
  // Triggered by Cmd+K or clicking search
  ```
- **Test:** Press Cmd+K → command palette opens → search returns results across entities.
- **Priority:** P2

---

## TASK-802: Enhance Admin Dashboard

- **File:** `frontend/src/pages/admin/AdminOverviewPage.tsx`
- **Change:** Add system health widget, revenue chart, user growth chart
- **Test:** Admin dashboard shows comprehensive system overview.
- **Priority:** P2

---

## TASK-803: Add Bulk User Operations

- **File:** `frontend/src/pages/users/UsersPage.tsx`
- **Change:** Add bulk activate/deactivate/delete with checkbox selection
- **Test:** Select multiple users → bulk action → all affected.
- **Priority:** P2

---

## TASK-804: Add CMS Live Preview

- **File:** `frontend/src/pages/admin/cms/SiteContentPage.tsx`
- **Change:** Show preview panel alongside editor
- **Test:** Edit content → preview updates in real-time.
- **Priority:** P2

---

## TASK-805: Add Export Functionality

- **Files:** All admin list pages (users, students, courses, etc.)
- **Change:** Add "Export CSV" button to each DataTable
- **Test:** Click export → CSV downloads with correct data.
- **Priority:** P2

---

## PHASE 8 ACCEPTANCE CRITERIA

- [ ] Command palette opens with Cmd+K
- [ ] Admin dashboard shows system health and analytics
- [ ] Bulk user operations work
- [ ] CMS live preview functions
- [ ] Export to CSV works on all list pages

---

# PHASE 9 — LMS ADVANCED FEATURES

**Priority:** P2
**Duration:** 6 weeks
**Dependencies:** Phase 4

---

## TASK-901: Fix Forum Nested Replies

- **File:** `frontend/src/pages/lms/LmsForumThreadPage.tsx:24-25`
- **Current:** `topLevel` filter hides child replies
- **Change:** Implement recursive rendering
  ```tsx
  const renderReply = (post: ForumPost, depth = 0) => (
    <div key={post.id} style={{ marginLeft: depth * 24 }}>
      <PostCard post={post} />
      {post.replies?.map((reply) => renderReply(reply, depth + 1))}
    </div>
  );

  // Render top-level posts with nested replies
  {topLevelPosts.map((post) => renderReply(post))}
  ```
- **Test:** Forum thread shows nested replies with indentation.
- **Priority:** P2

---

## TASK-902: Add AI Markdown Rendering

- **File:** `frontend/src/pages/lms/LmsAiTutorPage.tsx:187`
- **Current:** `whitespace-pre-wrap` plain text
- **Change:**
  ```tsx
  import ReactMarkdown from 'react-markdown';
  import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

  <ReactMarkdown
    components={{
      code({ node, inline, className, children, ...props }) {
        return !inline ? (
          <SyntaxHighlighter language="javascript" style={oneDark}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className="bg-slate-100 px-1 py-0.5 rounded text-sm" {...props}>{children}</code>
        );
      }
    }}
  >
    {message.content}
  </ReactMarkdown>
  ```
- **Test:** AI tutor response with code → syntax highlighted code block rendered.
- **Priority:** P2

---

## TASK-903: Add Gamification System

- **New Files:** Points, badges, streaks tables and services
- **Change:** Award points for: lesson completion (+10), quiz pass (+20), exercise solve (+15), daily login (+5)
- **New Badges:** "First Lesson", "Quiz Master", "7-Day Streak", "100 Exercises"
- **Test:** Complete lesson → points awarded → badge unlocked notification.
- **Priority:** P2

---

## TASK-904: Add Learning Paths

- **New Files:** Learning path models, controllers, pages
- **Change:** Chain courses into sequences with progress tracking across path
- **Test:** Enroll in learning path → progress tracked across all courses in path.
- **Priority:** P2

---

## TASK-905: Add Student Analytics Dashboard

- **New File:** `frontend/src/pages/lms/StudentAnalyticsPage.tsx`
- **Change:**
  - Learning time per day/week
  - Skills progress radar chart
  - Strengths/weaknesses analysis
  - Comparison with class average
- **Test:** Student analytics page shows learning patterns and recommendations.
- **Priority:** P2

---

## TASK-906: Add Lesson Notes

- **New Files:** Lesson notes model, API, UI
- **Change:** Students can add private notes per lesson
- **Test:** Add note to lesson → note saved → visible on next visit.
- **Priority:** P2

---

## PHASE 9 ACCEPTANCE CRITERIA

- [ ] Forum shows nested replies with indentation
- [ ] AI tutor responses render with markdown and code highlighting
- [ ] Gamification points awarded for meaningful actions
- [ ] Badges unlock with notifications
- [ ] Learning paths track cross-course progress
- [ ] Student analytics dashboard shows learning patterns

---

# PHASE 10 — PAYMENTS & COMMERCIAL

**Priority:** P2
**Duration:** 4 weeks
**Dependencies:** Phase 3, Phase 4

---

## TASK-1001: Build Online Enrollment Payment Flow

- **Files:** Enrollment wizard + M-Pesa integration
- **Change:** Connect enrollment to M-Pesa STK push → auto-activate on payment
- **Test:** Enroll → pay → enrollment activated → course accessible.
- **Priority:** P2

---

## TASK-1002: Add Subscription System

- **New Files:** Subscription model, controller, migration
- **Change:** Monthly/termly/annual plans with recurring billing
- **Test:** Create subscription → recurring charge → subscription active.
- **Priority:** P2

---

## TASK-1003: Add Failed Payment Retry

- **File:** `frontend/src/pages/parent/ParentFeesPage.tsx`
- **Change:** "Retry Payment" button for failed transactions
- **Test:** Failed payment → retry button → re-initiate M-Pesa.
- **Priority:** P2

---

## TASK-1004: Add Payment Notifications

- **File:** Notification system
- **Change:** Send SMS/WhatsApp on payment confirmation, reminder before due date, overdue alert
- **Test:** Payment made → confirmation SMS received.
- **Priority:** P2

---

## TASK-1005: Add Refund Handling

- **New Files:** Refund model, controller, migration
- **Change:** Refund request → approval workflow → processing → confirmation
- **Test:** Request refund → admin approves → refund processed → notification sent.
- **Priority:** P2

---

## PHASE 10 ACCEPTANCE CRITERIA

- [ ] Enrollment payment via M-Pesa works end-to-end
- [ ] Subscriptions can be created and managed
- [ ] Failed payments can be retried
- [ ] Payment notifications send correctly
- [ ] Refund workflow functions

---

# PHASE 11 — COMMUNICATION & NOTIFICATIONS

**Priority:** P2
**Duration:** 3 weeks
**Dependencies:** Phase 4, Phase 5, Phase 6

---

## TASK-1101: Add WhatsApp Integration

- **New File:** `backend/app/Services/WhatsAppGateway.php`
- **Change:** WhatsApp Business API for notifications
- **Test:** Trigger notification → WhatsApp message delivered.
- **Priority:** P2

---

## TASK-1102: Enhance Notification Preferences

- **File:** `frontend/src/pages/notifications/NotificationPreferencesPage.tsx`
- **Change:** Per-category, per-channel preferences
- **Test:** Toggle email off for attendance → no attendance emails.
- **Priority:** P2

---

## TASK-1103: Add Parent-Teacher Messaging

- **File:** Existing chat system
- **Change:** Direct messaging between parent and specific teacher
- **Test:** Parent messages teacher → teacher receives notification → reply works.
- **Priority:** P2

---

## TASK-1104: Add Rich Email Templates

- **File:** `backend/resources/views/emails/notification.blade.php`
- **Change:** Branded HTML email templates with logo, colors, responsive design
- **Test:** Receive email → branded, responsive, professional.
- **Priority:** P2

---

## TASK-1105: Add Push Notification Campaigns

- **File:** Admin notification management
- **Change:** Send push notifications to all users or specific roles
- **Test:** Admin sends campaign → targeted users receive push notification.
- **Priority:** P2

---

## PHASE 11 ACCEPTANCE CRITERIA

- [ ] WhatsApp notifications deliver
- [ ] Notification preferences are respected
- [ ] Parent-teacher messaging works
- [ ] Email templates are branded and responsive
- [ ] Push notification campaigns send

---

# PHASE 12 — ANALYTICS & REPORTING

**Priority:** P2
**Duration:** 4 weeks
**Dependencies:** Phase 4-8

---

## TASK-1201: Student Analytics

- **New Files:** Learning time, skills progress, strengths/weaknesses
- **Test:** Student sees learning patterns and recommendations.
- **Priority:** P2

---

## TASK-1202: School Analytics

- **New Files:** Enrollment trends, attendance rates, performance averages
- **Test:** School admin sees institutional metrics.
- **Priority:** P2

---

## TASK-1203: Course Analytics

- **New Files:** Enrollment numbers, completion rates, drop-off points
- **Test:** Course creator sees engagement data.
- **Priority:** P2

---

## TASK-1204: Business Analytics

- **New Files:** Revenue, conversion rates, churn analysis
- **Test:** Admin sees revenue and business metrics.
- **Priority:** P2

---

## PHASE 12 ACCEPTANCE CRITERIA

- [ ] Student analytics show learning patterns
- [ ] School analytics show institutional metrics
- [ ] Course analytics show engagement data
- [ ] Business analytics show revenue trends

---

# PHASE 13 — MOBILE APPLICATION

**Priority:** P2
**Duration:** 6 weeks
**Dependencies:** Phase 4-6

---

## TASK-1301: Add LMS Course Player to Flutter

- **New Files:** Flutter course player screen with video
- **Test:** Student can take courses on mobile.
- **Priority:** P2

---

## TASK-1302: Add Quiz Taking to Flutter

- **New Files:** Flutter quiz screen
- **Test:** Student can take quizzes on mobile.
- **Priority:** P2

---

## TASK-1303: Add Offline Caching

- **Files:** Flutter with Hive
- **Change:** Cache course content for offline viewing
- **Test:** View course → go offline → content still accessible.
- **Priority:** P2

---

## TASK-1304: Add Push Notification Setup

- **Files:** Flutter FCM integration
- **Change:** Register for push on login
- **Test:** Login → push notifications received.
- **Priority:** P2

---

## TASK-1305: Add Deep Linking

- **Files:** GoRouter configuration
- **Change:** Handle universal links
- **Test:** Click link → opens app to correct content.
- **Priority:** P2

---

## PHASE 13 ACCEPTANCE CRITERIA

- [ ] LMS course player works on mobile
- [ ] Quiz taking works on mobile
- [ ] Offline content available for viewed lessons
- [ ] Push notifications work
- [ ] Deep links open correct content

---

# PHASE 14 — SECURITY & PERFORMANCE

**Priority:** P1
**Duration:** 3 weeks
**Dependencies:** All previous phases

---

## TASK-1401: Security Audit

- **Files:** All API endpoints
- **Change:**
  - Add rate limiting middleware to auth endpoints
  - Add security headers (CSP, HSTS, X-Frame-Options)
  - Review CORS configuration
  - Audit SQL injection vectors
  - Audit XSS vectors
- **Test:** Penetration testing passes. Security headers present.
- **Priority:** P1

---

## TASK-1402: Performance Optimization

- **Files:** All pages, API responses
- **Change:**
  - Add image optimization (WebP, srcset)
  - Add API response compression
  - Optimize database queries (N+1 detection)
  - Add Redis caching for public pages
- **Test:** Lighthouse performance score > 80. All pages load < 2s on 3G.
- **Priority:** P1

---

## TASK-1403: Accessibility Audit (WCAG 2.1 AA)

- **Files:** All components
- **Change:**
  - Add skip-to-content link
  - Ensure color contrast 4.5:1
  - Add aria-describedby to form errors
  - Ensure keyboard navigation
  - Test with screen reader
- **Test:** Lighthouse accessibility score > 90. Screen reader test passes.
- **Priority:** P1

---

## TASK-1404: Responsive Testing

- **Files:** All pages
- **Change:** Test and fix on: iPhone SE, iPhone 14, iPad, Android phones, 1920px desktop
- **Test:** All pages render correctly on all breakpoints. Touch targets ≥ 44x44px.
- **Priority:** P1

---

## TASK-1405: Add Rate Limiting

- **File:** `backend/routes/api.php` — add middleware
- **Change:**
  ```php
  Route::post('/login', [AuthController::class, 'login'])
      ->middleware('throttle:5,1'); // 5 attempts per minute
  ```
- **Test:** 6th login attempt within 1 minute → 429 Too Many Requests.
- **Priority:** P1

---

## PHASE 14 ACCEPTANCE CRITERIA

- [ ] Security headers present on all responses
- [ ] Rate limiting blocks brute force attempts
- [ ] Lighthouse performance > 80
- [ ] Lighthouse accessibility > 90
- [ ] All pages responsive on all breakpoints
- [ ] All touch targets ≥ 44x44px

---

# PHASE 15 — END-TO-END TESTING

**Priority:** P1
**Duration:** 3 weeks
**Dependencies:** Phase 14

---

## TASK-1501: Authentication Testing

- **Scope:** All auth flows for all 16 roles
- **Test cases:**
  - Login/logout for each role
  - Registration flow
  - Password reset flow
  - Email verification flow
  - 2FA enable/disable/challenge
  - Session timeout
  - Rate limiting
- **Priority:** P1

---

## TASK-1502: Role Permission Testing

- **Scope:** All 16 roles × 150+ permissions
- **Test cases:**
  - Each role sees correct sidebar
  - Each role can access allowed pages
  - Each role is blocked from unauthorized pages
  - CRUD operations per role
- **Priority:** P1

---

## TASK-1503: Payment Flow Testing

- **Scope:** M-Pesa integration
- **Test cases:**
  - STK push initiated
  - Callback received
  - Payment recorded
  - Invoice generated
  - Receipt generated
  - Failed payment handling
  - Refund flow
- **Priority:** P1

---

## TASK-1504: Cross-Platform Testing

- **Scope:** All major browsers and devices
- **Test cases:**
  - Chrome, Firefox, Safari, Edge
  - iOS Safari, Chrome for Android
  - Flutter Android, iOS, Web
  - Responsive breakpoints
- **Priority:** P1

---

## TASK-1505: Load Testing

- **Scope:** API endpoints
- **Test cases:**
  - 100 concurrent users
  - Response time < 500ms for all endpoints
  - No memory leaks
  - Queue processing under load
- **Priority:** P1

---

## PHASE 15 ACCEPTANCE CRITERIA

- [ ] All auth flows pass for all roles
- [ ] All permissions enforced correctly
- [ ] Payment flows work end-to-end
- [ ] All pages render on all browsers/devices
- [ ] Load test passes (100 concurrent users)
- [ ] Zero critical bugs
- [ ] Zero security vulnerabilities

---

# PHASE 16 — PRODUCTION LAUNCH

**Priority:** P1
**Duration:** 2 weeks
**Dependencies:** Phase 15

---

## TASK-1601: Production Configuration

- **Files:** `.env.production`, Docker configs
- **Change:**
  - Set all environment variables
  - Configure SSL certificates
  - Configure CDN (Cloudflare)
  - Configure database connections
  - Configure Redis
  - Configure mail/SMS services
  - Configure M-Pesa live credentials
- **Test:** All services running in production mode.
- **Priority:** P1

---

## TASK-1602: Monitoring Setup

- **New Files:** Sentry config, uptime monitoring
- **Change:**
  - Add Sentry for error tracking
  - Add uptime monitoring (e.g., UptimeRobot)
  - Configure alert notifications
- **Test:** Trigger error → Sentry captures it. Site down → alert received.
- **Priority:** P1

---

## TASK-1603: Backup Strategy

- **Files:** Backup scripts, cron jobs
- **Change:**
  - Daily database backups
  - Weekly file backups
  - Backup verification
  - Disaster recovery plan
- **Test:** Restore from backup → data intact.
- **Priority:** P1

---

## TASK-1604: SEO Launch

- **Files:** Sitemap, analytics
- **Change:**
  - Generate and submit sitemap.xml
  - Submit to Google Search Console
  - Submit to Bing Webmaster Tools
  - Set up Google Analytics
  - Verify all structured data
- **Test:** Sitemap accessible. Google indexes all pages.
- **Priority:** P1

---

## TASK-1605: Documentation

- **New Files:** User guides, API docs, deployment guide
- **Change:**
  - API documentation (Swagger/OpenAPI)
  - User guides per role
  - Admin guide
  - Deployment guide
  - Troubleshooting guide
- **Test:** New team member can deploy and use system following docs.
- **Priority:** P1

---

## PHASE 16 ACCEPTANCE CRITERIA

- [ ] All environment variables configured
- [ ] SSL certificate active
- [ ] Backups running daily
- [ ] Error tracking capturing issues
- [ ] Sitemap submitted to Google
- [ ] Analytics tracking all pages
- [ ] Documentation complete
- [ ] Stakeholder sign-off obtained

---

# APPENDIX A: QUICK WINS (Do These First — 75 Minutes Total)

| # | Fix | File | Line | Time |
|---|-----|------|------|------|
| 1 | Dashboard crash | DashboardPage.tsx | 97, 105 | 5 min |
| 2 | Remember me | LoginForm.tsx | 122-129 | 15 min |
| 3 | Gallery lightbox | GalleryPage.tsx | 154 | 5 min |
| 4 | QuickActions roles | QuickActions.tsx | 42-46 | 10 min |
| 5 | ProgramsPage link | ProgramsPage.tsx | 138 | 5 min |
| 6 | PartnerSchools link | PartnerSchoolsPage.tsx | 77 | 5 min |
| 7 | Header height | Header.tsx | 45 | 2 min |
| 8 | DataTable loading | DataTable.tsx | 131-136 | 10 min |
| 9 | FAQ aria-expanded | FaqAccordion.tsx | 21-33 | 8 min |
| 10 | Remove search bar | Header.tsx | 86-97 | 5 min |
| | **TOTAL** | | | **70 min** |

---

# APPENDIX B: FILE REFERENCE

## New Files to Create

| File | Phase | Purpose |
|------|-------|---------|
| `frontend/src/components/ui/Skeleton.tsx` | 0 | Loading skeletons |
| `frontend/src/components/ui/Alert.tsx` | 0 | Alert component |
| `frontend/src/components/ui/ConfirmationDialog.tsx` | 0 | Confirmation dialogs |
| `frontend/src/pages/website/FreeTrialPage.tsx` | 1 | Free class booking |
| `frontend/src/pages/lms/QuizResultsPage.tsx` | 4 | Quiz results |
| `frontend/src/pages/OnboardingPage.tsx` | 2 | First-login onboarding |
| `frontend/src/pages/enrollment/EnrollmentWizardPage.tsx` | 3 | Enrollment flow |
| `frontend/src/pages/website/InstructorPage.tsx` | 3 | Instructor profiles |
| `frontend/src/pages/school/SchoolDashboardPage.tsx` | 7 | School dashboard |
| `frontend/src/pages/school/SchoolStudentsPage.tsx` | 7 | School students |
| `frontend/src/pages/school/SchoolReportsPage.tsx` | 7 | School reports |
| `frontend/src/components/ui/CommandPalette.tsx` | 8 | Global search |
| `frontend/src/pages/lms/StudentAnalyticsPage.tsx` | 9 | Student analytics |
| `backend/app/Http/Controllers/Api/Public/FreeTrialController.php` | 1 | Booking API |
| `backend/app/Models/FreeTrialBooking.php` | 1 | Booking model |
| `backend/app/Http/Controllers/Api/School/SchoolDashboardController.php` | 7 | School dashboard API |
| `backend/app/Services/WhatsAppGateway.php` | 11 | WhatsApp integration |

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `DashboardPage.tsx` | 0, 4 | Fix crash, add Continue Learning |
| `LoginForm.tsx` | 0 | Fix Remember me |
| `GalleryPage.tsx` | 0 | Fix lightbox close |
| `QuickActions.tsx` | 0 | Fix role fallback |
| `ProgramsPage.tsx` | 0 | Fix Link |
| `PartnerSchoolsPage.tsx` | 0 | Fix Link |
| `Header.tsx` | 0, 8 | Fix height, add search/cmdk |
| `DataTable.tsx` | 0 | Fix loading state |
| `FaqAccordion.tsx` | 0 | Add aria-expanded |
| `LmsCoursePlayerPage.tsx` | 4 | Add video player, fix markdown |
| `QuizTakerPage.tsx` | 4 | Fix quiz fetch, add results redirect |
| `LmsForumThreadPage.tsx` | 9 | Add nested replies |
| `LmsAiTutorPage.tsx` | 9 | Add markdown rendering |
| `ParentDashboardPage.tsx` | 5 | Add attendance, activity |
| `TeacherDashboardPage.tsx` | 6 | Add quick actions, greeting |
| `HomePage.tsx` | 1 | Add counters, partners, JSON-LD |
| `RegistrationPage.tsx` | 1 | Add Zod validation |
| `AboutPage.tsx` | 1 | Make CMS-driven |
| All auth pages | 2 | Consistency, strength indicator |
| routes.ts | 1, 2, 3 | Add new routes |

---

*This document is derived from CODERS_HERO_COMPETITIVE_AUDIT.md. Follow phases in order. Complete all acceptance criteria before moving to next phase.*
