<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\MpesaTransaction;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        config([
            'mpesa.consumer_key' => 'test-consumer',
            'mpesa.consumer_secret' => 'test-secret',
            'mpesa.passkey' => 'test-passkey',
            'mpesa.shortcode' => '174379',
            'mpesa.callback_url' => 'https://example.test/mpesa/callback',
        ]);

        Cache::flush();
    }

    private function user(string $role = 'admin'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function studentUser(string $grade = null): User
    {
        $user = $this->user('student');

        Student::create([
            'student_id' => 'STU' . uniqid(),
            'user_id' => $user->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'gender' => 'female',
            'grade' => $grade,
            'status' => 'active',
        ]);

        return $user;
    }

    private function structure(array $overrides = []): FeeStructure
    {
        return FeeStructure::create(array_merge([
            'name' => 'Tuition ' . uniqid(),
            'fee_type' => 'tuition',
            'amount' => 20000,
            'term' => 'Term 1',
            'is_active' => true,
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));
    }

    private function invoice(User $owner, array $overrides = []): Invoice
    {
        $student = Student::where('user_id', $owner->id)->firstOrFail();

        $invoice = Invoice::create(array_merge([
            'invoice_no' => 'INV-' . uniqid(),
            'student_id' => $student->id,
            'term' => 'Term 1',
            'description' => 'Tuition - Term 1',
            'amount' => 20000,
            'paid_amount' => 0,
            'status' => 'issued',
            'due_date' => now()->addDays(30),
            'issued_at' => now(),
            'created_by_user_id' => $this->user('admin')->id,
        ], $overrides));

        $invoice->items()->create([
            'description' => 'Tuition - Term 1',
            'amount' => 20000,
            'qty' => 1,
            'total' => 20000,
        ]);

        return $invoice;
    }

    public function test_finance_admin_endpoints_require_authentication(): void
    {
        $this->getJson('/api/finance/summary')->assertStatus(401);
        $this->getJson('/api/finance/fee-structures')->assertStatus(401);
        $this->postJson('/api/finance/invoices', [])->assertStatus(401);
        $this->getJson('/api/finance/payments')->assertStatus(401);
        $this->getJson('/api/invoices/mine')->assertStatus(401);
        $this->postJson('/api/mpesa/stk-push', [])->assertStatus(401);
    }

    public function test_non_admin_cannot_access_finance_admin_endpoints(): void
    {
        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->getJson('/api/finance/summary')->assertStatus(403);
        $this->postJson('/api/finance/fee-structures', ['name' => 'X'])->assertStatus(403);
        $this->getJson('/api/finance/expenses')->assertStatus(403);
    }

    public function test_admin_can_manage_fee_structures(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $structure = $this->structure();

        $this->getJson('/api/finance/fee-structures')
            ->assertOk()
            ->assertJsonPath('data.0.id', $structure->id);

        $this->postJson('/api/finance/fee-structures', [
            'name' => 'Lunch - Term 1',
            'fee_type' => 'lunch',
            'amount' => 4500,
            'term' => 'Term 1',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Lunch - Term 1');

        $this->putJson('/api/finance/fee-structures/' . $structure->id, [
            'amount' => 22000,
        ])
            ->assertOk()
            ->assertJsonPath('data.amount', '22000.00');

        $this->getJson('/api/finance/fee-structures/' . $structure->id)
            ->assertOk()
            ->assertJsonPath('data.amount', '22000.00');

        $this->deleteJson('/api/finance/fee-structures/' . $structure->id)
            ->assertOk();

        $this->assertDatabaseMissing('fee_structures', ['id' => $structure->id]);
    }

    public function test_fee_structure_with_invoices_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $structure = $this->structure();
        $owner = $this->studentUser();
        $this->invoice($owner, ['fee_structure_id' => $structure->id]);

        $this->deleteJson('/api/finance/fee-structures/' . $structure->id)
            ->assertStatus(422);

        $this->assertDatabaseHas('fee_structures', ['id' => $structure->id]);
    }

    public function test_admin_can_create_invoice_with_items(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $owner = $this->studentUser();
        $student = Student::where('user_id', $owner->id)->firstOrFail();

        $response = $this->postJson('/api/finance/invoices', [
            'student_id' => $student->id,
            'term' => 'Term 1',
            'items' => [
                ['description' => 'Tuition', 'amount' => 18000, 'qty' => 1],
                ['description' => 'Transport', 'amount' => 3000, 'qty' => 2],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.student_id', $student->id)
            ->assertJsonPath('data.amount', '24000.00')
            ->assertJsonPath('data.status', 'issued');

        $this->assertDatabaseHas('invoice_items', [
            'invoice_id' => $response->json('data.id'),
            'total' => '6000.00',
        ]);
    }

    public function test_admin_can_generate_invoices_from_structure(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $structure = $this->structure(['grade_level' => 'Grade 7', 'amount' => 15000]);

        $student1 = $this->studentUser('Grade 7');
        $student2 = $this->studentUser('Grade 7');

        $this->postJson('/api/finance/invoices/generate', [
            'fee_structure_id' => $structure->id,
            'grade_level' => 'Grade 7',
        ])
            ->assertOk()
            ->assertJsonPath('data.created', 2);

        $this->assertDatabaseHas('invoices', [
            'fee_structure_id' => $structure->id,
            'status' => 'issued',
            'amount' => '15000.00',
        ]);
    }

    public function test_invoice_issue_and_void_lifecycle(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $owner = $this->studentUser();
        $draft = $this->invoice($owner, ['status' => 'draft']);

        $this->putJson('/api/finance/invoices/' . $draft->id . '/issue')
            ->assertOk()
            ->assertJsonPath('data.status', 'issued');

        $this->putJson('/api/finance/invoices/' . $draft->id . '/void')
            ->assertOk()
            ->assertJsonPath('data.status', 'void');

        $paid = $this->invoice($owner);

        $this->postJson('/api/finance/invoices/' . $paid->id . '/pay', [
            'amount' => 20000,
            'method' => 'cash',
        ])
            ->assertCreated();

        $this->putJson('/api/finance/invoices/' . $paid->id . '/void')
            ->assertStatus(422);
    }

    public function test_record_payment_rejects_overpayment_and_updates_status(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        $this->postJson('/api/finance/invoices/' . $invoice->id . '/pay', [
            'amount' => 25000,
            'method' => 'cash',
        ])->assertStatus(422);

        $this->postJson('/api/finance/invoices/' . $invoice->id . '/pay', [
            'amount' => 12000,
            'method' => 'bank_transfer',
            'reference' => 'TRF-123',
        ])
            ->assertCreated()
            ->assertJsonPath('data.receipt_no', fn ($v) => str_starts_with($v, 'RCPT-'));

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'partial',
            'paid_amount' => '12000.00',
        ]);

        $this->postJson('/api/finance/invoices/' . $invoice->id . '/pay', [
            'amount' => 8000,
            'method' => 'cash',
        ])
            ->assertCreated();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
            'paid_amount' => '20000.00',
        ]);

        $this->postJson('/api/finance/invoices/' . $invoice->id . '/pay', [
            'amount' => 100,
            'method' => 'cash',
        ])->assertStatus(422);
    }

    public function test_payment_reverse_restores_invoice_status(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        $this->postJson('/api/finance/invoices/' . $invoice->id . '/pay', [
            'amount' => 20000,
            'method' => 'cash',
        ])->assertCreated();

        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'status' => 'paid']);

        $payment = Payment::where('invoice_id', $invoice->id)->firstOrFail();

        $this->putJson('/api/finance/payments/' . $payment->id . '/reverse')
            ->assertOk();

        $this->assertDatabaseMissing('payments', ['id' => $payment->id]);
        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'status' => 'issued', 'paid_amount' => '0.00']);
    }

    public function test_expense_and_budget_crud(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/finance/expenses', [
            'title' => 'Printer paper',
            'category' => 'Supplies',
            'amount' => 5000,
            'expense_date' => now()->toDateString(),
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Printer paper');

        $expense = Expense::firstOrFail();
        $this->assertDatabaseHas('expenses', ['title' => 'Printer paper']);

        $this->putJson('/api/finance/expenses/' . $expense->id, [
            'amount' => 6000,
        ])->assertOk()->assertJsonPath('data.amount', '6000.00');

        $this->deleteJson('/api/finance/expenses/' . $expense->id)->assertOk();
        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);

        $this->postJson('/api/finance/budgets', [
            'category' => 'Supplies',
            'allocated_amount' => 100000,
            'fiscal_year' => now()->year,
        ])
            ->assertCreated()
            ->assertJsonPath('data.category', 'Supplies');

        $this->postJson('/api/finance/budgets', [
            'category' => 'Supplies',
            'allocated_amount' => 50000,
            'fiscal_year' => now()->year,
        ])->assertStatus(422);

        $budget = Budget::firstOrFail();
        $this->putJson('/api/finance/budgets/' . $budget->id, ['allocated_amount' => 120000])
            ->assertOk();

        $this->getJson('/api/finance/budgets?fiscal_year=' . now()->year)
            ->assertOk()
            ->assertJsonPath('data.0.allocated_amount', '120000.00');

        $this->deleteJson('/api/finance/budgets/' . $budget->id)->assertOk();
    }

    public function test_finance_reports_reflect_recorded_data(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        $this->postJson('/api/finance/invoices/' . $invoice->id . '/pay', [
            'amount' => 5000,
            'method' => 'cash',
        ])->assertCreated();

        $this->getJson('/api/finance/summary')
            ->assertOk()
            ->assertJsonPath('data.total_invoiced', 20000)
            ->assertJsonPath('data.total_collected', 5000)
            ->assertJsonPath('data.outstanding', 15000);

        $this->getJson('/api/finance/collections')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.method', 'cash');

        $this->getJson('/api/finance/outstanding')
            ->assertOk()
            ->assertJsonPath('data.0.balance', 15000);

        $this->getJson('/api/finance/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'payment')
            ->assertJsonPath('data.0.direction', 'in')
            ->assertJsonPath('data.0.amount', 5000);
    }

    public function test_invoices_mine_and_my_outstanding_for_student(): void
    {
        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        Sanctum::actingAs($owner, ['*']);

        $this->getJson('/api/invoices/mine')
            ->assertOk()
            ->assertJsonPath('data.0.id', $invoice->id);

        $this->getJson('/api/my-outstanding')
            ->assertOk()
            ->assertJsonPath('data.0.balance', 20000);

        $this->getJson('/api/finance/invoices')
            ->assertStatus(403);
    }

    public function test_mpesa_stk_push_and_callback_success(): void
    {
        Http::fake([
            '*oauth*' => Http::response(['access_token' => 'test-token']),
            '*stkpush*' => Http::response([
                'MerchantRequestID' => 'MERC-1',
                'CheckoutRequestID' => 'WS_CO_' . uniqid(),
                'ResponseCode' => '0',
                'ResponseDescription' => 'Success. Request accepted for processing',
            ]),
        ]);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        Sanctum::actingAs($owner, ['*']);

        $response = $this->postJson('/api/mpesa/stk-push', [
            'invoice_id' => $invoice->id,
            'phone' => '0700000001',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'pending');

        $transaction = MpesaTransaction::where('invoice_id', $invoice->id)->firstOrFail();
        $checkoutRequestId = $transaction->checkout_request_id;

        $this->postJson('/api/mpesa/callback', [
            'Body' => [
                'stkCallback' => [
                    'MerchantRequestID' => 'MERC-1',
                    'CheckoutRequestID' => $checkoutRequestId,
                    'ResultCode' => 0,
                    'ResultDesc' => 'The service request is processed successfully.',
                    'CallbackMetadata' => [
                        'Item' => [
                            ['Name' => 'Amount', 'Value' => 20000],
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'QF' . uniqid()],
                            ['Name' => 'TransactionDate', 'Value' => 20260814120000],
                            ['Name' => 'PhoneNumber', 'Value' => 254700000001],
                        ],
                    ],
                ],
            ],
        ])->assertOk();

        $transaction->refresh();
        $this->assertSame('completed', $transaction->status);
        $this->assertNotNull($transaction->payment_id);

        $this->assertDatabaseHas('payments', [
            'id' => $transaction->payment_id,
            'invoice_id' => $invoice->id,
            'method' => 'mpesa',
        ]);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
            'paid_amount' => '20000.00',
        ]);
    }

    public function test_mpesa_callback_is_idempotent(): void
    {
        Http::fake([
            '*oauth*' => Http::response(['access_token' => 'test-token']),
            '*stkpush*' => Http::response([
                'MerchantRequestID' => 'MERC-2',
                'CheckoutRequestID' => 'WS_CO_' . uniqid(),
                'ResponseCode' => '0',
                'ResponseDescription' => 'Success',
            ]),
        ]);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        Sanctum::actingAs($owner, ['*']);

        $this->postJson('/api/mpesa/stk-push', [
            'invoice_id' => $invoice->id,
            'phone' => '0700000001',
        ])->assertOk();

        $checkoutRequestId = MpesaTransaction::where('invoice_id', $invoice->id)->value('checkout_request_id');

        $payload = [
            'Body' => [
                'stkCallback' => [
                    'CheckoutRequestID' => $checkoutRequestId,
                    'ResultCode' => 0,
                    'ResultDesc' => 'Success',
                    'CallbackMetadata' => [
                        'Item' => [
                            ['Name' => 'Amount', 'Value' => 20000],
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'QF' . uniqid()],
                            ['Name' => 'TransactionDate', 'Value' => 20260814120000],
                            ['Name' => 'PhoneNumber', 'Value' => 254700000001],
                        ],
                    ],
                ],
            ],
        ];

        $this->postJson('/api/mpesa/callback', $payload)->assertOk();
        $this->postJson('/api/mpesa/callback', $payload)->assertOk();

        $this->assertSame(1, Payment::where('invoice_id', $invoice->id)->count());
        $this->assertSame(1, MpesaTransaction::where('invoice_id', $invoice->id)->count());
    }

    public function test_mpesa_callback_unknown_checkout_request_returns_404(): void
    {
        $this->postJson('/api/mpesa/callback', [
            'Body' => [
                'stkCallback' => [
                    'CheckoutRequestID' => 'WS_CO_UNKNOWN',
                    'ResultCode' => 0,
                    'ResultDesc' => 'Success',
                ],
            ],
        ])->assertStatus(404);
    }

    public function test_mpesa_callback_failed_result_marks_transaction_failed(): void
    {
        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        $transaction = MpesaTransaction::create([
            'merchant_request_id' => 'MERC-3',
            'checkout_request_id' => 'WS_CO_' . uniqid(),
            'amount' => 20000,
            'phone_number' => '254700000001',
            'invoice_id' => $invoice->id,
            'user_id' => $owner->id,
            'status' => 'pending',
        ]);

        $this->postJson('/api/mpesa/callback', [
            'Body' => [
                'stkCallback' => [
                    'CheckoutRequestID' => $transaction->checkout_request_id,
                    'ResultCode' => 1,
                    'ResultDesc' => 'The initiator information is invalid.',
                ],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('mpesa_transactions', [
            'id' => $transaction->id,
            'status' => 'failed',
            'result_code' => 1,
        ]);

        $this->assertDatabaseMissing('payments', ['invoice_id' => $invoice->id]);
        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'status' => 'issued']);
    }

    public function test_mpesa_stk_push_failure_is_recorded(): void
    {
        Http::fake([
            '*oauth*' => Http::response(['access_token' => 'test-token']),
            '*stkpush*' => Http::response([
                'ResponseCode' => '1037',
                'ResponseDescription' => 'DS timeout.',
            ]),
        ]);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        Sanctum::actingAs($owner, ['*']);

        $this->postJson('/api/mpesa/stk-push', [
            'invoice_id' => $invoice->id,
            'phone' => '0700000001',
        ])->assertStatus(502);

        $this->assertDatabaseHas('mpesa_transactions', [
            'invoice_id' => $invoice->id,
            'status' => 'failed',
        ]);

        $this->assertDatabaseMissing('payments', ['invoice_id' => $invoice->id]);
    }

    public function test_mpesa_stk_push_unconfigured_returns_error(): void
    {
        config(['mpesa.passkey' => null]);

        $owner = $this->studentUser();
        $invoice = $this->invoice($owner);

        Sanctum::actingAs($owner, ['*']);

        $this->postJson('/api/mpesa/stk-push', [
            'invoice_id' => $invoice->id,
            'phone' => '0700000001',
        ])->assertStatus(500);
    }

    public function test_mpesa_stk_push_rejects_foreign_payable(): void
    {
        Http::fake(['*' => Http::response([])]);

        $owner = $this->studentUser();
        $other = $this->studentUser();
        $invoice = $this->invoice($other);

        Sanctum::actingAs($owner, ['*']);

        $this->postJson('/api/mpesa/stk-push', [
            'invoice_id' => $invoice->id,
            'phone' => '0700000001',
        ])->assertStatus(403);
    }
}
