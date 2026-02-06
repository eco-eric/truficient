import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin } from 'lucide-react';

const Locations = () => {
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Location
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search locations..." 
              className="pl-9"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No locations yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Locations are created when you add customers. Each customer can have multiple service addresses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Locations;
