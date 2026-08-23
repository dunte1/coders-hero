<?php

namespace App\Services\School;

use App\Models\PartnerSchool;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SchoolDashboardService
{
    public function getSummaryForUser(User $user): array
    {
        $totalStudents = Student::count();
        $totalTeachers = User::whereHas('roles', fn($q) => $q->whereIn('name', ['teacher', 'instructor']))
            ->count();
        $activeCourses = SchoolClass::where('status', 'active')->count();

        $todayAttendance = DB::table('attendances')
            ->whereDate('attendance_date', today())
            ->count();

        $presentToday = DB::table('attendances')
            ->whereDate('attendance_date', today())
            ->where('status', 'present')
            ->count();

        $attendancePercent = $todayAttendance > 0 ? round(($presentToday / $todayAttendance) * 100) : 0;

        $totalEnrollments = Enrollment::count();
        $activeEnrollments = Enrollment::where('status', 'active')->count();

        $partnerSchools = PartnerSchool::where('is_active', true)->count();

        return [
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'active_courses' => $activeCourses,
            'attendance_today' => $todayAttendance,
            'attendance_rate' => $attendancePercent,
            'total_enrollments' => $totalEnrollments,
            'active_enrollments' => $activeEnrollments,
            'partner_schools' => $partnerSchools,
        ];
    }

    public function getSummary(string $schoolId): array
    {
        $school = PartnerSchool::findOrFail($schoolId);

        $totalStudents = Student::count();
        $totalTeachers = User::whereHas('roles', fn($q) => $q->whereIn('name', ['teacher', 'instructor']))
            ->count();
        $activeCourses = SchoolClass::where('status', 'active')->count();

        $todayAttendance = DB::table('attendances')
            ->whereDate('attendance_date', today())
            ->count();

        $presentToday = DB::table('attendances')
            ->whereDate('attendance_date', today())
            ->where('status', 'present')
            ->count();

        $attendancePercent = $todayAttendance > 0 ? round(($presentToday / $todayAttendance) * 100) : 0;

        return [
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
                'type' => $school->partnership_type,
            ],
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'active_courses' => $activeCourses,
            'attendance_rate' => $attendancePercent,
        ];
    }
}
