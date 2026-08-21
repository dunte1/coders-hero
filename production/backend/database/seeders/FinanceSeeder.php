<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('admin')->first();

        $structures = [
            [
                'name' => 'Tuition - Term 1',
                'fee_type' => 'tuition',
                'amount' => 20000,
                'term' => 'Term 1',
                'grade_level' => null,
                'description' => 'Tuition fees for Term 1.',
                'is_active' => true,
            ],
            [
                'name' => 'Tuition - Term 2',
                'fee_type' => 'tuition',
                'amount' => 20000,
                'term' => 'Term 2',
                'grade_level' => null,
                'description' => 'Tuition fees for Term 2.',
                'is_active' => true,
            ],
            [
                'name' => 'Transport - Term 1',
                'fee_type' => 'transport',
                'amount' => 3500,
                'term' => 'Term 1',
                'grade_level' => null,
                'description' => 'School transport for Term 1.',
                'is_active' => true,
            ],
            [
                'name' => 'ICT Lab Fee - Term 1',
                'fee_type' => 'activity',
                'amount' => 1500,
                'term' => 'Term 1',
                'grade_level' => 'Grade 7',
                'description' => 'ICT laboratory activity fee for Grade 7.',
                'is_active' => true,
            ],
        ];

        foreach ($structures as $data) {
            FeeStructure::firstOrCreate(
                ['name' => $data['name']],
                array_merge($data, ['created_by_user_id' => $admin?->id])
            );
        }

        $tuition = FeeStructure::where('name', 'Tuition - Term 1')->first();
        $transport = FeeStructure::where('name', 'Transport - Term 1')->first();

        $students = Student::query()->active()->orderBy('student_id')->limit(6)->get();

        foreach ($students as $index => $student) {
            $invoice = Invoice::firstOrCreate(
                ['invoice_no' => 'INV-' . now()->format('Y') . '-' . strtoupper(Str::random(8))],
                [
                    'student_id' => $student->id,
                    'fee_structure_id' => $tuition?->id,
                    'term' => 'Term 1',
                    'description' => $tuition?->name,
                    'amount' => (float) ($tuition?->amount ?? 20000),
                    'paid_amount' => 0,
                    'status' => 'issued',
                    'due_date' => now()->addDays(30),
                    'issued_at' => now(),
                    'created_by_user_id' => $admin?->id,
                ]
            );

            $invoice->items()->firstOrCreate(
                ['description' => $tuition?->name ?? 'Tuition - Term 1'],
                ['amount' => (float) ($tuition?->amount ?? 20000), 'qty' => 1, 'total' => (float) ($tuition?->amount ?? 20000)]
            );

            if ($transport && ($index === 0 || $index === 1)) {
                $transportInvoice = Invoice::firstOrCreate(
                    ['invoice_no' => 'INV-' . now()->format('Y') . '-' . strtoupper(Str::random(8))],
                    [
                        'student_id' => $student->id,
                        'fee_structure_id' => $transport->id,
                        'term' => 'Term 1',
                        'description' => $transport->name,
                        'amount' => (float) $transport->amount,
                        'paid_amount' => 0,
                        'status' => 'issued',
                        'due_date' => now()->addDays(30),
                        'issued_at' => now(),
                        'created_by_user_id' => $admin?->id,
                    ]
                );

                $transportInvoice->items()->firstOrCreate(
                    ['description' => $transport->name],
                    ['amount' => (float) $transport->amount, 'qty' => 1, 'total' => (float) $transport->amount]
                );
            }

            if ($index === 0) {
                Payment::firstOrCreate(
                    ['receipt_no' => 'RCPT-' . strtoupper(Str::random(10))],
                    [
                        'invoice_id' => $invoice->id,
                        'amount' => (float) $invoice->amount,
                        'method' => 'bank_transfer',
                        'reference' => 'TRF-' . strtoupper(Str::random(8)),
                        'paid_at' => now()->subDays(2)->toDateString(),
                        'paid_by_user_id' => $admin?->id,
                    ]
                );
                $invoice->recalculateFromPayments();
            }
        }

        $categories = ['Utilities', 'Curriculum Materials', 'Equipment', 'Maintenance', 'Transport', 'Catering'];

        foreach ($categories as $i => $category) {
            Budget::firstOrCreate(
                ['category' => $category, 'fiscal_year' => now()->year],
                [
                    'allocated_amount' => [150000, 200000, 120000, 90000, 180000, 160000][$i],
                    'period' => 'Annual',
                ]
            );
        }

        $sampleExpenses = [
            ['title' => 'Electricity bill', 'category' => 'Utilities', 'amount' => 18500],
            ['title' => 'Term 1 textbooks', 'category' => 'Curriculum Materials', 'amount' => 46000],
            ['title' => 'Robotics kit replacement parts', 'category' => 'Equipment', 'amount' => 22000],
            ['title' => 'Classroom light fixtures', 'category' => 'Maintenance', 'amount' => 12500],
            ['title' => 'School bus fuel', 'category' => 'Transport', 'amount' => 31000],
            ['title' => 'Lunch program supplies', 'category' => 'Catering', 'amount' => 28000],
        ];

        foreach ($sampleExpenses as $expense) {
            Expense::firstOrCreate(
                ['title' => $expense['title']],
                [
                    'category' => $expense['category'],
                    'amount' => $expense['amount'],
                    'expense_date' => now()->subDays(random_int(1, 60)),
                    'receipt_ref' => 'EXP-' . strtoupper(Str::random(6)),
                    'notes' => 'Seeded sample expense.',
                    'recorded_by_user_id' => $admin?->id,
                ]
            );
        }
    }
}
