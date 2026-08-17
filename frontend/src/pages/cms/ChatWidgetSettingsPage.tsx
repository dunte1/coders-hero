import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Bot, MessageSquare } from 'lucide-react';
import { cmsApi, getErrorMessage } from '@/lib/cmsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ChatSettingsInput } from '@/types/cms';

const chatSchema = z.object({
  widget_title: z.string().min(1, 'Widget title is required'),
  widget_subtitle: z.string().optional(),
  welcome_message: z.string().optional(),
  primary_color: z.string().optional(),
  enabled: z.boolean(),
});

type ChatFormValues = z.infer<typeof chatSchema>;

export default function ChatWidgetSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'chat-settings'],
    queryFn: cmsApi.chatSettings.get,
  });

  const { register, handleSubmit, watch, setValue, reset } = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      widget_title: '',
      widget_subtitle: '',
      welcome_message: '',
      primary_color: '',
      enabled: true,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        widget_title: data.settings.widget_title || '',
        widget_subtitle: data.settings.widget_subtitle || '',
        welcome_message: data.settings.welcome_message || '',
        primary_color: data.settings.primary_color || '',
        enabled: data.settings.enabled === '1' || data.enabled,
      });
    }
  }, [data, reset]);

  const saveSettings = useMutation({
    mutationFn: (settings: ChatSettingsInput) => cmsApi.chatSettings.update(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'chat-settings'] });
      toast.success('Chat settings saved');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onFormSubmit = (values: ChatFormValues) => {
    saveSettings.mutate({
      widget_title: values.widget_title,
      widget_subtitle: values.widget_subtitle || undefined,
      welcome_message: values.welcome_message || undefined,
      primary_color: values.primary_color || undefined,
      enabled: values.enabled,
    });
  };

  if (isLoading) return <PageSpinner />;

  const primaryColor = watch('primary_color');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Widget"
        description="Configure the AI chat assistant shown on the website"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Chat Widget' }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Widget Settings</CardTitle>
              <CardDescription>
                Customize the text and appearance of the chat widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Widget Title"
                placeholder="e.g. Chat with us!"
                {...register('widget_title')}
              />
              <Input
                label="Widget Subtitle"
                placeholder="e.g. We usually reply in minutes"
                {...register('widget_subtitle')}
              />
              <Textarea
                label="Welcome Message"
                rows={3}
                placeholder="Message shown when a visitor opens the chat"
                {...register('welcome_message')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor || '#4f46e5'}
                      onChange={(e) => setValue('primary_color', e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
                    />
                    <Input
                      placeholder="#4f46e5"
                      value={primaryColor}
                      onChange={(e) => setValue('primary_color', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Enabled</p>
                    <p className="text-xs text-slate-500">Show the chat widget on the website</p>
                  </div>
                  <Switch checked={watch('enabled')} onCheckedChange={(v) => setValue('enabled', v)} />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-end">
            <Button type="submit" loading={saveSettings.isPending}>
              Save Settings
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">LLM Configured</p>
                  <p className="text-xs text-slate-500">API key for the language model</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-medium',
                    data?.llm_configured ? 'text-emerald-600' : 'text-red-500'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      data?.llm_configured ? 'bg-emerald-500' : 'bg-red-500'
                    )}
                  />
                  {data?.llm_configured ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Model</p>
                  <p className="text-xs text-slate-500">Active language model</p>
                </div>
                <span className="font-mono text-sm text-slate-700">{data?.model || '—'}</span>
              </div>
              {!data?.llm_configured && (
                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  Set the <code className="font-mono">OPENAI_API_KEY</code> environment variable in
                  the backend to enable AI-powered responses.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 h-4 w-4 text-brand-600" />
                <p className="text-sm text-brand-700">
                  Visitors will see the widget on every public page. The assistant answers
                  questions using your site content (sections, programs, services, FAQs and blog
                  posts).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
