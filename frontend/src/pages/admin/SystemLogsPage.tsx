import { useState } from 'react';
import { useSystemLogs } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { RefreshCw, TerminalSquare } from 'lucide-react';

const LEVELS = ['', 'DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'];

function levelColor(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('.error:') || lower.includes('critical') || lower.includes('emergency') || lower.includes('alert:')) return 'text-red-600';
  if (lower.includes('.warning:')) return 'text-amber-600';
  if (lower.includes('.info:')) return 'text-emerald-600';
  return 'text-slate-600';
}

export default function SystemLogsPage() {
  const [level, setLevel] = useState('');
  const [lines, setLines] = useState(300);
  const { data, isLoading, refetch, isFetching } = useSystemLogs({ lines, level: level || undefined });

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Logs"
        description="Application runtime logs from laravel.log"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administration', href: '/admin' }, { label: 'System Logs' }]}
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <SelectRoot value={level} onValueChange={(v) => setLevel(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All levels</SelectItem>
            {LEVELS.slice(1).map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <SelectRoot value={String(lines)} onValueChange={(v) => setLines(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="200">200 lines</SelectItem>
            <SelectItem value="500">500 lines</SelectItem>
            <SelectItem value="1000">1000 lines</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <PageSpinner />
          ) : !data?.lines.length ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
              <TerminalSquare className="h-5 w-5" /> No log entries to display.
            </div>
          ) : (
            <pre className="max-h-[65vh] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
              {data.lines.map(({ line, content }) => (
                <div key={line} className="flex">
                  <span className="mr-3 select-none text-slate-600">{String(line).padStart(5, ' ')}</span>
                  <span className={`whitespace-pre-wrap break-all ${levelColor(content)}`}>{content}</span>
                </div>
              ))}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
