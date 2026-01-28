import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Thermometer, Cpu, Shield, CheckCircle } from 'lucide-react';

const temperatureData = [
  { range: 'Below 32°F', percent: 5, label: 'Freezing (5%)' },
  { range: '32°F - 45°F', percent: 35, label: 'Heat Pump Sweet Spot' },
  { range: '45°F - 60°F', percent: 55, label: 'Optimal Efficiency' },
  { range: 'Above 60°F', percent: 5, label: 'Minimal Heating' },
];

const technologyFeatures = [
  'Inverter-driven variable-speed compressors',
  'Flash injection for cold weather performance',
  'Smart defrost cycles (only when needed)',
  'Zoned comfort control options',
  'Whisper-quiet operation (25 dB)',
  'Both heating AND cooling in one system',
];

const BenefitsGrid = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Heat Pumps Win in North Texas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our climate, modern technology, and rate stability make heat pumps the clear choice
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Climate Advantage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Thermometer className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Climate Advantage</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  95% of DFW winter hours are above 32°F — the heat pump efficiency sweet spot
                </p>
                
                {/* Temperature Distribution Bars */}
                <div className="space-y-3">
                  {temperatureData.map((temp) => (
                    <div key={temp.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{temp.range}</span>
                        <span className="font-medium text-foreground">{temp.percent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${temp.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            temp.percent >= 35 ? 'bg-secondary' : 'bg-primary/50'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Technology */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Modern Technology</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Today's heat pumps are engineered for performance your grandparents couldn't imagine
                </p>
                
                <ul className="space-y-3">
                  {technologyFeatures.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rate Stability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Rate Stability</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Electric rates are regulated and predictable — gas is a volatile commodity
                </p>
                
                <div className="space-y-4">
                  {/* Gas Rate */}
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Natural Gas</span>
                      <span className="text-destructive font-bold">+420%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Consumption charges since 2022
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full bg-destructive rounded-full"
                      />
                    </div>
                  </div>

                  {/* Electric Rate */}
                  <div className="p-4 bg-secondary/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Electricity</span>
                      <span className="text-secondary font-bold">+8-12%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average increase over same period
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '12%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full bg-secondary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;
