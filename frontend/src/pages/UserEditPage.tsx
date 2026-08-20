import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';

const schema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(parseInt(id || '0'));
  const updateUser = useUpdateUser();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      email: user?.email || '',
      name: user?.name || '',
      phone: user?.phone || '',
      is_active: user?.is_active ?? true,
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!user) return <div className="text-center py-12">User not found</div>;

  const onSubmit = (data: FormValues) => {
    updateUser.mutate({ id: user.id, data }, { onSuccess: () => navigate('/users') });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Edit User"
        breadcrumbs={[{ label: 'Users', href: '/users' }, { label: 'Edit' }]}
      />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" type="tel" {...register('phone')} />
            <div className="flex items-center gap-3">
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>Cancel</Button>
              <Button type="submit" loading={updateUser.isPending}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
