import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, MessageSquare, Users, Clock } from 'lucide-react';

const GHLConversations = () => {
  // GHL conversations dashboard URL - update this with your actual GHL location ID
  const ghlConversationsUrl = 'https://app.gohighlevel.com/conversations';

  return (
    <AdminLayout title="GHL Conversations">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GHL Conversations</h1>
          <p className="text-muted-foreground">
            View and manage live chat conversations from your website chatbot
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                View in GHL Dashboard
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Track in GHL Dashboard
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Manage in GHL Dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              GoHighLevel Conversations
            </CardTitle>
            <CardDescription>
              Access your live chat conversations, respond to customers, and manage chat history directly in the GoHighLevel dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">What you can do in GHL Conversations:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>View and respond to active chat conversations</li>
                <li>See chat history with customers</li>
                <li>Assign conversations to team members</li>
                <li>Mark conversations as read/unread or resolved</li>
                <li>Access customer contact information</li>
                <li>View chatbot automation logs</li>
              </ul>
            </div>

            <Button asChild size="lg" className="w-full sm:w-auto">
              <a 
                href={ghlConversationsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Open GHL Conversations
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            <p className="text-xs text-muted-foreground">
              Opens in a new tab. You'll need to be logged into your GoHighLevel account.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default GHLConversations;
