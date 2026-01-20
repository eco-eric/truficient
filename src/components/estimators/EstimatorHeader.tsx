import { Link } from "react-router-dom";
import { Phone, ArrowLeft } from "lucide-react";
import truficientLogo from "@/assets/truficient-logo.png";

interface EstimatorHeaderProps {
  estimatorType: "Ducted" | "Ductless";
}

export const EstimatorHeader = ({ estimatorType }: EstimatorHeaderProps) => {
  return (
    <header className="bg-background/95 backdrop-blur border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <img
              src={truficientLogo}
              alt="Truficient"
              className="h-10 w-10 object-contain rounded"
            />
            <span className="font-semibold text-primary text-sm hidden sm:inline">
              Truficient
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wide hidden sm:inline">
              {estimatorType === "Ducted" ? "AC | Heat Pump" : "Ductless"} Estimator
            </span>
            <a
              href="tel:214-238-4349"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">214-238-4349</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
