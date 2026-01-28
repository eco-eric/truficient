import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const rateData = [
  { year: '2022', increase: '+$4.17/mo', cumulative: '$4.17', change: '~4%', highlight: false },
  { year: '2023', increase: '+$5.73/mo', cumulative: '$9.90', change: '~5%', highlight: false },
  { year: '2024', increase: '+$13.69/mo', cumulative: '$23.59', change: '+14.94%', highlight: true },
  { year: '2025', increase: '+$7.83/mo', cumulative: '$31.42', change: '+7.93%', highlight: true },
  { year: '2026', increase: '+$11.25/mo', cumulative: '$42.67', change: '+10.4%', highlight: true },
];

const RateTimelineTable = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Alert Card */}
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    Atmos Energy Rate Crisis: 420% Increase in Consumption Charges
                  </h2>
                  <p className="text-muted-foreground">
                    Since 2022, Atmos Energy has increased the consumption charge from $0.47/Ccf to $2.47/Ccf — 
                    a 420% increase. This doesn't include monthly base charges, taxes, or pipeline fees.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Timeline Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="px-4 py-3 text-left font-semibold">Year</th>
                      <th className="px-4 py-3 text-left font-semibold">Rate Increase</th>
                      <th className="px-4 py-3 text-left font-semibold">Cumulative Impact</th>
                      <th className="px-4 py-3 text-left font-semibold">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateData.map((row, index) => (
                      <motion.tr
                        key={row.year}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`border-b border-border ${
                          row.highlight ? 'bg-destructive/5' : 'bg-background'
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-foreground">{row.year}</td>
                        <td className="px-4 py-3 text-destructive font-medium">{row.increase}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.cumulative}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 ${
                            row.highlight ? 'text-destructive font-semibold' : 'text-muted-foreground'
                          }`}>
                            <TrendingUp className={`w-4 h-4 ${row.highlight ? 'text-destructive' : ''}`} />
                            {row.change}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted">
                      <td colSpan={4} className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-foreground font-semibold">
                          <span>Total consumption charge increase:</span>
                          <span className="text-xl text-destructive">420%</span>
                          <span className="text-muted-foreground font-normal">
                            ($0.47 → $2.47 per Ccf)
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Context Note */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Source: Atmos Energy Mid-Tex Division rate filings with Texas Railroad Commission
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RateTimelineTable;
