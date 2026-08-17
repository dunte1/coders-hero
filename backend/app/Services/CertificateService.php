<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\CertificateVerification;
use App\Models\Enrollment;
use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\Notifications\NotificationDispatcher;

class CertificateService
{
    public function summary(): array
    {
        return [
            'total_certificates' => Certificate::count(),
            'issued_certificates' => Certificate::issued()->count(),
            'revoked_certificates' => Certificate::revoked()->count(),
            'total_templates' => CertificateTemplate::count(),
            'active_templates' => CertificateTemplate::active()->count(),
            'total_verifications' => CertificateVerification::count(),
            'recent_verifications' => CertificateVerification::with('certificate')->latest('verified_at')->take(5)->get(),
        ];
    }

    // ---- Templates ----

    public function templates(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return CertificateTemplate::query()
            ->withCount('certificates')
            ->search($filters['search'] ?? null)
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function allTemplates(): \Illuminate\Database\Eloquent\Collection
    {
        return CertificateTemplate::active()->orderBy('name')->get();
    }

    public function showTemplate(int $id): CertificateTemplate
    {
        return CertificateTemplate::query()->withCount('certificates')->findOrFail($id);
    }

    public function storeTemplate(array $data): CertificateTemplate
    {
        $data['created_by_user_id'] = auth()->id();
        $data['slug'] = Str::slug($data['name'] ?? 'template') . '-' . Str::lower(Str::random(4));

        if (! empty($data['is_default'])) {
            CertificateTemplate::where('is_default', true)->update(['is_default' => false]);
        }

        return CertificateTemplate::create($data);
    }

    public function updateTemplate(int $id, array $data): CertificateTemplate
    {
        $template = CertificateTemplate::findOrFail($id);

        if (! empty($data['is_default'])) {
            CertificateTemplate::where('is_default', true)->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $template->update($data);

        return $template->fresh();
    }

    public function destroyTemplate(int $id): bool
    {
        $template = CertificateTemplate::findOrFail($id);

        if ($template->certificates()->exists()) {
            throw new \InvalidArgumentException('Cannot delete a template that is in use.');
        }

        return (bool) $template->delete();
    }

    public function renderTemplateHtml(CertificateTemplate $template, Certificate $certificate): string
    {
        $holder = $certificate->user?->name ?? 'Certificate Holder';
        $course = $certificate->course?->title ?? 'Course';

        $body = $template->body_html ?: <<<'HTML'
            <h1>Certificate of Completion</h1>
            <p>This is to certify that</p>
            <h2>{{ holder }}</h2>
            <p>has successfully completed the course</p>
            <h3>{{ course }}</h3>
            <p>Certificate Number: <strong>{{ certificate_number }}</strong></p>
            <p>Verification Code: <strong>{{ verification_code }}</strong></p>
            <p>Issued on {{ issued_at }}</p>
        HTML;

        return str_replace(
            [
                '{{ holder }}',
                '{{ course }}',
                '{{ certificate_number }}',
                '{{ verification_code }}',
                '{{ issued_at }}',
            ],
            [
                e($holder),
                e($course),
                e($certificate->certificate_number),
                e($certificate->verification_code),
                $certificate->issued_at?->format('j F Y') ?? now()->format('j F Y'),
            ],
            $body
        );
    }

    // ---- QR ----

    public function generateQrSvg(string $verificationCode): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(240, 2),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);

        return $writer->writeString(url('/verify-certificate/' . $verificationCode));
    }

    public function generateQrDataUrl(string $verificationCode): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(240, 2),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $svg = $writer->writeString(url('/verify-certificate/' . $verificationCode));

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    // ---- Issue ----

