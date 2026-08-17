import { useAiMyUsage } from '@/hooks/useAi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Bot, MessageSquare, ShieldX, Coins } from 'lucide-react';

export default function AiUsagePage() {
  const { data, isLoading } = useAiMyUsage(30);

  if (isLoading) return <PageSpinner />;

  const usage = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My AI Usage"
        description="Your assistant usage over the last 30 days"
        breadcrumbs={[{ label: 'AI Platform', href: '/ai' }, { label: 'Usage' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={MessageSquare} title="Total Calls" value={usage?.total_calls ?? 0} />
        <StatsCard icon={Bot} title="Blocked Requests" value={usage?.blocked ?? 0} />
        <StatsCard icon={Coins} title="Total Tokens" value={usage?.total_tokens ?? 0} />
        <StatsCard icon={Coins} title="Estimated Cost" value={`$${Number(usage?.total_cost ?? 0).toFixed(4)}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-600" />
            Usage by Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!usage?.by_assistant?.length ? (
            <p className="text-sm text-slate-500">No AI usage recorded yet. Try chatting with an assistant!</p>
          ) : (
            <div className="space-y-3">
              {usage.by_assistant.map((row) => (
                <div key={row.assistant_id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.assistant?.name ?? `Assistant #${row.assistant_id}`}</p>
                    <p className="text-xs text-slate-500">{row.calls} calls</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{row.tokens.toLocaleString()} tokens</p>
                    <p className="text-xs text-slate-500">${Number(row.cost).toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How usage is calculated</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>
            Tokens are counted from the AI provider's response metadata and estimated costs use the
            platform's model pricing table. Blocked requests are messages that triggered safety
            controls and did not reach the provider.
          </p>
          <p>Rate limits apply per user: {15} messages per minute and {300} per day.</p>
        </CardContent>
      </Card>
    </div>
  );
}
