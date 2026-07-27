import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusSelect } from '@/components/admin/submissions/StatusSelect';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Wrench,
  MessageSquare 
} from 'lucide-react';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  service_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface Attribution {
  channel: string | null;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
}

interface LeadQuery {
  query: string;
  clicks: number | null;
  position: number | null;
}

const SubmissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [leadQueries, setLeadQueries] = useState<LeadQuery[]>([]);


  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setSubmission(data as Submission);
      } catch (error) {
        console.error('Error fetching submission:', error);
        toast({
          title: 'Error',
          description: 'Failed to load submission details.',
          variant: 'destructive',
        });
        navigate('/admin/submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, navigate, toast]);

  const handleStatusChange = async (newStatus: string) => {
    if (!submission) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', submission.id);

      if (error) throw error;

      setSubmission({ ...submission, status: newStatus });
      toast({
        title: 'Status updated',
        description: `Submission status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Submission Details">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout title="Submission Details">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Submission not found</p>
          <Button asChild className="mt-4">
            <Link to="/admin/submissions">Back to Submissions</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Submission Details">
      <div className="space-y-6">
        {/* Back button and actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/admin/submissions" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Submissions
            </Link>
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Status:</span>
            <StatusSelect
              value={submission.status || 'new'}
              onChange={handleStatusChange}
              disabled={saving}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {submission.first_name} {submission.last_name}
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a 
                  href={`mailto:${submission.email}`}
                  className="hover:text-foreground hover:underline"
                >
                  {submission.email}
                </a>
              </div>
              
              {submission.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a 
                    href={`tel:${submission.phone}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {submission.phone}
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(submission.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span>{submission.service_type}</span>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.message ? (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {submission.message}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No message provided
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={`mailto:${submission.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </a>
            </Button>
            
            {submission.phone && (
              <Button variant="outline" asChild>
                <a href={`tel:${submission.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SubmissionDetail;
