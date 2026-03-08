import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DocumentPreview } from '@/components/invoicing/DocumentPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Printer } from 'lucide-react';
import { printDocument } from '@/components/invoicing/DocumentPreview';
import { toast } from 'sonner';

function usePublicEstimate(id: string | undefined) {
  return useQuery({
    queryKey: ['public-estimate', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID');
      const { data, error } = await supabase.functions.invoke('ottopay-proxy', {
        body: { entity: 'estimates', method: 'GET', params: { id } },
      });
      if (error) throw error;
      if (!data?.data) throw new Error('Estimate not found');

      const estimate = Array.isArray(data.data) ? data.data[0] : data.data;

      // Fetch line items
      const { data: liData } = await supabase.functions.invoke('ottopay-proxy', {
        body: { entity: 'estimate_line_items', method: 'GET', params: { estimate_id: id } },
      });

      return { estimate, lineItems: liData?.data || [] };
    },
    enabled: !!id,
  });
}

const PublicEstimatePreview = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePublicEstimate(id);
  const [acceptName, setAcceptName] = useState('');
  const [accepted, setAccepted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-[700px] p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Estimate Not Found</h1>
          <p className="text-gray-500">This estimate may have expired or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const { estimate, lineItems } = data;

  const handleAccept = async () => {
    if (!acceptName.trim()) { toast.error('Please enter your name to accept'); return; }
    try {
      await supabase.functions.invoke('ottopay-proxy', {
        body: { entity: 'estimates', method: 'PATCH', id: estimate.id, params: { status: 'accepted' } },
      });
      setAccepted(true);
      toast.success('Estimate accepted!');
    } catch {
      toast.error('Failed to accept estimate');
    }
  };

  const previewProps = {
    type: 'estimate' as const,
    documentNumber: estimate.estimate_number,
    date: estimate.estimate_date || estimate.created_at,
    validUntil: estimate.valid_until,
    customerName: estimate.customers?.name || 'Customer',
    customerEmail: estimate.customers?.email,
    customerPhone: estimate.customers?.phone,
    customerAddress: estimate.customers?.address,
    lineItems: (lineItems || []).map((li: any) => ({ description: li.description, quantity: li.quantity, unit_price: li.unit_price, line_total: li.line_total })),
    subtotal: estimate.subtotal,
    taxRate: estimate.tax_rate || 0,
    taxAmount: estimate.tax_amount,
    total: estimate.total,
    notes: estimate.notes,
    terms: estimate.terms,
    status: accepted ? 'accepted' : estimate.status,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-[760px] mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1e3a5f]">Truficient HVAC</h1>
            <p className="text-sm text-gray-500">Estimate {estimate.estimate_number}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => printDocument(previewProps)}>
            <Printer className="h-4 w-4 mr-1.5" /> Download PDF
          </Button>
        </div>

        {/* Document */}
        <DocumentPreview {...previewProps} />

        {/* Accept Section */}
        {estimate.status !== 'accepted' && estimate.status !== 'converted' && !accepted ? (
          <div className="mt-6 bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-lg text-[#1e3a5f] mb-3">Accept This Estimate</h3>
            <p className="text-sm text-gray-600 mb-4">
              By entering your name below and clicking "Accept Estimate", you agree to the terms and pricing outlined above.
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Your Full Name</label>
                <Input
                  value={acceptName}
                  onChange={e => setAcceptName(e.target.value)}
                  placeholder="Enter your full name"
                  className="text-base"
                />
              </div>
              <Button onClick={handleAccept} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white">
                <CheckCircle className="h-4 w-4 mr-1.5" /> Accept Estimate
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-green-50 rounded-lg border border-green-200 p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-lg text-green-700">Estimate Accepted</h3>
            <p className="text-sm text-green-600 mt-1">Thank you! We'll be in touch to schedule the work.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicEstimatePreview;
