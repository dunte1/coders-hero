import { useQuery } from '@tanstack/react-query';
import { Building2, Mail, Phone, MapPin, Users } from 'lucide-react';
import { websiteApi } from '@/lib/websiteApi';
import { usePageMeta, formatSiteTitle } from '@/hooks/usePageMeta';
import { useCachedSiteName } from '@/hooks/useCachedSiteSettings';
import { usePageView } from '@/hooks/usePageView';
import { PageBanner } from '@/components/website/PageBanner';
import { Spinner } from '@/components/ui/Spinner';
import type { PartnerSchool } from '@/types/website';

const typeColors: Record<string, string> = {
  feeder: 'bg-blue-100 text-blue-700',
  sibling: 'bg-purple-100 text-purple-700',
  affiliate: 'bg-emerald-100 text-emerald-700',
  other: 'bg-slate-100 text-slate-700',
};

const typeLabels: Record<string, string> = {
  feeder: 'Feeder School',
  sibling: 'Sibling School',
  affiliate: 'Affiliate',
  other: 'Partner',
};

export default function PartnerSchoolsPage() {
  const siteName = useCachedSiteName();
  usePageMeta({ title: formatSiteTitle('School Partnerships', siteName) });
  usePageView();

  const { data: schools, isLoading, isError } = useQuery({
    queryKey: ['website', 'partner-schools'],
    queryFn: () => websiteApi.partnerSchools.list(),
  });

  return (
    <>
      <PageBanner
        badge="Partnerships"
        title="School Partnerships"
        subtitle="We collaborate with schools across the region to bring coding, robotics, and STEM education to students everywhere."
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Partner Schools</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We partner with schools committed to empowering the next generation with digital skills.
              Our partners benefit from curriculum support, teacher training, and access to our coding and robotics labs.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : isError || !schools || schools.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No partner schools listed yet.</p>
              <p className="text-slate-400 mt-2">Interested in partnering with us? Get in touch!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {schools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          )}

          <div className="mt-16 rounded-2xl bg-slate-50 p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-brand-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Become a Partner School</h3>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              Join our growing network of schools. We provide curriculum, training, equipment, and ongoing support
              to help your students excel in coding, robotics, and STEM.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function SchoolCard({ school }: { school: PartnerSchool }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900">{school.name}</h3>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            typeColors[school.partnership_type] ?? typeColors.other
          }`}
        >
          {typeLabels[school.partnership_type] ?? 'Partner'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-500">
        {school.contact_person && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{school.contact_person}</span>
          </div>
        )}
        {(school.city || school.country) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{[school.city, school.country].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      {school.notes && (
        <p className="mt-4 text-sm text-slate-600 line-clamp-2">{school.notes}</p>
      )}
    </div>
  );
}
