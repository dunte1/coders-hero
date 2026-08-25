#!/bin/bash
# ============================================
# CODER'S HERO — API ENDPOINT SMOKE TEST
# Tests every endpoint the Flutter app calls
# Run: bash test_api_endpoints.sh
# ============================================

BASE="https://coderhero.duncowebsolutions.co.ke/api"
PASS=0
FAIL=0
ERRORS=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

test_endpoint() {
    local method=$1
    local path=$2
    local token=$3
    local desc=$4
    local data=$5
    
    local args="-s -o /dev/null -w '%{http_code}'"
    if [ -n "$token" ]; then
        args="$args -H 'Authorization: Bearer $token'"
    fi
    args="$args -H 'Accept: application/json'"
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        args="$args -H 'Content-Type: application/json'"
        if [ -n "$data" ]; then
            args="$args -d '$data'"
        fi
    fi

    local code=$(eval curl $args -X "$method" "$BASE$path" 2>/dev/null)
    
    if [ "$code" = "200" ] || [ "$code" = "201" ]; then
        echo -e "${GREEN}✓${NC} $method $path ($code) — $desc"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗${NC} $method $path ($code) — $desc"
        FAIL=$((FAIL + 1))
        ERRORS="$ERRORS\n  $method $path → $code ($desc)"
    fi
}

login() {
    local email=$1
    local response=$(curl -s -X POST "$BASE/login" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"password\"}")
    echo "$response" | php -r 'echo json_decode(file_get_contents("php://stdin"))->data->token ?? "";' 2>/dev/null
}

# ============================================
echo "=========================================="
echo "  CODER'S HERO API SMOKE TEST"
echo "=========================================="
echo ""

# --- AUTH TESTS ---
echo ">>> AUTH"
test_endpoint POST "/login" "" "Login (valid)" '{"email":"alex@example.com","password":"password"}'
test_endpoint POST "/login" "" "Login (invalid)" '{"email":"bad@test.com","password":"wrong"}'
test_endpoint GET "/profile" "" "Profile (no token)" 
echo ""

# --- STUDENT ROLE ---
echo ">>> STUDENT (alex@example.com)"
STOK=$(login "alex@example.com")
if [ -z "$STOK" ]; then
    echo -e "${RED}Could not login as student — aborting student tests${NC}"
else
    test_endpoint GET "/dashboard" "$STOK" "Student Dashboard"
    test_endpoint GET "/dashboard/stats" "$STOK" "Student Dashboard Stats"
    test_endpoint GET "/profile" "$STOK" "Student Profile"
    test_endpoint GET "/student/classes" "$STOK" "Student Classes"
    test_endpoint GET "/student/projects" "$STOK" "Student Projects"
    test_endpoint GET "/student/exams" "$STOK" "Student Exams"
    test_endpoint GET "/student/assignments" "$STOK" "Student Assignments"
    test_endpoint GET "/certificates" "$STOK" "Student Certificates"
    test_endpoint GET "/certificates/CERT-2026-0001/download" "$STOK" "Certificate Download"
    test_endpoint GET "/enrollments/my-courses" "$STOK" "My Courses"
    test_endpoint GET "/enrollments/stats" "$STOK" "Enrollment Stats"
    test_endpoint GET "/notifications" "$STOK" "Student Notifications"
    test_endpoint GET "/notifications/unread" "$STOK" "Unread Count"
    test_endpoint GET "/chat" "$STOK" "Chat Conversations"
    test_endpoint GET "/lms/quizzes" "$STOK" "Quizzes"
    test_endpoint GET "/lms/bookmarks" "$STOK" "Bookmarks"
    test_endpoint GET "/courses" "$STOK" "Course Catalog"
    test_endpoint GET "/competitions" "$STOK" "Competitions"
fi
echo ""

# --- PARENT ROLE ---
echo ">>> PARENT (parent@codershero.com)"
PTOK=$(login "parent@codershero.com")
if [ -z "$PTOK" ]; then
    echo -e "${RED}Could not login as parent — aborting parent tests${NC}"
else
    test_endpoint GET "/parent/summary" "$PTOK" "Parent Dashboard"
    test_endpoint GET "/parent/children" "$PTOK" "Parent Children"
    test_endpoint GET "/parent/attendance" "$PTOK" "Parent Attendance"
    test_endpoint GET "/parent/progress" "$PTOK" "Parent Progress"
    test_endpoint GET "/parent/report-cards" "$PTOK" "Parent Report Cards"
    test_endpoint GET "/parent/fees" "$PTOK" "Parent Fees"
    test_endpoint GET "/parent/assignments" "$PTOK" "Parent Assignments"
    test_endpoint GET "/parent/courses" "$PTOK" "Parent Courses"
    test_endpoint GET "/parent/projects" "$PTOK" "Parent Projects"
    test_endpoint GET "/parent/competitions" "$PTOK" "Parent Competitions"
    test_endpoint GET "/parent/certificates" "$PTOK" "Parent Certificates"
    test_endpoint GET "/parent/announcements" "$PTOK" "Parent Announcements"
    test_endpoint GET "/parent/notifications" "$PTOK" "Parent Notifications"
    test_endpoint GET "/chat" "$PTOK" "Parent Chat"
    test_endpoint GET "/profile" "$PTOK" "Parent Profile"
