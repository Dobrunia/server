import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_AUTH_USER,
    pass: process.env.MAIL_AUTH_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const from = process.env.MAIL_AUTH_USER;

export async function emailVerification(to: string, activationLink: string) {
  console.log(transporter, from)
  const info = await transporter.sendMail({
    from,
    to, // list of receivers
    subject: 'Подтверждение почты. Email verification', // Subject line
    text: 'Для подтверждения почты нажмите на кнопку. Click the button to confirm your email.', // plain text body
    html: `<a href=${activationLink}>Click me</a>`, // html body
  });
  //console.log('Message sent: %s', info.messageId);
}
