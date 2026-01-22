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
    >
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
            {/* Ducted Offer */}
            <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Home className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Full Ducted System</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                10<span className="text-xl">%</span> OFF
              </div>
              <p className="text-sm text-muted-foreground mt-1">AC or Heat Pump Installation</p>
            </div>

            {/* Mini-Split Offer */}
            <div className="bg-emerald-500/10 rounded-lg p-4 text-center border border-emerald-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Snowflake className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-600">Mini-Split System</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                5<span className="text-xl">%</span> OFF
              </div>
              <p className="text-sm text-muted-foreground mt-1">Ductless Installation</p>
            </div>
          </div>

          {/* Body Text - only show in full variant */}
          {variant === 'full' && (
            <p className="text-sm text-muted-foreground text-center">
              Use this coupon to save on your new HVAC system. Pricing is based on our transparent 
              Online Estimator which includes equipment, labor, and taxes—no hidden fees, just honest pricing.
            </p>
          )}

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
                  <li>To validate this offer, the Equipment Report form must be completed in full, including Name, Phone Number, and Property Address.</li>
                  <li>Coupon expires 90 days from the date the report was generated.</li>
                  <li>Cannot be combined with other offers, promotions, or manufacturer rebates.</li>
                  <li>Valid for new installations only. Not applicable to repairs or maintenance.</li>
                  <li>Must be presented at time of estimate. Cannot be applied retroactively.</li>
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
