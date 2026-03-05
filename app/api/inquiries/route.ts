import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, projectType, budget, message } = body;

    if (!name || !email || !projectType || !budget || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert([
        {
          client_name: name,
          client_email: email,
          project_intent: projectType,
          project_type: projectType,
          budget_range: budget,
          message: message,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'ATELIER <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: `New Consulting Inquiry: ${projectType}`,
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="font-size: 24px; font-weight: 300; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.1em;">New Inquiry</h1>

              <div style="margin-bottom: 32px;">
                <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; font-weight: 300; margin-bottom: 8px;">Client Details</h2>
                <p style="margin: 4px 0;"><strong>Name:</strong> ${name}</p>
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
          from: 'ATELIER <onboarding@resend.dev>',
          to: email,
          subject: 'Thank You for Your Inquiry',
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="font-size: 24px; font-weight: 300; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.1em;">Thank You, ${name}</h1>

              <p style="line-height: 1.6; margin-bottom: 24px;">
                We've received your inquiry for <strong>${projectType}</strong> with a budget range of <strong>${budget}</strong>.
              </p>

              <p style="line-height: 1.6; margin-bottom: 24px;">
                Our team will review your project brief and get back to you within 24-48 hours to discuss how we can bring your vision to life.
              </p>

              <div style="margin: 32px 0; padding: 24px; background-color: #f5f5f5; border-radius: 4px;">
                <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; font-weight: 300; margin-bottom: 12px;">Your Project Brief</h2>
                <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>

              <p style="line-height: 1.6; margin-bottom: 24px;">
                In the meantime, feel free to explore our portfolio and learn more about our editorial-first approach to digital design.
              </p>

              <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e5e5;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; font-weight: 300; margin-bottom: 8px;">ATELIER</p>
                <p style="font-size: 12px; color: #737373;">Editorial-grade digital products</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
