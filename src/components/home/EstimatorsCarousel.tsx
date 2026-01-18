import { motion } from "framer-motion";
import { ChevronRight, Zap, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useButtonTracking } from "@/hooks/useButtonTracking";

export const EstimatorsCarousel = () => {
  const { trackButtonClick } = useButtonTracking();

  const estimators = [
    {
      title: "Ductless Systems",
      subtitle: "Mini-Split Solutions",
      label: "MOST EFFICIENT",
      tag: "Mitsubishi Diamond",
      href: "/estimate/ductless",
      icon: Zap,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-400/20",
    },
    {
      title: "Ducted Systems",
      subtitle: "Central AC & Heat",
      label: "CENTRAL",
      tag: "Full Replacement",
      href: "/estimate/ducted",
      icon: Home,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-400/20",
    },
  ];

  return (
    <section className="pb-6 lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-semibold text-foreground">System Estimators</h2>
        <Link 
          to="/services/residential" 
          className="text-sm text-primary font-medium flex items-center gap-1"
          onClick={() => trackButtonClick({ buttonName: 'See all estimators', buttonLocation: 'Mobile Home - Estimators', destinationUrl: '/services/residential' })}
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {estimators.map((est, index) => (
          <motion.div
            key={est.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <Link
              to={est.href}
              onClick={() => trackButtonClick({ buttonName: est.title, buttonLocation: 'Mobile Home - Estimators Carousel', destinationUrl: est.href })}
              className="block"
            >
              <div className={`bg-gradient-to-br ${est.gradient} rounded-2xl p-4 text-white w-[200px] flex-shrink-0 relative overflow-hidden`}>
                {/* Label Badge */}
                <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
                  {est.label}
                </span>

                {/* Icon */}
                <div className={`${est.iconBg} rounded-xl p-2.5 w-fit mb-3`}>
                  <est.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-base mb-0.5">{est.title}</h3>
                <p className="text-white/80 text-sm mb-3">{est.subtitle}</p>

                {/* Tag */}
                <span className="inline-block bg-white/10 text-xs px-2 py-1 rounded-lg">
                  {est.tag}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
