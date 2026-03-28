import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus,
  Home,
  Building2,
  Edit,
  Trash2,
  MoreHorizontal,
  Upload,
  CheckCircle2,
  Loader2,
  Link2,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Database } from '@/integrations/supabase/types';

type Location = Database['public']['Tables']['crm_locations']['Row'];

interface CustomerLocationsProps {
  customerId: string;
  locations: Location[];
  customer?: {
    billing_address?: string | null;
    billing_address_line2?: string | null;
    billing_city?: string | null;
    billing_state?: string | null;
    billing_zip?: string | null;
  } | null;
}

export function CustomerLocations({ customerId, locations, customer }: CustomerLocationsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [selectedLinkLocationId, setSelectedLinkLocationId] = useState<string | null>(null);
  const [linkRelationshipType, setLinkRelationshipType] = useState('owner');
  const queryClient = useQueryClient();

  // Form state
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('residential');
  const [buildingType, setBuildingType] = useState('single_family');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [stories, setStories] = useState('');
  const [gateCode, setGateCode] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const resetForm = () => {
    setLocationName('');
    setLocationType('residential');
    setBuildingType('single_family');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('TX');
    setZipCode('');
    setSquareFootage('');
    setYearBuilt('');
    setStories('');
    setGateCode('');
    setAccessNotes('');
    setIsPrimary(false);
    setEditingLocation(null);
  };

  const openEdit = (location: Location) => {
    setEditingLocation(location);
    setLocationName(location.location_name || '');
    setLocationType(location.location_type || 'residential');
    setBuildingType(location.building_type || 'single_family');
    setAddressLine1(location.address_line1);
    setAddressLine2(location.address_line2 || '');
    setCity(location.city);
    setState(location.state);
    setZipCode(location.zip_code);
    setSquareFootage(location.square_footage?.toString() || '');
    setYearBuilt(location.year_built?.toString() || '');
    setStories(location.stories?.toString() || '');
    setGateCode(location.gate_code || '');
    setAccessNotes(location.access_notes || '');
    setIsPrimary(location.is_primary || false);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        customer_id: customerId,
        location_name: locationName || null,
        location_type: locationType,
        building_type: buildingType || null,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        zip_code: zipCode,
        square_footage: squareFootage ? parseInt(squareFootage) : null,
        year_built: yearBuilt ? parseInt(yearBuilt) : null,
        stories: stories ? parseInt(stories) : null,
        gate_code: gateCode || null,
        access_notes: accessNotes || null,
        is_primary: isPrimary,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('crm_locations')
          .update(payload)
          .eq('id', editingLocation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('crm_locations')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_locations', customerId] });
      toast.success(editingLocation ? 'Location updated' : 'Location added');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save location');
    },
  });

  const [syncingLocationId, setSyncingLocationId] = useState<string | null>(null);

  const syncPropertyMutation = useMutation({
    mutationFn: async (locationId: string) => {
      setSyncingLocationId(locationId);
      const { data, error } = await supabase.functions.invoke('workedge-sync', {
        body: { action: 'create-property', locationId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_locations', customerId] });
      toast.success('Property synced to WorkEdge');
      setSyncingLocationId(null);
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
      setSyncingLocationId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('crm_locations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_locations', customerId] });
      toast.success('Location deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete location');
    },
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Service Locations</CardTitle>
          <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No service locations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location.id} className="flex items-start justify-between p-4 rounded-lg border bg-card">
                  <div className="flex gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      {location.location_type === 'commercial' ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <Home className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {location.location_name || location.address_line1}
                        </span>
                        {location.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                        {location.workedge_property_id && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            WE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {location.address_line1}
                        {location.address_line2 && `, ${location.address_line2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {location.city}, {location.state} {location.zip_code}
                      </p>
                      {(location.square_footage || location.year_built) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {location.square_footage && `${location.square_footage.toLocaleString()} sq ft`}
                          {location.square_footage && location.year_built && ' • '}
                          {location.year_built && `Built ${location.year_built}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(location)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!location.workedge_property_id && (
                        <DropdownMenuItem 
                          onClick={() => syncPropertyMutation.mutate(location.id)}
                          disabled={syncPropertyMutation.isPending}
                        >
                          {syncingLocationId === location.id && syncPropertyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Sync to WorkEdge
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(location.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location Name</Label>
                <Input 
                  value={locationName} 
                  onChange={(e) => setLocationName(e.target.value)} 
                  placeholder="Main Home, Rental, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="multi_family">Multi-Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Building Type</Label>
              <Select value={buildingType} onValueChange={setBuildingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_family">Single Family</SelectItem>
                  <SelectItem value="townhome">Townhome</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Import Address Buttons */}
            <div className="flex flex-wrap gap-2">
              {customer?.billing_address && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAddressLine1(customer.billing_address || '');
                    setAddressLine2((customer as any).billing_address_line2 || '');
                    setCity(customer.billing_city || '');
                    setState(customer.billing_state || 'TX');
                    setZipCode(customer.billing_zip || '');
                    toast.success('Billing address imported');
                  }}
                >
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  Use Billing Address
                </Button>
              )}
              {locations.filter(l => !editingLocation || l.id !== editingLocation.id).length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Home className="h-3.5 w-3.5 mr-1.5" />
                      Import from Location
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {locations
                      .filter(l => !editingLocation || l.id !== editingLocation.id)
                      .map(loc => (
                        <DropdownMenuItem
                          key={loc.id}
                          onClick={() => {
                            setAddressLine1(loc.address_line1);
                            setAddressLine2(loc.address_line2 || '');
                            setCity(loc.city);
                            setState(loc.state);
                            setZipCode(loc.zip_code);
                            if (loc.square_footage) setSquareFootage(loc.square_footage.toString());
                            if (loc.year_built) setYearBuilt(loc.year_built.toString());
                            if (loc.stories) setStories(loc.stories.toString());
                            if (loc.gate_code) setGateCode(loc.gate_code);
                            if (loc.access_notes) setAccessNotes(loc.access_notes);
                            toast.success('Address imported from location');
                          }}
                        >
                          {loc.location_name || loc.address_line1} — {loc.city}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-2">
              <Label>Address Line 1 *</Label>
              <Input 
                value={addressLine1} 
                onChange={(e) => setAddressLine1(e.target.value)} 
                placeholder="Street address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input 
                value={addressLine2} 
                onChange={(e) => setAddressLine2(e.target.value)} 
                placeholder="Apt, Suite, Unit, etc."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  maxLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP *</Label>
                <Input 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Sq Ft</Label>
                <Input 
                  type="number"
                  value={squareFootage} 
                  onChange={(e) => setSquareFootage(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Year Built</Label>
                <Input 
                  type="number"
                  value={yearBuilt} 
                  onChange={(e) => setYearBuilt(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Stories</Label>
                <Input 
                  type="number"
                  value={stories} 
                  onChange={(e) => setStories(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gate Code</Label>
              <Input 
                value={gateCode} 
                onChange={(e) => setGateCode(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>Access Notes</Label>
              <Textarea 
                value={accessNotes} 
                onChange={(e) => setAccessNotes(e.target.value)} 
                placeholder="Special access instructions..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_primary" className="cursor-pointer">Primary location</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button 
                onClick={() => saveMutation.mutate()} 
                disabled={saveMutation.isPending || !addressLine1 || !city || !state || !zipCode}
              >
                {saveMutation.isPending ? 'Saving...' : editingLocation ? 'Update Location' : 'Add Location'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
