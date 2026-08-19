# 02 — FLUTTER SCREEN INVENTORY

**Audit Date:** 2026-08-19
**Scope:** All screen/page/widget files in `Mobile/coders-hero-mobile/lib/`
**Method:** Complete static analysis of every .dart file

---

## 1. Current Screen Inventory

The existing Flutter template contains **11 screen files**, **12 widget files**, and **2 service/model files**. Every screen is either a stub with hardcoded data or a UI shell with no backend integration.

### 1.1 SplashScreen

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/SplashScreen.dart` |
| **Class** | `SplashScreen` (StatefulWidget) |
| **Route** | Home widget in main.dart |
| **Purpose** | Animated splash with Rive/Flare animation, 8-second timer |
| **Current Functionality** | Displays "school splash.flr" animation, navigates to LoginPage after 8s |
| **API** | None |
| **Model** | None |
| **Authentication** | None |
| **Problem** | Redundant `Firebase.initializeApp()`, no auth check, double `@override`, no timer disposal, user can navigate back |
| **Action** | **REBUILD** — Replace with auth-aware splash that checks token → route to Dashboard or Login |
| **New Implementation** | `lib/screens/splash_screen.dart` — Check flutter_secure_storage for token, fetch profile, route accordingly |

### 1.2 LoginPage

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/LoginPage.dart` |
| **Class** | `MyHomePage` (StatefulWidget) |
| **Route** | Target of SplashScreen navigation |
| **Purpose** | Email/password login form |
| **Current Functionality** | Validates form with regex, navigates directly to `Home()` without any authentication |
| **API** | `FirebaseAuth.instance` declared but never used for sign-in |
| **Model** | `_userfromfirebase()` defined but never called |
| **Authentication** | None — login is completely fake |
| **Problem** | No actual authentication occurs. Form validates then navigates to Home. Contains 370+ lines of commented-out code. Redundant Firebase.initializeApp(). |
| **Action** | **REBUILD** — Complete rewrite connecting to Laravel Sanctum |
| **New Implementation** | `lib/screens/login_screen.dart` — POST /api/login, store token, fetch profile, route by role |

### 1.3 ForgetPassword

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/ForgetPassword.dart` |
| **Class** | `ForgetPassword` (StatefulWidget) |
| **Route** | From LoginPage "Forgot Password" link |
| **Purpose** | Password reset request |
| **Current Functionality** | Form with roll number + email fields, submit handler with empty try/catch |
| **API** | None |
| **Model** | None |
| **Authentication** | None |
| **Problem** | Password reset is NOT implemented. Empty try/catch. Contains 220+ lines of commented-out code. |
| **Action** | **REBUILD** — Connect to POST /api/forgot-password and POST /api/reset-password |
| **New Implementation** | `lib/screens/forgot_password_screen.dart` — Email input → API call → success message |

### 1.4 RequestLogin

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/RequestLogin.dart` |
| **Class** | `RequestLogin` (StatefulWidget) |
| **Route** | From LoginPage "Request Login ID" button |
| **Purpose** | Request a login ID with personal information |
| **Current Functionality** | Form with Name, Roll Number, Class, Email, Phone → navigates to ProcessingRequest |
| **API** | None — form data is collected but never sent anywhere |
| **Model** | None |
| **Problem** | No backend. Misleading UX. Contains 300+ lines of commented-out code. |
| **Action** | **REMOVE** — Not part of Coder's Hero user flow. Registration is handled through the web application. |

