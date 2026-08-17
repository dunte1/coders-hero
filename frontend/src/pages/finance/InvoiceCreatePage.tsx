import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '@/hooks/useFinance';
import { useCompetitionStudentOptions } from '@/hooks/useCompetitions';
import { useFeeStructures } from '@/hooks/useFinance';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Trash2, Plus, FileText } from 'lucide-react';
import type { InvoiceItemInput } from '@/types/finance';

export default function InvoiceCreatePage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();

  const [studentId, setStudentId] = useState<number>(0);
  const [studentSearch, setStudentSearch] = useState('');
  const [feeStructureId, setFeeStructureId] = useState<number>(0);
  const [term, setTerm] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItemInput[]>([{ description: '', amount: 0, qty: 1 }]);

  const { data: students } = useCompetitionStudentOptions(studentSearch || undefined);
  const { data: structuresData } = useFeeStructures({ page: 1, per_page: 100 });

  const total = items.reduce((sum, item) => sum + (item.amount || 0) * (item.qty || 1), 0);

  const updateItem = (index: number, patch: Partial<InvoiceItemInput>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const submit = () => {
    if (!studentId) return;
    createInvoice.mutate(
      {
        student_id: studentId,
        fee_structure_id: feeStructureId || null,
        term: term || null,
        description: description || null,
        due_date: dueDate || null,
        status: 'issued',
        items: items.filter((i) => i.description),
      },
      {
        onSuccess: (invoice) => navigate(`/finance/invoices/${invoice.id}`),
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New Invoice"
        description="Raise an invoice for a student"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance', href: '/finance' }, { label: 'Invoices', href: '/finance/invoices' }, { label: 'New Invoice' }]}
      />

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Student</Label>
              <SelectRoot value={studentId ? String(studentId) : undefined} onValueChange={(v) => setStudentId(Number(v))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <div className="px-2 pb-2">
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                  {(students ?? []).map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.full_name} ({student.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div>
              <Label>Fee Structure (optional)</Label>
              <SelectRoot value={feeStructureId ? String(feeStructureId) : undefined} onValueChange={(v) => setFeeStructureId(Number(v))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {(structuresData?.results ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Term</Label>
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. Term 1" />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Term 1 fees" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Line items</h3>
            <Button variant="outline" size="sm" onClick={() => setItems([...items, { description: '', amount: 0, qty: 1 }])}>
              <Plus className="h-4 w-4 mr-1" /> Add item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="e.g. Tuition fee"
                  />
                </div>
                <div className="w-28">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateItem(index, { amount: Number(e.target.value) })}
                  />
                </div>
                <div className="w-24">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                  />
                </div>
                <div className="pb-2 text-sm font-medium text-slate-900 whitespace-nowrap">
                  {(item.amount || 0) * (item.qty || 1)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-red-600"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-lg font-bold text-slate-900">KSh {total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/finance/invoices')}>Cancel</Button>
        <Button onClick={submit} loading={createInvoice.isPending} disabled={!studentId}>
          <FileText className="h-4 w-4 mr-1" /> Create Invoice
        </Button>
      </div>
    </div>
  );
}
