import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, User, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  contactId: string;
  contactName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  lastMessageBody?: string;
  lastMessageDate?: string;
  unreadCount?: number;
}

export const RecentChats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ghl-conversations-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-ghl-conversations', {
        body: null,
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const conversations: Conversation[] = (data?.conversations || []).slice(0, 5);

  const getContactDisplayName = (conv: Conversation) => {
    return conv.fullName || conv.contactName || conv.email || conv.phone || 'Unknown Contact';
  };

  const formatMessageDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Recent Chats
          </CardTitle>
          <CardDescription>Unable to load conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Could not connect to GHL
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://app.gohighlevel.com/conversations" target="_blank" rel="noopener noreferrer">
                Open GHL Dashboard
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Recent Chats
          </CardTitle>
          <CardDescription>Latest chatbot conversations</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/ghl-conversations">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent conversations</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to="/admin/ghl-conversations"
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {getContactDisplayName(conv)}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <Badge variant="default" className="flex-shrink-0 text-xs">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessageBody || 'No messages yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatMessageDate(conv.lastMessageDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
