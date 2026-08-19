<?php

namespace App\Services\Website;

use Illuminate\Support\Str;

class MediaService
{
    public function store(?string $data, string $folder = 'cms'): ?string
    {
        if ($data === null || trim($data) === '') {
            return null;
        }

        if (Str::startsWith($data, 'http')) {
            return $data;
        }

        if (Str::startsWith($data, 'data:image')) {
            $parts = explode(',', $data, 2);
            $meta = $parts[0] ?? '';
            $extension = $this->extensionFromMeta($meta);
            $imageData = $parts[1] ?? '';

            if ($imageData !== '' && ($decoded = base64_decode($imageData, true)) !== false) {
                $filename = $folder . '/' . Str::uuid() . '.' . $extension;
                \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $decoded);

                return $filename;
            }
        }

        return trim($data);
    }

    private function extensionFromMeta(string $meta): string
    {
        if (preg_match('/data:image\/([a-zA-Z0-9]+)/', $meta, $matches)) {
            return in_array($matches[1], ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']) ? $matches[1] : 'png';
        }

        return 'png';
    }
}
