import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { UnifiedSubmission, SubmissionSource } from "@/pages/admin/UnifiedSubmissions";
import { ContactSubmissionDetail } from "./ContactSubmissionDetail";
import { LandingPageSubmissionDetail } from "./LandingPageSubmissionDetail";
import { DuctlessSubmissionDetail } from "./DuctlessSubmissionDetail";
import { ScannerSubmissionDetail } from "./ScannerSubmissionDetail";
import { DuctedSubmissionDetail } from "./DuctedSubmissionDetail";

interface SubmissionDetailSheetProps {
  submission: UnifiedSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (submission: UnifiedSubmission, status: string) => void;
}

const sourceLabels: Record<SubmissionSource, string> = {
  ducted: "Ducted Estimator",
  contact: "Contact Form",
  landing_page: "Landing Page Form",
  ductless: "Ductless Estimator",
  scanner: "Equipment Scanner",
};

const sourceColors: Record<SubmissionSource, string> = {
  ducted: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  contact: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  landing_page: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  ductless: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  scanner: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export const SubmissionDetailSheet = ({
  submission,
  open,
  onOpenChange,
  onStatusChange,
}: SubmissionDetailSheetProps) => {
  if (!submission) return null;

  const handleEmailClick = () => {
    window.location.href = `mailto:${submission.customerEmail}`;
  };

  const handlePhoneClick = () => {
    if (submission.customerPhone) {
      window.location.href = `tel:${submission.customerPhone}`;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge className={sourceColors[submission.source]} variant="secondary">
              {sourceLabels[submission.source]}
            </Badge>
          </div>
          <SheetTitle className="text-left text-xl">{submission.customerName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${submission.customerEmail}`}
                className="text-primary hover:underline"
              >
                {submission.customerEmail}
              </a>
            </div>
            {submission.customerPhone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${submission.customerPhone}`}
                  className="text-primary hover:underline"
                >
                  {submission.customerPhone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(submission.createdAt), "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEmailClick}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            {submission.customerPhone && (
              <Button variant="outline" size="sm" onClick={handlePhoneClick}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            )}
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={submission.status}
              onValueChange={(value) => onStatusChange(submission, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Type-specific Details */}
          {submission.source === "ducted" && (
            <DuctedSubmissionDetail metadata={submission.metadata} />
          )}
          {submission.source === "contact" && (
            <ContactSubmissionDetail metadata={submission.metadata} />
          )}
          {submission.source === "landing_page" && (
            <LandingPageSubmissionDetail metadata={submission.metadata} />
          )}
          {submission.source === "ductless" && (
            <DuctlessSubmissionDetail metadata={submission.metadata} />
          )}
          {submission.source === "scanner" && (
            <ScannerSubmissionDetail metadata={submission.metadata} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