### 1.5 RequestProcessing

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/RequestProcessing.dart` |
| **Class** | `ProcessingRequest` (StatelessWidget) |
| **Route** | From RequestLogin submission |
| **Purpose** | Static confirmation page |
| **Current Functionality** | Shows hardcoded message "YOUR USERNAME AND PASSWORD IS SENT TO YOUR MAIL" (no email is actually sent) |
| **API** | None |
| **Problem** | Misleading. No email is sent. |
| **Action** | **REMOVE** — Not needed in Coder's Hero. |

### 1.6 Home (Dashboard)

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/home.dart` |
| **Class** | `Home` (StatefulWidget) |
| **Route** | From LoginPage (after fake login) |
| **Purpose** | Main dashboard with grid of feature cards |
| **Current Functionality** | 8 dashboard cards: Attendance, Profile, Exam, TimeTable, Library, Track Bus, Activity, Apply Leave. Only Attendance, Exam, Leave have working navigation. Profile, TimeTable, Library, Track Bus, Activity have empty handlers. |
| **API** | None |
| **Model** | None |
| **Hardcoded** | All card data is static |
| **Problem** | No role-based differentiation. No dynamic data. 5 of 8 cards are stubs. Redundant Firebase.initializeApp(). Hides system UI. |
| **Action** | **REBUILD** — Role-based dynamic dashboard with stats from API |
| **New Implementation** | Separate dashboards: `student_dashboard.dart`, `parent_dashboard.dart`, `teacher_dashboard.dart`, `admin_dashboard.dart` |

### 1.7 Attendance (Tab Container)

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/Attendance/Attendance.dart` |
| **Class** | `Attendance` (StatefulWidget) |
| **Route** | From Home dashboard or MainDrawer |
| **Purpose** | Tab container for Today and Overall attendance |
| **Current Functionality** | TabBar with "Today" and "Overall" tabs |
| **API** | None |
| **Action** | **REBUILD** — Connect to GET /students/{id}/attendance |

### 1.8 TodayAttendance

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/Attendance/TodayAttendance.dart` |
| **Class** | `TodayAttendance` (StatefulWidget) |
| **Route** | Tab within Attendance screen |
| **Purpose** | Display today's attendance |
| **Current Functionality** | Two hardcoded AttendanceCard widgets (staff "Deepak", subject "English", times "9 AM"-"10 AM") |
| **API** | None |
| **Hardcoded** | Staff name, subject, times, attendance status |
| **Action** | **REBUILD** — Dynamic data from API |

### 1.9 OverallAttendance

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/Attendance/OverallAttendance.dart` |
| **Class** | `OverallAttendance` (StatefulWidget) |
| **Route** | Tab within Attendance screen |
| **Purpose** | Display attendance history |
| **Current Functionality** | 11 identical hardcoded OverallAttendanceCard widgets (date "15.12.2020", day "sunday") |
| **API** | None |
| **Hardcoded** | Date, day, attendance status |
| **Action** | **REBUILD** — Dynamic data from API with pagination |

### 1.10 LeaveApply

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/Leave_Apply/LeaveApply.dart` |
| **Class** | `LeaveApply` (StatefulWidget) |
| **Route** | From Home dashboard or MainDrawer |
| **Purpose** | Leave application form |
| **Current Functionality** | Form with leave type dropdown, date pickers, reason field, document attachment (stub), leave history section |
| **API** | None |
| **Problem** | Leave submission NOT implemented. First dropdown contains exam type values instead of leave types (bug). Contains 525+ lines of commented-out code. |
| **Action** | **REMOVE** — Leave/HR management is not in mobile scope. Use web application. |

### 1.11 ExamResult

| Field | Value |
|-------|-------|
| **File** | `lib/Screens/Exam/Exam_Rseult.dart` (typo in filename) |
| **Class** | `ExamResult` (StatefulWidget) |
| **Route** | From Home dashboard |
| **Purpose** | Display exam results |
| **Current Functionality** | Hardcoded exam with subjects (Language/Tamil: 90/A+, English: 85/A+), total "490/500", grade "A+", save/share buttons with empty handlers |
| **API** | None |
| **Hardcoded** | Exam name, subjects, marks, grades, totals |
| **Problem** | Filename typo (Rseult → Result). Contains 388+ lines of commented-out code. Save/Share buttons do nothing. |
| **Action** | **REBUILD** — Connect to API, fix filename |

---

## 2. Widget Inventory

