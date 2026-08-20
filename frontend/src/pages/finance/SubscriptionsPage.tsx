import { useState } from 'react';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api';

const unwrap = <T,>(res: { data: { data: T } }): T => res.data.data;

interface Subscription {
  id: number;
  plan: string;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  current_period_end: string | null;
  created_at: string;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

const plans: PlanOption[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 2500,
    period: 'month',
    features: ['Full course access', 'AI Tutor', 'Forum access', 'Certificates'],
  },
  {
    id: 'termly',
    name: 'Termly',
    price: 6500,
    period: 'term',
    features: ['Full course access', 'AI Tutor', 'Forum access', 'Certificates', 'Priority support'],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 22000,
    period: 'year',
    features: ['Full course access', 'AI Tutor', 'Forum access', 'Certificates', 'Priority support', '2 months free'],
  },
];

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => api.get('/subscriptions/current').then(unwrap<Subscription | null>),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) =>
      api.post('/subscriptions', { plan: planId }).then(unwrap<Subscription>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
      toast.success('Subscription updated');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post('/subscriptions/cancel').then(unwrap<Subscription>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
      toast.success('Subscription cancelled');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <Spinner />;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Manage your subscription plan."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Subscription' }]}
      />

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {statusIcon(subscription.status)}
              <div>
                <p className="font-semibold text-slate-900 capitalize">{subscription.plan} Plan</p>
                <div className="flex items-center gap-2">
                  <Badge variant={subscription.status === 'active' ? 'success' : subscription.status === 'trialing' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                  {subscription.current_period_end && (
                    <span className="text-sm text-slate-500">
                      Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {subscription.status === 'active' && (
              <div className="mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => cancelMutation.mutate()}
                  loading={cancelMutation.isPending}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Available Plans</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan === plan.id;
            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative',
                  isCurrent && 'ring-2 ring-brand-500'
                )}
              >
                {plan.id === 'annual' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Best Value</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-slate-900">{formatKES(plan.price)}</span>
                    <span className="text-sm text-slate-500">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.id === 'annual' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => subscribeMutation.mutate(plan.id)}
                      loading={subscribeMutation.isPending}
                    >
                      {subscription?.status === 'active' ? 'Switch Plan' : 'Subscribe'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
