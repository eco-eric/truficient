import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Zap, CheckCircle, MinusCircle, DollarSign } from 'lucide-react';

const gasSystemCosts = [
  { item: 'Gas Furnace (80% AFUE)', cost: 4500 },
  { item: 'Air Conditioner (14 SEER2)', cost: 5500 },
  { item: 'Installation Labor', cost: 3500 },
  { item: 'Gas Line & Venting', cost: 1500 },
];

const heatPumpCosts = [
  { item: 'Heat Pump (18 SEER2)', cost: 8500 },
  { item: 'Air Handler w/ Backup', cost: 3000 },
  { item: 'Installation Labor', cost: 3000 },
  { item: 'Federal Tax Credit', cost: -2000 },
];

const ROIComparison = () => {
  const gasTotal = gasSystemCosts.reduce((sum, item) => sum + item.cost, 0);
  const heatPumpTotal = heatPumpCosts.reduce((sum, item) => sum + item.cost, 0);
  const savings = gasTotal - heatPumpTotal;

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
            Installation Cost Comparison
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Heat pumps aren't just cheaper to run — they can cost less to install
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Gas System */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full border-destructive/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <Flame className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Gas Furnace + AC</h3>
                    <p className="text-sm text-muted-foreground">Traditional heating & cooling</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {gasSystemCosts.map((item) => (
                    <div key={item.item} className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-foreground">{item.item}</span>
                      <span className="font-semibold text-foreground">${item.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-destructive/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total Investment</span>
                    <span className="text-2xl font-bold text-destructive">${gasTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MinusCircle className="w-4 h-4 text-destructive" />
                    No federal tax credits
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MinusCircle className="w-4 h-4 text-destructive" />
                    Separate heating & cooling systems
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MinusCircle className="w-4 h-4 text-destructive" />
                    Subject to volatile gas prices
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Heat Pump System */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-secondary/50 relative overflow-hidden">
              {/* Best Value Badge */}
              <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-4 py-1 text-sm font-semibold">
                BEST VALUE
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Heat Pump System</h3>
                    <p className="text-sm text-muted-foreground">All-in-one heating & cooling</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {heatPumpCosts.map((item) => (
                    <div key={item.item} className="flex justify-between items-center py-2 border-b border-border">
                      <span className={item.cost < 0 ? 'text-secondary font-medium' : 'text-foreground'}>
                        {item.item}
                      </span>
                      <span className={`font-semibold ${item.cost < 0 ? 'text-secondary' : 'text-foreground'}`}>
                        {item.cost < 0 ? '-' : ''}${Math.abs(item.cost).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total After Credits</span>
                    <span className="text-2xl font-bold text-secondary">${heatPumpTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    $2,000 federal tax credit included
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    One system for heating AND cooling
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Protected from gas rate increases
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Savings Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Card className="inline-block bg-secondary text-secondary-foreground border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3">
                <DollarSign className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-sm opacity-80">Immediate Savings</div>
                  <div className="text-3xl font-bold">${Math.abs(savings).toLocaleString()}</div>
                </div>
              </div>
              <p className="text-sm mt-2 opacity-90">
                Heat pump costs less than gas + AC — before operating savings!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ROIComparison;
