import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (to, businessName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "SupportAI <onboarding@resend.dev>",
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
        </div>
      `,
    });
    if (error) console.error("❌ Welcome email failed:", error);
    else console.log("✅ Welcome email sent:", data?.id);
  } catch (err) {
    console.error("❌ Welcome email error:", err.message);
  }
};

export const sendInviteEmail = async (to, agentName, inviteToken) => {
  const link = `${process.env.CLIENT_URL}/auth/set-password?token=${inviteToken}`;
  try {
    const { data, error } = await resend.emails.send({
      from: "SupportAI <onboarding@resend.dev>",
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
          <p style="color:#888;font-size:12px;">Or copy: ${link}</p>
        </div>
      `,
    });
    if (error) {
      console.error("❌ Invite email failed:", error);
      throw new Error(error.message);
    }
    console.log("✅ Invite email sent:", data?.id);
  } catch (err) {
    console.error("❌ Invite email error:", err.message);
    throw err;
  }
};

export const sendTicketAssignedEmail = async (agentEmail, agentName, ticketId, subject) => {
  const link = `${process.env.CLIENT_URL}/agent/tickets/${ticketId}`;
  try {
    await resend.emails.send({
      from: "SupportAI <onboarding@resend.dev>",
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
  } catch (err) {
    console.error("❌ Ticket email failed:", err.message);
  }
};