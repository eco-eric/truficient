import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  MessageSquare, 
  RefreshCw, 
  User, 
  Clock,
  ArrowLeft,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  contactId: string;
  contactName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  lastMessageBody?: string;
  lastMessageDate?: string;
  lastMessageType?: string;
  unreadCount?: number;
  starred?: boolean;
  type?: string;
}

interface Message {
  id: string;
  body: string;
  dateAdded: string;
  direction: 'inbound' | 'outbound';
  type: string;
  status?: string;
  contactId?: string;
  userId?: string;
}

const GHLConversations = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const ghlConversationsUrl = 'https://app.gohighlevel.com/conversations';

  // Fetch conversations list
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations 
  } = useQuery({
    queryKey: ['ghl-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-ghl-conversations', {
        body: null,
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
  });

  // Fetch messages for selected conversation
  const { 
    data: messagesData, 
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ['ghl-messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return { messages: [] };
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-ghl-conversations?conversationId=${selectedConversation.id}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    enabled: !!selectedConversation?.id,
  });

  const conversations: Conversation[] = conversationsData?.conversations || [];
  const messages: Message[] = Array.isArray(messagesData?.messages) ? messagesData.messages : [];

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

  if (conversationsError) {
    return (
      <AdminLayout title="GHL Conversations">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">GHL Conversations</h1>
            <p className="text-muted-foreground">
              View and manage live chat conversations
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Conversations</CardTitle>
              <CardDescription>
                There was an issue connecting to GoHighLevel. This could be due to API permissions or configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Error: {conversationsError instanceof Error ? conversationsError.message : 'Unknown error'}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refetchConversations()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button asChild>
                  <a href={ghlConversationsUrl} target="_blank" rel="noopener noreferrer">
                    Open GHL Dashboard
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="GHL Conversations">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">GHL Conversations</h1>
            <p className="text-muted-foreground">
              View and manage live chat conversations
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchConversations()}
              disabled={conversationsLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", conversationsLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild size="sm">
              <a href={ghlConversationsUrl} target="_blank" rel="noopener noreferrer">
                Open GHL
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
                {conversations.length > 0 && (
                  <Badge variant="secondary">{conversations.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {conversationsLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                          selectedConversation?.id === conv.id && "bg-muted"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">
                                {getContactDisplayName(conv)}
                              </p>
                              {conv.unreadCount && conv.unreadCount > 0 && (
                                <Badge variant="default" className="flex-shrink-0">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessageBody || 'No messages yet'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatMessageDate(conv.lastMessageDate)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversation Detail / Messages */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {getContactDisplayName(selectedConversation)}
                      </CardTitle>
                      <CardDescription>
                        {selectedConversation.email || selectedConversation.phone || 'No contact info'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                            <Skeleton className="h-16 w-2/3 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No messages in this conversation</p>
                          <p className="text-sm mt-1">Reply via the GHL dashboard</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              msg.direction === 'outbound' ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-lg p-3",
                                msg.direction === 'outbound'
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                msg.direction === 'outbound' 
                                  ? "text-primary-foreground/70" 
                                  : "text-muted-foreground"
                              )}>
                                {formatMessageDate(msg.dateAdded)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex gap-2 items-center">
                    <p className="text-sm text-muted-foreground flex-1">
                      Reply to this conversation in the GHL dashboard
                    </p>
                    <Button asChild size="sm">
                      <a 
                        href={`${ghlConversationsUrl}/${selectedConversation.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Reply in GHL
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to view messages</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GHLConversations;
