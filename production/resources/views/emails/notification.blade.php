<x-mail::message>
@if ($siteName)
<x-slot:header>
    <div style="text-align: center; padding: 12px 0;">
        @if ($siteLogo)
            <img src="{{ $siteLogo }}" alt="{{ $siteName }}" style="max-height: 56px; max-width: 180px; display: inline-block;">
        @else
            <span style="font-size: 20px; font-weight: bold; color: #0f172a;">{{ $siteName }}</span>
        @endif
        @if ($siteTagline)
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">{{ $siteTagline }}</div>
        @endif
    </div>
</x-slot:header>
@endif

# {{ $subjectLine }}

{{ $body }}

@if ($link)
<x-mail::button :url="$link">
Open
</x-mail::button>
@endif

Regards,<br>
{{ $siteName ?? config('app.name') }}

@if ($contact['phone'] || $contact['email'] || $contact['address'])
<x-slot:footer>
    <div style="text-align: center; font-size: 11px; color: #64748b; padding: 10px 0;">
        {{ $siteName ?? config('app.name') }}
        @if ($contact['phone']) · {{ $contact['phone'] }} @endif
        @if ($contact['email']) · {{ $contact['email'] }} @endif
        @if ($contact['address']) · {{ $contact['address'] }} @endif
        @if ($contact['hours']) <br>{{ $contact['hours'] }} @endif
    </div>
</x-slot:footer>
@endif
</x-mail::message>
