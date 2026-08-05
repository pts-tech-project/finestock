const nodemailer = require('nodemailer');
const {
  welcomeCredentialsTemplate,
  passwordResetTemplate,
  forgotPasswordLinkTemplate,
} = require('./email.templates');

let transporterPromise = null;

function getProvider() {
  const forced = (process.env.EMAIL_PROVIDER || '').toLowerCase().trim();
  if (forced === 'smtp' || forced === 'resend' || forced === 'ethereal') {
    return forced;
  }
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  return 'ethereal';
}

async function createTransporter() {
  const provider = getProvider();

  if (provider === 'resend') {
    console.log('[email] Using Resend SMTP');
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  if (provider === 'smtp') {
    console.log(`[email] Using custom SMTP (${process.env.SMTP_HOST})`);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Free Ethereal test SMTP — no signup; opens a preview URL instead of a real inbox
  const testAccount = await nodemailer.createTestAccount();
  console.log('[email] Using free Ethereal Email (test inbox)');
  console.log(`[email] Ethereal user: ${testAccount.user}`);

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

function getFromAddress() {
  const provider = getProvider();
  if (provider === 'resend') {
    return process.env.SMTP_FROM || 'FinStock <onboarding@resend.dev>';
  }
  return process.env.SMTP_FROM || 'FinStock <noreply@finstock.local>';
}

async function sendMail({ to, subject, text, html }) {
  const transport = await getTransporter();
  const from = getFromAddress();
  const provider = getProvider();

  const info = await transport.sendMail({ from, to, subject, text, html });
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  if (previewUrl) {
    console.log('[email] Ethereal does NOT deliver to real inboxes.');
    console.log(`[email] Open this preview URL to view the message: ${previewUrl}`);
  } else {
    console.log(`[email] Sent via ${provider} → ${to} (${info.messageId})`);
  }

  return {
    queued: true,
    provider,
    messageId: info.messageId,
    previewUrl,
  };
}

async function sendWelcomeCredentials({ name, email, password, role }) {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const template = welcomeCredentialsTemplate({
    name,
    email,
    password,
    role,
    loginUrl,
  });
  return sendMail({ to: email, ...template });
}

async function sendPasswordResetCredentials({ name, email, password, role }) {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const template = passwordResetTemplate({
    name,
    email,
    password,
    role,
    loginUrl,
  });
  return sendMail({ to: email, ...template });
}

async function sendForgotPasswordLink({ name, email, resetUrl }) {
  const template = forgotPasswordLinkTemplate({ name, resetUrl });
  return sendMail({ to: email, ...template });
}

module.exports = {
  getProvider,
  sendMail,
  sendWelcomeCredentials,
  sendPasswordResetCredentials,
  sendForgotPasswordLink,
};
