import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Edit } from 'lucide-react';
import { LocationMapEmbed } from './LocationMapEmbed';
import type { CrmLocation, CrmCustomer } from '@/types/crmLocations';

interface LocationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: CrmLocation;
  customers: CrmCustomer[];
  onEdit?: () => void;
}

export function LocationDetailsDialog({
  open,
  onOpenChange,
  location,
  customers,
  onEdit,
}: LocationDetailsDialogProps) {
  const customer = customers.find(c => c.id === location.customer_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{location.location_name || 'Location'}</span>
            <div className="flex gap-2">
              {location.is_primary && (
                <Badge variant="default">Primary</Badge>
              )}
              <Badge variant={location.location_type === 'residential' ? 'default' : 'secondary'}>
                {location.location_type || 'Residential'}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Service location details for {customer?.first_name} {customer?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">Customer</h3>
            <div className="text-sm space-y-1">
              <div>{customer?.first_name} {customer?.last_name}</div>
              {customer?.email && <div className="text-muted-foreground">{customer.email}</div>}
              {customer?.phone && <div className="text-muted-foreground">{customer.phone}</div>}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </h3>
            <div className="text-sm space-y-1">
              <div>{location.address_line1}</div>
              {location.address_line2 && <div>{location.address_line2}</div>}
              <div>
                {location.city}, {location.state} {location.zip_code}
              </div>
              {location.county && <div className="text-muted-foreground">{location.county} County</div>}
            </div>
          </div>

          {/* Map */}
          {location.latitude && location.longitude && (
            <LocationMapEmbed
              latitude={location.latitude}
              longitude={location.longitude}
              address={location.formatted_address || location.address_line1}
            />
          )}

          {/* Property Details */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Property Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {location.building_type && (
                <div>
                  <div className="text-muted-foreground">Building Type</div>
                  <div className="capitalize">{location.building_type.replace('_', ' ')}</div>
                </div>
              )}
              {location.square_footage && (
                <div>
                  <div className="text-muted-foreground">Square Footage</div>
                  <div>{location.square_footage.toLocaleString()} sq ft</div>
                </div>
              )}
              {location.year_built && (
                <div>
                  <div className="text-muted-foreground">Year Built</div>
                  <div>{location.year_built}</div>
                </div>
              )}
              {location.stories && (
                <div>
                  <div className="text-muted-foreground">Stories</div>
                  <div>{location.stories}</div>
                </div>
              )}
              {location.bedrooms && (
                <div>
                  <div className="text-muted-foreground">Bedrooms</div>
                  <div>{location.bedrooms}</div>
                </div>
              )}
              {location.bathrooms && (
                <div>
                  <div className="text-muted-foreground">Bathrooms</div>
                  <div>{location.bathrooms}</div>
                </div>
              )}
              {location.lot_size_sqft && (
                <div>
                  <div className="text-muted-foreground">Lot Size</div>
                  <div>{location.lot_size_sqft.toLocaleString()} sq ft</div>
                </div>
              )}
            </div>
            
            {location.property_data_source && (
              <div className="mt-4 text-xs text-muted-foreground bg-muted p-2 rounded">
                Property data from: {location.property_data_source}
                {location.property_data_verified_at && (
                  <span className="ml-2">
                    (Updated: {new Date(location.property_data_verified_at).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Access Information */}
          {(location.gate_code || location.access_notes || location.parking_instructions) && (
            <div>
              <h3 className="font-semibold mb-2">Access Information</h3>
              <div className="space-y-2 text-sm">
                {location.gate_code && (
                  <div>
                    <div className="text-muted-foreground">Gate Code</div>
                    <div className="font-mono">{location.gate_code}</div>
                  </div>
                )}
                {location.access_notes && (
                  <div>
                    <div className="text-muted-foreground">Access Notes</div>
                    <div>{location.access_notes}</div>
                  </div>
                )}
                {location.parking_instructions && (
                  <div>
                    <div className="text-muted-foreground">Parking Instructions</div>
                    <div>{location.parking_instructions}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <div>Created</div>
                <div>{new Date(location.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div>Last Updated</div>
                <div>{new Date(location.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Location
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
