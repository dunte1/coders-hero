import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/types/website';
import { cn } from '@/lib/utils';

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.id}
            className={cn(
              'overflow-hidden rounded-2xl border bg-white transition-colors',
              isOpen ? 'border-brand-200 shadow-sm' : 'border-slate-200'
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <span className="font-medium text-slate-900">{faq.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-slate-400 transition-transform',
                  isOpen && 'rotate-180 text-brand-600'
                )}
              />
            </button>
            {isOpen ? (
              <div
                id={`faq-answer-${faq.id}`}
                role="region"
                className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600"
              >
                {faq.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
