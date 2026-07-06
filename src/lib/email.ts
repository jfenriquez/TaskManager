import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Preview available at: data:text/html,${encodeURIComponent(html)}`);
  }

  try {
    const info = await transporter.sendMail({
      from: `"TaskManager" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent successfully to ${to} | MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}:`, error);
    throw error;
  }
}
