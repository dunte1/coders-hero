<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page { size: A4 landscape; margin: 0; }
        body {
            font-family: {{ $fontFamily }}, 'DejaVu Sans', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }
        .certificate {
            border: 4px solid {{ $accentColor }};
            border-radius: 8px;
            padding: 18px 30px 12px;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        }
        .certificate::before {
            content: '';
            position: absolute;
            inset: 4px;
            border: 1px solid {{ $accentColor }};
            border-radius: 4px;
            opacity: 0.3;
            pointer-events: none;
        }
        .header { text-align: center; margin-bottom: 12px; }
        .badge { font-size: 16px; letter-spacing: 6px; text-transform: uppercase; color: {{ $accentColor }}; font-weight: bold; }
        .title { font-size: 34px; font-weight: bold; margin: 4px 0 2px; color: #0f172a; }
        .subtitle { font-size: 14px; color: #64748b; }
        .body { text-align: center; margin: 14px 0; }
        .body p { font-size: 15px; color: #475569; margin: 6px 0; }
        .holder {
            font-size: 30px;
            font-weight: bold;
            color: #0f172a;
            margin: 8px 0;
            border-bottom: 2px solid {{ $accentColor }};
            display: inline-block;
            padding: 0 28px 6px;
        }
        .course-name { font-size: 22px; font-weight: bold; color: {{ $accentColor }}; margin-top: 4px; }
        .details { margin-top: 10px; font-size: 12px; color: #64748b; }
        .details strong { color: #334155; }
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 16px;
        }
        .signature { text-align: center; }
        .signature .name { font-weight: bold; font-size: 14px; color: #0f172a; margin-top: 3px; }
        .signature .title { font-size: 11px; color: #64748b; font-weight: normal; }
        .signature-line { border-top: 1.5px solid #334155; width: 180px; margin: 0 auto; }
        .qr { text-align: center; }
        .qr svg { width: 80px; height: 80px; }
        .qr-code-label { font-size: 10px; color: #64748b; margin-top: 2px; }
        .verification-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 4px; }
        .site-logo { max-height: 50px; max-width: 140px; margin: 0 auto 4px; object-fit: contain; }
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
                Certificate Number: <strong>{{ $certificate->certificate_number }}</strong> &nbsp;&bull;&nbsp;
                Issued on <strong>{{ $certificate->issued_at?->format('j F Y') ?? now()->format('j F Y') }}</strong>
            </div>
        </div>

        <div class="footer">
            <div class="signature">
                @if (!empty($signatureImage))
                    <img src="{{ $signatureImage }}" alt="Signature" style="max-height: 50px; max-width: 160px; margin: 0 auto; display: block;">
                @else
                    <div class="signature-line"></div>
                @endif
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
            Verify at {{ url('/verify-certificate/' . $certificate->verification_code) }}
        </div>
    </div>
</body>
</html>