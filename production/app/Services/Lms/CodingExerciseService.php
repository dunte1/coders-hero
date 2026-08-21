<?php

namespace App\Services\Lms;

use App\Models\CodingExercise;
use App\Models\CodingSubmission;
use App\Services\CodeRunner\CodeRunnerContract;
use App\Services\CodeRunner\CodeRunnerUnavailableException;
use Illuminate\Support\Facades\Log;

class CodingExerciseService
{
    protected CodeRunnerContract $runner;

    public function __construct(CodeRunnerContract $runner)
    {
        $this->runner = $runner;
    }

    public function list(int $courseId, array $filters = [], int $perPage = 20)
    {
        return CodingExercise::query()
            ->byCourse($courseId)
            ->published()
            ->withCount('submissions')
            ->when(!empty($filters['difficulty']) && $filters['difficulty'] !== 'all', function ($query) use ($filters) {
                return $query->where('difficulty', $filters['difficulty']);
            })
            ->when(!empty($filters['language']) && $filters['language'] !== 'all', function ($query) use ($filters) {
                return $query->where('language', $filters['language']);
            })
            ->orderBy('difficulty')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id, ?string $userId = null): ?CodingExercise
    {
        $exercise = CodingExercise::published()->with(['lesson', 'course'])->find($id);

        if ($exercise && $userId) {
            $exercise->loadCount([
                'submissions as user_submissions_count' => fn ($q) => $q->byUser($userId),
            ]);
        }

        return $exercise;
    }

    public function submit(string $userId, int $exerciseId, string $code): CodingSubmission
    {
        $exercise = CodingExercise::findOrFail($exerciseId);

        $result = $this->evaluate($exercise, $code);

        return CodingSubmission::create([
            'exercise_id' => $exerciseId,
            'user_id' => $userId,
            'code' => $code,
            'status' => $result['status'],
            'score' => $result['score'],
            'result' => $result['details'],
            'feedback' => $result['feedback'],
            'submitted_at' => now(),
        ]);
    }

    public function submissions(string $userId, int $exerciseId, int $perPage = 10)
    {
        return CodingSubmission::query()
            ->byUser($userId)
            ->where('exercise_id', $exerciseId)
            ->orderByDesc('submitted_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function progress(string $userId, int $courseId): array
    {
        $exercises = CodingExercise::byCourse($courseId)->published()->pluck('id');

        $submissions = CodingSubmission::byUser($userId)
            ->whereIn('exercise_id', $exercises)
            ->orderBy('submitted_at')
            ->get();

        $latest = $submissions->groupBy('exercise_id')
            ->map(fn ($group) => $group->last());

        return [
            'total_exercises' => $exercises->count(),
            'solved' => $latest->where('status', 'correct')->count(),
            'attempted' => $latest->count(),
            'solved_exercise_ids' => $latest->where('status', 'correct')->pluck('exercise_id'),
            'attempted_exercise_ids' => $latest->pluck('exercise_id'),
        ];
    }

    protected function evaluate(CodingExercise $exercise, string $code): array
    {
        $testCases = $exercise->test_cases ?? [];

        if (empty($testCases)) {
            return [
                'status' => 'pending',
                'score' => 0,
                'details' => [],
                'feedback' => 'No automated test cases are defined for this exercise. Your submission has been recorded.',
            ];
        }

        $passed = 0;
        $details = [];

        foreach ($testCases as $index => $testCase) {
            $input = $testCase['input'] ?? null;
            $expected = $testCase['expected'] ?? null;

            $actual;
            try {
                $files = $this->buildTestCaseFiles($exercise->language, $code, $input);

                if (empty($files)) {
                    throw new \RuntimeException('Unsupported language');
                }

                $runResult = $this->runner->run($files, json_encode($input ?? ''));
                $actual = trim($runResult['stdout'] ?? '');
            } catch (\Throwable $e) {
                // Runner unavailable / error → static fallback
                Log::warning('Code execution runner unavailable, using static fallback.', [
                    'error' => $e->getMessage(),
                    'exercise_id' => $exercise->id,
                ]);
                $actual = $this->staticEvaluate($code, $input);
            }

            $ok = $this->matches($actual, $expected);

            if ($ok) {
                $passed++;
            }

            $details[] = [
                'index' => $index + 1,
                'input' => is_array($input) ? json_encode($input) : $input,
                'expected' => $expected,
                'actual' => $actual,
                'passed' => $ok,
            ];
        }

        $score = $passed === count($testCases) ? 100 : round(($passed / count($testCases)) * 100, 1);

        return [
            'status' => $passed === count($testCases) ? 'correct' : ($passed > 0 ? 'partial' : 'incorrect'),
            'score' => $score,
            'details' => $details,
            'feedback' => $passed === count($testCases)
                ? 'All test cases passed. Great job!'
                : "{$passed} of " . count($testCases) . " test cases passed.",
        ];
    }

    protected function buildTestCaseFiles(string $language, string $code, ?string $input): array
    {
        $stdin = $input !== null ? json_encode($input) : '';

        if ($language === 'python') {
            return [
                [
                    'name' => 'main.py',
                    'content' => "import sys, json\n\ninput_str = sys.stdin.read().strip()\ntry:\n    args = json.loads(input_str)\n    from solution import solution\n    result = solution(*args) if isinstance(args, list) else solution(args)\n    print(json.dumps(result, default=str))\nexcept Exception as e:\n    print(json.dumps({'__error__': str(e)}, default=str))",
                ],
                [
                    'name' => 'solution.py',
                    'content' => $code,
                ],
            ];
        }

        if ($language === 'javascript') {
            return [
                [
                    'name' => 'main.js',
                    'content' => "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\ntry {\n    const solution = require('./solution').solution;\n    const result = solution(JSON.parse(input));\n    console.log(JSON.stringify(result));\n} catch (e) {\n    console.log(JSON.stringify({__error__: String(e.message || e)}));\n}",
                ],
                [
                    'name' => 'solution.js',
                    'content' => $code,
                ],
            ];
        }

        return [];
    }

    protected function matches(mixed $actual, mixed $expected): bool
    {
        if ($actual === '[not executed]') {
            return false;
        }

        if (is_array($expected) || is_array($actual)) {
            return json_encode($actual) === json_encode($expected);
        }

        return (string) $actual === (string) $expected;
    }

    protected function staticEvaluate(string $code, mixed $input): string
    {
        if ($input !== null && is_string($input) && trim($input) !== '' && str_contains($code, 'return')) {
            $codeNormalized = preg_replace('/\s+/', '', $code);
            $inputNormalized = preg_replace('/\s+/', (string) $input);

            if ($codeNormalized !== '' && str_contains($codeNormalized, $inputNormalized)) {
                return $input;
            }
        }

        return '[not executed]';
    }
}