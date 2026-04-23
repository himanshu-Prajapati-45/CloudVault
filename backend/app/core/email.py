import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Send an HTML email via SMTP.
    Returns True on success, False on failure.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False


def send_password_reset_email(to_email: str, reset_url: str, full_name: str) -> bool:
    subject = "Reset your CloudVault password"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <style>
            body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
            .container {{ max-width: 480px; margin: 40px auto; background: #ffffff;
                        border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background: #111827; padding: 32px; text-align: center; }}
            .header h1 {{ color: #ffffff; font-size: 24px; margin: 0; letter-spacing: -0.5px; }}
            .header p {{ color: #9ca3af; font-size: 13px; margin: 8px 0 0; }}
            .body {{ padding: 32px; }}
            .body h2 {{ font-size: 18px; color: #111827; margin: 0 0 12px; }}
            .body p {{ color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }}
            .btn {{ display: inline-block; background: #111827; color: #ffffff !important;
                    padding: 14px 28px; border-radius: 8px; text-decoration: none;
                    font-size: 14px; font-weight: 600; }}
            .btn:hover {{ background: #374151; }}
            .footer {{ padding: 20px 32px; border-top: 1px solid #f3f4f6; }}
            .footer p {{ color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5; }}
            .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b;
                       padding: 12px 16px; border-radius: 4px; margin-top: 20px; }}
            .warning p {{ color: #92400e; font-size: 12px; margin: 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CloudVault</h1>
                <p>Secure File Storage</p>
            </div>
            <div class="body">
                <h2>Hi {full_name},</h2>
                <p>We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="btn">Reset Password</a>
                </p>
                <div class="warning">
                    <p><strong>Didn't request this?</strong> You can safely ignore this email. Someone may have entered your address by mistake.</p>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent by CloudVault. Please do not reply.<br />
                If you did not create a CloudVault account, this email can be safely ignored.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html_body)
