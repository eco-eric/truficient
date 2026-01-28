import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Zap, MapPin, Home, Calendar } from 'lucide-react';

interface Report {
  location: string;
  bill: string;
  sqft: string;
  month: string;
  note?: string;
}

const gasReports: Report[] = [
  { location: 'Allen, TX', bill: '$723', sqft: '3,200 sq ft', month: 'Jan 2026', note: 'Posted on Reddit' },
  { location: 'Plano, TX', bill: '$335', sqft: '2,100 sq ft', month: 'Dec 2025' },
  { location: 'Frisco, TX', bill: '$400+', sqft: '2,800 sq ft', month: 'Jan 2026' },
];

const heatPumpReports: Report[] = [
  { location: 'Richardson, TX', bill: '$147', sqft: '2,400 sq ft', month: 'Jan 2026' },
  { location: 'McKinney, TX', bill: '$165', sqft: '3,100 sq ft', month: 'Dec 2025' },
  { location: 'Carrollton, TX', bill: '$182', sqft: '2,800 sq ft', month: 'Jan 2026' },
];

interface ReportCardProps {
  report: Report;
  type: 'gas' | 'heatpump';
  index: number;
}

const ReportCard = ({ report, type, index }: ReportCardProps) => {
  const isGas = type === 'gas';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={`border-l-4 ${isGas ? 'border-l-destructive' : 'border-l-secondary'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{report.location}</span>
            </div>
            <div className={`text-2xl font-bold ${isGas ? 'text-destructive' : 'text-secondary'}`}>
              {report.bill}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3" />
              {report.sqft}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {report.month}
            </div>
          </div>
          {report.note && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {report.note}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const HomeownerReports = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real DFW Homeowner Reports
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Actual utility bills reported by homeowners on Reddit and Facebook groups this winter
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Gas Users Column */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Flame className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Gas Furnace Users</h3>
                <p className="text-sm text-muted-foreground">Winter heating bills</p>
              </div>
            </motion.div>
            <div className="space-y-4">
              {gasReports.map((report, index) => (
                <ReportCard key={report.location} report={report} type="gas" index={index} />
              ))}
            </div>
          </div>

          {/* Heat Pump Users Column */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Heat Pump Users</h3>
                <p className="text-sm text-muted-foreground">All-electric heating</p>
              </div>
            </motion.div>
            <div className="space-y-4">
              {heatPumpReports.map((report, index) => (
                <ReportCard key={report.location} report={report} type="heatpump" index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block bg-muted border-0">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
                <span className="text-muted-foreground">Average gas bill:</span>
                <span className="text-2xl font-bold text-destructive">$486</span>
                <span className="text-muted-foreground">vs</span>
                <span className="text-muted-foreground">Average heat pump:</span>
                <span className="text-2xl font-bold text-secondary">$165</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Heat pump users saving an average of 66% on heating costs
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeownerReports;
