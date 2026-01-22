import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Ticket, Home, Snowflake, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScannerCouponProps {
  variant?: 'full' | 'compact';
}

export function ScannerCoupon({ variant = 'full' }: ScannerCouponProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2"
    >
      {/* DFW Only Notice */}
      <p className="text-center text-sm font-medium text-muted-foreground">
        For DFW Customers Only
      </p>
      
      <Card className="overflow-hidden border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Ticket className="w-5 h-5 text-secondary-foreground" />
            <span className="font-bold text-secondary-foreground tracking-wide">
              EXCLUSIVE UPGRADE SAVINGS
            </span>
          </div>
          <p className="text-secondary-foreground/80 text-sm flex items-center justify-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Valid for 90 days from your Equipment Report date
          </p>
        </div>

        <div className={variant === 'compact' ? 'p-4 space-y-3' : 'p-4 sm:p-6 space-y-4'}>
          {/* Offer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Installs Offer */}
            <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Home className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">New Installs</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                Up to 10<span className="text-lg">%</span> OFF
              </div>
            </div>

            {/* Repairs Offer */}
            <div className="bg-emerald-500/10 rounded-lg p-4 text-center border border-emerald-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Snowflake className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-600">Repairs</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                Up to $150 OFF
              </div>
            </div>
          </div>

          {/* Terms note */}
          <p className="text-sm text-muted-foreground text-center">
            See Terms & Conditions for more details
          </p>

          {/* Terms & Conditions Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terms" className="border-none">
              <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2 hover:no-underline">
                <span className="flex items-center gap-1">
                  Terms & Conditions
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <ul className="space-y-2 list-disc list-inside">
                  <li>To validate this offer, once the equipment is scanned, the Equipment Report form must be completed in full, including Name, Phone Number, and Property Address.</li>
                  <li>Coupon expires 90 days from the date the report was generated.</li>
                  <li>Cannot be combined with other offers, promotions, or manufacturer rebates.</li>
                  <li>Install coupon applies to pricing for the online estimators:
                    <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                      <li>10% off Ducted AC replacements</li>
                      <li>5% off Mini split installs</li>
                    </ul>
                  </li>
                  <li>Repair discounts:
                    <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                      <li>$75 off repairs – minimum repair of $250</li>
                      <li>$150 off repairs – minimum repair of $750</li>
                    </ul>
                  </li>
                  <li>Truficient Energy Solutions reserves the right to modify or cancel this offer at any time.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Card>
    </motion.div>
  );
}
