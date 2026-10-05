<?php
/**
 * Standalone seed + email test script.
 * Access: https://coderhero.duncowebsolutions.co.ke/seed_email.php?secret=SEED2026
 */
$secret = $_GET['secret'] ?? '';
if ($secret !== 'SEED2026') {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}

$backendPath = __DIR__ . '/coders-hero/backend';
require $backendPath . '/vendor/autoload.php';
$app = require_once $backendPath . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

$now = Carbon::now()->toDateTimeString();
$output = [];

// Step 1: Seed notification templates
$templates = [
    [
        'event' => 'payment.confirmed',
        'name' => 'Payment Confirmed',
        'description' => 'Sends a branded receipt to the payer when a payment is received and confirmed.',
        'category' => 'fees',
        'subject' => 'Payment Confirmed - Receipt #{{receipt_no}}',
        'body' => 'Hello {{user_name}}, your payment of KES {{amount}} has been received. Receipt: {{receipt_no}}. Method: {{method}}. Reference: {{reference}}.',
        'channels' => json_encode(['in_app', 'email']),
        'is_active' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ],
    [
        'event' => 'payment.admin_alert',
        'name' => 'Payment Received (Admin Alert)',
        'description' => 'Notifies admins when a payment is received from a student or parent.',
        'category' => 'fees',
        'subject' => 'Payment Received - KES {{amount}} from {{student_name}}',
        'body' => 'Hello Admin, a payment of KES {{amount}} has been received from {{student_name}}. Receipt: {{receipt_no}}. Method: {{method}}.',
        'channels' => json_encode(['in_app', 'email']),
        'is_active' => 1,
        'created_at' => $now,
        'updated_at' => $now,
    ],
];

$count = 0;
foreach ($templates as $t) {
    $exists = DB::table('notification_templates')->where('event', $t['event'])->first();
    if ($exists) {
        DB::table('notification_templates')->where('event', $t['event'])->update([
            'name' => $t['name'],
            'description' => $t['description'],
            'category' => $t['category'],
            'subject' => $t['subject'],
            'body' => $t['body'],
            'channels' => $t['channels'],
            'updated_at' => $now,
        ]);
    } else {
        DB::table('notification_templates')->insert($t);
    }
    $count++;
}
$output[] = "Seeded {$count} notification templates.";

// Step 2: Send test payment confirmation email
$testEmail = 'dunthecan02@gmail.com';

$payment = new \App\Models\Payment();
$payment->receipt_no = 'RCPT-MPESATEST001';
$payment->amount = 1.00;
$payment->method = 'mpesa';
$payment->reference = 'QHK73J4BML';
$payment->paid_at = now();

$student = \App\Models\Student::first();
$invoice = \App\Models\Invoice::first();

if ($invoice) {
    $payment->invoice_id = $invoice->id;
    $payment->setRelation('invoice', $invoice);
}
$payment->setRelation('fee', null);
$payment->setRelation('mpesaTransaction', null);

try {
    Mail::to($testEmail)->send(
        new \App\Notifications\PaymentConfirmationNotification($payment)
    );
    $output[] = "Payment confirmation email sent to {$testEmail}!";
    $output[] = "Receipt No: RCPT-MPESATEST001";
    $output[] = "Amount: KES 1.00";
    $output[] = "Method: M-Pesa";
    $output[] = "Reference: QHK73J4BML";
} catch (\Throwable $e) {
    $output[] = "Email error: " . $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode(['success' => true, 'output' => $output], JSON_PRETTY_PRINT);
