# Code Runner Architecture

The LMS lets students write and execute Python/JavaScript code (coding exercises and the
Coding Playground). User code is **never executed on the Laravel application server**.
Instead it runs in an isolated, sandboxed execution engine — **Piston** by default.

```
┌────────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│  React frontend    │ HTTP │  Laravel API         │ HTTP │  Piston (Docker)    │
│  CodeMirror editor ─────▶ │  Playground/Exercise │─────▶│  isolated sandbox   │
│  Console output     ◀───── │  CodeRunnerContract │◀───── │  CPU/mem/network     │
└────────────────────┘      └──────────────────────┘      └─────────────────────┘
```

## Why an external runner

- Student submissions are untrusted input.
- Running arbitrary code inside the PHP process risks RCE, resource exhaustion, and
  interference with the application.
- The external runner enforces resource limits (runtime, compile time, memory) and
  network isolation at the container level.

## Components

### `App\Services\CodeRunner\CodeRunnerContract`

Interface every runner implements:

```php
run(array $files, ?string $stdin = null, int $timeout = null): array
languages(): array
isAvailable(): bool
```

The normalized `run()` result shape:

| Key         | Type    | Description                          |
|-------------|---------|--------------------------------------|
| `stdout`    | string  | Standard output of the program       |
| `stderr`    | string  | Standard error of the program        |
| `output`    | string  | Combined output                      |
| `exit_code` | int     | Process exit code                    |
| `timed_out` | bool    | True if the run exceeded the limit   |

### `PistonCodeRunner`

Talks to the [Piston](https://github.com/engineer-man/piston) HTTP API:

- `POST /execute` runs files: `{"language","version","files":[{"name","content"}],"stdin","compile_timeout","run_timeout","memory_limit"}`
- `GET /runtimes` lists installed language runtimes.
- Configures itself from `config('services.code_runner')`.
- Sends the bearer token (if `CODE_RUNNER_TOKEN` is set) to the engine.

### `NullCodeRunner`

Used when execution is disabled (`CODE_RUNNER_ENABLED=false` or no URL). It reports
`isAvailable() === false` and its `run()` throws `CodeRunnerUnavailableException`.
The playground responds **503**; exercise submissions degrade to a static fallback.

### Binding

`AppServiceProvider::register()` resolves `CodeRunnerContract` once per request:

- disabled / empty URL  → `NullCodeRunner`
- enabled              → `PistonCodeRunner`

## Configuration

`config/services.php` → `code_runner` block. Env vars (see `.env.example`):

| Env                              | Default  | Purpose                         |
|----------------------------------|----------|---------------------------------|
| `CODE_RUNNER_ENABLED`            | `false`  | Master switch                   |
| `CODE_RUNNER_URL`                | (empty)  | Piston base URL                 |
| `CODE_RUNNER_TOKEN`              | (empty)  | Optional bearer token           |
| `CODE_RUNNER_TIMEOUT`            | `30`     | HTTP timeout (seconds)          |
| `CODE_RUNNER_RUN_TIMEOUT_MS`     | `10000`  | Per-run CPU time budget (ms)    |
| `CODE_RUNNER_COMPILE_TIMEOUT_MS` | `15000`  | Compile time budget (ms)        |
| `CODE_RUNNER_MEMORY_LIMIT_KB`    | `256000` | Memory cap (KB, ~256 MB)        |

## Services using the runner

### `CodingExerciseService::evaluate()`

Runs a submission against each test case by building a `main.<ext>` file that feeds the
test input via stdin and compares stdout with the expected value:

- **Python**: `main.py` reads a JSON line from stdin, calls `solution(...)`, prints the result.
- **JavaScript**: `main.js` reads a JSON line from `process.stdin`, calls `solution(...)`, prints the result.

Outcome is mapped to one of:

| Status      | Meaning                                      |
|-------------|----------------------------------------------|
| `correct`   | Every test case passed                       |
| `partial`   | Some test cases passed                       |
| `incorrect` | No test cases passed (or runner unavailable) |
| `pending`   | Exercise has no test cases                   |

### `CodingPlaygroundService`

Free-form sandbox for experiments:

- `runCode()` → returns the normalized runner result.
- Workspaces are persisted per user (`coding_workspaces` table) with multi-file support.
  Created on `POST /api/lms/playground/workspaces`, updated on
  `PUT .../workspaces/{id}`, deleted on `DELETE .../workspaces/{id}`, loaded on
  `GET .../workspaces/{id}/load`. Ownership is enforced server-side.

## Running Piston locally (Docker)

Add the `code-runner` service to `docker-compose.yml` (see root file) using
`ghcr.io/engineer-man/piston`. Then:

```bash
docker compose up -d code-runner
docker compose exec code-runner /piston/pull-installations.sh python javascript
```

Enable it in the app environment:

```
CODE_RUNNER_ENABLED=true
CODE_RUNNER_URL=http://localhost:2000
```

## AI hint / debug (CodingAiService)

`POST /api/lms/coding-ai/hint` and `/debug` ask an LLM (OpenAI-compatible endpoint) for a
short hint or a debugging guide. If the provider is disabled or the call fails, they fall
back to rule-based local replies and set `meta.fallback = true` so the UI can label them
"offline hints".

## Security checklist

- [x] User code runs outside the Laravel process.
- [x] Runner unavailable ⇒ explicit 503 / graceful degradation, never in-process execution.
- [x] Workspace ownership checked per user.
- [x] Language whitelist enforced by FormRequest (`in:python,javascript`).
- [x] Timeouts and memory caps passed to the engine.
