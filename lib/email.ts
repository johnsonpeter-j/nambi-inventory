import nodemailer from "nodemailer";

// Email template
export const getRegistrationEmailTemplate = (
  registrationLink: string,
  inviterName: string = "Admin",
  companyName: string = "Inventory"
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Inventory</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a2332; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 50px 40px 30px;">
                            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <path d="M3 9h18"/>
                                    <path d="M9 21V9"/>
                                </svg>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">You're Invited!</h1>
                            <p style="margin: 12px 0 0; color: #94a3b8; font-size: 16px; line-height: 1.5;">Join our Inventory management system</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <div style="background-color: #0f172a; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
                                <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                    Hello,
                                </p>
                                <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                    <strong style="color: #ffffff;">${inviterName}</strong> has invited you to join <strong style="color: #ffffff;">${companyName}</strong>. You'll have access to manage and track inventory items, collaborate with your team, and streamline your workflow.
                                </p>
                                <p style="margin: 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                    Click the button below to complete your registration and create your account credentials.
                                </p>
                            </div>
                            
                            <!-- Registration Info Box -->
                            <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
                                <p style="margin: 0 0 12px; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Getting Started</p>
                                <p style="margin: 0 0 12px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                                    Your invitation is ready! You'll be able to:
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 14px; line-height: 1.8;">
                                    <li>Create your own password</li>
                                    <li>Set up your profile</li>
                                    <li>Access the dashboard immediately</li>
                                </ul>
                                <p style="margin: 16px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                                    <em>This registration link will expire in 7 days</em>
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <a href="${registrationLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                                            Complete Registration
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0; color: #64748b; font-size: 13px; text-align: center; line-height: 1.6;">
                                Or copy and paste this link into your browser:<br>
                                <a href="${registrationLink}" style="color: #3b82f6; text-decoration: none; word-break: break-all;">${registrationLink}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 32px 40px; border-top: 1px solid #1e293b;">
                            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-align: center;">
                                Need help? <a href="mailto:support@company.com" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 12px; text-align: center; line-height: 1.5;">
                                This invitation was sent by ${companyName}<br>
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// Email transporter configuration
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send registration email
export const sendRegistrationEmail = async (
  to: string,
  registrationLink: string,
  inviterName?: string,
  companyName?: string
) => {
  const transporter = createEmailTransporter();
  const html = getRegistrationEmailTemplate(
    registrationLink,
    inviterName,
    companyName
  );

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "You're Invited to Join Inventory",
    html,
  };

  return transporter.sendMail(mailOptions);
};

// Password reset email template
export const getPasswordResetEmailTemplate = (
  resetLink: string,
  companyName: string = "Inventory",
  expiresIn: string = "1 hour"
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a2332; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 50px 40px 30px;">
                            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Reset Your Password</h1>
                            <p style="margin: 12px 0 0; color: #94a3b8; font-size: 16px; line-height: 1.5;">Secure your ${companyName} account</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <div style="background-color: #0f172a; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
                                <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                    Hello,
                                </p>
                                <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                    We received a request to reset your password for your <strong style="color: #ffffff;">${companyName}</strong> account. If you didn't make this request, you can safely ignore this email.
                                </p>
                                <p style="margin: 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                    Click the button below to reset your password and create a new one.
                                </p>
                            </div>
                            
                            <!-- Security Info Box -->
                            <div style="background-color: #0f172a; border-radius: 8px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #ef4444;">
                                <p style="margin: 0 0 12px; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Security Notice</p>
                                <p style="margin: 0 0 12px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                                    For your security:
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 14px; line-height: 1.8;">
                                    <li>This link will expire in ${expiresIn}</li>
                                    <li>Only use this link if you requested a password reset</li>
                                    <li>Never share this link with anyone</li>
                                </ul>
                                <p style="margin: 16px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                                    <em>If you didn't request this, please ignore this email and your password will remain unchanged.</em>
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0; color: #64748b; font-size: 13px; text-align: center; line-height: 1.6;">
                                Or copy and paste this link into your browser:<br>
                                <a href="${resetLink}" style="color: #ef4444; text-decoration: none; word-break: break-all;">${resetLink}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 32px 40px; border-top: 1px solid #1e293b;">
                            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; text-align: center;">
                                Need help? <a href="mailto:support@company.com" style="color: #ef4444; text-decoration: none;">Contact Support</a>
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 12px; text-align: center; line-height: 1.5;">
                                This email was sent by ${companyName}<br>
                                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// Send password reset email
export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string,
  companyName?: string,
  expiresIn?: string
) => {
  const transporter = createEmailTransporter();
  const html = getPasswordResetEmailTemplate(
    resetLink,
    companyName,
    expiresIn
  );

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset Your Password - Inventory",
    html,
  };

  return transporter.sendMail(mailOptions);
};

