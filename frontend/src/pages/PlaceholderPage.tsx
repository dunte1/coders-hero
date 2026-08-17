import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  backHref?: string;
}

export function PlaceholderPage({ title, description, icon: Icon = Construction, backHref = '/dashboard' }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: title },
        ]}
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              {description ?? `The ${title.toLowerCase()} module is under development and will be available in a future release.`}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(backHref)}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
