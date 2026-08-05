function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout({ title, preheader, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e 0%,#0c1929 100%);padding:28px 32px;">
              <div style="width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,0.18);color:#fff;font-weight:700;font-size:20px;line-height:42px;text-align:center;">F</div>
              <h1 style="margin:14px 0 0;color:#ffffff;font-size:22px;letter-spacing:-0.02em;">FinStock</h1>
              <p style="margin:6px 0 0;color:rgba(204,251,241,0.9);font-size:13px;">Restaurant finance, organised</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.5;">
                If you didn’t expect this email, contact your FinStock administrator.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">© ${new Date().getFullYear()} FinStock</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function credentialsBlock({ email, password, role }) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#64748b;width:120px;">Email</td>
              <td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;">Password</td>
              <td style="padding:6px 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;color:#0f766e;letter-spacing:0.02em;">${escapeHtml(password)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;">Role</td>
              <td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(role)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function ctaButton(href, label) {
  return `
    <p style="margin:24px 0 8px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;background:#0f766e;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        ${escapeHtml(label)}
      </a>
    </p>`;
}

function welcomeCredentialsTemplate({ name, email, password, role, loginUrl }) {
  const subject = 'Your FinStock account is ready';
  const text = [
    `Hi ${name},`,
    '',
    'Your FinStock account has been created.',
    '',
    `Email: ${email}`,
    `Temporary password: ${password}`,
    `Role: ${role}`,
    '',
    `Sign in at: ${loginUrl}/login`,
    '',
    'Please change your password after your first login.',
    '',
    '— FinStock',
  ].join('\n');

  const html = layout({
    title: subject,
    preheader: 'Your FinStock login credentials are inside.',
    bodyHtml: `
      <h2 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Welcome, ${escapeHtml(name)}</h2>
      <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.55;">
        Your FinStock account has been set up. Use the temporary credentials below to sign in.
      </p>
      ${credentialsBlock({ email, password, role })}
      ${ctaButton(`${loginUrl}/login`, 'Sign in to FinStock')}
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
        For security, please change your password from <strong>Settings → My Profile</strong> after your first login.
      </p>
    `,
  });

  return { subject, text, html };
}

function passwordResetTemplate({ name, email, password, role, loginUrl }) {
  const subject = 'Your FinStock password has been reset';
  const text = [
    `Hi ${name},`,
    '',
    'Your FinStock password has been reset by an administrator.',
    '',
    `Email: ${email}`,
    `Temporary password: ${password}`,
    `Role: ${role}`,
    '',
    `Sign in at: ${loginUrl}/login`,
    '',
    'Please change your password after signing in.',
    '',
    '— FinStock',
  ].join('\n');

  const html = layout({
    title: subject,
    preheader: 'A temporary password has been issued for your FinStock account.',
    bodyHtml: `
      <h2 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Password reset</h2>
      <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.55;">
        Hi ${escapeHtml(name)}, an administrator reset your FinStock password. Use the temporary credentials below:
      </p>
      ${credentialsBlock({ email, password, role })}
      ${ctaButton(`${loginUrl}/login`, 'Sign in to FinStock')}
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
        Please change this temporary password after you sign in.
      </p>
    `,
  });

  return { subject, text, html };
}

function forgotPasswordLinkTemplate({ name, resetUrl }) {
  const subject = 'Reset your FinStock password';
  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset your FinStock password.',
    '',
    `Open this link to choose a new password (valid for 1 hour):`,
    resetUrl,
    '',
    'If you did not request this, you can ignore this email.',
    '',
    '— FinStock',
  ].join('\n');

  const html = layout({
    title: subject,
    preheader: 'Use this secure link to reset your FinStock password.',
    bodyHtml: `
      <h2 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Reset your password</h2>
      <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.55;">
        Hi ${escapeHtml(name)}, we received a request to reset your FinStock password. Click the button below to choose a new one.
      </p>
      ${ctaButton(resetUrl, 'Choose a new password')}
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
        This link expires in <strong>1 hour</strong>. If you didn’t request a reset, you can safely ignore this email.
      </p>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;word-break:break-all;">
        Or paste this URL into your browser:<br />${escapeHtml(resetUrl)}
      </p>
    `,
  });

  return { subject, text, html };
}

module.exports = {
  welcomeCredentialsTemplate,
  passwordResetTemplate,
  forgotPasswordLinkTemplate,
};
