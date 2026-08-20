import { Link } from 'react-router-dom';
import {
  Bot,
  BrainCircuit,
  Code2,
  FlaskConical,
  Gamepad2,
  Rocket,
  Smartphone,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { Service } from '@/types/website';

const iconMap: Record<string, LucideIcon> = {
  Bot,
  Code2,
  FlaskConical,
  Gamepad2,
  Smartphone,
  BrainCircuit,
  Rocket,
};

export function ServiceCard({ service }: { service: Service }) {
  const Icon = iconMap[service.icon ?? ''] ?? Rocket;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-brand-400 shadow-sm transition-transform group-hover:scale-105">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{service.name}</h3>
      {service.short_description ? (
        <p className="mt-2 text-sm text-slate-600">{service.short_description}</p>
      ) : null}
      {service.features.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {service.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto pt-5">
        <Link
          to="/programs"
          className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          Explore programs →
        </Link>
      </div>
    </div>
  );
}
