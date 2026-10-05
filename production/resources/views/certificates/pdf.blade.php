<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        * { box-sizing: border-box; }
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: {{ $fontFamily }}, 'DejaVu Sans', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }
        .certificate {
            position: absolute;
            top: 8mm;
            left: 8mm;
            right: 8mm;
            bottom: 8mm;
            border: 3px solid {{ $accentColor }};
            border-radius: 10px;
            padding: 16mm 20mm 14mm;
            overflow: hidden;
            background: #ffffff;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 3mm;
            left: 3mm;
            right: 3mm;
            bottom: 3mm;
            border: 1.5px solid {{ $accentColor }};
            border-radius: 6px;
            opacity: 0.45;
            pointer-events: none;
        }
        .top-band {
            text-align: center;
            margin-bottom: 8mm;
        }
        .org-name {
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: {{ $accentColor }};
            margin-bottom: 4px;
        }
        .org-logo {
            display: block;
            max-height: 14mm;
            max-width: 60mm;
            margin: 0 auto 3mm;
            object-fit: contain;
        }
        .accent-rule {
            border: 0;
            border-top: 1.5px solid {{ $accentColor }};
            width: 70mm;
            margin: 0 auto 1mm;
            opacity: 0.6;
        }
        .accent-rule .diamond {
            display: inline-block;
            width: 3mm;
            height: 3mm;
            background: {{ $accentColor }};
            transform: rotate(45deg);
            margin-top: -2mm;
        }
        .title-row { text-align: center; margin-bottom: 2mm; }
        .overline {
            font-size: 14px;
            letter-spacing: 6px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
        }
        .title {
            font-size: 34px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 2px;
            margin: 2mm 0 1mm;
        }
        .title .accent { color: {{ $accentColor }}; }
        .body { text-align: center; margin: 5mm 0 6mm; }
        .body .intro {
            font-size: 15px;
            color: #64748b;
            margin: 0 0 3mm;
            letter-spacing: 1px;
        }
        .holder {
            font-family: 'DejaVu Serif', Georgia, serif;
            font-size: 30px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 3mm;
        }
        .body .outro {
            font-size: 15px;
            color: #475569;
            margin: 0 0 4mm;
        }
        .course-name {
            font-size: 22px;
            font-weight: 700;
            color: {{ $accentColor }};
            margin: 0;
        }
        .details {
            margin: 6mm auto 0;
            width: 150mm;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            padding: 3mm 0;
            font-size: 12px;
            color: #64748b;
        }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 0 4mm; text-align: center; }
        .details .label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
        .details .value { display: block; font-weight: 700; color: #334155; font-size: 13px; margin-top: 1mm; }
        .footer {
            position: absolute;
            left: 20mm;
            right: 20mm;
            bottom: 14mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .signature { text-align: center; }
        .signature .sig-image { max-height: 16mm; max-width: 40mm; margin: 0 auto; display: block; }
        .signature-line { border-top: 1.5px solid #475569; width: 44mm; margin: 0 auto 2mm; }
        .signature .name {
            font-family: 'DejaVu Serif', Georgia, serif;
            font-style: italic;
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
        }
        .signature .title { font-size: 11px; color: #64748b; margin-top: 1mm; letter-spacing: 1px; text-transform: uppercase; }
        .qr { text-align: center; }
        .qr img { width: 26mm; height: 26mm; }
        .badge-section {
            text-align: center;
            margin: 5mm auto 0;
            width: 120mm;
        }
        .badge-icon {
            display: inline-block;
            width: 14mm;
            height: 14mm;
            border-radius: 50%;
            text-align: center;
            line-height: 14mm;
            margin-bottom: 2mm;
        }
        .badge-icon svg {
            width: 8mm;
            height: 8mm;
            vertical-align: middle;
        }
        .badge-name {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="top-band">
            @if (!empty($siteLogo))
                <img src="{{ $siteLogo }}" alt="{{ $siteName }}" class="org-logo">
            @else
                <div class="org-name">{{ $siteName }}</div>
            @endif
        </div>

        <div class="title-row">
            <div class="overline">Certificate</div>
            <div class="title">of <span class="accent">Completion</span></div>
            <hr class="accent-rule">
        </div>

        <div class="body">
            <p class="intro">This is to proudly certify that</p>
            <div class="holder">{{ $certificate->user->name ?? 'Certificate Holder' }}</div>
            <p class="outro">has successfully completed the course</p>
            <div class="course-name">{{ $certificate->course->title ?? 'Course' }}</div>

            <div class="details">
                <table>
                    <tr>
                        <td>
                            <span class="label">Certificate No.</span>
                            <span class="value">{{ $certificate->certificate_number }}</span>
                        </td>
                        <td>
                            <span class="label">Issued on</span>
                            <span class="value">{{ $certificate->issued_at?->format('j F Y') ?? now()->format('j F Y') }}</span>
                        </td>
                        <td>
                            <span class="label">Verification Code</span>
                            <span class="value">{{ $certificate->verification_code }}</span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        @if (!empty($badgeName))
            <div class="badge-section">
                <div class="badge-icon" style="background: {{ $badgeColor }}15;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="{{ $badgeColor }}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
                <div class="badge-name" style="color: {{ $badgeColor }};">{{ $badgeName }}</div>
            </div>
        @endif

        <div class="footer">
            <div class="signature">
                @if (!empty($signatureImage))
                    <img src="{{ $signatureImage }}" alt="Signature" class="sig-image">
                @else
                    <div class="signature-line"></div>
                @endif
                @if ($signatureName)
                    <div class="name">{{ $signatureName }}</div>
                    @if ($signatureTitle)
                        <div class="title">{{ $signatureTitle }}</div>
                    @endif
                @else
                    <div class="name">Authorised Signature</div>
                @endif
            </div>

            <div class="qr">
                <img src="{{ $qrCode }}" alt="QR code">
            </div>
        </div>
    </div>
</body>
</html>
