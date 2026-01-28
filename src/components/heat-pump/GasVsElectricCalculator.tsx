import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Flame, Zap, TrendingDown, DollarSign } from 'lucide-react';

// Constants based on 2026 Atmos Energy rates
const ATMOS_EFFECTIVE_RATE = 2.47; // $/Ccf (all-in effective rate)
const FEDERAL_TAX_CREDIT = 2000;
const WINTER_MONTHS = 5;

interface TierOption {
  label: string;
  seer: number;
  description: string;
}

const tierOptions: TierOption[] = [
  { label: 'Good', seer: 14, description: '14-15 SEER2' },
  { label: 'Better', seer: 16, description: '16-17 SEER2' },
  { label: 'Premium', seer: 18, description: '18-19 SEER2' },
  { label: 'Elite', seer: 20, description: '20+ SEER2' },
];

const GasVsElectricCalculator = () => {
  const [squareFootage, setSquareFootage] = useState(2500);
  const [thermostatTemp, setThermostatTemp] = useState(72);
  const [electricRate, setElectricRate] = useState(0.13);
  const [selectedTierIndex, setSelectedTierIndex] = useState(2); // Premium default

  const heatPumpSEER = tierOptions[selectedTierIndex].seer;

  const calculations = useMemo(() => {
    // Gas furnace calculation
    const ccfPerMonth = (squareFootage / 2500) * 120 * (thermostatTemp - 65) / 7;
    const monthlyGasCost = ccfPerMonth * ATMOS_EFFECTIVE_RATE + 20; // $20 base charge

    // Heat pump calculation  
    const heatPumpCOP = heatPumpSEER >= 20 ? 3.2 : heatPumpSEER >= 16 ? 2.8 : 2.5;
    const btuNeeded = squareFootage * 30 * (thermostatTemp - 45) / 25;
    const kwhPerMonth = (btuNeeded / 3412 / heatPumpCOP) * 30;
    const monthlyHeatPumpCost = kwhPerMonth * electricRate;

    const monthlySavings = monthlyGasCost - monthlyHeatPumpCost;
    const annualSavings = monthlySavings * WINTER_MONTHS;
    const fiveYearSavings = annualSavings * 5;

    return {
      monthlyGasCost: Math.round(monthlyGasCost),
      monthlyHeatPumpCost: Math.round(monthlyHeatPumpCost),
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      fiveYearSavings: Math.round(fiveYearSavings),
      savingsPercent: Math.round((monthlySavings / monthlyGasCost) * 100),
    };
  }, [squareFootage, thermostatTemp, electricRate, heatPumpSEER]);

  return (
    <section id="calculator" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Gas vs. Heat Pump Calculator
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See your personalized savings based on your home and current electric rates
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardContent className="p-6 md:p-8 space-y-8">
                {/* Square Footage */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-foreground">Home Size</label>
                    <span className="text-lg font-bold text-primary">{squareFootage.toLocaleString()} sq ft</span>
                  </div>
                  <Slider
                    value={[squareFootage]}
                    onValueChange={(value) => setSquareFootage(value[0])}
                    min={1000}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1,000 sq ft</span>
                    <span>5,000 sq ft</span>
                  </div>
                </div>

                {/* Thermostat Setting */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-foreground">Winter Thermostat</label>
                    <span className="text-lg font-bold text-primary">{thermostatTemp}°F</span>
                  </div>
                  <Slider
                    value={[thermostatTemp]}
                    onValueChange={(value) => setThermostatTemp(value[0])}
                    min={65}
                    max={78}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>65°F</span>
                    <span>78°F</span>
                  </div>
                </div>

                {/* Electric Rate */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-foreground">Your Electric Rate</label>
                    <span className="text-lg font-bold text-primary">${electricRate.toFixed(2)}/kWh</span>
                  </div>
                  <Slider
                    value={[electricRate * 100]}
                    onValueChange={(value) => setElectricRate(value[0] / 100)}
                    min={8}
                    max={18}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0.08</span>
                    <span>$0.18</span>
                  </div>
                </div>

                {/* SEER Tier Selection */}
                <div>
                  <label className="font-semibold text-foreground mb-3 block">Heat Pump Efficiency</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tierOptions.map((tier, index) => (
                      <Button
                        key={tier.label}
                        variant={selectedTierIndex === index ? 'default' : 'outline'}
                        className={`flex flex-col h-auto py-3 ${
                          selectedTierIndex === index 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-primary/10'
                        }`}
                        onClick={() => setSelectedTierIndex(index)}
                      >
                        <span className="font-semibold">{tier.label}</span>
                        <span className="text-xs opacity-80">{tier.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full bg-primary text-primary-foreground">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6" />
                  Your Estimated Savings
                </h3>

                {/* Monthly Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-destructive/20 rounded-lg p-4 text-center">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-destructive" />
                    <div className="text-sm opacity-80 mb-1">Gas Furnace</div>
                    <div className="text-2xl md:text-3xl font-bold">${calculations.monthlyGasCost}</div>
                    <div className="text-xs opacity-60">/month</div>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-4 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-secondary" />
                    <div className="text-sm opacity-80 mb-1">Heat Pump</div>
                    <div className="text-2xl md:text-3xl font-bold">${calculations.monthlyHeatPumpCost}</div>
                    <div className="text-xs opacity-60">/month</div>
                  </div>
                </div>

                {/* Savings Breakdown */}
                <div className="space-y-4">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Monthly Savings</span>
                      <span className="text-2xl font-bold text-secondary">
                        ${calculations.monthlySavings}
                      </span>
                    </div>
                    <div className="text-sm opacity-70 mt-1">
                      {calculations.savingsPercent}% less than gas
                    </div>
                  </div>

                  <div className="bg-primary-foreground/10 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Annual Savings</span>
                      <span className="text-xl font-bold">${calculations.annualSavings.toLocaleString()}</span>
                    </div>
                    <div className="text-sm opacity-70 mt-1">
                      Based on {WINTER_MONTHS} winter months
                    </div>
                  </div>

                  <div className="bg-primary-foreground/10 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">5-Year Savings</span>
                      <span className="text-xl font-bold">${calculations.fiveYearSavings.toLocaleString()}</span>
                    </div>
                    <div className="text-sm opacity-70 mt-1">
                      Plus $2,000 federal tax credit
                    </div>
                  </div>
                </div>

                {/* Total Value */}
                <div className="mt-6 pt-6 border-t border-primary-foreground/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-secondary" />
                    <span className="text-sm">Total 5-Year Value</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-secondary">
                    ${(calculations.fiveYearSavings + FEDERAL_TAX_CREDIT).toLocaleString()}
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

export default GasVsElectricCalculator;
