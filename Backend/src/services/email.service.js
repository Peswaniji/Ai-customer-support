import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export const sendWelcomeEmail = async (to, businessName) => {
  await transporter.sendMail({
    from: `"SupportAI" <${process.env.GOOGLE_USER}>`,
    to,
    subject: `Welcome to SupportAI — Let's set up ${businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px;">
        <h2 style="color: #1E40AF;">Welcome to SupportAI! 🚀</h2>
        <p>Hi <strong>${businessName}</strong>,</p>
        <p>Your account is live. Next steps:</p>
        <ol>
          <li>Add your first support agent</li>
          <li>Copy your widget embed code</li>
          <li>Paste it on your website</li>
        </ol>
        <a href="${process.env.CLIENT_URL}/admin/dashboard" 
           style="display:inline-block;background:#1E40AF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
};

export const sendInviteEmail = async (to, agentName, inviteToken) => {
  const link = `${process.env.CLIENT_URL}/auth/set-password?token=${inviteToken}`;
  await transporter.sendMail({
    from: `"SupportAI" <${process.env.GOOGLE_USER}>`,
    to,
    subject: `You've been invited to join SupportAI`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px;">
        <h2 style="color: #1E40AF;">You're invited! 🎉</h2>
        <p>Hi <strong>${agentName}</strong>,</p>
        <p>You've been added as a support agent on SupportAI.</p>
        <a href="${link}" 
           style="display:inline-block;background:#1E40AF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Activate Account
        </a>
        <p style="color:#888;font-size:12px;">This link expires in 48 hours.</p>
      </div>
    `,
  });
};

export const sendTicketAssignedEmail = async (agentEmail, agentName, ticketId, subject) => {
  const link = `${process.env.CLIENT_URL}/agent/tickets/${ticketId}`;
  await transporter.sendMail({
    from: `"SupportAI" <${process.env.GOOGLE_USER}>`,
    to: agentEmail,
    subject: `New ticket assigned: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px;">
        <p>Hi <strong>${agentName}</strong>,</p>
        <p>New ticket assigned: <strong>${subject}</strong></p>
        <a href="${link}"
           style="display:inline-block;background:#1E40AF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Ticket
        </a>
      </div>
    `,
  });
};