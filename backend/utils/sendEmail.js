const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  let transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"CheatSheet" <noreply@cheatsheet.app>',
    to,
    subject,
    html,
  });

  if (!process.env.SMTP_HOST) {
    console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

module.exports = sendEmail;