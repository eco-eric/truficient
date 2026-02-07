import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText, 
  Plus,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Database } from '@/integrations/supabase/types';

type Interaction = Database['public']['Tables']['crm_interactions']['Row'];

interface InteractionLogProps {
  customerId: string;
  interactions: Interaction[];
}

const interactionIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  meeting: <Activity className="h-4 w-4" />,
};

export function InteractionLog({ customerId, interactions }: InteractionLogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [type, setType] = useState('note');
  const [direction, setDirection] = useState('outbound');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [outcome, setOutcome] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('crm_interactions')
        .insert({
          customer_id: customerId,
          interaction_type: type,
          direction: direction,
          subject: subject || null,
          content: content || null,
          outcome: outcome || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_interactions', customerId] });
      toast.success('Interaction logged');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log interaction');
    },
  });

  const resetForm = () => {
    setType('note');
    setDirection('outbound');
    setSubject('');
    setContent('');
    setOutcome('');
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Interaction History</CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Interaction
          </Button>
        </CardHeader>
        <CardContent>
          {interactions.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No interactions recorded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex gap-4 p-3 rounded-lg border bg-card">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 bg-muted rounded-full">
                      {interactionIcons[interaction.interaction_type] || <Activity className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{interaction.interaction_type}</span>
                      {interaction.direction && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {interaction.direction}
                        </Badge>
                      )}
                    </div>
                    {interaction.subject && (
                      <p className="text-sm font-medium">{interaction.subject}</p>
                    )}
                    {interaction.content && (
                      <p className="text-sm text-muted-foreground mt-1">{interaction.content}</p>
                    )}
                    {interaction.outcome && (
                      <p className="text-sm mt-1">
                        <span className="text-muted-foreground">Outcome:</span> {interaction.outcome}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(interaction.interaction_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Brief summary..."
              />
            </div>

            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Full details of the interaction..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Outcome</Label>
              <Input 
                value={outcome} 
                onChange={(e) => setOutcome(e.target.value)} 
                placeholder="Result or next steps..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Log Interaction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
