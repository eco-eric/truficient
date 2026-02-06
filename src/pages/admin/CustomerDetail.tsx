import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, Package, Activity } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AdminLayout title="Customer Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Details</h1>
            <p className="text-muted-foreground">ID: {id}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No phone</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No email</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No address</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="estimates">Estimates</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center py-8">
                      Customer overview will appear here once data is loaded.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No jobs found</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estimates" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No estimates found</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipment" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center py-8">
                      <Package className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No equipment records</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center py-8">
                      <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No activity recorded</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerDetail;
