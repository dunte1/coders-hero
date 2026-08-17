import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Mail, Phone, Building2 } from 'lucide-react';
import type { Employee } from '@/types';
import { getInitials, formatDate, getStatusColor } from '@/lib/utils';

interface EmployeeCardProps {
  employee: Employee;
  onClick?: () => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={employee.user.avatar} />
            <AvatarFallback className="text-lg">
              {getInitials(employee.user.first_name, employee.user.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-900 truncate">
                {employee.user.first_name} {employee.user.last_name}
              </h3>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            </div>
            <p className="text-sm text-brand-600 font-medium mb-2">
              {employee.position?.title}
            </p>
            <div className="space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                {employee.department?.name}
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {employee.user.email}
              </div>
              {employee.user.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {employee.user.phone}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Since {formatDate(employee.hire_date)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
