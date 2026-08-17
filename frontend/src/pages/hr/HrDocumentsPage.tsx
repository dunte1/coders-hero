import { useState } from 'react';
import { useHrDocuments, useHrEmployees, useCreateDocument, useDeleteDocument } from '@/hooks/useHr';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Plus, FileText, Trash2, Download } from 'lucide-react';
import { DOCUMENT_CATEGORIES } from '@/types/hr';
import { hrApi } from '@/lib/hrApi';
import type { DocumentCategory } from '@/types/hr';

export default function HrDocumentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('contract');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useHrDocuments({ page, per_page: 15, search: search || undefined });
  const { data: employeesData } = useHrEmployees({ per_page: 200 });
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();

  const employees = employeesData?.results || [];
  const documents = data?.results || [];

  const openUpload = () => {
    setEmployeeId(undefined);
    setTitle('');
    setCategory('contract');
    setFile(null);
    setDialogOpen(true);
  };

  const submit = () => {
    if (!employeeId || !file) return;
    const formData = new FormData();
    formData.append('employee_id', String(employeeId));
    formData.append('title', title);
    formData.append('category', category);
    formData.append('file', file);
    setUploading(true);
    createDocument.mutate(formData, {
      onSuccess: () => {
        setDialogOpen(false);
        setUploading(false);
      },
      onSettled: () => setUploading(false),
    });
  };

  const openDownload = (docId: number) => {
    hrApi.downloadDocument(docId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Contracts, IDs, certificates and other employee documents"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR', href: '/hr' }, { label: 'Documents' }]}
        actions={
          <Button onClick={openUpload}>
            <Plus className="mr-1 h-4 w-4" /> Upload Document
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by title or employee..."
          className="w-full sm:w-64"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="Uploaded documents will appear here." />
      ) : (
        <>
          <div className="space-y-3">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{document.title}</p>
                        <p className="truncate text-sm text-slate-500">
                          {document.employee?.user?.name ?? 'Unknown employee'} · {document.category} ·{' '}
                          {document.file_name} · {document.size_human ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDownload(document.id)}>
                        <Download className="mr-1 h-3.5 w-3.5" /> Download
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => deleteDocument.mutate(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data?.meta && data.meta.last_page > 1 && (
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={setPage}
              totalCount={data.meta.total}
              pageSize={data.meta.per_page}
            />
          )}
        </>
      )}

      <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Attach an employee document (PDF, DOC, image, XLS up to 10MB).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <SelectRoot
                value={employeeId != null ? String(employeeId) : undefined}
                onValueChange={(v) => setEmployeeId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.user?.name ?? e.employee_id} ({e.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Signed contract 2026" />
            </div>
            <div>
              <Label>Category</Label>
              <SelectRoot value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div>
              <Label>File</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={uploading} disabled={!employeeId || !file || !title}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
