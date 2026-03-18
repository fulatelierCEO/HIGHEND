import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

console.log('API Route initialized with SB_URL:', !!process.env.SB_URL);
console.log('Using URL:', process.env.SB_URL);

const supabase = createClient(
  process.env.SB_URL!,
  process.env.SB_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = body.fullName || body.full_name || body.name;
    const email = body.email;
    const projectType = body.projectType || body.project_type;
    const budget = body.budget || body.budget_range;
    const message = body.message;

    const { data: lead, error: dbError } = await supabase
      .from('inquiries')
      .insert([
        {
          full_name: fullName,
          email_address: email,
          project_type: projectType,
          budget_range: budget,
          project_brief: message,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('FULL DATABASE ERROR:', JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500 }
      );
    }

    console.log('✅ Inquiry saved to DB');

    try {
      console.log('📩 Resend attempt triggered');

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.ADMIN_EMAIL!,
        subject: `New Consulting Inquiry: ${projectType}`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="font-size: 24px; font-weight: 300; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.1em;">New Inquiry</h1>

            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; font-weight: 300; margin-bottom: 8px;">Client Details</h2>
              <p style="margin: 4px 0;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
            </div>

            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; font-weight: 300; margin-bottom: 8px;">Project Information</h2>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${projectType}</p>
              <p style="margin: 4px 0;"><strong>Budget:</strong> ${budget}</p>
            </div>

            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; font-weight: 300; margin-bottom: 8px;">Project Brief</h2>
              <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #737373;">
              <p>Inquiry ID: ${lead.id}</p>
              <p>Submitted: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      });

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: 'Thank You for Your Inquiry',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 0; background-color: #FDFCF8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDFCF8; padding: 48px 24px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid rgba(26, 26, 26, 0.1);">
                      <tr>
                        <td style="padding: 64px 48px;">
                          <h1 style="font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 400; color: #1A1A1A; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.2;">
                            Thank You,<br>${fullName}
                          </h1>

                          <div style="width: 60px; height: 1px; background-color: #1A1A1A; margin: 32px 0;"></div>

                          <p style="font-size: 16px; line-height: 1.8; color: #1A1A1A; margin: 0 0 24px 0; font-weight: 300;">
                            We've received your inquiry for <strong style="font-weight: 500;">${projectType}</strong> with a budget range of <strong style="font-weight: 500;">${budget}</strong>.
                          </p>

                          <p style="font-size: 16px; line-height: 1.8; color: #1A1A1A; margin: 0 0 32px 0; font-weight: 300;">
                            Our team will review your project brief and get back to you within 24-48 hours to discuss how we can bring your vision to life.
                          </p>

                          <div style="background-color: #FDFCF8; padding: 32px; margin: 32px 0;">
                            <p style="font-family: 'Inter', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(26, 26, 26, 0.4); margin: 0 0 16px 0; font-weight: 400;">
                              Your Project Brief
                            </p>
                            <p style="font-family: 'Playfair Display', serif; font-size: 15px; line-height: 1.7; color: #1A1A1A; margin: 0; white-space: pre-wrap; font-weight: 400;">
                              ${message}
                            </p>
                          </div>

                          <p style="font-size: 16px; line-height: 1.8; color: #1A1A1A; margin: 0 0 32px 0; font-weight: 300;">
                            In the meantime, feel free to explore our portfolio and learn more about our editorial-first approach to digital design.
                          </p>

                          <div style="text-align: center; margin: 48px 0;">
                            <a href="https://fulatelier.com/products"
                               style="display: inline-block; background-color: #1A1A1A; color: #FFFFFF; text-decoration: none; padding: 16px 48px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 400; transition: background-color 0.3s;">
                              View Our Work
                            </a>
                          </div>

                          <div style="margin-top: 64px; padding-top: 32px; border-top: 1px solid rgba(26, 26, 26, 0.1); text-align: center;">
                            <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #1A1A1A; margin: 0 0 8px 0; font-weight: 400; letter-spacing: -0.01em;">
                              Atelier
                            </h2>
                            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(26, 26, 26, 0.4); margin: 0; font-weight: 300;">
                              Editorial-Grade Digital Products
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                      <tr>
                        <td style="text-align: center; padding: 24px;">
                          <p style="font-size: 11px; color: rgba(26, 26, 26, 0.4); margin: 0; line-height: 1.6;">
                            © ${new Date().getFullYear()} Atelier. All rights reserved.<br>
                            You're receiving this email because you submitted an inquiry on our website.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
