import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.gigachat.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'gigachat@gigachat.ru',
    pass: 'Dobrunia1',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const from = 'gigachat@gigachat.ru';

export async function emailVerification(to: string, activationLink: string) {
  const info = await transporter.sendMail({
    from,
    to, // list of receivers
    subject: 'Подтверждение почты. Email verification', // Subject line
    text: 'Для подтверждения почты нажмите на кнопку. Click the button to confirm your email.', // plain text body
    html: `<a href=${activationLink}>Click me</a>`, // html body
  });
  console.log('Message sent: %s', info.messageId);
}