fi
echo ""

# --- TEACHER ROLE ---
echo ">>> TEACHER (teacher@codershero.com)"
TTOK=$(login "teacher@codershero.com")
if [ -z "$TTOK" ]; then
    echo -e "${RED}Could not login as teacher — aborting teacher tests${NC}"
else
    test_endpoint GET "/teacher/dashboard" "$TTOK" "Teacher Dashboard"
    test_endpoint GET "/teacher/classes" "$TTOK" "Teacher Classes"
    test_endpoint GET "/teacher/assignments" "$TTOK" "Teacher Assignments"
    test_endpoint GET "/teacher/exams" "$TTOK" "Teacher Exams"
    test_endpoint GET "/teacher/lesson-notes" "$TTOK" "Teacher Lesson Notes"
    test_endpoint GET "/teacher/notifications" "$TTOK" "Teacher Notifications"
    test_endpoint GET "/chat" "$TTOK" "Teacher Chat"
    test_endpoint GET "/profile" "$TTOK" "Teacher Profile"
    test_endpoint GET "/competitions" "$TTOK" "Teacher Competitions"
fi
echo ""

# --- ADMIN ROLE ---
echo ">>> ADMIN (admin@codershero.com)"
ATOK=$(login "admin@codershero.com")
if [ -z "$ATOK" ]; then
    echo -e "${RED}Could not login as admin — aborting admin tests${NC}"
else
    test_endpoint GET "/dashboard" "$ATOK" "Admin Dashboard"
    test_endpoint GET "/dashboard/stats" "$ATOK" "Admin Dashboard Stats"
    test_endpoint GET "/students" "$ATOK" "Admin Students List"
    test_endpoint GET "/admin/employees" "$ATOK" "Admin Teachers/Employees"
    test_endpoint GET "/finance/summary" "$ATOK" "Finance Summary"
    test_endpoint GET "/finance/expenses" "$ATOK" "Finance Expenses"
    test_endpoint GET "/inventory/suppliers" "$ATOK" "Inventory Suppliers"
    test_endpoint GET "/inventory/purchase-orders" "$ATOK" "Inventory Purchase Orders"
    test_endpoint GET "/organization/contracts" "$ATOK" "Organization Contracts"
    test_endpoint GET "/admin/crm/leads" "$ATOK" "CRM Leads"
    test_endpoint GET "/admin/activity-logs" "$ATOK" "Activity Logs"
    test_endpoint GET "/hr/employees" "$ATOK" "HR Employees"
    test_endpoint GET "/hr/documents" "$ATOK" "HR Documents"
    test_endpoint GET "/library/catalog" "$ATOK" "Library Catalog"
    test_endpoint GET "/chat" "$ATOK" "Admin Chat"
    test_endpoint GET "/profile" "$ATOK" "Admin Profile"
    test_endpoint GET "/admin/notifications" "$ATOK" "Admin Notifications"
    test_endpoint GET "/competitions" "$ATOK" "Admin Competitions"
fi
echo ""

# --- INSTRUCTOR ROLE ---
echo ">>> INSTRUCTOR (emily@codershero.com)"
ITOK=$(login "emily@codershero.com")
if [ -z "$ITOK" ]; then
    echo -e "${RED}Could not login as instructor — aborting${NC}"
else
    test_endpoint GET "/dashboard" "$ITOK" "Instructor Dashboard"
    test_endpoint GET "/profile" "$ITOK" "Instructor Profile"
    test_endpoint GET "/lms/quizzes" "$ITOK" "Instructor Quizzes"
    test_endpoint GET "/chat" "$ITOK" "Instructor Chat"
fi
echo ""

# --- SHARED ENDPOINTS ---
echo ">>> SHARED"
if [ -n "$STOK" ]; then
    test_endpoint GET "/announcements" "$STOK" "Announcements"
fi
echo ""

# ============================================
echo "=========================================="
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "=========================================="
if [ $FAIL -gt 0 ]; then
    echo -e "\n${RED}FAILED ENDPOINTS:${NC}$ERRORS"
    exit 1
else
    echo -e "\n${GREEN}ALL TESTS PASSED!${NC}"
    exit 0
fi
