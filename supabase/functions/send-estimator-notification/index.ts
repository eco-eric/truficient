import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFICATION_EMAIL = 'estimator@truficient.com';

interface NotificationData {
  estimatorType: 'ducted' | 'ductless';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  quoteTotal: string;
  quoteDetails: string;
  submittedAt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get('GHL_API_Key_Contact');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL credentials');
      throw new Error('GHL credentials not configured');
    }

    const data: NotificationData = await req.json();
    console.log('Sending estimator notification for:', data.customerEmail);

    const submittedAt = data.submittedAt || new Date().toLocaleString('en-US', { 
      timeZone: 'America/Chicago',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Format email body with submission details
    const emailSubject = `New ${data.estimatorType === 'ducted' ? 'Ducted HVAC' : 'Ductless Mini-Split'} Estimate Submission`;
    
    const emailBody = `
NEW ESTIMATOR SUBMISSION
========================

Customer Information:
---------------------
Name: ${data.customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone || 'Not provided'}
Address: ${data.customerAddress || 'Not provided'}

Estimate Type: ${data.estimatorType === 'ducted' ? 'Ducted HVAC System' : 'Ductless Mini-Split'}
Total Quote: ${data.quoteTotal}
Submitted: ${submittedAt}

Quote Details:
--------------
${data.quoteDetails}

---
This is an automated notification from the Truficient website estimator.
    `.trim();

    // Create an internal note on the notification contact using GHL Tasks API
    // First, ensure we have a staff contact or use the conversations API
    
    // Use GHL's Conversations API to create an internal notification
    // We'll send to the internal notification channel via webhook trigger
    
    // Alternative: Use GHL's built-in email via their SMTP or trigger a workflow
    // For now, we'll create a task in GHL that will notify staff

    // Try to create a task for internal notification
    const taskPayload = {
      title: emailSubject,
      body: emailBody,
      dueDate: new Date().toISOString(),
      completed: false,
      assignedTo: NOTIFICATION_EMAIL,
    };

    // First, let's try sending via GHL's internal notification system
    // by adding a note to the contact we just created
    
    // Search for the contact first
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(data.customerEmail)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
        },
      }
    );

    let contactId: string | null = null;
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      contactId = searchData.contact?.id;
      console.log('Found contact ID:', contactId);
    }

    if (contactId) {
      // Add a note to the contact which can trigger GHL automations
      const notePayload = {
        body: `📋 ESTIMATOR SUBMISSION\n\n${emailBody}`,
      };

      const noteResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify(notePayload),
        }
      );

      if (noteResponse.ok) {
        console.log('Note added to contact successfully');
      } else {
        console.log('Note response:', await noteResponse.text());
      }

      // Add a task for follow-up
      const ghlTaskPayload = {
        title: emailSubject,
        body: `Follow up on estimate submission from ${data.customerName}\n\nQuote Total: ${data.quoteTotal}\nEmail: ${data.customerEmail}\nPhone: ${data.customerPhone || 'N/A'}`,
        dueDate: new Date().toISOString(),
        completed: false,
        contactId: contactId,
      };

      const taskResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify(ghlTaskPayload),
        }
      );

      if (taskResponse.ok) {
        console.log('Task created successfully');
      } else {
        console.log('Task response:', await taskResponse.text());
      }
    }

    // Log the notification for tracking
    console.log('Notification processed:', {
      email: data.customerEmail,
      type: data.estimatorType,
      total: data.quoteTotal,
      notificationTarget: NOTIFICATION_EMAIL,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification processed for ${data.customerEmail}`,
        notificationEmail: NOTIFICATION_EMAIL,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
    console.error('Error sending notification:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