### 2.1 CommonAppBar

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/AppBar.dart` |
| **Class** | `CommonAppBar` (StatelessWidget, PreferredSizeWidget) |
| **Purpose** | Reusable app bar with optional menu and notification icons |
| **Parameters** | `title`, `menuenabled`, `notificationenabled`, `ontap` |
| **Assets** | `assets/notification.png` |
| **Action** | **MODIFY** — Rebrand colors, update icons to Lucide-style |

### 2.2 DashboardCard

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/DashboardCards.dart` |
| **Class** | `DashboardCard` (StatelessWidget) |
| **Purpose** | Card for dashboard grid items |
| **Parameters** | `name`, `imgpath` |
| **Assets** | `assets/${imgpath}` (dynamic) |
| **Action** | **REBUILD** — Dynamic data, role-based, Coder's Hero styling |

### 2.3 MainDrawer

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/MainDrawer.dart` |
| **Class** | `MainDrawer` (StatefulWidget) |
| **Purpose** | Navigation drawer with 13 menu items |
| **Current Items** | Home, Attendance, Classwork (stub), Profile (stub), Examination, Fees (stub), TimeTable (stub), Library (stub), Downloads (stub), Track (stub), Leave Apply, Activity (stub), Notification (stub) |
| **Working Items** | Home, Attendance, Examination, Leave Apply |
| **Stub Items** | 9 of 13 (69% are stubs) |
| **Action** | **REBUILD** — Role-based dynamic navigation drawer matching React navigation.ts |

### 2.4 NavigationDrawer

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/NavigationDrawer.dart` |
| **Class** | `NavigationDrawer` (StatefulWidget) |
| **Purpose** | Wrapper around MainDrawer (redundant) |
| **Action** | **REMOVE** — Never used anywhere in the app |

### 2.5 DrawerListTile

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/DrawerListTile.dart` |
| **Class** | `DrawerListTile` (StatelessWidget) |
| **Purpose** | Individual drawer menu item |
| **Parameters** | `name`, `imgpath`, `ontap` |
| **Action** | **MODIFY** — Update styling, add role-based visibility |

### 2.6 Bouncing (Button)

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/BouncingButton.dart` |
| **Class** | `Bouncing` (StatefulWidget) |
| **Purpose** | Button with scale bounce animation |
| **Parameters** | `child` (Widget), `onPress` (VoidCallback) |
| **Animation** | Scale 1.0 → 0.9 on press, reverse on release |
| **Action** | **KEEP** — Useful reusable animation widget. Fix dispose order. |

### 2.7 UserDetailCard

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/UserDetailCard.dart` |
| **Class** | `UserDetailCard` (StatefulWidget) |
| **Purpose** | Blue card showing student info |
| **Hardcoded** | Roll "BCM2005", Name "M.Irtaza", Standard "12", Section "B" |
| **Assets** | `assets/home.png` (avatar) |
| **Action** | **REBUILD** — Dynamic user data from API/auth state |

### 2.8 AttendanceCard

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/Attendance/AttendanceCard.dart` |
| **Class** | `AttendanceCard` (StatefulWidget) |
| **Purpose** | Single class attendance record card |
| **Parameters** | `starttime`, `endtime`, `subject`, `staff`, `attendance` (bool) |
| **Visual** | Green "P" / Red "A" indicator |
| **Action** | **REBUILD** — Dynamic data, Coder's Hero styling |

### 2.9 OverallAttendanceCard

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/Attendance/OverAllAttendanceCard.dart` |
| **Class** | `OverallAttendanceCard` (StatefulWidget) |
| **Purpose** | Day attendance with morning/afternoon halves |
| **Parameters** | `date`, `day`, `firsthalf` (bool), `secondhalf` (bool) |
| **Action** | **REBUILD** — Dynamic data, Coder's Hero styling |

### 2.10 LeaveHistoryCard

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/LeaveApply/LeaveHistoryCard.dart` |
| **Class** | `LeaveHistoryCard` (StatelessWidget) |
| **Purpose** | Leave request history card |
| **Parameters** | `status`, `adate`, `startdate`, `enddate`, `reason` |
| **Action** | **REMOVE** — Related to LeaveApply which is being removed |

