import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InquiryPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { name, email, projectType, budget, message }: InquiryPayload = await req.json();

    if (!name || !email || !projectType || !budget || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data, error: dbError } = await supabase
      .from("consulting_inquiries")
      .insert([
        {
          name,
          email,
          project_type: projectType,
          budget_range: budget,
          message,
          status: "new",
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Atelier <support@fulatelier.com>",
            to: "your-email@example.com",
            subject: `New Inquiry: ${projectType} (${budget})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
                <h2 style="font-weight: 300; letter-spacing: -0.02em;">NEW CONSULTATION INQUIRY</h2>
                <p><strong>Client:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Project Type:</strong> ${projectType}</p>
                <p><strong>Budget:</strong> ${budget}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Message:</strong></p>
                <p>${message}</p>
              </div>
            `,
          }),
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Atelier <support@fulatelier.com>",
            to: email,
            subject: "Your Inquiry at Atelier",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
                <h2 style="font-weight: 300; letter-spacing: -0.02em;">ATELIER</h2>
                <p>Hi ${name},</p>
                <p>Thank you for reaching out. We have received your inquiry for a <strong>${projectType}</strong> project.</p>
                <p>Our team is reviewing your requirements and budget (${budget}) and will get back to you within 48 hours to discuss the next steps.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">This is an automated confirmation of your request.</p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
