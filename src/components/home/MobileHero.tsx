import { motion } from "framer-motion";
import { Search, Calendar, Phone, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useButtonTracking } from "@/hooks/useButtonTracking";

export const MobileHero = () => {
  const { trackButtonClick } = useButtonTracking();

  const quickActions = [
    { label: "Schedule Service", icon: Calendar, href: "/contact", variant: "default" as const },
    { label: "Call Now", icon: Phone, href: "tel:+14692098555", variant: "outline" as const },
    { label: "Repairs", icon: Wrench, href: "/services/residential", variant: "outline" as const },
  ];

  return (
    <section className="px-4 pt-6 pb-4 lg:hidden">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Hi, Neighbor 👋</h1>
        <p className="text-muted-foreground mt-1">Need comfort today?</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services or system types..."
          className="pl-10 bg-card border-border rounded-xl h-12"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
      >
        {quickActions.map((action) => (
          action.href.startsWith("tel:") ? (
            <a
              key={action.label}
              href={action.href}
              onClick={() => trackButtonClick({ buttonName: action.label, buttonLocation: 'Mobile Hero - Quick Actions', destinationUrl: action.href })}
            >
              <Button
                variant={action.variant}
                size="sm"
                className="rounded-full whitespace-nowrap gap-2 flex-shrink-0"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </a>
          ) : (
            <Link
              key={action.label}
              to={action.href}
              onClick={() => trackButtonClick({ buttonName: action.label, buttonLocation: 'Mobile Hero - Quick Actions', destinationUrl: action.href })}
            >
              <Button
                variant={action.variant}
                size="sm"
                className="rounded-full whitespace-nowrap gap-2 flex-shrink-0"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          )
        ))}
      </motion.div>
    </section>
  );
};
