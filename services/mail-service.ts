import nodemailer from 'nodemailer';
import {config} from '../config.js';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: 465,
  secure: true,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const from = config.mail.user;

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
