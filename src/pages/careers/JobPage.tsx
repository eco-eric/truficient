import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckCircle, Clock, DollarSign, Gift, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JobApplicationForm from '@/components/careers/JobApplicationForm';
import { usePageSEO } from '@/hooks/usePageSEO';
import { trackPhoneCallClick } from '@/utils/conversionTracking';
import { HIRING_STEPS, POSITION_OPTIONS, getJobBySlug, type JobOpening } from '@/data/careers';
import NotFound from '@/pages/NotFound';

const SITE = 'https://truficient.com';

// JobPosting structured data. baseSalary is left out until pay is filled in
// src/data/careers.ts; Google treats the posting as valid without it.
const buildJobPosting = (job: JobOpening) => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: [...job.intro, 'Responsibilities: ' + job.responsibilities.join('; '), 'Requirements: ' + job.requirements.join('; ')].join('\n\n'),
    datePosted: job.datePosted,
    employmentType: job.employmentType,
    directApply: true,
    url: `${SITE}${job.path}/`,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Truficient Energy Solutions',
      sameAs: SITE,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dallas',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
    },
  };
  return schema;
};

interface Props {
  slug: string;
}

const JobPage = ({ slug }: Props) => {
  const job = getJobBySlug(slug);
  usePageSEO(job?.path);

  useEffect(() => {
    if (!job) return;
    const id = `job-posting-${job.slug}-jsonld`;
    document.getElementById(id)?.remove();
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(buildJobPosting(job));
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [job]);

  if (!job) return <NotFound />;

  const facts = [
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Type', value: job.employmentType === 'FULL_TIME' ? 'Full-time' : 'Part-time' },
    job.pay ? { icon: DollarSign, label: 'Pay', value: job.pay } : null,
    job.schedule ? { icon: Clock, label: 'Schedule', value: job.schedule } : null,
    job.benefits ? { icon: Gift, label: 'Benefits', value: job.benefits } : null,
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  return (
    <div className="min-h-screen flex flex-col" data-ssg-ready="true">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 md:py-20 bg-gradient-to-br from-primary via-primary to-navy-dark overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/careers" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> All openings
            </Link>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-4">
              {job.badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">{job.title}</h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl">{job.summary}</p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                <a href="#apply">Apply now</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                {job.intro.map((p) => (
                  <p key={p} className="text-muted-foreground leading-relaxed">{p}</p>
                ))}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">What you will do</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="flex gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">What we are looking for</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item) => (
                    <li key={item} className="flex gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">How hiring works</h2>
                <ol className="space-y-4">
                  {HIRING_STEPS.map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-foreground">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <aside>
              <Card className="lg:sticky lg:top-24">
                <CardContent className="p-6 space-y-4">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex gap-3">
                      <Icon className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="text-foreground font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                  <Button asChild className="w-full bg-secondary hover:bg-gold-dark text-secondary-foreground font-semibold">
                    <a href="#apply">Apply now</a>
                  </Button>
                  <a
                    href="tel:214-238-4349"
                    onClick={() => trackPhoneCallClick(`Careers - ${job.shortTitle}`)}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="w-4 h-4" /> Questions? 214-238-4349
                  </a>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        <section id="apply" className="py-12 md:py-16 bg-muted scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Apply for this job</h2>
              <p className="text-muted-foreground">It takes about five minutes. A resume is optional.</p>
            </div>
            <JobApplicationForm
              defaultPosition={(POSITION_OPTIONS as readonly string[]).includes(job.shortTitle) ? job.shortTitle : ''}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JobPage;
