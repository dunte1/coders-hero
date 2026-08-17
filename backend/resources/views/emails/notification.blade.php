<x-mail::message>
# {{ $subjectLine }}

{{ $body }}

@if ($link)
<x-mail::button :url="$link">
Open
</x-mail::button>
@endif

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
