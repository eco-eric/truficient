import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, Calendar, Wrench, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface ScannerSubmissionDetailProps {
  metadata: Record<string, unknown>;
}

export const ScannerSubmissionDetail = ({ metadata }: ScannerSubmissionDetailProps) => {
  const currentYear = new Date().getFullYear();
  const manufacturedYear = metadata.manufacturedYear as number | null;
  const equipmentAge = manufacturedYear ? currentYear - manufacturedYear : null;

  const ghlSyncStatus = metadata.ghlSyncStatus as string | undefined;
  const ghlContactId = metadata.ghlContactId as string | undefined;

  const getSyncStatusBadge = () => {
    switch (ghlSyncStatus) {
      case 'synced':
        return <Badge className="bg-green-100 text-green-800">Synced</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'unknown':
        return <Badge variant="secondary">Unknown</Badge>;
      case 'not_applicable':
        return <Badge variant="outline">N/A</Badge>;
      default:
        return <Badge variant="outline">{ghlSyncStatus || 'N/A'}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Location Info */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
          {(metadata.city || metadata.state) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">City/State:</span>
              <span className="font-medium">
                {metadata.city as string}{metadata.city && metadata.state ? ', ' : ''}{metadata.state as string}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">ZIP Code:</span>
            <span className="font-medium">{metadata.zipCode as string || "N/A"}</span>
          </div>
          {metadata.customerAddress && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">{metadata.customerAddress as string}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">DFW Area:</span>
            <Badge variant={metadata.isDfw ? "default" : "secondary"}>
              {metadata.isDfw ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Equipment Info */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Equipment Information
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
          {metadata.brand && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-medium">{metadata.brand as string}</span>
            </div>
          )}
          {metadata.modelNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-mono text-xs">{metadata.modelNumber as string}</span>
            </div>
          )}
          {metadata.serialNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial:</span>
              <span className="font-mono text-xs">{metadata.serialNumber as string}</span>
            </div>
          )}
          {metadata.equipmentType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{metadata.equipmentType as string}</span>
            </div>
          )}
        </div>
      </div>

      {/* Age & Year */}
      {manufacturedYear && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Equipment Age
          </h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manufactured:</span>
              <span className="font-medium">{manufacturedYear}</span>
            </div>
            {equipmentAge !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <Badge variant={equipmentAge >= 15 ? "destructive" : equipmentAge >= 10 ? "secondary" : "outline"}>
                  {equipmentAge} years old
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Specs */}
      {(metadata.tonnage || metadata.refrigerant || metadata.seerRating) && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Technical Specifications
          </h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            {metadata.tonnage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tonnage:</span>
                <span className="font-medium">{metadata.tonnage as string}</span>
              </div>
            )}
            {metadata.refrigerant && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refrigerant:</span>
                <span className="font-medium">{metadata.refrigerant as string}</span>
              </div>
            )}
            {metadata.seerRating && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SEER Rating:</span>
                <span className="font-medium">{metadata.seerRating as number}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GHL Sync Status */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          GHL Integration
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sync Status:</span>
            {getSyncStatusBadge()}
          </div>
          {ghlContactId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact ID:</span>
              <span className="font-mono text-xs">{ghlContactId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Marketing Opt-In */}
      <div className="flex items-center gap-2 text-sm">
        {metadata.marketingOptIn ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Opted in to marketing communications</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Did not opt in to marketing</span>
          </>
        )}
      </div>
    </div>
  );
};
