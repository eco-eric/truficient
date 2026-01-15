import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCards } from '@/components/admin/dashboard/StatsCards';
import { RecentSubmissions } from '@/components/admin/dashboard/RecentSubmissions';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { startOfWeek } from 'date-fns';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  service_type: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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

        const allSubmissions = (data || []) as Submission[];
        
        // Calculate stats
        const weekStart = startOfWeek(new Date());
        const thisWeekCount = allSubmissions.filter(
          s => new Date(s.created_at) >= weekStart
        ).length;

        setStats({
          total: allSubmissions.length,
          new: allSubmissions.filter(s => !s.status || s.status === 'new').length,
          reviewed: allSubmissions.filter(s => s.status === 'reviewed' || s.status === 'contacted' || s.status === 'closed').length,
          thisWeek: thisWeekCount,
        });

        // Set recent submissions (last 5)
        setSubmissions(allSubmissions.slice(0, 5));
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
        
        <RecentSubmissions submissions={submissions} />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
