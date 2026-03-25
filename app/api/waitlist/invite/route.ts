import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SIGNUP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mypawpair.com";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const signupLink = `${SIGNUP_URL}/auth/sign-up`;

    await resend.emails.send({
      from: "myPawPair <noreply@contact.mypawpair.com>",
      to: [email],
      subject: "You're invited to join myPawPair as a Dog Owner! 🐾",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>myPawPair Invitation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F6F2EA;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F6F2EA; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="background-color: #5F7E9D; padding: 40px 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600;">You're Invited! 🐾</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; color: #2F3E4E; font-size: 24px; font-weight: 600;">Join myPawPair as a Dog Owner</h2>
                        
                        <p style="margin: 0 0 20px; color: #4A5563; font-size: 16px; line-height: 1.6;">
                          You're on the myPawPair waitlist! We're excited to invite you to create your account and start finding the perfect care for your dog.
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #4A5563; font-size: 16px; line-height: 1.6;">
                          myPawPair is your personal AI dog care assistant that matches you with trusted caregivers. Create your account and get matched with caregivers who understand your dog's unique needs.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${signupLink}" style="display: inline-block; background-color: #5F7E9D; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                            Sign up as Dog Owner
                          </a>
                        </div>
                        
                        <p style="margin: 0 0 20px; color: #4A5563; font-size: 14px; line-height: 1.6;">
                          Or copy this link: <a href="${signupLink}" style="color: #5F7E9D; word-break: break-all;">${signupLink}</a>
                        </p>
                        
                        <p style="margin: 30px 0 0; color: #4A5563; font-size: 16px; line-height: 1.6;">
                          Best regards,<br>
                          <strong style="color: #2F3E4E;">The myPawPair Team</strong>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #F6F2EA; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                          © 2026 myPawPair. All rights reserved.
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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Waitlist invite error:", error);
    return NextResponse.json(
      { error: "Failed to send invite email" },
      { status: 500 }
    );
  }
}
