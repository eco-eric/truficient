import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  ShieldCheck,
  Gauge,
  Volume2,
  Leaf,
  Snowflake,
  Wrench,
  Wind,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { usePageSEO } from '@/hooks/usePageSEO';

const LINEUP = [
  { model: 'XV20i', type: 'Air Conditioner', seer: '22 SEER', hspf: '—', best: 'Maximum efficiency' },
  { model: 'XV20i', type: 'Heat Pump', seer: '21 SEER', hspf: '10 HSPF', best: 'Heating + cooling, top efficiency' },
  { model: 'XV18', type: 'AC / Heat Pump', seer: '18 SEER', hspf: '10 HSPF', best: 'High efficiency, great value' },
  { model: 'XV19 Low Profile', type: 'Heat Pump', seer: '19.5 SEER', hspf: '11.5 HSPF', best: 'Tight spaces, strong heating' },
  {
    model: '17 Multi-Speed (5TTR7/5TWR7/5TTX7/5TWX7)',
    type: 'AC / Heat Pump',
    seer: '17.1 SEER2',
    hspf: '11 HSPF2',
    best: 'Inverter performance at a lower system cost; can reuse existing furnace',
  },
];

const BENEFITS = [
  {
    icon: Gauge,
    title: 'Consistent Comfort',
    body: 'Variable-speed operation holds your set temperature steady instead of cycling on and off all day.',
  },
  {
    icon: Leaf,
    title: 'Lower Energy Use',
    body: 'Running longer at lower speeds uses less power than repeated full-blast starts.',
  },
  {
    icon: Volume2,
    title: 'Quieter Operation',
    body: 'Lower fan and compressor speeds mean noticeably quieter indoor and outdoor units.',
  },
];