    public function issue(int $enrollmentId, ?int $templateId = null, ?string $issuedByUserId = null): Certificate
    {
        $enrollment = Enrollment::with(['user', 'course'])->findOrFail($enrollmentId);

        $existing = Certificate::where('enrollment_id', $enrollmentId)->first();
        if ($existing) {
            return $existing;
        }

        $template = $templateId
            ? CertificateTemplate::findOrFail($templateId)
            : CertificateTemplate::where('is_default', true)->first()
                ?? CertificateTemplate::first();

        $certificateNumber = 'CH-' . strtoupper(Str::random(4)) . '-' . now()->format('Y') . '-' . str_pad((string) $enrollmentId, 5, '0', STR_PAD_LEFT);
        $verificationCode = Str::random(32);
        $qrCode = 'QR-' . strtoupper(Str::random(12));

        $certificate = Certificate::create([
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollmentId,
            'template_id' => $template?->id,
            'certificate_number' => $certificateNumber,
            'issued_at' => now(),
            'verification_code' => $verificationCode,
            'qr_code' => $qrCode,
            'digital_signature' => $template?->signature_name ?: null,
            'status' => 'issued',
            'issued_by_user_id' => $issuedByUserId ?? auth()->id(),
        ]);

        $this->renderPdf($certificate);

        \App\Jobs\SendNotificationJob::dispatch(
            $enrollment->user_id,
            'Certificate Generated!',
            'Your course completion certificate has been generated. Download it from your certificates page.',
            'certificate_generated'
        );

        app(NotificationDispatcher::class)->notify(
            $enrollment->user,
            'certificate.issued',
            [
                'title' => 'Certificate issued for ' . ($enrollment->course?->title ?? 'your course'),
                'course_name' => $enrollment->course?->title ?? 'your course',
                'certificate_number' => $certificateNumber,
                'user_name' => $enrollment->user?->name ?? 'there',
                'date' => now()->format('M j, Y'),
            ],
            "/certificates/{$certificate->id}"
        );

        activity()
            ->performedOn($certificate)
            ->event('certificate_issued')
            ->withProperties([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'certificate_number' => $certificateNumber,
            ])
            ->log('Certificate issued for course completion');

        return $certificate->fresh()->load(['user', 'course', 'template']);
    }

    public function bulkGenerate(int $courseId, ?int $templateId = null): array
    {
        $completedEnrollments = Enrollment::query()
            ->with(['user', 'course'])
            ->where('course_id', $courseId)
            ->where('status', 'completed')
            ->whereDoesntHave('certificate')
            ->get();

        $created = 0;
        foreach ($completedEnrollments as $enrollment) {
            $this->issue($enrollment->id, $templateId);
            $created++;
        }

        return [
            'generated' => $created,
            'skipped' => $completedEnrollments->count() - $created,
        ];
    }

    // ---- PDF ----

    public function renderPdf(Certificate $certificate): string
    {
        $template = $certificate->template;
        $certificate->loadMissing(['user', 'course', 'template']);

        $bodyHtml = $this->renderTemplateHtml($template ?? new CertificateTemplate([
            'accent_color' => '#6366f1',
            'font_family' => 'DejaVu Sans',
        ]), $certificate);

        $html = view('certificates.pdf', [
            'certificate' => $certificate,
            'bodyHtml' => $bodyHtml,
            'accentColor' => $template?->accent_color ?? '#6366f1',
            'fontFamily' => $template?->font_family ?? 'DejaVu Sans',
            'qrCode' => $this->generateQrSvg($certificate->verification_code),
            'signatureName' => $template?->signature_name ?? $certificate->digital_signature,
            'signatureTitle' => $template?->signature_title,
        ])->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'landscape');

        $path = 'certificates/' . $certificate->id . '-' . Str::slug($certificate->certificate_number) . '.pdf';
        Storage::disk('public')->put($path, $pdf->output());

        if ($certificate->certificate_url && $certificate->certificate_url !== $path) {
            Storage::disk('public')->delete($certificate->certificate_url);
        }

        $certificate->update(['certificate_url' => $path]);

