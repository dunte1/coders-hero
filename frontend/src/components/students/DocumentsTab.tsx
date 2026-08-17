import { useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, FileText, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';
import { useStudentDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/useStudents';
import { DOCUMENT_TYPES } from '@/components/students/SisBadges';
import { formatDate, formatFileSize } from '@/lib/utils';

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  document_type: z.string().min(1, 'Document type is required'),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export function DocumentsTab({ studentId }: { studentId: number }) {
  const { data, isLoading } = useStudentDocuments(studentId);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const methods = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '', document_type: 'other' },
  });

  const { register, handleSubmit, setValue, watch, reset } = methods;

  const onFormSubmit = (values: DocumentFormValues) => {
    if (!file) return;
    uploadMutation.mutate(
      { studentId, name: values.name, documentType: values.document_type, file },
      {
        onSuccess: () => {
          reset({ name: '', document_type: 'other' });
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      }
    );
  };

  if (isLoading) return <PageSpinner />;

  const documents = data?.results || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Document Name"
                    placeholder="e.g. Birth Certificate"
                    error={methods.formState.errors.name?.message}
                    {...register('name')}
                  />
                </div>
                <SelectRoot
                  value={watch('document_type')}
                  onValueChange={(value) => setValue('document_type', value)}
                >
                  <SelectTrigger label="Type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={uploadMutation.isPending} disabled={!file}>
                  Upload
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState
              title="No documents"
              description="Uploaded documents will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-200">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">
                      {doc.document_type} · {doc.size != null ? formatFileSize(doc.size) : '—'} ·{' '}
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(doc.url!, '_blank')}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => setDeleteId(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
