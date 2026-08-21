<?php

namespace App\Services;

use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use App\Models\PartnerSchool;
use Illuminate\Support\Collection;

class SearchService
{
    public function search(string $query, ?string $type = null): array
    {
        $results = collect();
        $query = "%{$query}%";

        if (!$type || $type === 'users') {
            $users = User::where('name', 'LIKE', $query)
                ->orWhere('email', 'LIKE', $query)
                ->limit(10)
                ->get()
                ->map(fn($u) => ['type' => 'user', 'id' => $u->id, 'title' => $u->name, 'subtitle' => $u->email, 'url' => "/users/{$u->id}"]);
            $results = $results->merge($users);
        }

        if (!$type || $type === 'students') {
            $students = Student::where('first_name', 'LIKE', $query)
                ->orWhere('last_name', 'LIKE', $query)
                ->orWhere('student_id', 'LIKE', $query)
                ->limit(10)
                ->get()
                ->map(fn($s) => ['type' => 'student', 'id' => $s->id, 'title' => $s->full_name, 'subtitle' => $s->student_id, 'url' => "/students/{$s->id}"]);
            $results = $results->merge($students);
        }

        if (!$type || $type === 'courses') {
            $courses = Course::where('title', 'LIKE', $query)
                ->limit(10)
                ->get()
                ->map(fn($c) => ['type' => 'course', 'id' => $c->id, 'title' => $c->title, 'subtitle' => $c->level ?? '', 'url' => "/courses/{$c->id}"]);
            $results = $results->merge($courses);
        }

        if (!$type || $type === 'schools') {
            $schools = PartnerSchool::where('name', 'LIKE', $query)
                ->limit(10)
                ->get()
                ->map(fn($s) => ['type' => 'school', 'id' => $s->id, 'title' => $s->name, 'subtitle' => $s->partnership_type ?? '', 'url' => "/partner-schools/{$s->id}"]);
            $results = $results->merge($schools);
        }

        return $results->take(20)->values()->all();
    }
}
