<?php

namespace Database\Seeders;

use App\Models\Competition;
use App\Models\CompetitionCriterion;
use App\Models\CompetitionScore;
use App\Models\CompetitionTeam;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        $hackathon = Competition::updateOrCreate(
            ['slug' => 'campus-hackathon-2026'],
            [
                'name' => 'Campus Hackathon 2026',
                'type' => 'hackathon',
                'description' => '48-hour coding marathon to build innovative solutions for real-world problems.',
                'venue' => 'Innovation Hall',
                'start_date' => now()->addWeeks(2)->toDateString(),
                'end_date' => now()->addWeeks(2)->addDays(2)->toDateString(),
                'registration_deadline' => now()->addWeek()->toDateTimeString(),
                'min_team_size' => 2,
                'max_team_size' => 5,
                'status' => 'registration_open',
                'rules' => ['Original code only', 'Open source tools allowed', 'Present in 5 minutes'],
            ]
        );

        $creator = User::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'super_admin', 'teacher', 'instructor']))
            ->first();

        if ($creator) {
            $hackathon->update(['created_by_user_id' => $creator->id]);
        }

        $criteria = [
            ['name' => 'Creativity & Innovation', 'description' => 'Originality and novelty of the idea.', 'max_score' => 20, 'weight' => 3, 'sort_order' => 1],
            ['name' => 'Technical Complexity', 'description' => 'Depth and difficulty of implementation.', 'max_score' => 30, 'weight' => 3, 'sort_order' => 2],
            ['name' => 'Impact & Usefulness', 'description' => 'Real-world value of the solution.', 'max_score' => 20, 'weight' => 2, 'sort_order' => 3],
            ['name' => 'Presentation', 'description' => 'Clarity and quality of the final demo.', 'max_score' => 10, 'weight' => 2, 'sort_order' => 4],
        ];

        foreach ($criteria as $item) {
            CompetitionCriterion::updateOrCreate(
                ['competition_id' => $hackathon->id, 'name' => $item['name']],
                $item
            );
        }

        $judge = User::query()->whereHas('roles', fn ($q) => $q->where('name', 'judge'))->first()
            ?? User::query()->whereHas('roles', fn ($q) => $q->where('name', 'instructor'))->first();

        if ($judge) {
            $hackathon->judges()->syncWithoutDetaching([$judge->id => ['title' => 'Lead Judge']]);
        }

        $students = Student::query()->limit(3)->get();

        if ($students->isNotEmpty()) {
            $leader = $students->first();

            $team = CompetitionTeam::updateOrCreate(
                ['competition_id' => $hackathon->id, 'name' => 'CodeBusters'],
                [
                    'project_title' => 'Smart Campus Navigation',
                    'description' => 'AR-powered indoor navigation for campus visitors.',
                    'status' => 'registered',
                    'leader_student_id' => $leader->id,
                ]
            );

            $team->members()->syncWithoutDetaching(
                $students->mapWithKeys(fn ($student) => [
                    $student->id => ['role' => $student->id === $leader->id ? 'leader' : 'member'],
                ])->all()
            );
        }

        $robotics = Competition::updateOrCreate(
            ['slug' => 'robotics-challenge-2026'],
            [
                'name' => 'Robotics Challenge 2026',
                'type' => 'robotics_challenge',
                'description' => 'Robots battle it out in an obstacle course.',
                'venue' => 'Robotics Laboratory',
                'start_date' => now()->subMonth()->toDateString(),
                'end_date' => now()->subMonth()->addWeek()->toDateString(),
                'min_team_size' => 2,
                'max_team_size' => 4,
                'status' => 'completed',
            ]
        );

        if ($creator) {
            $robotics->update(['created_by_user_id' => $creator->id]);
        }

        foreach (['Engineering Design' => 40, 'Performance' => 60] as $name => $max) {
            CompetitionCriterion::updateOrCreate(
                ['competition_id' => $robotics->id, 'name' => $name],
                ['max_score' => $max, 'weight' => 1, 'sort_order' => 1]
            );
        }

        if ($judge) {
            $robotics->judges()->syncWithoutDetaching([$judge->id => ['title' => 'Head Judge']]);

            $completedTeam = CompetitionTeam::updateOrCreate(
                ['competition_id' => $robotics->id, 'name' => 'MechMinds'],
                [
                    'project_title' => 'Obstacle Course Robot',
                    'description' => 'Autonomous line-following robot with obstacle avoidance.',
                    'status' => 'submitted',
                    'leader_student_id' => $students->first()?->id,
                ]
            );

            $completedTeam->members()->syncWithoutDetaching(
                $students->mapWithKeys(fn ($student) => [
                    $student->id => ['role' => $student->id === $completedTeam->leader_student_id ? 'leader' : 'member'],
                ])->all()
            );

            foreach ($robotics->criteria as $criterion) {
                CompetitionScore::updateOrCreate(
                    [
                        'competition_id' => $robotics->id,
                        'competition_team_id' => $completedTeam->id,
                        'criterion_id' => $criterion->id,
                        'judge_user_id' => $judge->id,
                    ],
                    [
                        'score' => $criterion->max_score > 40 ? 48 : 35,
                        'remarks' => 'Solid engineering, strong finish.',
                        'submitted_at' => now()->subWeek(),
                        'verified_by_user_id' => $creator?->id,
                        'verified_at' => now()->subWeek(),
                    ]
                );
            }
        }
    }
}
