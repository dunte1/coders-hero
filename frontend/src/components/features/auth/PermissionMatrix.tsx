import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Permission } from '@/types';

interface PermissionMatrixProps {
  permissions: Permission[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

interface GroupModel {
  label: string;
  permissions: Permission[];
}

function useGroupedPermissions(permissions: Permission[]): GroupModel[] {
  return useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of permissions) {
      const key = permission.group || 'General';
      const list = map.get(key) ?? [];
      list.push(permission);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .map(([label, items]) => ({
        label,
        permissions: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);
}

interface GroupHeaderProps {
  label: string;
  items: Permission[];
  selected: string[];
  onToggleAll: () => void;
}

function GroupHeader({ label, items, selected, onToggleAll }: GroupHeaderProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const selectedCount = items.filter((item) => selected.includes(item.name)).length;
  const allChecked = selectedCount === items.length;
  const indeterminate = selectedCount > 0 && !allChecked;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="flex w-full cursor-pointer items-center justify-between py-2">
      <span className="flex items-center gap-3">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={allChecked}
          onChange={onToggleAll}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-sm font-semibold text-slate-900">{label}</span>
      </span>
      <span className="text-xs text-slate-500">
        {selectedCount} / {items.length}
      </span>
    </label>
  );
}

export function PermissionMatrix({ permissions, selected, onChange, className }: PermissionMatrixProps) {
  const groups = useGroupedPermissions(permissions);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const togglePermission = (name: string) => {
    const next = new Set(selectedSet);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    onChange(Array.from(next));
  };

  const toggleGroup = (items: Permission[]) => {
    const next = new Set(selectedSet);
    const allSelected = items.every((item) => next.has(item.name));
    for (const item of items) {
      if (allSelected) {
        next.delete(item.name);
      } else {
        next.add(item.name);
      }
    }
    onChange(Array.from(next));
  };

  if (permissions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No permissions available. Create permissions first.
      </p>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {groups.map((group) => (
        <div
          key={group.label}
          className="rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-4 rounded-t-xl">
            <GroupHeader
              label={group.label}
              items={group.permissions}
              selected={selected}
              onToggleAll={() => toggleGroup(group.permissions)}
            />
          </div>
          <div className="grid grid-cols-1 gap-1 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.permissions.map((permission) => {
              const isSelected = selectedSet.has(permission.name);
              return (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePermission(permission.name)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        isSelected ? 'text-slate-900' : 'text-slate-600'
                      )}
                    >
                      {permission.display_name || permission.name}
                    </span>
                    <span className="block truncate text-xs text-slate-400">{permission.name}</span>
                    {permission.description && (
                      <span className="block text-xs text-slate-500">{permission.description}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
