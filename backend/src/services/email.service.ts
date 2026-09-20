import { Resend } from "resend";

const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[EMAIL] ⚠️ RESEND_API_KEY is not defined in environment variables. Email sending disabled.");
    return null;
  }
  return new Resend(apiKey);
};

export interface SendWelcomeEmailParams {
  to: string;
  name?: string | null;
  email: string;
  plainPassword: string;
  role: string;
}

/**
 * Sends a welcome email containing login credentials to a newly created user via Resend SDK.
 * Follows official Resend Node.js SDK guidelines.
 */
export async function sendWelcomeEmail({
  to,
  name,
  email,
  plainPassword,
  role,
}: SendWelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    const errorMsg = "RESEND_API_KEY is not configured in backend/.env. Please add RESEND_API_KEY=re_xxx to enable email sending.";
    console.warn(`[EMAIL] ⚠️ Cannot send email to ${email}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const displayName = name ? name : email.split("@")[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
          .header h2 { color: #1e293b; margin: 0; font-size: 24px; }
          .content { font-size: 15px; line-height: 1.6; }
          .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
          .credentials-box p { margin: 6px 0; font-size: 14px; }
          .credentials-box strong { color: #0f172a; width: 100px; display: inline-block; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }
          .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to eCTD Dossier Management System</h2>
          </div>
          <div class="content">
            <p>Hello <strong>${displayName}</strong>,</p>
            <p>An administrator has created an account for you on the eCTD Regulatory Dossier Management platform. Below are your account credentials:</p>
            
            <div class="credentials-box">
              <p><strong>Email:</strong> <code>${email}</code></p>
              <p><strong>Password:</strong> <code>${plainPassword}</code></p>
              <p><strong>Role:</strong> <code>${role.toUpperCase()}</code></p>
            </div>

            <p><strong>Security Notice:</strong> Please log in and change your password immediately from your account settings.</p>
            
            <a href="${loginUrl}" class="btn" target="_blank">Log In to Portal</a>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `eCTD Admin <${fromEmail}>`,
      to: [to],
      subject: "Your New Account Credentials — eCTD Portal",
      html: htmlContent,
      headers: {
        "X-Entity-Ref-ID": `user-welcome-${email}-${Date.now()}`,
      },
    });

    if (error) {
      console.error(`[EMAIL] ❌ Resend error when sending to ${email}:`, error.message);

      // Sandbox testing fallback: Resend restricts test domain (onboarding@resend.dev) to registered account owner email
      if (
        fromEmail.includes("resend.dev") &&
        error.message?.includes("only send testing emails")
      ) {
        const testRecipient = process.env.RESEND_TEST_RECIPIENT || "jeevanvishnu18@gmail.com";
        console.warn(
          `[EMAIL] ⚠️ Resend sandbox restriction active. Delivering welcome credentials for ${email} to test owner address (${testRecipient}).`
        );

        const testNoticeHtml = `
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 12px; margin-bottom: 20px; border-radius: 6px; font-size: 13px;">
            <strong>⚠️ Resend Sandbox Mode Notice:</strong><br/>
            This email was generated for user <code>${email}</code>. Because <code>onboarding@resend.dev</code> is in test mode, credentials were sent to test address <code>${testRecipient}</code>.
          </div>
          ${htmlContent}
        `;

        const fallback = await resend.emails.send({
          from: `eCTD Admin <${fromEmail}>`,
          to: [testRecipient],
          subject: `[TEST CREDENTIALS for ${email}] Your New Account Credentials — eCTD Portal`,
          html: testNoticeHtml,
        });

        if (!fallback.error && fallback.data) {
          console.log(`[EMAIL] ✅ Welcome email delivered to test address (${testRecipient}) for user ${email} (ID: ${fallback.data.id})`);
          return { success: true, id: fallback.data.id };
        }
      }

      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] ✅ Welcome email sent successfully to ${email} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error(`[EMAIL] 💥 Exception throwing email to ${email}:`, err);
    return { success: false, error: err.message || "Email send exception" };
  }
}
