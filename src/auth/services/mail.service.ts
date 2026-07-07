import nodemailer from 'nodemailer';
import { logger } from '@/config';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
              }
            : undefined,
    secure: process.env.SMTP_PORT === '465',
});

/**
 * Send an email using SMTP or log to console in development if no SMTP host is configured.
 */
export async function sendMail(
    to: string,
    subject: string,
    html: string,
): Promise<void> {
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@money.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Money Manager';

    const mailOptions = {
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject,
        html,
    };

    try {
        if (!process.env.SMTP_HOST || process.env.NODE_ENV === 'test') {
            // Mock output in local or test environment if SMTP_HOST is not configured
            logger.info(
                { to, subject, html },
                '[MOCK EMAIL] SMTP_HOST is not configured or in test mode. Printing email content.',
            );
            return;
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.error({ error, mailOptions }, 'Failed to send email');
        throw new Error('Email delivery failed');
    }
}
