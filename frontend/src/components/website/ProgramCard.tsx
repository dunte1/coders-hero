import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Users } from 'lucide-react';
import type { Program } from '@/types/website';
import { categoryLabels } from '@/lib/websiteApi';

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      to={`/programs/${program.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {program.image_url ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={program.image_url}
            alt={program.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {program.is_featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950">
              Featured
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-brand-50 to-indigo-50">
          <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {categoryLabels[program.category] ?? program.category}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
          {categoryLabels[program.category] ?? program.category}
        </span>
        <h3 className="mt-3 font-display text-lg font-bold text-slate-900 group-hover:text-brand-700">
          {program.name}
        </h3>
        {program.tagline ? (
          <p className="mt-1 text-sm text-slate-500">{program.tagline}</p>
        ) : null}
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{program.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {program.age_group ? (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Ages {program.age_group}
            </span>
          ) : null}
          {program.duration_weeks ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {program.duration_weeks} weeks
            </span>
          ) : null}
          {program.sessions_per_week ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {program.sessions_per_week}x/week
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            {program.price != null ? (
              <>
                <span className="font-display text-lg font-bold text-slate-900">
                  ${program.price}
                </span>
                {program.price_suffix ? (
                  <span className="ml-0.5 text-xs">{program.price_suffix}</span>
                ) : null}
              </>
            ) : (
              <span className="text-sm font-medium text-slate-600">Enquire for pricing</span>
            )}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
            Learn more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
