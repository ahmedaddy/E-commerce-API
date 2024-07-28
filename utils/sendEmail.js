const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1- create transporter (service that will send email like: {"gmail", "outlook", "mailtrap", "mailgun", "sendgrid"...})
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false = 587 if true 465
    secure: true,
    service: "Gmail",
    auth: {
      user: process.env.APP_EMAIL_ADDRESS,
      pass: process.env.APP_EMAIL_PASS,
    },
  });
  // 2- defined email options (like from, to, subject ....)
  const mailOptions = {
    from: "E-Shop App <ahmedaddy013@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3- send email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
