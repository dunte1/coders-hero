# Coder's Hero — React Frontend Mapping

> Functional reference for Flutter mobile integration. React frontend architecture, navigation, state management, and page-to-API consumption patterns.

---

## 1. Architecture Overview

### Tech Stack (from `frontend/package.json`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.0 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 6.0 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| Zustand | 5.0 | Client state management |
| TanStack React Query | 5.0 | Server state management (caching, refetching) |
| react-router-dom | 7.0 | Client-side routing |
| Axios | 1.7 | HTTP client |
| react-hook-form | 7.54 | Form management |
| Zod | 3.24 | Schema validation |
| @radix-ui/* | 1.1 | UI primitives (dialog, dropdown, select, tabs, toast, tooltip, etc.) |
| lucide-react | 0.460 | Icon library |
| recharts | 2.15 | Charts |
| @uiw/react-codemirror | 4.25 | Code editor |
| date-fns | 4.1 | Date utilities |
| sonner | 1.7 | Toast notifications |
| class-variance-authority | 0.71 | Component variants |
| tailwind-merge | 2.6 | Tailwind class merging |
| clsx | 2.1 | Conditional class names |
| qrcode | 1.5 | QR code generation |
| react-easy-crop | 6.2 | Image cropping |

---

## 2. State Management Architecture

### Zustand Auth Store (`frontend/src/store/authStore.ts`)

```typescript
// Key state
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  pendingTwoFactorToken: string | null;
}

// Persistence: localStorage for token + user, sessionStorage for 2FA pending token
// Actions: login, logout, setUser, setLoading, beginTwoFactor, completeTwoFactor
```

**Flutter Equivalent:** Provider/Riverpod/Bloc + Flutter Secure Storage

### TanStack React Query (38 hook files)

Each domain has a dedicated hook file that wraps React Query:

| Hook File | Domain | API Pattern |
|-----------|--------|-------------|
| `useAuth.ts` | Authentication | login, logout, register, profile, 2FA |
| `useCourses.ts` | Courses CRUD | useQuery + useMutation |
| `useEnrollments.ts` | Enrollments | list, enroll, unenroll, progress |
| `useStudents.ts` | Student management | CRUD, filters, export |
| `useTeacher.ts` | Teacher portal | classes, assignments, exams, gradebook |
| `useParentPortal.ts` | Parent portal | summary, attendance, fees, progress |
| `useHr.ts` | HR management | employees, leaves, payroll, attendance |
| `useFinance.ts` | Finance | invoices, payments, expenses, budgets |
| `useInventory.ts` | Inventory | assets, items, maintenance |
| `useLibrary.ts` | Library | catalog, borrowings, reservations |
| `useCompetitions.ts` | Competitions | list, register, judge, leaderboard |
| `useRobotics.ts` | Robotics | equipment, teams, projects, reservations |
| `useNotifications.ts` | Notifications | list, read, stats, preferences |
| `useAi.ts` | AI Platform | assistants, conversations, messages |
| `useLms.ts` | LMS | forum, bookmarks, ratings, coding exercises |
| `useAnalytics.ts` | Analytics | overview, enrollments, revenue, attendance |
| `useAdmin.ts` | Admin operations | users, roles, permissions |
| `useOrganization.ts` | Organization | branches, partner schools, academic years |
| `useDashboard.ts` | Dashboard | stats, overview, activities |
| `useTasks.ts` | Tasks | CRUD, bulk assign, status |
| `useProjects.ts` | Projects | CRUD, members |
| `useLoginHistory.ts` | Login history | list, clear |
| `useTwoFactor.ts` | 2FA | status, enable, disable, challenge |
| `useRoles.ts` | Roles | CRUD, permissions sync |
| `usePermissionManagement.ts` | Permissions | list, groups, assign |
| `useUsers.ts` | Users | CRUD, role assignment |
| `useAdmissions.ts` | Admissions | CRUD, admit/reject |
| `useGuardians.ts` | Guardians | CRUD |
| `useAttendances.ts` | Attendance | CRUD, bulk, reports |
| `useCertificates.ts` | Certificates | list, issue, verify |
| `useNavigation.ts` | Navigation | role-based filtering |

**Flutter Equivalent:** Riverpod providers or Bloc for each domain

### Pattern Reference

```typescript
// React Query pattern (useCourses.ts example)
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/courses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
}
```

**Flutter Equivalent:** `FutureProvider` + caching, or `Bloc` with `CacheClient`

---

## 3. Navigation Architecture

### Config-Driven Navigation (`frontend/src/config/navigation.ts`)

- **20 navigation sections** with role-based filtering
- **129 navigation items** total
- **218 routes** defined in `routes.ts`
- **15 roles** defined as `NavRole` type

### Navigation Sections

| # | Section | Icon | Roles | Children |
|---|---------|------|-------|----------|
| 1 | Dashboard | LayoutDashboard | All authenticated | 1 (direct link) |
| 2 | Organization | Building2 | SIS_ROLES | 4: Overview, Branches, Partner Schools, Academic Years |
| 3 | Students | UsersRound | SIS_ROLES | 7: Dashboard, All Students, Admissions, Guardians, Attendance, Reports, Appointments |
| 4 | Parents | Users | parent | 8: Dashboard, Attendance, Report Cards, Coding Progress, Fees, Receipts, Appointments, Notifications |
| 5 | Teachers | UserCheck | TEACHER_ROLES | 9: Dashboard, Classes, Assignments, Exams, Gradebook, Lesson Notes, Calendar, Performance, Reports |
| 6 | Academics | GraduationCap | ACADEMICS_ROLES | 2: Courses, Enrollments |
| 7 | Learning/LMS | BookOpen | LEARNER_ROLES | 6: My Courses, My Assignments, Quizzes, Forum, Bookmarks, AI Tutor |
| 8 | Coding Lab | Code2 | CODING_ROLES | 3: Playground, Challenges, Leaderboard |
| 9 | Robotics Lab | Cpu | ROBOTICS_ROLES | 6: Overview, Equipment, Teams, Projects, Reservations, Maintenance |
| 10 | Competitions | Trophy | 6 roles | 2: Competitions, My Teams |
| 11 | Finance | Wallet | FINANCE_ROLES | 10: Dashboard, Fee Structures, Invoices, Payments, Expenses, Budgets, M-Pesa, Outstanding, Transactions, My Finance |
| 12 | Human Resources | Briefcase | HR_ROLES | 9: Dashboard, Employees, Contracts, Leave, Attendance, Payroll, Performance, Documents, Reports |
| 13 | My HR | UserCheck | employee/admin | 3: My Overview, My Leave, My Payslips |
| 14 | Inventory | Boxes | INVENTORY_ROLES | 6: Dashboard, Assets, Stock Items, Maintenance, Categories, Locations |
| 15 | Library | Library | 8 roles | 8: Catalog, My Library, Overview, Resources, Borrowings, Reservations, Categories, Authors |
| 16 | Certificates | Award | 6 roles | 5: My Certificates, Overview, All, Templates, Verifications |
| 17 | AI Platform | Bot | COMMUNICATION_ROLES | 3: AI Dashboard, My Usage, Administration |
| 18 | Website/CMS | Globe | CMS_ROLES | 10: Site Content, Services, Programs, Gallery, Testimonials, Blog, FAQs, Contact Messages, Chat Widget, Analytics |
| 19 | Communication | MessageSquare | COMMUNICATION_ROLES | 6: Inbox, Preferences, Announcements, Messages, Administration, Templates |
| 20 | Project Management | FolderKanban | 3 roles | 2: Tasks, Projects |
| 21 | Reports & Analytics | BarChart3 | 4 roles | 2: Executive Dashboard, Reports |
| 22 | Administration | Shield | ADMIN_ROLES | 10: Home, Users, Roles, Permissions, Activity Logs, Audit Logs, Login History, System Health, Backups, System Logs |
| 23 | Settings | Settings | COMMUNICATION_ROLES | 12: General, Branding, Localization, Academic, Notifications, Integrations, Security, Storage, Backup, System, Profile, Two-Factor |

### Role Groups

```typescript
ACADEMICS_ROLES = ['super_admin', 'admin', 'director', 'branch_manager', 'school_admin', 'teacher', 'instructor']
TEACHER_ROLES   = ['super_admin', 'admin', 'director', 'school_admin', 'teacher', 'instructor']
SIS_ROLES       = ['super_admin', 'admin', 'director', 'branch_manager', 'school_admin']
LEARNER_ROLES   = ['super_admin', 'admin', 'teacher', 'instructor', 'student', 'parent']
CODING_ROLES    = ['super_admin', 'admin', 'teacher', 'instructor', 'student']
ROBOTICS_ROLES  = ['super_admin', 'admin', 'teacher', 'instructor', 'student']
HR_ROLES        = ['super_admin', 'admin', 'hr_officer']
INVENTORY_ROLES = ['super_admin', 'admin', 'inventory_officer']
LIBRARY_MANAGE_ROLES = ['super_admin', 'admin', 'librarian']
FINANCE_ROLES   = ['super_admin', 'admin', 'director', 'accountant']
CMS_ROLES       = ['super_admin', 'admin']
COMMUNICATION_ROLES = all 15 roles
ADMIN_ROLES     = ['super_admin', 'admin']
```

### Navigation Filtering Logic

```typescript
// useNavigation hook
function filterEntries(entries, role, permissions) {
  // Bypass for admin/super_admin
  // Filter by entry.roles.includes(role)
  // Filter by entry.permission if present
  // Recursively filter children
}
```

**Flutter Equivalent:** Dynamic `NavigationDrawer` with role-based menu filtering

---

## 4. Route Configuration (`frontend/src/router/routes.ts`)

### Route Pattern

```typescript
interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType>;
  meta?: {
    title?: string;
    public?: boolean;
    layout?: 'website';
    roles?: string[];
    permissions?: string[];
  };
}
```

### Route Groups

#### Public Routes (Website)
| Path | Page |
|------|------|
| `/` | HomePage |
| `/services` | ServicesPage |
| `/about` | AboutPage |
| `/programs` | ProgramsPage |
| `/programs/:slug` | ProgramDetailPage |
| `/robotics` | RoboticsPage |
| `/coding` | CodingPage |
| `/gallery` | GalleryPage |
| `/testimonials` | TestimonialsPage |
| `/blog` | BlogPage |
| `/blog/:slug` | BlogDetailPage |
| `/faqs` | FaqPage |
| `/events` | EventsPage |
| `/courses-catalog` | PublicCoursesPage |
| `/register` | RegistrationPage |
| `/contact` | ContactPage |
| `/school-partnerships` | PartnerSchoolsPage |

#### Public Auth Routes
| Path | Page |
|------|------|
| `/login` | LoginPage |
| `/verify-email` | VerifyEmailPage |
| `/forgot-password` | ForgotPasswordPage |
| `/reset-password` | ResetPasswordPage |
| `/two-factor/challenge` | TwoFactorChallengePage |

#### Protected App Routes (examples)
| Path | Page | Roles |
|------|------|-------|
| `/dashboard` | DashboardPage | All authenticated |
| `/courses` | CoursesPage | All |
| `/courses/create` | CourseCreatePage | admin, instructor |
| `/courses/:id` | CourseDetailPage | All |
| `/users` | UsersPage | admin |
| `/students` | StudentsPage | SIS roles |
| `/teacher` | TeacherDashboardPage | teacher roles |
| `/parent` | ParentDashboardPage | parent |
| `/finance` | FinanceDashboardPage | finance roles |
| `/hr` | HrDashboardPage | HR roles |
| `/inventory` | InventoryDashboardPage | inventory roles |
| `/library` | LibraryCatalogPage | All authenticated |
| `/lms/playground` | PlaygroundPage | coding roles |
| `/competitions` | CompetitionsPage | competition roles |
| `/ai` | AiDashboardPage | All authenticated |
| `/admin` | AdminDashboardPage | admin roles |

---

## 5. API Client Pattern (`frontend/src/lib/api`)

### Axios Configuration

```typescript
// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on 401
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Flutter Equivalent:** Dio interceptors with identical logic

---

## 6. Page-to-API Consumption Patterns

### React Patterns for Flutter Replication

| React Pattern | Implementation | Flutter Equivalent |
|--------------|---------------|-------------------|
| Auth store (Zustand) | `useAuthStore` with localStorage persistence | Provider/Riverpod + Flutter Secure Storage |
| API client (Axios) | Interceptors for token injection + 401 handling | Dio interceptors |
| Protected routes | `meta.roles` in route config, middleware check | Route guards with `Navigator` |
| Config-driven nav | `navigation.ts` + `useNavigation` hook | Dynamic `NavigationDrawer` |
| React Query caching | `useQuery` with `queryKey` for automatic cache | `FutureProvider` / `CachedNetworkImage` |
| Form validation | react-hook-form + zod schemas | Flutter `Form` + `TextFormField` validators |
| Toast notifications | `sonner` library | `SnackBar` / fluttertoast |
| Role-based rendering | `hasRole()` / `hasPermission()` in components | Conditional `Widget` based on role |
| Data tables | Custom components with sorting/filtering | `DataTable` / `PaginatedDataTable` |
| Charts | recharts (bar, line, pie, area) | fl_chart |
| Code editor | @uiw/react-codemirror | flutter_code_editor / Highlight.js |
| Image upload | react-easy-crop + base64 | image_picker + Cropper |
| Date handling | date-fns | intl / timeago |
| PDF generation | Browser print / jsPDF | printing + pdf packages |

---

## 7. Form Patterns

### react-hook-form + Zod Validation

```typescript
// React pattern
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category_id: z.number().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
});

function CourseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  // ...
}
```

**Flutter Equivalent:**
```dart
// Flutter equivalent
final _formKey = GlobalKey<FormState>();
TextFormField(
  validator: (value) => value?.isEmpty ?? true ? 'Title is required' : null,
)
```

---

## 8. Component Patterns

### Shadcn/ui-style Components

The React frontend uses Radix UI primitives styled with Tailwind CSS in a shadcn/ui pattern:

| Component | Radix Primitive | Usage |
|-----------|-----------------|-------|
| `Button` | - | CVA variants (default, destructive, outline, ghost) |
| `Input` | - | Styled text input |
| `Select` | `@radix-ui/react-select` | Dropdown selection |
| `Dialog` | `@radix-ui/react-dialog` | Modal dialogs |
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` | Context menus |
| `Tabs` | `@radix-ui/react-tabs` | Tab panels |
| `Toast` | `sonner` | Notifications |
| `Tooltip` | `@radix-ui/react-tooltip` | Hover tooltips |
| `Avatar` | `@radix-ui/react-avatar` | User avatars |
| `Badge` | - | Status badges |
| `Card` | - | Content cards |
| `DataTable` | - | Data tables with sorting |
| `Skeleton` | - | Loading placeholders |

**Flutter Equivalent:** Custom widget library using `ThemeData` + consistent design tokens
