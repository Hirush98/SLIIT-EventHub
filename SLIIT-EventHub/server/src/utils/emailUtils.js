const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'SLIIT EventHub <noreply@sliiteventhub.com>',
    to,
    subject,
    html
  });
};

// Password reset email template
const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1f2937; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">SLIIT EventHub</h1>
        <p style="color: #9ca3af; margin: 4px 0 0; font-size: 13px;">
          Event Management System
        </p>
      </div>
      <div style="padding: 32px 24px; background: #f9fafb;">
        <h2 style="color: #1f2937; font-size: 18px;">Reset Your Password</h2>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          You requested a password reset. Click the button below to
          set a new password. This link expires in 30 minutes.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background: #1f2937; color: white; padding: 12px 28px;
                    border-radius: 8px; text-decoration: none; font-size: 14px;
                    font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
      <div style="padding: 16px 24px; background: #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
          &copy; ${new Date().getFullYear()} SLIIT EventHub — IT3040 ITPM Group 279
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to:      email,
    subject: 'SLIIT EventHub — Password Reset',
    html
  });
};

module.exports = { sendEmail, sendPasswordResetEmail };