export default function TraneBrand() {
  usePageSEO('/equipment/trane', { skipGlobalSchema: true });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#142844] text-white py-20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#cc0000]" aria-hidden="true" />
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border border-[#cc0000]/60">
                Certified Trane Installer
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Trane — Engineered for Comfort, Built to Last
              </h1>
              <p className="text-xl text-white/85 mb-8 max-w-2xl mx-auto">
                Truficient Energy Solutions is a certified Trane installer serving Dallas–Fort Worth homeowners
                with reliable, professionally installed Trane heating and cooling systems.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
                  <Award className="w-4 h-4 text-[#d4a84b]" />
                  America's Most Trusted HVAC Brand — 7 consecutive years
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#d4a84b]" />
                  Most reliable heating and cooling equipment brand
                </div>
              </div>

              <Link to="/estimate">
                <Button
                  size="lg"
                  className="bg-[#d4a84b] hover:bg-[#c39a3d] text-[#1e3a5f] font-semibold h-14 px-8 text-lg"
                >
                  Get a Free Estimate
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* WHY VARIABLE SPEED */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-[#A5A983]/20 text-[#1e3a5f]">
                TruComfort Variable Speed
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                Why Variable Speed Changes Everything
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Traditional systems blast on at 100%, shut off, and repeat all day. A Trane TruComfort
                variable-speed system runs longer at lower speeds — giving you steadier temperatures, better
                humidity control, cleaner air, quieter operation, and lower running costs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {BENEFITS.map((b) => (
                <Card key={b.title} className="p-6 border-t-4 border-t-[#d4a84b]">
                  <b.icon className="w-10 h-10 text-[#1e3a5f] mb-4" />
                  <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{b.title}</h3>
                  <p className="text-muted-foreground">{b.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* LINEUP */}
        <section className="py-16 bg-[#A5A983]/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">Trane System Lineup</h2>
              <p className="text-lg text-muted-foreground">
                A homeowner-friendly look at Trane's most popular residential systems.
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-lg border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#1e3a5f] text-white">
                  <tr>
                    <th className="text-left p-4 font-semibold">Model</th>
                    <th className="text-left p-4 font-semibold">Type</th>
                    <th className="text-left p-4 font-semibold">Up to SEER</th>
                    <th className="text-left p-4 font-semibold">Up to HSPF</th>
                    <th className="text-left p-4 font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {LINEUP.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-4 font-semibold text-[#1e3a5f]">{row.model}</td>
                      <td className="p-4">{row.type}</td>
                      <td className="p-4 font-medium">{row.seer}</td>
                      <td className="p-4 font-medium">{row.hspf}</td>
                      <td className="p-4 text-muted-foreground">{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {LINEUP.map((row, i) => (
                <Card key={i} className="p-5 border-l-4 border-l-[#d4a84b]">
                  <div className="font-bold text-[#1e3a5f] text-lg mb-1">{row.model}</div>
                  <div className="text-sm text-muted-foreground mb-3">{row.type}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Up to SEER</div>
                      <div className="font-semibold">{row.seer}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Up to HSPF</div>
                      <div className="font-semibold">{row.hspf}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-[#1e3a5f]">Best for: </span>
                    <span className="text-muted-foreground">{row.best}</span>
                  </div>
                </Card>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4 italic">
              SEER2 / HSPF2 are the current efficiency standards.
            </p>
          </div>
        </section>

        {/* KEY TECHNOLOGY */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">Key Trane Technology</h2>
              <p className="text-lg text-muted-foreground">What makes a Trane system different.</p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-l-[#1e3a5f]">
                <div className="flex items-start gap-4">
                  <Snowflake className="w-8 h-8 text-[#1e3a5f] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">
                      ComfortSeek <span className="text-sm font-normal text-muted-foreground">(17 Multi-Speed)</span>
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Automatically adjusts capacity to outdoor temperature — more output when it's extremely
                      hot or cold, and more efficiency in mild weather.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-[#A5A983]/20 text-[#1e3a5f] px-3 py-1.5 rounded-full text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Cold-climate capable: up to 70% heating capacity at 5°F — may qualify for incentives.
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#d4a84b]">
                <div className="flex items-start gap-4">
                  <Gauge className="w-8 h-8 text-[#d4a84b] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">
                      Climatuff Variable-Speed Compressor
                    </h3>
                    <p className="text-muted-foreground">
                      The heart of every TruComfort system — a self-adjusting compressor that fine-tunes
                      itself moment to moment for constant, even comfort.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-[#A5A983]">
                <div className="flex items-start gap-4">
                  <Wrench className="w-8 h-8 text-[#A5A983] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">Built to Last</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A5A983] flex-shrink-0 mt-0.5" />
                        <span><strong>SEET-tested:</strong> five years of real-world wear simulated in months.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A5A983] flex-shrink-0 mt-0.5" />
                        <span><strong>Spine Fin coils</strong> for efficient heat transfer and corrosion resistance.</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A5A983] flex-shrink-0 mt-0.5" />
                        <span><strong>WeatherGuard top</strong> and <strong>DuraTuff rustproof basepan</strong> stand up to Texas weather.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* INDOOR AIR QUALITY */}
        <section className="py-16 bg-[#1e3a5f]/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">Cleaner, Healthier Air</h2>
              <p className="text-lg text-muted-foreground">
                Pair your Trane system with whole-home indoor air quality accessories.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <Wind className="w-10 h-10 text-[#1e3a5f] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1e3a5f] mb-2">CleanEffects Air Cleaner</h3>
                <p className="text-sm text-muted-foreground">Whole-home filtration that captures particles down to 0.3 microns.</p>
              </Card>
              <Card className="p-6 text-center">
                <Wind className="w-10 h-10 text-[#1e3a5f] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1e3a5f] mb-2">Energy Recovery Ventilators</h3>
                <p className="text-sm text-muted-foreground">Brings in fresh outdoor air without losing your conditioned air.</p>
              </Card>
              <Card className="p-6 text-center">
                <Wind className="w-10 h-10 text-[#1e3a5f] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1e3a5f] mb-2">Humidifiers & Dehumidifiers</h3>
                <p className="text-sm text-muted-foreground">Dial in the perfect humidity year-round for comfort and health.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* WARRANTY + TRUST */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-[#d4a84b] text-[#1e3a5f] hover:bg-[#d4a84b]">Warranty</Badge>
                <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Backed by Trane. Installed by Truficient.</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">12-year limited warranty</strong> on the compressor (residential use).</span>
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1e3a5f] flex-shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">10-year limited warranty</strong> on the outdoor coil and other internal parts (residential use).</span>
                  </li>
                </ul>
              </div>
              <Card className="p-8 bg-gradient-to-br from-[#1e3a5f] to-[#142844] text-white border-0">
                <Award className="w-12 h-12 text-[#d4a84b] mb-4" />
                <h3 className="text-2xl font-bold mb-3">Mitsubishi Diamond + Trane Installer</h3>
                <p className="text-white/85 mb-4">
                  Truficient Energy Solutions has completed <strong className="text-[#d4a84b]">1,000+ installs</strong>
                  {' '}across the DFW area. You get factory-trained installation and local accountability.
                </p>
                <div className="text-sm text-white/70">TACLA142792E</div>
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 bg-[#1e3a5f] text-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready for reliable comfort?
            </h2>
            <p className="text-xl text-white/85 mb-8">
              Get your free, no-pressure estimate from a certified Trane installer.
            </p>
            <Link to="/estimate">
              <Button
                size="lg"
                className="bg-[#d4a84b] hover:bg-[#c39a3d] text-[#1e3a5f] font-semibold h-14 px-10 text-lg"
              >
                Get Your Free Estimate
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
