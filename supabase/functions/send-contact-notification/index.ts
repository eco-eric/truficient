// Sends two emails when a contact form is submitted:
//   1. Internal notification to the team
//   2. Customer acknowledgement
// Uses the same Resend setup as send-crm-email (from bach@truficient.com).

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FROM = 'Truficient <bach@truficient.com>';
const REPLY_TO = 'info@truficient.com';
const INTERNAL_RECIPIENTS = ['info@truficient.com', 'annabeth.d@truficient.com'];

interface Payload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  source?: string;
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const sendEmail = async (payload: Record<string, unknown>) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Resend error:', data);
    throw new Error(data?.message || 'Resend send failed');
  }
  return data;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;

    if (!body.email || !body.firstName || !body.lastName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fullName = `${body.firstName} ${body.lastName}`.trim();
    const submittedCST = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // ---------- 1. INTERNAL NOTIFICATION ----------
    const internalHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #002244;">
        <div style="background: #002244; color: #FFB547; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">New Contact Form Submission</h1>
          <p style="margin: 8px 0 0; color: #fff; font-size: 13px;">${escape(submittedCST)} CST</p>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 130px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${escape(fullName)}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escape(body.email)}" style="color: #002244;">${escape(body.email)}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;"><a href="tel:${escape(body.phone)}" style="color: #002244;">${escape(body.phone)}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Service</td><td style="padding: 8px 0;">${escape(body.serviceType)}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Source</td><td style="padding: 8px 0;">${escape(body.source || 'Website Contact Page')}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-left: 3px solid #FFB547; border-radius: 4px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
            <p style="margin: 0; white-space: pre-wrap;">${escape(body.message)}</p>
          </div>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            View in admin: <a href="https://truficient.com/admin/submissions" style="color: #002244;">truficient.com/admin/submissions</a>
          </div>
        </div>
      </div>`;

    const internalText = [
      `New Contact Form Submission`,
      `Submitted: ${submittedCST} CST`,
      ``,
      `Name: ${fullName}`,
      `Email: ${body.email}`,
      `Phone: ${body.phone}`,
      `Service: ${body.serviceType}`,
      `Source: ${body.source || 'Website Contact Page'}`,
      ``,
      `Message:`,
      body.message,
      ``,
      `Admin: https://truficient.com/admin/submissions`,
    ].join('\n');

    // ---------- 2. CUSTOMER ACKNOWLEDGEMENT ----------
    const customerHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #002244;">
        <div style="background: #002244; padding: 28px 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; color: #FFB547; font-size: 24px;">Thanks, ${escape(body.firstName)}!</h1>
          <p style="margin: 8px 0 0; color: #fff; font-size: 14px;">We received your message.</p>
        </div>
        <div style="background: #fff; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
            A member of our team will be in touch within <strong>24 business hours</strong> regarding your <strong>${escape(body.serviceType)}</strong> request.
          </p>
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
            Need immediate help? Give us a call:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="tel:214-238-4349" style="display: inline-block; background: #FFB547; color: #002244; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 16px;">Call (214) 238-4349</a>
          </div>
          <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 4px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Your Message</p>
            <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${escape(body.message)}</p>
          </div>
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;"><strong>Truficient HVAC Solutions</strong></p>
            <p style="margin: 4px 0 0;">TACLB77247C · Serving the DFW Metroplex</p>
            <p style="margin: 8px 0 0;"><a href="https://truficient.com" style="color: #002244;">truficient.com</a></p>
          </div>
        </div>
      </div>`;

    const customerText = [
      `Thanks, ${body.firstName}!`,
      ``,
      `We received your message and a member of our team will be in touch within 24 business hours regarding your ${body.serviceType} request.`,
      ``,
      `Need immediate help? Call (214) 238-4349`,
      ``,
      `Your message:`,
      body.message,
      ``,
      `--`,
      `Truficient HVAC Solutions`,
      `TACLB77247C · Serving the DFW Metroplex`,
      `https://truficient.com`,
    ].join('\n');

    // Send both in parallel
    const [internalRes, customerRes] = await Promise.allSettled([
      sendEmail({
        from: FROM,
        to: INTERNAL_RECIPIENTS,
        reply_to: body.email,
        subject: `🔔 New Contact: ${fullName} — ${body.serviceType}`,
        html: internalHtml,
        text: internalText,
      }),
      sendEmail({
        from: FROM,
        to: [body.email],
        reply_to: REPLY_TO,
        subject: `We got your message, ${body.firstName} — Truficient HVAC`,
        html: customerHtml,
        text: customerText,
      }),
    ]);

    const result = {
      internal:
        internalRes.status === 'fulfilled'
          ? { ok: true, id: (internalRes.value as { id?: string }).id }
          : { ok: false, error: String(internalRes.reason) },
      customer:
        customerRes.status === 'fulfilled'
          ? { ok: true, id: (customerRes.value as { id?: string }).id }
          : { ok: false, error: String(customerRes.reason) },
    };

    console.log('Contact notification result:', JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-contact-notification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
