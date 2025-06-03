const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendWelcomeEmail = async (to, username) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Bem-vindo ao Ecolink!',
    html: `<p>Olá, <strong>${username}</strong>!</p>
           <p>Obrigado por se registrar no Ecolink. Estamos felizes em tê-lo com a gente!</p>
           <p>**Ecolink** is an environmental awareness initiative focused on promoting proper waste separation and recycling, especially within the university environment. Through a mobile app and smart collection stations — called **Ecopoints** — the project aims to encourage students to properly clean and sort recyclable materials, primarily aluminum cans and PET bottles.</p>
           <p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato conosco.</p>
           <p>Atenciosamente,<br>Equipe Ecolink</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
