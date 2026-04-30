const VERIFY_EMAIL_TEMPLATE = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; line-height: 1.5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f7; width: 100%;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main card -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.05); border: 1px solid #e9e9ef;">
                    <tr>
                        <td style="padding: 40px 32px; text-align: center;">
                            <!-- Main heading -->
                            <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e1e2f;">
                                Touropia
                            </h1>

                            <!-- Subheading -->
                            <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 500; color: #4a4a5e;">
                                Verify your email address
                            </h2>

                            <!-- Greeting -->
                            <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 400; color: #2d2d3a;">
                                <strong style="font-weight: 600;">Hello {{username}}</strong>
                            </p>

                            <!-- Message -->
                            <p style="margin: 0 0 32px 0; font-size: 16px; color: #5b5b6b;">
                                Thanks for signing up! Please use the verification code below to complete your registration.
                            </p>

                            <!-- Verification code box -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
                                <tr>
                                    <td align="center" style="background-color: #f0f3ff; border-radius: 12px; padding: 24px 16px;">
                                        <span style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e; font-family: monospace;">{{verificationToken}}</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiry note (customise as needed) -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #8e8e9d;">
                                This code will expire in <strong style="color: #1e1e2f;">10 minutes</strong>. If you didn't request this, you can safely ignore this email.
                            </p>

                            <!-- Divider -->
                            <div style="height: 1px; background-color: #e9e9ef; margin: 24px 0;"></div>

                            <!-- Footer -->
                            <p style="margin: 0; font-size: 13px; color: #8e8e9d;">
                                &copy; 2025 Touropia. All rights reserved.<br>
                                <span style="display: inline-block; margin-top: 8px;">Adama,</span>
                            </p>
                        </td>
                    </tr>
                </table>
                <!-- Footnote -->
                <p style="margin: 24px 0 0 0; font-size: 12px; color: #a0a0b0;">
                    This is an automated message, please do not reply.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Touropia – Your Ethiopian Adventure Awaits</title>
  <style>
    /* Global styles for clients that support <style> */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body style="margin:0; padding:20px 0; background-color:#f8f9fa; font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.05);">
    <!-- Header with lime green gradient -->
    <div style="background:linear-gradient(135deg, #CCFF66 0%, #66CC00 100%); padding:40px 24px; text-align:center;">
      <h1 style="margin:0; font-size:32px; font-weight:800; color:#1F2A1F; letter-spacing:-0.5px;">Touropia</h1>
      <p style="margin:12px 0 0; font-size:18px; color:#1F2A1F; font-weight:500;">One platform, endless Ethiopian adventures</p>
    </div>

    <!-- Main content -->
    <div style="padding:40px 32px;">
      <div style="font-size:26px; font-weight:700; color:#1F2A1F; margin-bottom:16px;">
        Welcome, {{username}}! 👋
      </div>
      <div style="font-size:16px; line-height:1.6; color:#3A4A3A; margin-bottom:24px;">
        You’ve just unlocked the ultimate travel companion for Ethiopia. Whether you’re dreaming of exploring ancient rock churches, savoring authentic <em>injera</em>, or cruising through the highlands — Touropia brings everything you need into one place.
      </div>

      <!-- Feature highlights with icons (simplified text) -->
      <div style="background-color:#F4FFF0; border-radius:16px; padding:24px; margin:24px 0; border-left:4px solid #66CC00;">
        <p style="margin:0 0 12px; font-weight:700; color:#1F2A1F;">✨ What you can do in a few clicks:</p>
        <ul style="margin:0; padding-left:20px; color:#3A4A3A;">
        <li style="margin-bottom:8px;">🏞️ Book guided tours to historical and natural wonders</li>
          <li style="margin-bottom:8px;">🏨 Book hand-picked hotels and lodges</li>
          <li style="margin-bottom:8px;">🚗 Rent a car with local drivers or self-drive options</li>
          <li style="margin-bottom:8px;">🍽️ Reserve tables at top Ethiopian restaurants</li>
        </ul>
      </div>

      <!-- Call to action button (lime green) -->
      <div style="text-align:center;">
        <a href="http://localhost:3000/tours" style="display:inline-block; background-color:#66CC00; color:#1F2A1F !important; text-decoration:none; font-weight:700; padding:14px 36px; border-radius:50px; font-size:18px; margin:16px 0 8px; transition:0.2s;">Start Exploring →</a>
      </div>

      <!-- Additional motivational message -->
      <div style="margin:32px 0 0; text-align:center; font-size:14px; color:#6A7C6A; background:#F9FEF5; padding:20px; border-radius:16px;">
        <p style="margin:0;">“Ethiopia is a land of wonder — and we’re here to make your journey effortless.”</p>
        <p style="margin:10px 0 0; font-weight:600;">Need help? Our local experts are just a message away.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px 32px; background-color:#F0F7EA; font-size:14px; color:#5A6E5A;">
      <p style="margin:0 0 8px;">&copy; 2026 Touropia. All rights reserved.</p>
      <p style="margin:0;">
      <a href="http://localhost:3000/Unsubscribe" style="color:#66CC00; text-decoration:none;">Unsubscribe</a> |
      <a href="http://localhost:3000/privacy-policy" style="color:#66CC00; text-decoration:none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const RESET_PASSWORD_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Touropia Password</title>
  <style>
    /* Fallback styles for clients that support <style> */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body style="margin:0; padding:20px 0; background-color:#f8f9fa; font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.05);">
    <!-- Header with lime green gradient -->
    <div style="background:linear-gradient(135deg, #CCFF66 0%, #66CC00 100%); padding:40px 24px; text-align:center;">
      <h1 style="margin:0; font-size:32px; font-weight:800; color:#1F2A1F; letter-spacing:-0.5px;">Touropia</h1>
      <p style="margin:12px 0 0; font-size:18px; color:#1F2A1F; font-weight:500;">Reset your password</p>
    </div>

    <!-- Main content -->
    <div style="padding:40px 32px;">
      <div style="font-size:26px; font-weight:700; color:#1F2A1F; margin-bottom:16px;">
        Hello, {{username}}!
      </div>
      <div style="font-size:16px; line-height:1.6; color:#3A4A3A; margin-bottom:24px;">
        We received a request to reset the password for your Touropia account. If you made this request, click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.
      </div>

      <!-- Call to action button (lime green) -->
      <div style="text-align:center;">
        <a href="{{resetLink}}" style="display:inline-block; background-color:#66CC00; color:#1F2A1F !important; text-decoration:none; font-weight:700; padding:14px 36px; border-radius:50px; font-size:18px; margin:16px 0 8px; transition:0.2s;">Reset Password →</a>
      </div>

      <!-- Alternative instruction -->
      <div style="margin:24px 0 0; text-align:center; font-size:14px; color:#6A7C6A;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <a href="{{resetLink}}" style="color:#66CC00; text-decoration:none; word-break:break-all;">{{resetLink}}</a>
      </div>

      <!-- Security note -->
      <div style="margin:32px 0 0; background:#F9FEF5; padding:20px; border-radius:16px; text-align:center;">
        <p style="margin:0; font-size:14px; color:#5A6E5A;">
          🔒 If you didn't request this, please ignore this email. Your password won't change until you create a new one.
        </p>
        <p style="margin:12px 0 0; font-size:13px; color:#6A7C6A;">
          For security, never share this link with anyone.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px 32px; background-color:#F0F7EA; font-size:14px; color:#5A6E5A;">
      <p style="margin:0 0 8px;">&copy; 2026 Touropia. All rights reserved.</p>
      <p style="margin:0;">
        <a href="http://localhost:3000/Unsubscribe" style="color:#66CC00; text-decoration:none;">Unsubscribe</a> |
        <a href="http://localhost:3000/privacy-policy" style="color:#66CC00; text-decoration:none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const RESET_SUCCESSFUL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful – Touropia</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body style="margin:0; padding:20px 0; background-color:#f8f9fa; font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.05);">
    <!-- Header with lime green gradient -->
    <div style="background:linear-gradient(135deg, #CCFF66 0%, #66CC00 100%); padding:40px 24px; text-align:center;">
      <h1 style="margin:0; font-size:32px; font-weight:800; color:#1F2A1F; letter-spacing:-0.5px;">Touropia</h1>
      <p style="margin:12px 0 0; font-size:18px; color:#1F2A1F; font-weight:500;">Password successfully reset</p>
    </div>

    <!-- Main content -->
    <div style="padding:40px 32px;">
      <div style="font-size:26px; font-weight:700; color:#1F2A1F; margin-bottom:16px;">
        Hi {{username}},
      </div>
      <div style="font-size:16px; line-height:1.6; color:#3A4A3A; margin-bottom:24px;">
        Your Touropia password has been changed successfully. You can now log in with your new password.
      </div>

      <!-- Call to action button (lime green) -->
      <div style="text-align:center;">
        <a href="{{loginLink}}" style="display:inline-block; background-color:#66CC00; color:#1F2A1F !important; text-decoration:none; font-weight:700; padding:14px 36px; border-radius:50px; font-size:18px; margin:16px 0 8px;">Log In →</a>
      </div>

      <!-- Alternative link -->
      <div style="margin:24px 0 0; text-align:center; font-size:14px; color:#6A7C6A;">
        Or copy this link into your browser:<br>
        <a href="{{loginLink}}" style="color:#66CC00; text-decoration:none;">{{loginLink}}</a>
      </div>

      <!-- Security tip -->
      <div style="margin:32px 0 0; background:#F9FEF5; padding:20px; border-radius:16px; text-align:center;">
        <p style="margin:0; font-size:14px; color:#5A6E5A;">
          🔐 Didn’t make this change? <a href="http://localhost:3000/contact" style="color:#66CC00;">Contact our support team</a> immediately.
        </p>
        <p style="margin:12px 0 0; font-size:13px; color:#6A7C6A;">
          For your security, never share your password with anyone.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px 32px; background-color:#F0F7EA; font-size:14px; color:#5A6E5A;">
      <p style="margin:0 0 8px;">&copy; {{year}} Touropia. All rights reserved.</p>
      <p style="margin:0;">
        <a href="http://localhost:3000/Unsubscribe" style="color:#66CC00; text-decoration:none;">Unsubscribe</a> |
        <a href="http://localhost:3000/privacy-policy" style="color:#66CC00; text-decoration:none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  WELCOME_EMAIL_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  RESET_PASSWORD_TEMPLATE,
  RESET_SUCCESSFUL_TEMPLATE,
};
