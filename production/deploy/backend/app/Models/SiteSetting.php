<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'is_public',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Read a single site setting by dotted key (e.g. "general.site_name"),
     * falling back to the provided default when unset or empty.
     */
    public static function getValue(string $key, ?string $default = null): ?string
    {
        $value = static::where('key', $key)->value('value');

        return $value !== null && $value !== '' ? (string) $value : $default;
    }

    /**
     * Branded site name from settings, falling back to the product name.
     */
    public static function siteName(): string
    {
        return static::getValue('general.site_name', "Coder's Hero");
    }

    /**
     * Branded logo URL from settings.
     */
    public static function siteLogo(): ?string
    {
        return static::getValue('branding.logo');
    }

    /**
     * Branded tagline from settings.
     */
    public static function siteTagline(): ?string
    {
        return static::getValue('general.tagline');
    }

    /**
     * Branded primary color from settings, falling back to the default indigo.
     */
    public static function sitePrimaryColor(): string
    {
        return static::getValue('branding.primary_color', '#4F46E5');
    }

    /**
     * Contact details for document footers (phone, email, address, hours).
     */
    public static function siteContact(): array
    {
        return [
            'phone' => static::getValue('general.phone'),
            'email' => static::getValue('general.email'),
            'address' => static::getValue('general.address'),
            'hours' => static::getValue('general.hours'),
        ];
    }
}
