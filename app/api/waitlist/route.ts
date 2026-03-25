import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = [
  "tarunkumarz211286@gmail.com",
  "annaduchene@outlook.com"
];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log("Waitlist API called with email:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();
    console.log("Supabase client created");

    // Check if email already exists
    const { data: existingEmail, error: checkError } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine
      console.error("Supabase check error:", checkError);
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 400 }
      );
    }

    console.log("Inserting email into database...");

    // Insert into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          email: email.toLowerCase(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to add to waitlist" },
        { status: 500 }
      );
    }

    console.log("Email inserted successfully:", data);

    // Send email to user
    try {
      await resend.emails.send({
        from: "myPawPair <noreply@contact.mypawpair.com>",
        to: [email],
        subject: "Welcome to myPawPair Waitlist! 🐾",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to myPawPair</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F6F2EA;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F6F2EA; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #5F7E9D; padding: 40px 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600;">Welcome to myPawPair! 🐾</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; color: #2F3E4E; font-size: 24px; font-weight: 600;">You're on the list!</h2>
                          
                          <p style="margin: 0 0 20px; color: #4A5563; font-size: 16px; line-height: 1.6;">
                            Thank you for joining the myPawPair waitlist! We're thrilled to have you as part of our early community.
                          </p>
                          
                          <p style="margin: 0 0 20px; color: #4A5563; font-size: 16px; line-height: 1.6;">
                            myPawPair is your personal AI dog care assistant that truly understands your dog's unique needs. From nutrition advice to behavior tips, we're building something special just for you and your furry friend.
                          </p>
                          
                          <div style="background-color: #F6F2EA; border-radius: 12px; padding: 24px; margin: 30px 0;">
                            <h3 style="margin: 0 0 15px; color: #2F3E4E; font-size: 18px; font-weight: 600;">What's Next?</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #4A5563; font-size: 16px; line-height: 1.8;">
                              <li>You'll receive early access before the public launch</li>
                              <li>Get exclusive updates on new features</li>
                              <li>Priority support from our team</li>
                              <li>Special perks for early adopters</li>
                            </ul>
                          </div>
                          
                          <p style="margin: 0 0 20px; color: #4A5563; font-size: 16px; line-height: 1.6;">
                            We'll keep you updated on our progress and let you know as soon as myPawPair is ready to meet your dog!
                          </p>
                          
                          <p style="margin: 30px 0 0; color: #4A5563; font-size: 16px; line-height: 1.6;">
                            Best regards,<br>
                            <strong style="color: #2F3E4E;">The myPawPair Team</strong>
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #F6F2EA; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                            © 2026 myPawPair. All rights reserved.
                          </p>
                          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                            Compatibility-based dog care, starting local and built thoughtfully.
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
      console.log("User confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send user email:", emailError);
      // Don't fail the request if email fails
    }

    // Send notification emails to admins
    try {
      console.log("Sending notification to admins:", ADMIN_EMAILS);
      const adminEmailResult = await resend.emails.send({
        from: "myPawPair Waitlist <noreply@contact.mypawpair.com>",
        to: ADMIN_EMAILS,
        subject: "🎉 New Waitlist Signup - myPawPair",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Waitlist Signup</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #5F7E9D 0%, #4e6b87 100%); padding: 30px 40px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 New Waitlist Signup</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                            Great news! Someone just joined the myPawPair waitlist.
                          </p>
                          
                          <div style="background-color: #F6F2EA; border-left: 4px solid #5F7E9D; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #6B7280; font-size: 14px; font-weight: 600; width: 120px;">Email:</td>
                                <td style="color: #111827; font-size: 16px; font-weight: 500;">${email}</td>
                              </tr>
                              <tr>
                                <td style="color: #6B7280; font-size: 14px; font-weight: 600;">Signed up:</td>
                                <td style="color: #111827; font-size: 14px;">${new Date().toLocaleString('en-US', { 
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</td>
                              </tr>
                            </table>
                          </div>
                          
                          <p style="margin: 25px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                            This is an automated notification from your myPawPair waitlist system.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                            myPawPair Admin Notification System
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
      console.log("Admin notification emails sent successfully");
    } catch (adminEmailError) {
      console.error("Failed to send admin email:", adminEmailError);
      // Don't fail the request if email fails
    }

    console.log("Waitlist signup completed successfully for:", email);

    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully joined the waitlist!",
        data 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
