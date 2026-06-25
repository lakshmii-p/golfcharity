const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"GolfCharity" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email error:', err);
  }
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to GolfCharity!',
    html: `<h2>Welcome, ${name}!</h2><p>Your account is active. Start entering scores and making an impact.</p>`,
  }),
  drawResult: (name, matched) => ({
    subject: 'Monthly Draw Results Are In!',
    html: `<h2>Hello ${name},</h2><p>This month's draw is complete. You matched <strong>${matched}</strong> numbers!</p>`,
  }),
  winner: (name, amount, tier) => ({
    subject: '🏆 You Won!',
    html: `<h2>Congratulations ${name}!</h2><p>You won <strong>₹${amount}</strong> in the ${tier} match! Please log in to upload your verification proof.</p>`,
  }),
  subscriptionRenewal: (name, date) => ({
    subject: 'Subscription Renewal Reminder',
    html: `<h2>Hi ${name},</h2><p>Your subscription renews on <strong>${date}</strong>.</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