        return $path;
    }

    public function downloadStream(string $certificateNumber)
    {
        $certificate = Certificate::where('certificate_number', $certificateNumber)->firstOrFail();

        if ($certificate->certificate_url && Storage::disk('public')->exists($certificate->certificate_url)) {
            return Storage::disk('public')->download($certificate->certificate_url);
        }

        // Regenerate on demand.
        $path = $this->renderPdf($certificate);

        return Storage::disk('public')->download($path);
    }

    // ---- Revoke ----

    public function revoke(int $id, ?string $reason = null): Certificate
    {
        $certificate = Certificate::findOrFail($id);

        if ($certificate->isRevoked()) {
            throw new \InvalidArgumentException('This certificate is already revoked.');
        }

        $certificate->update([
            'status' => 'revoked',
            'revoked_at' => now(),
            'revoked_by_user_id' => auth()->id(),
            'revoked_reason' => $reason,
        ]);

        activity()
            ->performedOn($certificate)
            ->event('certificate_revoked')
            ->withProperties([
                'certificate_number' => $certificate->certificate_number,
                'reason' => $reason,
            ])
            ->log('Certificate revoked');

        return $certificate->fresh();
    }

    public function unrevoke(int $id): Certificate
    {
        $certificate = Certificate::findOrFail($id);

        if (! $certificate->isRevoked()) {
            throw new \InvalidArgumentException('This certificate is not revoked.');
        }

        $certificate->update([
            'status' => 'issued',
            'revoked_at' => null,
            'revoked_by_user_id' => null,
            'revoked_reason' => null,
        ]);

        return $certificate->fresh();
    }

    // ---- Verify ----

    public function verify(string $verificationCode, ?string $ip = null, ?string $userAgent = null): array
    {
        $certificate = Certificate::with(['user', 'course', 'course.category', 'template'])
            ->where('verification_code', $verificationCode)
            ->first();

        if (! $certificate) {
            throw new \InvalidArgumentException('Invalid verification code.');
        }

        CertificateVerification::create([
            'certificate_id' => $certificate->id,
            'verifier_ip' => $ip,
            'verifier_user_agent' => $userAgent ? Str::limit($userAgent, 250) : null,
            'verified_at' => now(),
            'outcome' => $certificate->isRevoked() ? 'revoked' : 'valid',
        ]);

        return [
            'valid' => ! $certificate->isRevoked(),
            'revoked' => $certificate->isRevoked(),
            'revoked_reason' => $certificate->revoked_reason,
            'certificate_number' => $certificate->certificate_number,
            'holder_name' => $certificate->user?->name,
            'course' => $certificate->course?->title,
            'issued_at' => $certificate->issued_at?->toDateString(),
            'template_name' => $certificate->template?->name,
            'verification_count' => $certificate->verifications()->count(),
        ];
    }

    // ---- Index ----

    public function index(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Certificate::query()
            ->with(['user', 'course', 'template'])
            ->withCount('verifications')
            ->when(($filters['status'] ?? null) && $filters['status'] !== 'all', fn (Builder $q) => $q->where('status', $filters['status']))
            ->when(($filters['course_id'] ?? null), fn (Builder $q, $courseId) => $q->where('course_id', (int) $courseId))
            ->when(($filters['search'] ?? null), function (Builder $q, $term) {
                $q->where(function (Builder $inner) use ($term) {
                    $inner->where('certificate_number', 'like', "%{$term}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%"));
                });
            })
            ->orderByDesc('issued_at')
            ->paginate($perPage);
    }

    public function myCertificates(?string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Certificate::query()
            ->with(['course', 'course.category', 'template'])
            ->where('user_id', $userId)
            ->orderByDesc('issued_at')
            ->paginate($perPage);
    }

    public function verifications(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return CertificateVerification::query()
            ->with(['certificate.course', 'certificate.user'])
            ->when(($filters['outcome'] ?? null) && $filters['outcome'] !== 'all', fn (Builder $q) => $q->where('outcome', $filters['outcome']))
            ->orderByDesc('verified_at')
            ->paginate($perPage);
    }
}
