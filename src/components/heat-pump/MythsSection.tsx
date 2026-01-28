import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, Snowflake, DollarSign, Home, Clock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Myth {
  icon: LucideIcon;
  myth: string;
  truth: string;
}

const myths: Myth[] = [
  {
    icon: Snowflake,
    myth: "Heat pumps don't work in cold weather",
    truth: "Modern inverter heat pumps maintain full capacity down to 5°F and continue operating efficiently to -13°F. DFW rarely drops below 20°F, well within optimal performance range.",
  },
  {
    icon: DollarSign,
    myth: "Electric heating is always more expensive",
    truth: "At 2026 Atmos gas rates ($2.47/Ccf effective), heat pumps cost 30-50% less to operate. The efficiency advantage (3:1 vs 1:1) more than offsets the electric rate difference.",
  },
  {
    icon: Home,
    myth: "Heat pumps can't heat a whole house",
    truth: "Properly sized heat pumps provide the same BTU output as any furnace. We perform load calculations to ensure your system handles the coldest nights comfortably.",
  },
  {
    icon: Clock,
    myth: "Heat pumps take forever to heat up",
    truth: "Variable-speed compressors provide consistent, steady temperature control. No more hot blasts followed by cold spells — just comfortable, even heating all day.",
  },
];

const MythsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Heat Pump Myths — Busted
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Outdated information is costing homeowners thousands. Here's what's actually true in 2026.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {myths.map((myth, index) => (
            <motion.div
              key={myth.myth}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-primary-foreground/10 border-primary-foreground/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                        <myth.icon className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-destructive" />
                        <h3 className="font-bold text-secondary">
                          MYTH: "{myth.myth}"
                        </h3>
                      </div>
                      <p className="text-primary-foreground/90 text-sm leading-relaxed">
                        <span className="font-semibold text-secondary">TRUTH: </span>
                        {myth.truth}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MythsSection;
