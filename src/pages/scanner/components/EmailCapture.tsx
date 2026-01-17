import { useState } from 'react';
import { useScanner } from '../context/ScannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function EmailCapture() {
  const { state, dispatch } = useScanner();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get all scan IDs (current result + accumulated results)
  const getAllScanIds = (): string[] => {
    const ids: string[] = [];
    
    // Add accumulated results
    state.results.forEach(scan => {
      if (scan.id) ids.push(scan.id);
    });
    
    // Add current result if not already in results
    if (state.result?.id && !ids.includes(state.result.id)) {
      ids.push(state.result.id);
    }
    
    return ids;
  };

  const totalScans = getAllScanIds().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const scanIds = getAllScanIds();
    if (scanIds.length === 0) {
      toast.error('No scans to save');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update all scan records with the email
      const { error } = await supabase
        .from('equipment_scans')
        .update({ email })
        .in('id', scanIds);

      if (error) throw error;

      dispatch({ type: 'SET_EMAIL', payload: email });
      setIsSubmitted(true);
      toast.success(
        totalScans > 1 
          ? `Email saved! We'll send your ${totalScans} equipment reports shortly.`
          : 'Email saved! We\'ll send your results shortly.'
      );
    } catch (err) {
      console.error('Failed to save email:', err);
      toast.error('Failed to save email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">Email saved!</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {totalScans > 1 
                ? `We'll send your ${totalScans} equipment reports to ${email}`
                : `We'll send your equipment report to ${email}`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Get your results emailed</h3>
              <p className="text-sm text-muted-foreground">
                {totalScans > 1 
                  ? `We'll send a report with all ${totalScans} scanned units and downloadable PDFs`
                  : 'We\'ll send a copy of this report with downloadable PDFs'
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !email}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            We respect your privacy. No spam, unsubscribe anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
