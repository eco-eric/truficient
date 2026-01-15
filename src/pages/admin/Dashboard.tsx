import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCards } from '@/components/admin/dashboard/StatsCards';
import { RecentSubmissions } from '@/components/admin/dashboard/RecentSubmissions';
import { SubmissionsChart } from '@/components/admin/dashboard/SubmissionsChart';
import { ServiceTypeChart } from '@/components/admin/dashboard/ServiceTypeChart';
import { StatusChart } from '@/components/admin/dashboard/StatusChart';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { startOfWeek } from 'date-fns';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  service_type: string | null;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewed: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all submissions
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('id, first_name, last_name, email, service_type, status, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const fetchedSubmissions = (data || []) as Submission[];
        
        // Calculate stats
        const weekStart = startOfWeek(new Date());
        const thisWeekCount = fetchedSubmissions.filter(
          s => new Date(s.created_at) >= weekStart
        ).length;

        setStats({
          total: fetchedSubmissions.length,
          new: fetchedSubmissions.filter(s => !s.status || s.status === 'new').length,
          reviewed: fetchedSubmissions.filter(s => s.status === 'reviewed' || s.status === 'contacted' || s.status === 'closed').length,
          thisWeek: thisWeekCount,
        });

        // Store all submissions for charts
        setAllSubmissions(fetchedSubmissions);
        
        // Set recent submissions (last 5)
        setSubmissions(fetchedSubmissions.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <StatsCards
          totalSubmissions={stats.total}
          newSubmissions={stats.new}
          reviewedSubmissions={stats.reviewed}
          thisWeekSubmissions={stats.thisWeek}
        />
        
        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubmissionsChart submissions={allSubmissions} days={30} />
          <div className="grid grid-cols-1 gap-6">
            <ServiceTypeChart submissions={allSubmissions} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart submissions={allSubmissions} />
          <RecentSubmissions submissions={submissions} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
