const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(to, subject, html) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️ SMTP credentials not set. Skipping email send.');
            console.log(`📧 To: ${to}`);
            console.log(`SUBJECT: ${subject}`);
            return;
        }

        const info = await this.transporter.sendMail({
            from: `"Smart Restaurant" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
    }

    async sendVerificationEmail(to, token) {
        const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const html = `
            <h1>Verify your email</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${url}">${url}</a>
        `;
        await this.sendEmail(to, 'Verify Email - Smart Restaurant', html);
    }

    async sendPasswordResetEmail(to, token) {
        const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const html = `
            <h1>Reset Password</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${url}">${url}</a>
            <p>If you didn't request this, please ignore this email.</p>
        `;
        await this.sendEmail(to, 'Reset Password - Smart Restaurant', html);
    }
}

module.exports = new EmailService();
