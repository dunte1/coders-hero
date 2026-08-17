<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: {{ $fontFamily ?? 'DejaVu Sans' }}, 'DejaVu Sans', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 12px;
        }
        .doc-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            border-bottom: 3px solid {{ $primaryColor }};
            padding: 14px 40px;
            background: #ffffff;
        }
        .doc-header-inner { display: flex; justify-content: space-between; align-items: center; }
        .doc-brand { display: flex; align-items: center; gap: 10px; }
        .doc-brand img { max-height: 44px; max-width: 140px; }
        .doc-brand-name { font-size: 18px; font-weight: bold; color: #0f172a; }
        .doc-brand-tagline { font-size: 10px; color: #64748b; margin-top: 2px; }
        .doc-meta { text-align: right; }
        .doc-meta .doc-title { font-size: 15px; font-weight: bold; color: {{ $primaryColor }}; }
        .doc-meta .doc-ref { font-size: 10px; color: #64748b; margin-top: 3px; }
        .doc-body {
            margin: 86px 40px 64px;
        }
        .doc-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #f8fafc;
            border-top: 3px solid {{ $primaryColor }};
            padding: 8px 40px;
            font-size: 9px;
            color: #64748b;
        }
        .doc-footer-inner { display: flex; justify-content: space-between; align-items: center; }
        .doc-footer .contact { color: #334155; }
        .doc-footer .contact span { margin: 0 6px; }
        .doc-footer .pages { font-weight: bold; color: #334155; }
        table.doc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
        }
        table.doc-table th {
            background: {{ $primaryColor }};
            color: #ffffff;
            text-align: left;
            padding: 6px 8px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        table.doc-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        table.doc-table tr:nth-child(even) td { background: #f8fafc; }
        .doc-section { margin-bottom: 22px; }
        .doc-section-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            border-left: 4px solid {{ $primaryColor }};
            padding-left: 8px;
            margin-bottom: 10px;
        }
        .doc-box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
            background: #ffffff;
        }
        .doc-dl { width: 100%; }
        .doc-dl td { padding: 4px 6px; vertical-align: top; }
        .doc-dl td:first-child { color: #64748b; width: 38%; }
        .doc-dl td:last-child { font-weight: 600; color: #0f172a; }
        .doc-total {
            border-top: 2px solid {{ $primaryColor }};
            padding-top: 8px;
            margin-top: 8px;
            font-weight: bold;
        }
        .doc-badge {
            display: inline-block;
            background: {{ $primaryColor }};
            color: #ffffff;
            border-radius: 10px;
            padding: 2px 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-muted { color: #64748b; }
        .mt-2 { margin-top: 8px; }
        .mt-4 { margin-top: 16px; }
    </style>
</head>
<body>

    <div class="doc-header">
        <div class="doc-header-inner">
            <div class="doc-brand">
                @if ($siteLogo)
                    <img src="{{ $siteLogo }}" alt="{{ $siteName }}">
                @endif
                <div>
                    <div class="doc-brand-name">{{ $siteName }}</div>
                    @if ($siteTagline)
                        <div class="doc-brand-tagline">{{ $siteTagline }}</div>
                    @endif
                </div>
            </div>
            <div class="doc-meta">
                <div class="doc-title">{{ $title }}</div>
                @if ($documentNo)
                    <div class="doc-ref">{{ $documentNo }}</div>
                @endif
                <div class="doc-ref">Generated {{ $generatedAt }}</div>
            </div>
        </div>
    </div>

    <div class="doc-body">
        {!! $content !!}
    </div>

    <div class="doc-footer">
        <div class="doc-footer-inner">
            <div class="contact">
                @if ($contact['phone'])
                    <span>Tel: {{ $contact['phone'] }}</span>
                @endif
                @if ($contact['email'])
                    <span>Email: {{ $contact['email'] }}</span>
                @endif
                @if ($contact['address'])
                    <span>{{ $contact['address'] }}</span>
                @endif
            </div>
            <div class="pages">{{ $siteName }} · Page {PAGE_NUM} of {PAGE_COUNT}</div>
        </div>
    </div>

</body>
</html>
