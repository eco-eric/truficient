import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface LandingPageSubmissionDetailProps {
  metadata: Record<string, unknown>;
}

export const LandingPageSubmissionDetail = ({ metadata }: LandingPageSubmissionDetailProps) => {
  const formName = metadata.formName as string | null;
  const serviceType = metadata.serviceType as string | null;
  const message = metadata.message as string | null;
  const customFields = metadata.customFields as Record<string, unknown> | null;
  const ghlSyncStatus = metadata.ghlSyncStatus as string | null;
  const ghlContactId = metadata.ghlContactId as string | null;

  const getSyncStatusIcon = (status: string | null) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Submission Details
      </h3>

      {formName && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Form</p>
          <Badge variant="outline">{formName}</Badge>
        </div>
      )}

      {serviceType && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Service Type</p>
          <p className="text-sm font-medium">{serviceType}</p>
        </div>
      )}

      {message && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Message</p>
          <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{message}</p>
        </div>
      )}

      {/* GHL Sync Status */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">GHL Sync Status</p>
        <div className="flex items-center gap-2">
          {getSyncStatusIcon(ghlSyncStatus)}
          <span className="text-sm capitalize">{ghlSyncStatus || "pending"}</span>
        </div>
      </div>

      {ghlContactId && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">GHL Contact ID</p>
          <code className="text-xs bg-muted px-2 py-1 rounded">{ghlContactId}</code>
        </div>
      )}

      {/* Custom Fields */}
      {customFields && Object.keys(customFields).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Custom Fields</p>
          <div className="bg-muted/50 p-3 rounded-md space-y-2">
            {Object.entries(customFields).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
