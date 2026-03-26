export function getMagicLinkEmailHtml(url: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sign in to ClassMate</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
 
  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
 
          <!-- Logo / Nav bar -->
          <tr>
            <td style="padding:0 0 28px 0;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:12px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;color:#ffffff;line-height:36px;">✦</span>
                  </td>
                  <td style="padding-left:10px;font-size:20px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;">
                    Class<span style="color:#60a5fa;">Mate</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
 
          <!-- Card -->
          <tr>
            <td style="background:#1e293b;border-radius:24px;border:1px solid #334155;overflow:hidden;">
 
              <!-- Top accent bar -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6);border-radius:24px 24px 0 0;display:block;"></td>
              </tr>
 
              <!-- Card body -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 40px 40px;">
 
                <!-- Icon circle -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4338ca);border-radius:20px;width:64px;height:64px;text-align:center;line-height:64px;">
                      <span style="font-size:28px;">✉</span>
                    </div>
                  </td>
                </tr>
 
                <!-- Headline -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.5px;line-height:1.2;">
                      Your magic link is ready
                    </h1>
                  </td>
                </tr>
 
                <!-- Sub-text -->
                <tr>
                  <td align="center" style="padding-bottom:36px;">
                    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.6;max-width:380px;">
                      Click the button below to sign in to your ClassMate account. This link expires in <strong style="color:#e2e8f0;">15 minutes</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
 
                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom:36px;">
                    <a href="${url}" target="_blank"
                      style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:50px;letter-spacing:0.1px;">
                      Sign in to ClassMate &rarr;
                    </a>
                  </td>
                </tr>
 
                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #334155;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
 
                <!-- SDG 4 badge row -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table cellpadding="0" cellspacing="0" style="background:#172554;border-radius:50px;padding:8px 18px;border:1px solid #1e3a8a;">
                      <tr>
                        <td style="font-size:11px;font-weight:600;color:#93c5fd;letter-spacing:1.5px;text-transform:uppercase;">
                          ✦ &nbsp; United Nations · SDG 4 · Quality Education
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
 
                <!-- Copy URL fallback -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                      Button not working? Copy and paste this link into your browser:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:11px;color:#475569;word-break:break-all;background:#0f172a;border-radius:10px;padding:10px 14px;border:1px solid #1e293b;">
                      ${url}
                    </p>
                  </td>
                </tr>
 
              </table>
            </td>
          </tr>
 
          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0 0;" align="center">
              <p style="margin:0 0 8px;font-size:12px;color:#475569;">
                You received this email because <strong style="color:#64748b;">${email}</strong> was used to sign in.
              </p>
              <p style="margin:0;font-size:12px;color:#334155;">
                If you didn&apos;t request this, you can safely ignore it.
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#1e293b;">
                &copy; 2026 ClassMate &mdash; Advancing SDG 4 · Quality Education for All
              </p>
            </td>
          </tr>
 
        </table>
      </td>
    </tr>
  </table>
 
</body>
</html>
`;
}
