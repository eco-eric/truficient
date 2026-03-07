import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCards } from '@/components/admin/dashboard/StatsCards';
import { RecentSubmissions } from '@/components/admin/dashboard/RecentSubmissions';
import { RecentChats } from '@/components/admin/dashboard/RecentChats';
import { SubmissionsChart } from '@/components/admin/dashboard/SubmissionsChart';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { LeadMetrics } from '@/components/admin/dashboard/LeadMetrics';
import { InvoicingSnapshot } from '@/components/admin/dashboard/InvoicingSnapshot';
import { EngagementStats } from '@/components/admin/dashboard/EngagementStats';
import { RevenueSummary } from '@/components/admin/dashboard/RevenueSummary';
import { PipelineStatus } from '@/components/admin/dashboard/PipelineStatus';
import { DuctedMetricsCard } from '@/components/admin/dashboard/DuctedMetricsCard';
import { DuctlessMetricsCard } from '@/components/admin/dashboard/DuctlessMetricsCard';
import { GHLSyncHealth } from '@/components/admin/dashboard/GHLSyncHealth';
import { FailedSyncsAlert } from '@/components/admin/dashboard/FailedSyncsAlert';
import { JobTypeBoardPreview } from '@/components/admin/dashboard/JobTypeBoardPreview';
import { UpcomingAppointments } from '@/components/admin/dashboard/UpcomingAppointments';
import { BriefingSummaryCard } from '@/components/admin/dashboard/BriefingSummaryCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { startOfWeek } from 'date-fns';
import { CommandCenter } from '@/components/admin/command-center/CommandCenter';
import { useAssistant } from '@/components/admin/assistant/AssistantContext';

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
  const outletContext = useOutletContext<{ briefingData?: any; canBriefing?: boolean }>();
  const { openPanel } = useAssistant();
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
        // Fetch all submissions from multiple sources in parallel
        const [contactResult, landingPageResult, ductlessResult, scannerResult] = await Promise.all([
          supabase
            .from('contact_submissions')
            .select('id, first_name, last_name, email, service_type, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('landing_page_submissions')
            .select('id, first_name, last_name, email, service_type, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('ductless_estimate_submissions')
            .select('id, customer_name, customer_email, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('equipment_scans')
            .select('id, customer_name, email, status, created_at')
            .not('email', 'is', null)
            .order('created_at', { ascending: false }),
        ]);

        // Normalize all submissions
        const allSubs: Submission[] = [];
        
        // Contact submissions
        (contactResult.data || []).forEach(s => {
          allSubs.push({
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            email: s.email,
            service_type: s.service_type,
            status: s.status || 'new',
            created_at: s.created_at,
          });
        });

        // Landing page submissions
        (landingPageResult.data || []).forEach(s => {
          allSubs.push({
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            email: s.email,
            service_type: s.service_type,
            status: s.status || 'new',
            created_at: s.created_at,
          });
        });

        // Ductless submissions
        (ductlessResult.data || []).forEach(s => {
          const nameParts = (s.customer_name || 'Unknown').split(' ');
          allSubs.push({
            id: s.id,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: s.customer_email,
            service_type: 'Ductless',
            status: s.status || 'new',
            created_at: s.created_at,
          });
        });

        // Scanner submissions
        (scannerResult.data || []).forEach(s => {
          const nameParts = (s.customer_name || 'Unknown').split(' ');
          allSubs.push({
            id: s.id,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: s.email!,
            service_type: 'Scanner',
            status: s.status || 'new',
            created_at: s.created_at!,
          });
        });

        // Sort by date descending
        allSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Calculate stats
        const weekStart = startOfWeek(new Date());
        const thisWeekCount = allSubs.filter(
          s => new Date(s.created_at) >= weekStart
        ).length;

        setStats({
          total: allSubs.length,
          new: allSubs.filter(s => !s.status || s.status === 'new').length,
          reviewed: allSubs.filter(s => s.status === 'reviewed' || s.status === 'contacted' || s.status === 'closed').length,
          thisWeek: thisWeekCount,
        });

        // Store all submissions for charts
        setAllSubmissions(allSubs);
        
        // Set recent submissions (last 5)
        setSubmissions(allSubs.slice(0, 5));
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
        {/* AI Briefing Summary */}
        {outletContext?.canBriefing && outletContext?.briefingData && (
          <BriefingSummaryCard briefingData={outletContext.briefingData} onOpenAssistant={openPanel} />
        )}

        {/* Command Center */}
        <CommandCenter />
        
        {/* Stats Cards Row */}
        <StatsCards
          totalSubmissions={stats.total}
          newSubmissions={stats.new}
          reviewedSubmissions={stats.reviewed}
          thisWeekSubmissions={stats.thisWeek}
        />
        
        {/* Revenue & Pipeline Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueSummary />
          <PipelineStatus />
        </div>
        
        {/* Jobs & Calendar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobTypeBoardPreview jobTypeSlug="residential-service-call" title="Service Calls Board" icon="wrench" />
          <JobTypeBoardPreview jobTypeSlug="residential-installation" title="Installs Board" icon="hardhat" />
        </div>
        
        {/* Upcoming Appointments */}
        <UpcomingAppointments />
        
        {/* GHL Sync Health Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GHLSyncHealth />
          <FailedSyncsAlert />
        </div>
        
        {/* Estimator Performance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DuctedMetricsCard />
          <DuctlessMetricsCard />
        </div>
        
        {/* Quick Actions + Lead Metrics + Invoicing Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions />
          <LeadMetrics />
          <InvoicingSnapshot />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubmissionsChart submissions={allSubmissions} days={30} />
          <EngagementStats />
        </div>
        
        {/* Activity + Recent Items Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityFeed />
          <RecentSubmissions submissions={submissions} />
          <RecentChats />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
