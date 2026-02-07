import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ExternalLink, Thermometer, Wind, Scan } from 'lucide-react';
import { format } from 'date-fns';

interface LinkedSubmissionsProps {
  customerId: string;
}

interface SubmissionLink {
  id: string;
  submission_id: string;
  submission_type: string;
  created_at: string;
}

interface SubmissionDetail {
  id: string;
  type: string;
  source: string;
  customerName: string;
  status: string;
  estimatedValue: number | null;
  createdAt: string;
}

const sourceConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  ducted: { 
    icon: <Wind className="h-4 w-4" />, 
    label: 'Ducted Estimator',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  ductless: { 
    icon: <Thermometer className="h-4 w-4" />, 
    label: 'Ductless Estimator',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  scanner: { 
    icon: <Scan className="h-4 w-4" />, 
    label: 'Equipment Scanner',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  contact: { 
    icon: <FileText className="h-4 w-4" />, 
    label: 'Contact Form',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
  landing_page: { 
    icon: <FileText className="h-4 w-4" />, 
    label: 'Landing Page',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
};

export function LinkedSubmissions({ customerId }: LinkedSubmissionsProps) {
  const navigate = useNavigate();

  // Fetch submission links for this customer
  const { data: links, isLoading } = useQuery({
    queryKey: ['crm_submission_links', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_submission_links')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SubmissionLink[];
    },
  });

  // Fetch details for each linked submission
  const { data: submissions } = useQuery({
    queryKey: ['linked_submission_details', links],
    queryFn: async () => {
      if (!links || links.length === 0) return [];

      const details: SubmissionDetail[] = [];

      for (const link of links) {
        try {
          if (link.submission_type === 'ducted') {
            const { data } = await supabase
              .from('ducted_estimate_submissions')
              .select('id, customer_name, status, final_total, created_at')
              .eq('id', link.submission_id)
              .single();
            
            if (data) {
              details.push({
                id: data.id,
                type: 'ducted',
                source: 'ducted',
                customerName: data.customer_name,
                status: data.status,
                estimatedValue: data.final_total,
                createdAt: data.created_at,
              });
            }
          } else if (link.submission_type === 'ductless') {
            const { data } = await supabase
              .from('ductless_estimate_submissions')
              .select('id, customer_name, status, final_total, created_at')
              .eq('id', link.submission_id)
              .single();
            
            if (data) {
              details.push({
                id: data.id,
                type: 'ductless',
                source: 'ductless',
                customerName: data.customer_name || 'Unknown',
                status: data.status,
                estimatedValue: data.final_total,
                createdAt: data.created_at,
              });
            }
          } else if (link.submission_type === 'scanner') {
            const { data } = await supabase
              .from('equipment_scans')
              .select('id, customer_name, status, created_at')
              .eq('id', link.submission_id)
              .single();
            
            if (data) {
              details.push({
                id: data.id,
                type: 'scanner',
                source: 'scanner',
                customerName: data.customer_name || 'Unknown',
                status: data.status,
                estimatedValue: null,
                createdAt: data.created_at || '',
              });
            }
          }
        } catch (err) {
          console.error(`Failed to fetch ${link.submission_type} submission:`, err);
        }
      }

      return details;
    },
    enabled: !!links && links.length > 0,
  });

  const handleViewSubmission = (submission: SubmissionDetail) => {
    navigate(`/admin/submissions/${submission.type}/${submission.id}`);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Linked Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!links || links.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No linked submissions</p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimator and scanner submissions will appear here when linked
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Linked Submissions ({links.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {submissions?.map((submission) => {
            const config = sourceConfig[submission.source] || sourceConfig.contact;
            
            return (
              <div 
                key={submission.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.label}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {submission.estimatedValue && (
                        <span className="font-medium text-foreground">
                          {formatCurrency(submission.estimatedValue)}
                        </span>
                      )}
                      <span>•</span>
                      <span>{format(new Date(submission.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleViewSubmission(submission)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
