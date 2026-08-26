import { useState } from 'react';
import {
  useAdminAiUsage,
  useAdminAiAssistants,
  useCreateAiAssistant,
  useUpdateAiAssistant,
  useDeleteAiAssistant,
  useAdminAiTemplates,
  useCreateAiTemplate,
  useUpdateAiTemplate,
  useDeleteAiTemplate,
} from '@/hooks/useAi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Bot, MessageSquare, Coins, Plus, Pencil, Trash2, Wand2 } from 'lucide-react';
import type { AiAssistant, AiPromptTemplate, AiUsageLogEntry } from '@/types/ai';
import { formatDateTime } from '@/lib/utils';
import { ConfirmDelete } from '@/components/cms/ConfirmDelete';

interface AssistantForm {
  name: string;
  description: string;
  category: string;
  icon: string;
  system_prompt: string;
  model: string;
  max_tokens: string;
  temperature: string;
  is_active: boolean;
}

const emptyAssistant: AssistantForm = {
  name: '',
  description: '',
  category: 'general',
  icon: 'Sparkles',
  system_prompt: '',
  model: '',
  max_tokens: '',
  temperature: '',
  is_active: true,
};

interface TemplateForm {
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string;
  is_active: boolean;
}

const emptyTemplate: TemplateForm = {
  name: '',
  description: '',
  category: 'general',
  template: '',
  variables: '',
  is_active: true,
};

