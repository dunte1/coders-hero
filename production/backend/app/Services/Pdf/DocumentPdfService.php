<?php

namespace App\Services\Pdf;

use App\Models\SiteSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Renders branded PDF documents (header + footer with dynamic site branding)
 * and streams them as downloads. Used by exports, receipts, invoices,
 * payslips and ID cards so every generated document carries the same
 * organisation branding from the settings.
 */
class DocumentPdfService
{
    /**
     * Wrap a body HTML fragment in the branded document shell.
     */
    public function branded(string $title, string $content, array $options = []): string
    {
        $siteName = SiteSetting::siteName();
        $primaryColor = SiteSetting::sitePrimaryColor();
        $contact = SiteSetting::siteContact();

        $logo = SiteSetting::siteLogo();
        if ($logo && str_starts_with($logo, '/')) {
            $logo = url($logo);
        }

        return view('pdf.branded', [
            'siteName' => $siteName,
            'siteLogo' => $logo,
            'siteTagline' => SiteSetting::siteTagline(),
            'primaryColor' => $primaryColor,
            'contact' => $contact,
            'title' => $title,
            'documentNo' => $options['document_no'] ?? null,
            'generatedAt' => now()->format('M j, Y g:i A'),
            'content' => $content,
            'fontFamily' => $options['font_family'] ?? SiteSetting::getValue('branding.font_family', 'DejaVu Sans'),
        ])->render();
    }

    /**
     * Render an HTML string to PDF and stream it as a download.
     */
    public function stream(string $html, string $filename, string $orientation = 'portrait'): StreamedResponse
    {
        $pdf = Pdf::loadHTML($html);
        // Allow remote images so the branding logo and student photos render.
        $pdf->getDomPDF()->getOptions()->set('isRemoteEnabled', true);
        $pdf->setPaper('a4', $orientation);

        return response()->streamDownload(
            function () use ($pdf): void {
                echo $pdf->output();
            },
            $filename,
            ['Content-Type' => 'application/pdf']
        );
    }

    /**
     * Convenience: render a branded PDF from a content fragment and stream it.
     */
    public function download(string $title, string $content, string $filename, array $options = []): StreamedResponse
    {
        return $this->stream($this->branded($title, $content, $options), $filename, $options['orientation'] ?? 'portrait');
    }

    /**
     * Build a simple key/value details box.
     */
    public function detailsBox(array $rows): string
    {
        $cells = '';
        foreach ($rows as $label => $value) {
            if ($value === null || $value === '') {
                continue;
            }
            $cells .= '<tr><td>' . e((string) $label) . '</td><td>' . e((string) $value) . '</td></tr>';
        }

        return '<div class="doc-box"><table class="doc-dl">' . $cells . '</table></div>';
    }

    /**
     * Build a branded data table from headers + rows.
     */
    public function table(array $headers, array $rows): string
    {
        $head = '<tr>';
        foreach ($headers as $header) {
            $head .= '<th>' . e((string) $header) . '</th>';
        }
        $head .= '</tr>';

        $body = '';
        foreach ($rows as $row) {
            $body .= '<tr>';
            foreach ($row as $cell) {
                $body .= '<td>' . e((string) $cell) . '</td>';
            }
            $body .= '</tr>';
        }

        return '<table class="doc-table">' . $head . $body . '</table>';
    }
}
