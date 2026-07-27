import nodemailer from "nodemailer";
import { env } from "./env.js";

export function isMailerConfigured(): boolean {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
  }
  return transporter;
}

const PLAN_NAMES: Record<string, string> = { starter: "Starter", growth: "Growth", pro: "Pro" };

// Sends the promo code that unlocks paid features. Called only after
// Stripe confirms payment (see routes/stripeWebhook.ts) — this is the only
// place in the app a promo code is ever generated or handed out.
export async function sendPromoCodeEmail(to: string, code: string, plan: string): Promise<void> {
  if (!isMailerConfigured()) {
    console.warn(`SMTP not configured — promo code for ${to} was generated but not emailed: ${code}`);
    return;
  }
  const planName = PLAN_NAMES[plan] ?? plan;
  await getTransporter().sendMail({
    from: env.smtpFrom,
    to,
    subject: `Your Shopyfy ${planName} activation code`,
    text: `Thanks for your purchase!\n\nYour Shopyfy ${planName} activation code:\n\n${code}\n\nEnter it at ${env.appUrl}/redeem to unlock your plan.`,
    html: `<p>Thanks for your purchase!</p><p>Your Shopyfy <strong>${planName}</strong> activation code:</p><p style="font-size:20px;font-family:monospace;letter-spacing:2px;">${code}</p><p>Enter it at <a href="${env.appUrl}/redeem">${env.appUrl}/redeem</a> to unlock your plan.</p>`,
  });
}
