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
                from: 'Smart Restaurant <noreply@restaurant.thunguyen.io.vn>', 
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
        // Use first URL from FRONTEND_URL if multiple are configured
        const frontendUrl = process.env.FRONTEND_URL.split(',')[0].trim();
        const url = `${frontendUrl}/reset-password?token=${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                        <h1 style="color: #333; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 0 40px 20px 40px;">
                                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                            Hello,
                                        </p>
                                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                            We received a request to reset your password for your <strong>Smart Restaurant</strong> account. Click the button below to create a new password:
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Button -->
                                <tr>
                                    <td align="center" style="padding: 0 40px 30px 40px;">
                                        <a href="${url}" style="display: inline-block; background-color: #dc3545; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
                                    </td>
                                </tr>
                                
                                <!-- Security Info -->
                                <tr>
                                    <td style="padding: 0 40px 30px 40px;">
                                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                                            <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                                                <strong>⚠️ Security Notice:</strong><br>
                                                This link will expire in <strong>1 hour</strong>. If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Alternative Link -->
                                <tr>
                                    <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e0e0e0;">
                                        <p style="color: #888; font-size: 12px; margin: 20px 0 0 0; text-align: center; line-height: 1.6;">
                                            If the button doesn't work, copy and paste this link into your browser:
                                        </p>
                                        <p style="color: #007bff; font-size: 12px; margin: 10px 0 0 0; text-align: center; word-break: break-all;">
                                            <a href="${url}" style="color: #007bff;">${url}</a>
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                        <p style="color: #6c757d; font-size: 12px; margin: 0; line-height: 1.6;">
                                            © ${new Date().getFullYear()} Smart Restaurant. All rights reserved.<br>
                                            This is an automated message, please do not reply to this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        await this.sendEmail(to, '🔐 Reset Your Password - Smart Restaurant', html);
    }
}

module.exports = new EmailService();