### 2.11 CustomDatePicker

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/LeaveApply/datepicker.dart` |
| **Class** | `CustomDatePicker` (StatelessWidget) |
| **Purpose** | Reusable date picker wrapping DateTimePicker |
| **Parameters** | `controller`, `onChanged`, `onSaved`, `validator`, `title` |
| **Config** | Date format `dd/MM/yyyy`, range 2000-2100 |
| **Action** | **KEEP** — Useful reusable widget. Move to shared widgets. |

### 2.12 SubjectCard

| Field | Value |
|-------|-------|
| **File** | `lib/Widgets/Exams/SubjectCard.dart` |
| **Class** | `SubjectCard` (StatelessWidget) |
| **Purpose** | Exam result for a single subject |
| **Parameters** | `subjectname`, `chapter`, `date`, `time`, `grade`, `mark` |
| **Visual** | Random color accent bar via flutter_randomcolor |
| **Problem** | Random color regenerated on every rebuild. Contains commented-out old version. |
| **Action** | **REBUILD** — Dynamic data, deterministic colors, Coder's Hero styling |

---

## 3. Service/Model Inventory

### 3.1 UserModel

| Field | Value |
|-------|-------|
| **File** | `lib/services/UserModel.dart` |
| **Class** | `UserModel` |
| **Fields** | `final String uid` (only field) |
| **Action** | **REBUILD** — Full user model with id, name, email, role, permissions, photo_url, branch_id |

### 3.2 AuthService

| Field | Value |
|-------|-------|
| **File** | `lib/services/Auth_services.dart` |
| **Class** | `AuthService` |
| **Methods** | `googleSignIn()` — Google OAuth + Firebase credential |
| **Usage** | **NEVER USED** — Class is defined but no screen calls it |
| **Action** | **REMOVE** — Replace with Laravel Sanctum auth service |

---

## 4. Screen Classification Summary

| Action | Count | Files |
|--------|-------|-------|
| **REMOVE** | 5 | ForgetPassword, RequestLogin, RequestProcessing, LeaveApply, NavigationDrawer |
| **REBUILD** | 12 | SplashScreen, LoginPage, Home, Attendance, TodayAttendance, OverallAttendance, ExamResult, MainDrawer, UserDetailCard, AttendanceCard, OverallAttendanceCard, SubjectCard, UserModel |
| **MODIFY** | 3 | CommonAppBar, DrawerListTile, BouncingButton (minor fixes) |
| **KEEP** | 1 | CustomDatePicker |

---

## 5. New Screens Required (See 10_NEW_FILE_PLAN.md)

### Student Experience (16 screens)
- Student Dashboard
- Course List
- Course Detail + Lessons
- Lesson Viewer
- Attendance View
- Assignments List + Detail
- Exams List
- Grades View
- Timetable
- Certificates
- Notifications
- Profile
- Settings
- Coding Playground
- Coding Leaderboard
- AI Tutor

### Parent Experience (8 screens)
- Parent Dashboard
- Children List
- Child Detail
- Child Attendance
- Child Progress
- Fees & Receipts
- Notifications
- Profile

### Teacher Experience (8 screens)
- Teacher Dashboard
- Classes List
- Class Detail + Roster
- Mark Attendance (mobile-friendly)
- Assignments Management
- Exams Management
- Gradebook
- Lesson Notes

### Admin Experience (5 screens)
- Admin Dashboard
- Student List/Search
- Quick Actions
- Notifications
- Profile

### Shared (5 screens)
- Login
- Forgot Password
- Splash (auth-aware)
- Notifications Center
- Settings

**Total new screens: ~42**
**Total screens after migration: ~53 (11 existing + 42 new - 5 removed)**
