import { useState } from 'react';
import { motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ExternalLink } from 'lucide-react';

const sources = [
  {
    title: 'Atmos Energy Rate Filings',
    description: 'Texas Railroad Commission GUD rate case filings for Mid-Tex Division (2022-2026)',
    url: 'https://www.rrc.texas.gov',
  },
  {
    title: 'NOAA Climate Data',
    description: 'Dallas-Fort Worth temperature distribution based on 30-year climate normals',
    url: 'https://www.weather.gov',
  },
  {
    title: 'AHRI Performance Data',
    description: 'Heat pump COP and efficiency ratings at various operating temperatures',
    url: 'https://www.ahrinet.org',
  },
  {
    title: 'IRS Energy Credits',
    description: 'Residential Clean Energy Credit (25D) for heat pump installations',
    url: 'https://www.irs.gov/credits-deductions/home-energy-tax-credits',
  },
  {
    title: 'Real Homeowner Reports',
    description: 'Bills shared on r/Dallas, r/plano, r/frisco, and local Facebook groups (Jan 2026)',
    url: '#',
  },
];

const DataSourcesSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-medium">Data Sources & Methodology</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </motion.button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="py-6 space-y-6">
                <div className="grid gap-4">
                  {sources.map((source) => (
                    <div key={source.title} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">{source.title}</span>
                        <span className="text-muted-foreground"> — {source.description}</span>
                        {source.url !== '#' && (
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center gap-1 text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">Calculation Methodology</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>
                      • Gas cost = (Sq ft / 2,500) × 120 Ccf × (Thermostat - 65°F) / 7 × $2.47/Ccf + $20 base
                    </li>
                    <li>
                      • Heat pump COP: 2.5 (14 SEER), 2.8 (16-18 SEER), 3.2 (20+ SEER)
                    </li>
                    <li>
                      • Winter heating season = 5 months (Nov-Mar)
                    </li>
                    <li>
                      • All costs are estimates based on typical DFW installations
                    </li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. 
                  Actual savings will vary based on home insulation, usage patterns, equipment efficiency, 
                  and utility rates. Contact us for a personalized assessment.
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
};

export default DataSourcesSection;
