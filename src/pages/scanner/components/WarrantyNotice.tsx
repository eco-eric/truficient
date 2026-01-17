import { ShieldCheck, ExternalLink } from 'lucide-react';
import { getBrandSupportUrl } from '@/lib/api/documentation';

interface WarrantyNoticeProps {
  age: number | null;
  brand: string;
}

export function WarrantyNotice({ age, brand }: WarrantyNoticeProps) {
  // Only show for equipment 10 years old or less
  if (!age || age > 10) return null;

  const isLikelyFullCoverage = age < 5;
  const warrantyUrl = getBrandSupportUrl(brand);

  return (
    <div className="flex gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">
      <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        {isLikelyFullCoverage ? (
          <p className="text-green-700 dark:text-green-400">
            <strong>Warranty:</strong> All parts should be covered by manufacturer warranty 
            if registered for residential use.
          </p>
        ) : (
          <p className="text-green-700 dark:text-green-400">
            <strong>Warranty:</strong> Coverage may still apply. Verify status with your 
            serial number at the manufacturer's website.
          </p>
        )}
        {brand && (
          <a
            href={warrantyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 underline hover:text-green-700 dark:hover:text-green-300 text-xs inline-flex items-center gap-1"
          >
            Check {brand} warranty status
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
