import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Zap, CheckCircle, MinusCircle, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const FEDERAL_TAX_CREDIT = 2000;

// Fallback values matching current database
const FALLBACK_GAS_TOTAL = 15562;
const FALLBACK_HEAT_PUMP_TOTAL = 13562;

const gasSystemItems = [
  'Goodman 16 SEER2 Inverter Air Conditioner',
  '80% AFUE Gas Furnace (60,000 BTU)',
  'Evaporator Coil',
  'Connected Smart Thermostat',
  'Professional Installation',
  '10-Year Warranty',
];

const heatPumpItems = [
  'Goodman 16 SEER2 Inverter Heat Pump',
  'Variable Speed Air Handler',
  'Backup Heat Kit',
  'Connected Smart Thermostat',
  'Professional Installation',
  '10-Year Warranty',
];

const ROIComparison = () => {
  const { data: systems, isLoading } = useQuery({
    queryKey: ['goodman-3-ton-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ducted_equipment')
        .select('*')
        .eq('brand', 'Goodman')
        .eq('tonnage', 3)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Extract gas and heat pump systems
  const gasSystem = systems?.find(s => s.system_type === 'gas_system');
  const heatPumpSystem = systems?.find(s => s.system_type === 'heat_pump');

  // Calculate totals with fallbacks
  const gasTotal = gasSystem 
    ? Number(gasSystem.equipment_cost || 0) + Number(gasSystem.installation_labor || 0)
    : FALLBACK_GAS_TOTAL;
  
  const heatPumpSubtotal = heatPumpSystem 
    ? Number(heatPumpSystem.equipment_cost || 0) + Number(heatPumpSystem.installation_labor || 0)
    : FALLBACK_GAS_TOTAL;
  
  const heatPumpTotal = heatPumpSubtotal - FEDERAL_TAX_CREDIT;
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

                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">What's Included:</p>
                  <ul className="space-y-2">
                    {gasSystemItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-foreground">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-destructive/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total Investment</span>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <span className="text-2xl font-bold text-destructive">${gasTotal.toLocaleString()}</span>
                    )}
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

                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">What's Included:</p>
                  <ul className="space-y-2">
                    {heatPumpItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-foreground">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-foreground">Subtotal</span>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <span className="font-semibold text-foreground">${heatPumpSubtotal.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-secondary font-medium">Federal Tax Credit</span>
                    <span className="font-semibold text-secondary">-${FEDERAL_TAX_CREDIT.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-secondary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Total After Credits</span>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <span className="text-2xl font-bold text-secondary">${heatPumpTotal.toLocaleString()}</span>
                    )}
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
                  {isLoading ? (
                    <Skeleton className="h-9 w-24 bg-secondary-foreground/20" />
                  ) : (
                    <div className="text-3xl font-bold">${Math.abs(savings).toLocaleString()}</div>
                  )}
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
