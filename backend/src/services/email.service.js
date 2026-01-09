const { Resend } = require('resend');

class EmailService {
    constructor() {
        // Initialize Resend with API key from environment variables
        // We use a dummy key 're_missing' if not set to prevent crash on startup, 
        // and check for valid key before sending.
        const apiKey = process.env.RESEND_API_KEY || 're_missing_key';
        this.resend = new Resend(apiKey);
    }

    async sendEmail(to, subject, html) {
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ RESEND_API_KEY not set. Skipping email send.');
            console.log(`📧 To: ${to}`);
            console.log(`SUBJECT: ${subject}`);
            return;
        }

        try {
            const data = await this.resend.emails.send({
                from: 'Smart Restaurant <onboarding@resend.dev>', // Default sender for testing
                to,
                subject,
                html,
            });

            if (data.error) {
                console.error('Error sending email:', data.error);
                throw new Error(data.error.message);
            }

            console.log('Message sent:', data.id);
            return data;
        } catch (error) {
            console.error('Email send failed:', error);
            // We might want to throw this depending on if we want the caller to know
            // but for now logging is sufficient as auth service handles the try-catch for registration
            throw error;
        }
    }

    async sendVerificationEmail(to, token) {
        // Construct the frontend URL for verification
        // NOTE: The backend routes expect /api/auth/verify-email/:token
        // But this email sends a link to the FRONTEND page, which then calls the backend.
        const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">Welcome to Smart Restaurant!</h2>
                <p style="color: #555; text-align: center;">Please verify your email address to activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                </div>
                <p style="color: #888; font-size: 12px; text-align: center;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${url}">${url}</a></p>
            </div>
        `;

        await this.sendEmail(to, 'Verify your Email - Smart Restaurant', html);
    }

    async sendPasswordResetEmail(to, token) {
        const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const html = `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">Reset Password Request</h2>
                <p style="color: #555; text-align: center;">You requested to reset your password. Click the button below to proceed.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #888; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
        `;

        await this.sendEmail(to, 'Reset Password - Smart Restaurant', html);
    }
}

module.exports = new EmailService();
