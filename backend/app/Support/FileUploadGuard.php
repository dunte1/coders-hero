<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

class FileUploadGuard
{
    public const DEFAULT_MAX_KB = 5120;

    /** @var array<string, list<string>> */
    public const PRESETS = [
        'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'],
        'media' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'mp3', 'wav'],
        'assignment' => ['pdf', 'doc', 'docx', 'txt', 'zip', 'png', 'jpg', 'jpeg'],
    ];

    /**
     * Validate an uploaded file against extension + size + path safety.
     *
     * @param  list<string>|string  $allowedExtensions
     * @return list<string> error messages (empty = valid)
     */
    public static function validate(?UploadedFile $file, array|string $allowedExtensions, int $maxKb = self::DEFAULT_MAX_KB): array
    {
        if (!$file || !$file->isValid()) {
            return ['Invalid uploaded file.'];
        }

        $allowed = is_string($allowedExtensions) ? (self::PRESETS[$allowedExtensions] ?? []) : $allowedExtensions;
        if (empty($allowed)) {
            return ['No allowed file types configured.'];
        }

        $errors = [];
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowed, true)) {
            $errors[] = 'Invalid file type. Allowed: ' . implode(', ', $allowed);
        }

        $mime = $file->getMimeType() ?: '';
        $mimeMap = [
            'pdf' => ['application/pdf'],
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'gif' => ['image/gif'],
            'webp' => ['image/webp'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'xls' => ['application/vnd.ms-excel'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'csv' => ['text/csv', 'application/csv', 'text/plain'],
            'txt' => ['text/plain'],
            'zip' => ['application/zip', 'application/x-zip-compressed'],
        ];
        if (isset($mimeMap[$extension]) && !in_array($mime, $mimeMap[$extension], true)) {
            $errors[] = 'File content does not match its extension.';
        }

        if ($file->getSize() > $maxKb * 1024) {
            $errors[] = "File size must not exceed {$maxKb}KB.";
        }

        $original = $file->getClientOriginalName();
        if (str_contains($original, '..') || str_contains($original, '/') || str_contains($original, '\\')) {
            $errors[] = 'Invalid filename.';
        }

        return $errors;
    }

    /**
     * Assert validation or throw ValidationException-style RuntimeException.
     */
    public static function assert(?UploadedFile $file, array|string $allowedExtensions, int $maxKb = self::DEFAULT_MAX_KB): void
    {
        $errors = self::validate($file, $allowedExtensions, $maxKb);
        if ($errors) {
            throw new \RuntimeException(implode(' ', $errors));
        }
    }
}
