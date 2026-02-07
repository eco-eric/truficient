import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Package, 
  Activity,
  Edit,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import { CustomerFormDialog } from '@/components/admin/customers/CustomerFormDialog';
import { InteractionLog } from '@/components/admin/customers/InteractionLog';
import { CustomerLocations } from '@/components/admin/customers/CustomerLocations';
import { ActivityTimeline } from '@/components/admin/customers/ActivityTimeline';
import { LinkedSubmissions } from '@/components/admin/customers/LinkedSubmissions';
import { AIAssistantWidget } from '@/components/admin/ai/AIAssistantWidget';
import type { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['crm_customers']['Row'];

const statusColors: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  prospect: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['crm_customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!id,
  });

  const { data: locations } = useQuery({
    queryKey: ['crm_locations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_locations')
        .select('*')
        .eq('customer_id', id)
        .is('deleted_at', null)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: interactions } = useQuery({
    queryKey: ['crm_interactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_interactions')
        .select('*')
        .eq('customer_id', id)
        .order('interaction_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getDisplayName = (customer: Customer) => {
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed';
  };

  if (isLoading) {
    return (
      <AdminLayout title="Customer Details">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 lg:col-span-2" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title="Customer Details">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
          <Button variant="link" onClick={() => navigate('/admin/customers')}>
            Back to Customers
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Customer Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/customers')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{getDisplayName(customer)}</h1>
                <Badge className={statusColors[customer.customer_status]} variant="secondary">
                  {customer.customer_status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {customer.customer_type}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Created {new Date(customer.created_at).toLocaleDateString()}
                {customer.lead_source && ` • Source: ${customer.lead_source}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AIAssistantWidget 
              customerId={customer.id} 
              customerName={getDisplayName(customer)}
            />
            <Button onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${customer.phone}`} className="hover:underline">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.alternate_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.alternate_phone} (Alt)</span>
                </div>
              )}
              {customer.preferred_contact_method && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">Prefers: {customer.preferred_contact_method}</span>
                </div>
              )}
              {(customer.billing_address || customer.billing_city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    {customer.billing_address && <div>{customer.billing_address}</div>}
                    {customer.billing_city && (
                      <div>
                        {customer.billing_city}, {customer.billing_state} {customer.billing_zip}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!customer.email && !customer.phone && !customer.billing_address && (
                <p className="text-muted-foreground text-sm">No contact information</p>
              )}

              {customer.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              )}

              {customer.tags && customer.tags.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="locations">Locations ({locations?.length || 0})</TabsTrigger>
                <TabsTrigger value="activity">Activity ({interactions?.length || 0})</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="estimates">Estimates</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Service Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{locations?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{interactions?.length || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity - Enhanced with ActivityTimeline preview */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interactions && interactions.length > 0 ? (
                      <div className="space-y-3">
                        {interactions.slice(0, 5).map((interaction) => {
                          const isSystem = interaction.interaction_type.startsWith('system_');
                          return (
                            <div key={interaction.id} className="flex items-start gap-3 text-sm">
                              <Activity className={`h-4 w-4 mt-0.5 ${isSystem ? 'text-primary' : 'text-muted-foreground'}`} />
                              <div>
                                <span className="font-medium capitalize">
                                  {interaction.interaction_type.replace('system_', '').replace('_', ' ')}
                                </span>
                                {interaction.subject && <span> - {interaction.subject}</span>}
                                {isSystem && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    System
                                  </Badge>
                                )}
                                <p className="text-muted-foreground text-xs">
                                  {new Date(interaction.interaction_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="locations" className="mt-4">
                <CustomerLocations customerId={id!} locations={locations || []} />
              </TabsContent>

              <TabsContent value="activity" className="mt-4 space-y-4">
                <InteractionLog customerId={id!} interactions={interactions || []} />
                <ActivityTimeline interactions={interactions || []} />
              </TabsContent>

              <TabsContent value="jobs" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No jobs found</p>
                      <p className="text-xs text-muted-foreground mt-1">Jobs will appear here once created</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estimates" className="mt-4">
                <LinkedSubmissions customerId={id!} />
              </TabsContent>

              <TabsContent value="equipment" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center py-8">
                      <Package className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No equipment records</p>
                      <p className="text-xs text-muted-foreground mt-1">Equipment from scans will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
      />
    </AdminLayout>
  );
};

export default CustomerDetail;
