import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryCatalog, useLibraryCategoryOptions } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { BookOpen, FileText, Video, FileQuestion, Code2, Cpu, Search } from 'lucide-react';
import type { LibraryResource, LibraryResourceType } from '@/types/library';

const typeMeta: Record<LibraryResourceType, { label: string; icon: typeof BookOpen }> = {
  ebook: { label: 'E-Book', icon: BookOpen },
  video: { label: 'Video', icon: Video },
  notes: { label: 'Notes', icon: FileText },
  past_paper: { label: 'Past Paper', icon: FileQuestion },
  coding_resource: { label: 'Coding Resource', icon: Code2 },
  robotics_manual: { label: 'Robotics Manual', icon: Cpu },
};

export default function LibraryCatalogPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | LibraryResourceType>('all');
  const [categoryId, setCategoryId] = useState('all');

  const { data, isLoading } = useLibraryCatalog({ page, search, type, category_id: categoryId });
  const { data: categories = [] } = useLibraryCategoryOptions();

  const resources = data?.results || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Library"
        description="Browse e-books, videos, notes, past papers and coding resources"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Library' }]}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search resources, authors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <SelectRoot value={type} onValueChange={(v) => { setType(v as 'all' | LibraryResourceType); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(typeMeta).map(([key, meta]) => (
              <SelectItem key={key} value={key}>{meta.label}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <SelectRoot value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : resources.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="No resources found"
              description="Try adjusting your search or filters."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const meta = typeMeta[r.resource_type] ?? { label: r.resource_type, icon: BookOpen };
            const Icon = meta.icon;
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/library/resources/${r.id}`)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    {r.is_borrowed ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Borrowed</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Available</span>
                    )}
                  </div>
                  <h4 className="mt-3 font-semibold text-slate-900 line-clamp-2">{r.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">{r.author?.name ?? 'Unknown author'}</p>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{r.description ?? 'No description'}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{meta.label}</span>
                    {r.category?.name && <span>{r.category.name}</span>}
                    {r.file_size_human && <span>· {r.file_size_human}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.last_page}
          onPageChange={setPage}
          totalCount={data.meta.total}
          pageSize={data.meta.per_page}
        />
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate('/library/mine')}>
          <BookOpen className="h-4 w-4 mr-2" /> My Borrowings
        </Button>
      </div>
    </div>
  );
}
