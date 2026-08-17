import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Save, Plus, FolderOpen, Trash2, FilePlus2, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { Spinner } from '@/components/ui/Spinner';
import { CodeEditor } from '@/components/lms/CodeEditor';
import { ConsoleOutput } from '@/components/lms/ConsoleOutput';
import {
  useDeleteWorkspace,
  useListWorkspaces,
  useRunPlaygroundCode,
  useSaveWorkspace,
  useUpdateWorkspace,
} from '@/hooks/useLms';
import { lmsApi } from '@/lib/lmsApi';
import { formatRelativeDate } from '@/lib/utils';
import type { CodingLanguage, CodingWorkspaceFile, PlaygroundRunResult } from '@/types/lms';

const DEFAULT_FILES: Record<CodingLanguage, CodingWorkspaceFile> = {
  python: { name: 'main.py', content: '# Write your Python code here\n\n' },
  javascript: { name: 'main.js', content: '// Write your JavaScript code here\n\n' },
};

const AUTO_SAVE_MS = 15000;

export default function LmsPlaygroundPage() {
  const { data: workspacesData, isLoading: workspacesLoading } = useListWorkspaces();
  const runCode = useRunPlaygroundCode();
  const saveWorkspace = useSaveWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [name, setName] = useState('Untitled Workspace');
  const [language, setLanguage] = useState<CodingLanguage>('python');
  const [files, setFiles] = useState<CodingWorkspaceFile[]>([DEFAULT_FILES.python]);
  const [activeFileName, setActiveFileName] = useState('main.py');
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState<PlaygroundRunResult | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const workspaces = workspacesData ?? [];
  const activeFile = files.find((f) => f.name === activeFileName) ?? files[0];
  const isSaving = saveWorkspace.isPending || updateWorkspace.isPending;
  const isRunning = runCode.isPending;

  const persist = useCallback(() => {
    const payload = {
      name: name.trim() || 'Untitled Workspace',
      language,
      files,
      active_file: activeFileName,
    };

    if (workspaceId) {
      updateWorkspace.mutate({ workspaceId, data: payload });
    } else {
      saveWorkspace.mutate(payload, {
        onSuccess: (data) => setWorkspaceId(data.id),
      });
    }

    dirtyRef.current = false;
    setLastSaved(new Date().toISOString());
  }, [name, language, files, activeFileName, workspaceId, updateWorkspace, saveWorkspace]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (dirtyRef.current) persist();
    }, AUTO_SAVE_MS);
    return () => clearInterval(timer);
  }, [persist]);

  useEffect(() => {
    return () => {
      if (dirtyRef.current) persist();
    };
  }, [persist]);

  const updateActiveContent = (content: string) => {
    dirtyRef.current = true;
    setFiles((fs) => fs.map((f) => (f.name === activeFileName ? { ...f, content } : f)));
  };

  const handleLanguageChange = (value: string) => {
    const lang = value as CodingLanguage;
    dirtyRef.current = true;
    setLanguage(lang);
    setFiles((fs) => {
      if (fs.some((f) => f.name === `main.${lang}`)) return fs;
      const mapped = fs.map((f) =>
        f.name === 'main.py' || f.name === 'main.js' ? { ...f, name: `main.${lang}` } : f
      );
      return mapped.some((f) => f.name === `main.${lang}`) ? mapped : [...mapped, DEFAULT_FILES[lang]];
    });
    setActiveFileName(`main.${lang}`);
  };

  const handleAddFile = () => {
    const ext = language === 'python' ? 'py' : 'js';
    let index = 1;
    let candidate = `file_${index}.${ext}`;
    while (files.some((f) => f.name === candidate)) {
      index += 1;
      candidate = `file_${index}.${ext}`;
    }
    dirtyRef.current = true;
    setFiles((fs) => [...fs, { name: candidate, content: '' }]);
    setActiveFileName(candidate);
  };

  const handleRemoveFile = (fileName: string) => {
    if (files.length <= 1) return;
    dirtyRef.current = true;
    setFiles((fs) => fs.filter((f) => f.name !== fileName));
    if (activeFileName === fileName) {
      const remaining = files.filter((f) => f.name !== fileName);
      setActiveFileName(remaining[0].name);
    }
  };

  const handleRun = () => {
    if (!activeFile) return;
    runCode.mutate(
      { language, code: activeFile.content, stdin: stdin.trim() || undefined },
      { onSuccess: setResult }
    );
  };

  const handleLoad = async (id: number) => {
    const ws = await lmsApi.loadWorkspace(id);
    setWorkspaceId(id);
    setName(ws.name);
    setLanguage(ws.language);
    setFiles(ws.files.length ? ws.files : [DEFAULT_FILES[ws.language]]);
    setActiveFileName(ws.active_file ?? ws.files[0]?.name ?? `main.${ws.language}`);
    setStdin('');
    setResult(null);
    dirtyRef.current = false;
    setLastSaved(ws.saved_at);
  };

  const handleNew = () => {
    setWorkspaceId(null);
    setName('Untitled Workspace');
    setLanguage('python');
    setFiles([DEFAULT_FILES.python]);
    setActiveFileName('main.py');
    setStdin('');
    setResult(null);
    setLastSaved(null);
    dirtyRef.current = false;
  };

  const handleDelete = () => {
    if (!workspaceId) return;
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: handleNew,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Playground"
        description="Experiment with Python or JavaScript in an isolated sandbox."
        breadcrumbs={[{ label: 'Learning', href: '/lms/coding-exercises' }, { label: 'Coding Playground' }]}
        actions={
          <Button size="sm" onClick={handleRun} loading={isRunning} disabled={!activeFile}>
            <Play className="mr-1 h-3 w-3" />Run
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <Input
              value={name}
              onChange={(e) => {
                dirtyRef.current = true;
                setName(e.target.value);
              }}
              placeholder="Workspace name"
            />
          </div>

          <SelectRoot value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </SelectRoot>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={workspacesLoading}>
                <FolderOpen className="mr-1 h-3 w-3" />Load
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>My workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.length === 0 ? (
                <div className="px-2 py-3 text-center text-sm text-slate-400">No saved workspaces</div>
              ) : (
                workspaces.map((ws) => (
                  <DropdownMenuItem key={ws.id} onSelect={() => handleLoad(ws.id)}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{ws.name}</p>
                      <p className="text-xs text-slate-500">
                        {ws.language} · {formatRelativeDate(ws.saved_at)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={persist} loading={isSaving}>
            <Save className="mr-1 h-3 w-3" />Save
          </Button>

          <Button variant="outline" size="sm" onClick={handleNew}>
            <FilePlus2 className="mr-1 h-3 w-3" />New
          </Button>

          {workspaceId && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}

          <span className="ml-auto text-xs text-slate-400">
            {isSaving ? 'Saving...' : lastSaved ? `Saved ${formatRelativeDate(lastSaved)}` : 'Unsaved'}
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className={`group flex items-center gap-1 rounded-t-md border border-b-0 px-3 py-1.5 text-sm ${
                    file.name === activeFileName
                      ? 'border-slate-300 bg-slate-900 text-slate-100'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    className="font-mono"
                    onClick={() => setActiveFileName(file.name)}
                  >
                    {file.name}
                  </button>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className={`rounded p-0.5 ${
                        file.name === activeFileName
                          ? 'text-slate-400 hover:text-red-400'
                          : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500'
                      }`}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddFile}
                className="ml-1 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Plus className="h-3 w-3" />Add file
              </button>
            </div>

            {activeFile ? (
              <CodeEditor
                value={activeFile.content}
                onChange={updateActiveContent}
                language={language}
                height="440px"
                placeholder={`# Write your ${language} code here`}
              />
            ) : (
              <Spinner />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Standard input (stdin)</label>
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={2}
                className="font-mono text-sm"
                placeholder="Optional input passed to your program"
              />
            </CardContent>
          </Card>

          <ConsoleOutput
            stdout={result?.stdout}
            stderr={result?.stderr}
            exitCode={result?.exit_code ?? null}
            timedOut={result?.timed_out}
            running={isRunning}
          />
        </div>
      </div>
    </div>
  );
}
