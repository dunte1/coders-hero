<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: {{ $fontFamily }}, 'DejaVu Sans', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }
        .certificate {
            border: 14px solid {{ $accentColor }};
            border-radius: 12px;
            padding: 40px 50px;
            min-height: 100%;
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            inset: 10px;
            border: 2px solid {{ $accentColor }};
            border-radius: 6px;
            opacity: 0.35;
            pointer-events: none;
        }
        .header { text-align: center; margin-bottom: 24px; }
        .badge { font-size: 16px; letter-spacing: 6px; text-transform: uppercase; color: {{ $accentColor }}; font-weight: bold; }
        .title { font-size: 34px; font-weight: bold; margin: 8px 0 4px; color: #0f172a; }
        .subtitle { font-size: 14px; color: #64748b; }
        .body { text-align: center; margin: 28px 0; }
        .body p { font-size: 15px; color: #475569; margin: 10px 0; }
        .holder {
            font-size: 30px;
            font-weight: bold;
            color: #0f172a;
            margin: 16px 0;
            border-bottom: 2px solid {{ $accentColor }};
            display: inline-block;
            padding: 0 30px 10px;
        }
        .course-name { font-size: 22px; font-weight: bold; color: {{ $accentColor }}; margin-top: 6px; }
        .details { margin-top: 26px; font-size: 12px; color: #64748b; }
        .details strong { color: #334155; }
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 34px;
        }
        .signature { text-align: center; }
        .signature .name { font-weight: bold; font-size: 14px; color: #0f172a; margin-top: 4px; }
        .signature .title { font-size: 11px; color: #64748b; font-weight: normal; }
        .signature-line { border-top: 1.5px solid #334155; width: 200px; margin: 0 auto; }
        .qr { text-align: center; }
        .qr svg { width: 90px; height: 90px; }
        .qr-code-label { font-size: 10px; color: #64748b; margin-top: 2px; }
        .verification-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 8px; }
        .site-logo { max-height: 56px; max-width: 160px; margin: 0 auto 6px; object-fit: contain; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            @if (!empty($siteLogo))
                <img src="{{ $siteLogo }}" alt="{{ $siteName }}" class="site-logo">
            @else
                <div class="badge">{{ $siteName }}</div>
            @endif
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">This certificate is proudly presented to</div>
        </div>

        <div class="body">
            <div class="holder">{{ $certificate->user->name ?? 'Certificate Holder' }}</div>
            <p>for successfully completing the course</p>
            <div class="course-name">{{ $certificate->course->title ?? 'Course' }}</div>
            <div class="details">
                Certificate Number: <strong>{{ $certificate->certificate_number }}</strong><br>
                Issued on <strong>{{ $certificate->issued_at?->format('j F Y') ?? now()->format('j F Y') }}</strong>
            </div>
        </div>

        <div class="footer">
            <div class="signature">
                <div class="signature-line"></div>
                @if ($signatureName)
                    <div class="name">{{ $signatureName }}</div>
                    @if ($signatureTitle)
                        <div class="title">{{ $signatureTitle }}</div>
                    @endif
                @else
                    <div class="title">Authorised Signature</div>
                @endif
            </div>

            <div class="qr">
                {!! $qrCode !!}
                <div class="qr-code-label">Scan to verify</div>
            </div>
        </div>

        <div class="verification-note">
            Verify this certificate at {{ url('/verify-certificate/' . $certificate->verification_code) }}
        </div>
    </div>
</body>
</html>