export default function AiAdminPage() {
  const [tab, setTab] = useState('usage');
  const [assistantDialog, setAssistantDialog] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<AiAssistant | null>(null);
  const [assistantForm, setAssistantForm] = useState<AssistantForm>(emptyAssistant);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AiPromptTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateForm>(emptyTemplate);
  const [usagePage, setUsagePage] = useState(1);
  const [confirmDeleteAssistantId, setConfirmDeleteAssistantId] = useState<number | null>(null);
  const [confirmDeleteTemplateId, setConfirmDeleteTemplateId] = useState<number | null>(null);

  const usage = useAdminAiUsage({ page: usagePage, per_page: 15 });
  const { data: assistantsData, isLoading: assistantsLoading } = useAdminAiAssistants({ per_page: 50 });
  const { data: templatesData, isLoading: templatesLoading } = useAdminAiTemplates({ per_page: 50 });

  const createAssistant = useCreateAiAssistant();
  const updateAssistant = useUpdateAiAssistant();
  const deleteAssistant = useDeleteAiAssistant();
  const createTemplate = useCreateAiTemplate();
  const updateTemplate = useUpdateAiTemplate();
  const deleteTemplate = useDeleteAiTemplate();

  const openCreateAssistant = () => {
    setEditingAssistant(null);
    setAssistantForm(emptyAssistant);
    setAssistantDialog(true);
  };

  const openEditAssistant = (a: AiAssistant) => {
    setEditingAssistant(a);
    setAssistantForm({
      name: a.name,
      description: a.description ?? '',
      category: a.category,
      icon: a.icon,
      system_prompt: a.system_prompt ?? '',
      model: a.model ?? '',
      max_tokens: a.max_tokens ? String(a.max_tokens) : '',
      temperature: a.temperature !== null && a.temperature !== undefined ? String(a.temperature) : '',
      is_active: a.is_active,
    });
    setAssistantDialog(true);
  };

  const saveAssistant = () => {
    const payload = {
      name: assistantForm.name,
      description: assistantForm.description || null,
      category: assistantForm.category,
      icon: assistantForm.icon || 'Sparkles',
      system_prompt: assistantForm.system_prompt || null,
      model: assistantForm.model || null,
      max_tokens: assistantForm.max_tokens ? Number(assistantForm.max_tokens) : null,
      temperature: assistantForm.temperature ? Number(assistantForm.temperature) : null,
      is_active: assistantForm.is_active,
    };
    if (editingAssistant) {
      updateAssistant.mutate({ id: editingAssistant.id, data: payload }, { onSettled: () => setAssistantDialog(false) });
    } else {
      createAssistant.mutate(payload, { onSettled: () => setAssistantDialog(false) });
    }
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm(emptyTemplate);
    setTemplateDialog(true);
  };

  const openEditTemplate = (t: AiPromptTemplate) => {
    setEditingTemplate(t);
    setTemplateForm({
      name: t.name,
      description: t.description ?? '',
      category: t.category,
      template: t.template,
      variables: (t.variables ?? []).join(', '),
      is_active: t.is_active,
    });
    setTemplateDialog(true);
  };

  const saveTemplate = () => {
    const payload = {
      name: templateForm.name,
      description: templateForm.description || null,
      category: templateForm.category,
      template: templateForm.template,
      variables: templateForm.variables ? templateForm.variables.split(',').map((v) => v.trim()).filter(Boolean) : [],
      is_active: templateForm.is_active,
    };
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data: payload }, { onSettled: () => setTemplateDialog(false) });
    } else {
      createTemplate.mutate(payload, { onSettled: () => setTemplateDialog(false) });
    }
  };

  const usageColumns: Column<AiUsageLogEntry>[] = [
    { key: 'user', header: 'User', render: (l) => <span className="text-sm text-slate-800">{l.user?.name ?? '—'}</span> },
    { key: 'assistant', header: 'Assistant', render: (l) => <span className="text-sm text-slate-700">{l.assistant?.name ?? '—'}</span> },
    { key: 'model', header: 'Model', render: (l) => <span className="font-mono text-xs text-slate-600">{l.model ?? '—'}</span> },
    { key: 'tokens', header: 'Tokens', render: (l) => <span className="text-sm text-slate-600">{l.total_tokens}</span> },
    { key: 'cost', header: 'Cost', render: (l) => <span className="text-sm text-slate-600">${Number(l.cost).toFixed(6)}</span> },
    {
      key: 'blocked',
      header: 'Status',
      render: (l) => (l.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="success">OK</Badge>),
    },
    { key: 'created_at', header: 'When', render: (l) => <span className="text-xs text-slate-500">{formatDateTime(l.created_at ?? '')}</span> },
  ];

  const assistantColumns: Column<AiAssistant>[] = [
    {
      key: 'name',
      header: 'Assistant',
      render: (a) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{a.name}</p>
          <p className="text-xs text-slate-500">{a.category}</p>
        </div>
      ),
    },
    { key: 'model', header: 'Model', render: (a) => <span className="font-mono text-xs text-slate-600">{a.model ?? 'default'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (a.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEditAssistant(a)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDeleteAssistantId(a.id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const templateColumns: Column<AiPromptTemplate>[] = [
    {
      key: 'name',
      header: 'Template',
      render: (t) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{t.name}</p>
          <p className="text-xs text-slate-500">{t.category}</p>
        </div>
      ),
    },
    { key: 'description', header: 'Description', render: (t) => <span className="text-xs text-slate-600">{t.description ?? '—'}</span> },
    { key: 'variables', header: 'Variables', render: (t) => <span className="text-xs text-slate-600">{(t.variables ?? []).join(', ') || '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (t.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEditTemplate(t)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDeleteTemplateId(t.id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const summary = usage.data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Platform Administration"
        description="Assistants, prompt templates and platform usage"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Platform' }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="templates">Prompt Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={MessageSquare} title="Total Calls" value={summary?.total_calls ?? 0} />
            <StatsCard icon={Bot} title="Blocked" value={summary?.blocked ?? 0} />
            <StatsCard icon={Coins} title="Total Tokens" value={summary?.total_tokens ?? 0} />
            <StatsCard icon={Coins} title="Total Cost" value={`$${Number(summary?.total_cost ?? 0).toFixed(4)}`} />
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Usage by Assistant</p>
              {!summary?.by_assistant?.length ? (
                <p className="text-sm text-slate-500">No usage recorded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {summary.by_assistant.map((row) => (
                    <div key={row.assistant_id} className="rounded-lg border border-slate-100 p-3">
                      <p className="text-sm font-medium text-slate-900">{row.assistant?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{row.calls} calls · {row.tokens.toLocaleString()} tokens</p>
                      <p className="text-xs text-slate-500">${Number(row.cost).toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={usageColumns}
                data={usage.data?.logs ?? []}
                totalCount={usage.data?.meta.total ?? 0}
                page={usage.data?.meta.current_page ?? 1}
                pageSize={usage.data?.meta.per_page ?? 15}
                onPageChange={setUsagePage}
                loading={usage.isLoading}
                searchable={false}
                emptyTitle="No usage logs"
                emptyDescription="AI usage will appear here once assistants are used."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistants" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Assistants</p>
                  <p className="text-xs text-slate-500">Configure the specialized assistants available to users</p>
                </div>
                <Button size="sm" onClick={openCreateAssistant}>
                  <Plus className="h-4 w-4 mr-1" />New Assistant
                </Button>
              </div>
              <DataTable
                columns={assistantColumns}
                data={assistantsData?.results ?? []}
                loading={assistantsLoading}
                searchable={false}
                emptyTitle="No assistants"
                emptyDescription="Create an assistant to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Prompt Templates</p>
                  <p className="text-xs text-slate-500">Reusable generation prompts with placeholders</p>
                </div>
                <Button size="sm" onClick={openCreateTemplate}>
                  <Plus className="h-4 w-4 mr-1" />New Template
                </Button>
              </div>
              <DataTable
                columns={templateColumns}
                data={templatesData?.results ?? []}
                loading={templatesLoading}
                searchable={false}
                emptyTitle="No templates"
                emptyDescription="Create a prompt template to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assistant dialog */}
      <DialogRoot open={assistantDialog} onOpenChange={setAssistantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAssistant ? 'Edit Assistant' : 'New Assistant'}</DialogTitle>
            <DialogDescription>Configure the assistant's identity, prompt and model.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="as-name">Name</Label>
                <Input id="as-name" value={assistantForm.name} onChange={(e) => setAssistantForm({ ...assistantForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-category">Category</Label>
                <Input id="as-category" value={assistantForm.category} onChange={(e) => setAssistantForm({ ...assistantForm, category: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="as-desc">Description</Label>
              <Input id="as-desc" value={assistantForm.description} onChange={(e) => setAssistantForm({ ...assistantForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="as-prompt">System Prompt</Label>
              <Textarea
                id="as-prompt"
                rows={6}
                value={assistantForm.system_prompt}
                onChange={(e) => setAssistantForm({ ...assistantForm, system_prompt: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="as-model">Model</Label>
                <Input id="as-model" value={assistantForm.model} onChange={(e) => setAssistantForm({ ...assistantForm, model: e.target.value })} placeholder="default" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-tokens">Max Tokens</Label>
                <Input id="as-tokens" type="number" value={assistantForm.max_tokens} onChange={(e) => setAssistantForm({ ...assistantForm, max_tokens: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="as-temp">Temperature</Label>
                <Input id="as-temp" type="number" step="0.1" min="0" max="2" value={assistantForm.temperature} onChange={(e) => setAssistantForm({ ...assistantForm, temperature: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={assistantForm.is_active}
                onChange={(e) => setAssistantForm({ ...assistantForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssistantDialog(false)}>Cancel</Button>
            <Button onClick={saveAssistant} disabled={!assistantForm.name.trim()}>
              {editingAssistant ? 'Save Changes' : 'Create Assistant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Template dialog */}
      <DialogRoot open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Prompt Template' : 'New Prompt Template'}</DialogTitle>
            <DialogDescription>Use {'{{ variable }}'} placeholders filled in by the user.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tp-name">Name</Label>
                <Input id="tp-name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tp-category">Category</Label>
                <Input id="tp-category" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-desc">Description</Label>
              <Input id="tp-desc" value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-vars">Variables (comma-separated)</Label>
              <Input id="tp-vars" value={templateForm.variables} onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })} placeholder="topic, level, num_questions" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-body">Template</Label>
              <Textarea
                id="tp-body"
                rows={8}
                value={templateForm.template}
                onChange={(e) => setTemplateForm({ ...templateForm, template: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={templateForm.is_active}
                onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(false)}>Cancel</Button>
            <Button onClick={saveTemplate} disabled={!templateForm.name.trim() || !templateForm.template.trim()}>
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <ConfirmDelete
        open={!!confirmDeleteAssistantId}
        onOpenChange={() => setConfirmDeleteAssistantId(null)}
        title="Delete Assistant"
        description="Are you sure you want to delete this assistant?"
        loading={deleteAssistant.isPending}
        onConfirm={() => {
          if (confirmDeleteAssistantId) deleteAssistant.mutate(confirmDeleteAssistantId, { onSettled: () => setConfirmDeleteAssistantId(null) });
        }}
      />
      <ConfirmDelete
        open={!!confirmDeleteTemplateId}
        onOpenChange={() => setConfirmDeleteTemplateId(null)}
        title="Delete Template"
        description="Are you sure you want to delete this template?"
        loading={deleteTemplate.isPending}
        onConfirm={() => {
          if (confirmDeleteTemplateId) deleteTemplate.mutate(confirmDeleteTemplateId, { onSettled: () => setConfirmDeleteTemplateId(null) });
        }}
      />
    </div>
  );
}
