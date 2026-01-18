import { motion } from "framer-motion";
import { ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const insights = [
  {
    title: "When to Replace Your AC Unit",
    date: "Jan 15, 2025",
    readTime: "4 min read",
    image: "/placeholder.svg",
    href: "/blog",
  },
  {
    title: "Mini-Split vs Central AC: Which is Right?",
    date: "Jan 10, 2025",
    readTime: "6 min read",
    image: "/placeholder.svg",
    href: "/blog",
  },
  {
    title: "2025 HVAC Rebates & Tax Credits",
    date: "Jan 5, 2025",
    readTime: "3 min read",
    image: "/placeholder.svg",
    href: "/blog",
  },
];

export const InsightsList = () => {
  return (
    <section className="px-4 pb-6 lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Latest Insights</h2>
        <Link 
          to="/blog" 
          className="text-sm text-primary font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* List Items */}
      <div className="space-y-3">
        {insights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <Link to={item.href} className="block">
              <div className="flex gap-3 bg-card rounded-xl p-3 border border-border">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.readTime}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 self-center" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
