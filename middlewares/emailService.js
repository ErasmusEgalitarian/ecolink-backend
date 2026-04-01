const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendResetEmail = async (to, token) => {

    //gerar link de reset (ajuste a URL conforme necessário)
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Password Reset',
        html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link expires in 15 minutes.</p>
        `
    });
};

module.exports = {
    sendResetEmail
};