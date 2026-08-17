import { Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsoleOutputProps {
  stdout?: string;
  stderr?: string;
  exitCode?: number | null;
  timedOut?: boolean;
  running?: boolean;
  placeholder?: string;
  className?: string;
}

export function ConsoleOutput({
  stdout,
  stderr,
  exitCode,
  timedOut,
  running,
  placeholder = 'Run your code to see output here.',
  className,
}: ConsoleOutputProps) {
  const hasOutput = stdout || stderr;

  return (
    <div
      className={cn(
        'flex min-h-[200px] flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Console</span>
        {running && (
          <span className="flex items-center gap-1 text-xs text-brand-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Running...
          </span>
        )}
        {!running && exitCode !== null && exitCode !== undefined && (
          <span
            className={cn(
              'text-xs font-medium',
              exitCode === 0 && !timedOut ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {timedOut ? 'timed out' : `exit code: ${exitCode}`}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed">
        {running ? (
          <span className="text-slate-500">Waiting for output...</span>
        ) : !hasOutput ? (
          <span className="text-slate-500">{placeholder}</span>
        ) : (
          <>
            {stdout && <pre className="whitespace-pre-wrap text-slate-200">{stdout}</pre>}
            {stderr && (
              <pre className="mt-2 flex items-start gap-1 whitespace-pre-wrap text-red-400">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{stderr}</span>
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
