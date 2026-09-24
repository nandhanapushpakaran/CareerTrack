import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(
    to_email: str,
    reset_token: str,
    user_name: Optional[str] = None
) -> bool:
    """
    Sends a secure password reset email containing a time-limited token link.
    If SMTP_HOST is not configured, logs the reset URL to console/logs for local development.
    """
    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"
    display_name = user_name or "there"

    subject = f"[{settings.PROJECT_NAME}] Reset Your Password"

    # Plain text alternative
    text_content = f"""Hello {display_name},

We received a request to reset the password for your {settings.PROJECT_NAME} account ({to_email}).

To choose a new password, click the link below (or copy and paste it into your browser):
{reset_url}

This password reset link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The {settings.PROJECT_NAME} Team
"""

    # Modern responsive HTML email template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 32px; background-color: #4f46e5; text-align: left;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
          {settings.PROJECT_NAME}
        </h1>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 600;">
          Password Reset Request
        </h2>
        <p style="font-size: 14px; line-height: 22px; color: #334155; margin-bottom: 20px;">
          Hello <strong>{display_name}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 22px; color: #334155; margin-bottom: 24px;">
          We received a request to reset your password for your account (<strong>{to_email}</strong>). Click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; line-height: 20px; color: #64748b; margin-top: 24px;">
          This link will expire in <strong>30 minutes</strong>.
        </p>
        <p style="font-size: 13px; line-height: 20px; color: #64748b;">
          If you did not request this change, please ignore this email. Your password will not change until you access the link above and create a new one.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        <p style="font-size: 12px; line-height: 18px; color: #94a3b8; word-break: break-all;">
          Button not working? Copy and paste this URL into your browser:<br/>
          <a href="{reset_url}" style="color: #4f46e5;">{reset_url}</a>
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
        &copy; {settings.PROJECT_NAME}. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
"""

    # If no SMTP host is configured (local dev, test environments), log the link clearly
    if not settings.SMTP_HOST:
        print("\n" + "=" * 70)
        print(f"[DEV EMAIL] Password reset email requested for: {to_email}")
        print(f"[RESET URL] {reset_url}")
        print("=" * 70 + "\n")
        logger.info(f"[DEV EMAIL] Reset link for {to_email}: {reset_url}")
        return True

    # Send real email via SMTP
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        try:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            logger.info(f"Password reset email sent to {to_email}")
            return True
        finally:
            server.quit()
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
        return False
