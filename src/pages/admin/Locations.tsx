import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  Search, 
  MapPin, 
  Home, 
  Building2, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  ExternalLink,
  Copy,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AddressAutocomplete, AddressComponents } from '@/components/AddressAutocomplete';
import { lookupPropertyData, formatPropertySource, PropertyLookupResult } from '@/lib/propertyLookup';
import { MapPreview } from '@/components/MapPreview';
import type { Database } from '@/integrations/supabase/types';

type Location = Database['public']['Tables']['crm_locations']['Row'];
type Customer = Database['public']['Tables']['crm_customers']['Row'];

type LocationWithCustomer = Location & {
  customer: Pick<Customer, 'id' | 'first_name' | 'last_name' | 'company_name'> | null;
};

const Locations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationWithCustomer | null>(null);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('residential');
  const [buildingType, setBuildingType] = useState('single_family');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('');
  const [county, setCounty] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [stories, setStories] = useState('');
  const [gateCode, setGateCode] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  
  // Coordinates state for map
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState('');
  
  // Property lookup state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(new Set());
  const [propertyDataSource, setPropertyDataSource] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Fetch all locations with customer data
  const { data: locations, isLoading } = useQuery({
    queryKey: ['all_crm_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_locations')
        .select(`
          *,
          customer:crm_customers(id, first_name, last_name, company_name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LocationWithCustomer[];
    },
  });

  // Fetch customers for the dropdown (with billing address for auto-fill)
  const { data: customers } = useQuery({
    queryKey: ['crm_customers_list_with_billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_customers')
        .select('id, first_name, last_name, company_name, billing_address, billing_city, billing_state, billing_zip')
        .is('deleted_at', null)
        .order('first_name');
      if (error) throw error;
      return data;
    },
  });

  // Find selected customer and check for billing address
  const selectedCustomer = useMemo(() => 
    customers?.find(c => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const hasBillingAddress = selectedCustomer?.billing_address && selectedCustomer?.billing_city;

  const resetForm = () => {
    setSelectedCustomerId('');
    setLocationName('');
    setLocationType('residential');
    setBuildingType('single_family');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('TX');
    setZipCode('');
    setCounty('');
    setSquareFootage('');
    setYearBuilt('');
    setStories('');
    setGateCode('');
    setAccessNotes('');
    setIsPrimary(false);
    setEditingLocation(null);
    setAutoPopulatedFields(new Set());
    setPropertyDataSource(null);
    setLookupError(null);
    setLatitude(null);
    setLongitude(null);
    setGooglePlaceId('');
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = async (components: AddressComponents) => {
    setAddressLine1(components.streetAddress);
    setCity(components.city);
    setState(components.state);
    setZipCode(components.zipCode);
    setCounty(components.county);
    setLatitude(components.lat);
    setLongitude(components.lng);
    setGooglePlaceId(components.placeId);
    setLookupError(null);

    // Show county warning if not detected
    if (!components.county && components.state === 'TX') {
      toast.info('County could not be determined - please verify');
    }

    // Trigger property lookup
    if (!editingLocation) {
      setIsLookingUp(true);
      try {
        const result: PropertyLookupResult = await lookupPropertyData({
          address: components.streetAddress,
          city: components.city,
          state: components.state,
          zipCode: components.zipCode,
          county: components.county,
        });

        if (result.error && !result.data) {
          // Lookup failed with error
          setLookupError(result.error);
          toast.error(`Property lookup: ${result.error}`);
        } else if (result.data) {
          const newAutoFields = new Set<string>();

          if (result.data.squareFootage) {
            setSquareFootage(result.data.squareFootage.toString());
            newAutoFields.add('squareFootage');
          }
          if (result.data.yearBuilt) {
            setYearBuilt(result.data.yearBuilt.toString());
            newAutoFields.add('yearBuilt');
          }
          if (result.data.stories) {
            setStories(result.data.stories.toString());
            newAutoFields.add('stories');
          }

          setAutoPopulatedFields(newAutoFields);
          setPropertyDataSource(result.data.source);
          setLookupError(null);

          if (newAutoFields.size > 0) {
            toast.success(`Property data found via ${formatPropertySource(result.data.source)}`);
          } else {
            toast.info('Property found but no details available - please enter manually');
          }
        } else {
          // No data and no error - unlikely but handle
          setLookupError('No property data found for this address');
          toast.info('No property data found - please enter manually');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Property lookup failed';
        console.error('Property lookup failed:', err);
        setLookupError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLookingUp(false);
      }
    }
  };

  const openEdit = (location: LocationWithCustomer) => {
    setEditingLocation(location);
    setSelectedCustomerId(location.customer_id);
    setLocationName(location.location_name || '');
    setLocationType(location.location_type || 'residential');
    setBuildingType(location.building_type || 'single_family');
    setAddressLine1(location.address_line1);
    setAddressLine2(location.address_line2 || '');
    setCity(location.city);
    setState(location.state);
    setZipCode(location.zip_code);
    setCounty(location.county || '');
    setSquareFootage(location.square_footage?.toString() || '');
    setYearBuilt(location.year_built?.toString() || '');
    setStories(location.stories?.toString() || '');
    setGateCode(location.gate_code || '');
    setAccessNotes(location.access_notes || '');
    setIsPrimary(location.is_primary || false);
    setLatitude(location.latitude || null);
    setLongitude(location.longitude || null);
    setGooglePlaceId(location.google_place_id || '');
    setLookupError(null);
    setDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        customer_id: selectedCustomerId,
        location_name: locationName || null,
        location_type: locationType,
        building_type: buildingType || null,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        zip_code: zipCode,
        county: county || null,
        square_footage: squareFootage ? parseInt(squareFootage) : null,
        year_built: yearBuilt ? parseInt(yearBuilt) : null,
        stories: stories ? parseInt(stories) : null,
        gate_code: gateCode || null,
        access_notes: accessNotes || null,
        is_primary: isPrimary,
        property_data_source: propertyDataSource || 'manual',
        property_data_verified_at: propertyDataSource ? new Date().toISOString() : null,
        property_data_auto_populated: autoPopulatedFields.size > 0,
        latitude: latitude,
        longitude: longitude,
        google_place_id: googlePlaceId || null,
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('crm_locations')
          .update(payload)
          .eq('id', editingLocation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crm_locations').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_crm_locations'] });
      toast.success(editingLocation ? 'Location updated' : 'Location added');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save location');
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
      queryClient.invalidateQueries({ queryKey: ['all_crm_locations'] });
      toast.success('Location deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete location');
    },
  });

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter((loc) => {
      const customerName = loc.customer
        ? `${loc.customer.first_name || ''} ${loc.customer.last_name || ''} ${loc.customer.company_name || ''}`.toLowerCase()
        : '';
      return (
        loc.address_line1.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.zip_code.includes(q) ||
        customerName.includes(q) ||
        (loc.location_name && loc.location_name.toLowerCase().includes(q))
      );
    });
  }, [locations, searchQuery]);

  const getCustomerDisplayName = (customer: LocationWithCustomer['customer']) => {
    if (!customer) return 'Unknown';
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed';
  };

  return (
    <AdminLayout title="Locations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground">
              View and manage customer service locations
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Location
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address, city, or customer..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Locations
              {locations && (
                <Badge variant="secondary" className="ml-2">
                  {filteredLocations.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  {searchQuery ? 'No matching locations' : 'No locations yet'}
                </h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                  {searchQuery
                    ? 'Try a different search term.'
                    : 'Add a location to get started.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>City / State</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Sq Ft</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-muted rounded">
                            {location.location_type === 'commercial' ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Home className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {location.location_name || location.address_line1}
                              {location.is_primary && (
                                <Badge variant="secondary" className="text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {location.location_name && (
                              <div className="text-sm text-muted-foreground">
                                {location.address_line1}
                                {location.address_line2 && `, ${location.address_line2}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {location.city}, {location.state} {location.zip_code}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/admin/customers/${location.customer_id}`)}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {getCustomerDisplayName(location.customer)}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </TableCell>
                      <TableCell className="capitalize">
                        {location.location_type?.replace('_', ' ') || 'Residential'}
                      </TableCell>
                      <TableCell className="text-right">
                        {location.square_footage
                          ? location.square_footage.toLocaleString()
                          : '—'}
                      </TableCell>
                      <TableCell>
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
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(location.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Location Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add Location'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer Selector */}
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.company_name ||
                        `${cust.first_name || ''} ${cust.last_name || ''}`.trim() ||
                        'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Use Billing Address Button - only for new locations when customer has billing info */}
            {!editingLocation && hasBillingAddress && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setAddressLine1(selectedCustomer!.billing_address || '');
                  setCity(selectedCustomer!.billing_city || '');
                  setState(selectedCustomer!.billing_state || 'TX');
                  setZipCode(selectedCustomer!.billing_zip || '');
                  setIsPrimary(true);
                  toast.success('Billing address applied');
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Use Billing Address
              </Button>
            )}

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

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Address Line 1 *
                {isLookingUp && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Looking up property data...
                  </span>
                )}
              </Label>
              <AddressAutocomplete
                value={addressLine1}
                onChange={setAddressLine1}
                onAddressSelect={handleAddressSelect}
                placeholder="Start typing address..."
                className="w-full"
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

            <div className="space-y-2">
              <Label>County</Label>
              <Input
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g., Dallas County"
              />
            </div>

            {/* Map Preview */}
            {latitude && longitude && (
              <MapPreview
                lat={latitude}
                lng={longitude}
                address={`${addressLine1}, ${city}, ${state} ${zipCode}`}
                county={county}
                className="mt-2"
              />
            )}

            {!latitude && addressLine1 && !isLookingUp && (
              <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
                <MapPin className="h-4 w-4 inline mr-1" />
                Select an address from the dropdown to see map preview
              </div>
            )}

            {/* Property Lookup Error */}
            {lookupError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{lookupError}</AlertDescription>
              </Alert>
            )}

            <TooltipProvider>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Sq Ft
                    {autoPopulatedFields.has('squareFootage') && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs gap-1 bg-accent text-accent-foreground">
                            <Sparkles className="h-3 w-3" />
                            Auto
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Data from {formatPropertySource(propertyDataSource || 'unknown')}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={squareFootage}
                    onChange={(e) => {
                      setSquareFootage(e.target.value);
                      setAutoPopulatedFields(prev => {
                        const next = new Set(prev);
                        next.delete('squareFootage');
                        return next;
                      });
                    }}
                    className={autoPopulatedFields.has('squareFootage') ? 'bg-accent/50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Year Built
                    {autoPopulatedFields.has('yearBuilt') && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs gap-1 bg-accent text-accent-foreground">
                            <Sparkles className="h-3 w-3" />
                            Auto
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Data from {formatPropertySource(propertyDataSource || 'unknown')}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => {
                      setYearBuilt(e.target.value);
                      setAutoPopulatedFields(prev => {
                        const next = new Set(prev);
                        next.delete('yearBuilt');
                        return next;
                      });
                    }}
                    className={autoPopulatedFields.has('yearBuilt') ? 'bg-accent/50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Stories
                    {autoPopulatedFields.has('stories') && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs gap-1 bg-accent text-accent-foreground">
                            <Sparkles className="h-3 w-3" />
                            Auto
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Data from {formatPropertySource(propertyDataSource || 'unknown')}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={stories}
                    onChange={(e) => {
                      setStories(e.target.value);
                      setAutoPopulatedFields(prev => {
                        const next = new Set(prev);
                        next.delete('stories');
                        return next;
                      });
                    }}
                    className={autoPopulatedFields.has('stories') ? 'bg-accent/50' : ''}
                  />
                </div>
              </div>
            </TooltipProvider>

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
              <Label htmlFor="is_primary" className="cursor-pointer">
                Primary location
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={
                  saveMutation.isPending ||
                  !selectedCustomerId ||
                  !addressLine1 ||
                  !city ||
                  !state ||
                  !zipCode
                }
              >
                {saveMutation.isPending
                  ? 'Saving...'
                  : editingLocation
                  ? 'Update Location'
                  : 'Add Location'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Locations;
