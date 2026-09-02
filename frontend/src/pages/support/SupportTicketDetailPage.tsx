import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supportApi, type TicketStatus, type TicketPriority } from '@/lib/supportApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { getPriorityColor, getStatusColor, formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Send, User } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  billing: 'Billing',
  general: 'General',
  bug_report: 'Bug Report',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function SupportTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';

  const [replyMessage, setReplyMessage] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-ticket', id],
    queryFn: () => supportApi.getTicket(Number(id)),
    enabled: !!id,
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) => supportApi.replyToTicket(Number(id), { message }),
    onSuccess: () => {
      toast.success('Reply sent');
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', id] });
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: TicketStatus; priority?: TicketPriority }) =>
      supportApi.updateTicketStatus(Number(id), data),
    onSuccess: () => {
      toast.success('Ticket updated');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: () => {
      toast.error('Failed to update ticket');
    },
  });

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    replyMutation.mutate(replyMessage.trim());
  };

  if (isLoading) return <PageSpinner />;
  if (!ticket) return <div className="text-center py-12 text-slate-500">Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Support', href: '/support' },
          { label: `#${ticket.id}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Conversation ({ticket.replies?.length || 0})
            </h3>
            {ticket.replies && ticket.replies.length > 0 ? (
              <div className="space-y-4">
                {ticket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-lg border p-4 ${
                      reply.is_staff
                        ? 'bg-brand-50 border-brand-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                        {reply.is_staff ? (
                          <span className="text-brand-600">S</span>
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {reply.user_name}
                      </span>
                      {reply.is_staff && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">Staff</Badge>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">
                        {formatDateTime(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap ml-9">
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No replies yet. Be the first to respond.
              </p>
            )}
          </div>

          {ticket.status !== 'closed' && (
            <Card>
              <CardContent className="p-4">
                <Textarea
                  placeholder="Type your reply..."
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendReply();
                    }
                  }}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || replyMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
                  <Badge className={getStatusColor(ticket.status)}>
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase">Priority</span>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase">Category</span>
                  <Badge variant="secondary">{CATEGORY_LABELS[ticket.category]}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase">Created</span>
                  <span className="text-sm text-slate-700">{formatDate(ticket.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase">Ticket ID</span>
                  <span className="text-sm text-slate-700 font-mono">#{ticket.id}</span>
                </div>
                {ticket.assigned_to_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500 uppercase">Assigned To</span>
                    <span className="text-sm text-slate-700">{ticket.assigned_to_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">Admin Actions</h4>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Change Status</label>
                  <SelectRoot
                    value={ticket.status}
                    onValueChange={(v) => updateMutation.mutate({ status: v as TicketStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Change Priority</label>
                  <SelectRoot
                    value={ticket.priority}
                    onValueChange={(v) => updateMutation.mutate({ priority: v as TicketPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
