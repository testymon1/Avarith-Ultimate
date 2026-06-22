// src/utils/email.js
import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create transporter (simplified)
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@avarith.io',
      to,
      subject,
      text: text || subject,
      html: html || `<p>${text || subject}</p>`,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    // Don't throw, just log - email failure shouldn't break the app
    return null;
  }
};

// For waitlist confirmation
export const sendWaitlistConfirmation = async (email) => {
  const subject = 'Welcome to Avarith Waitlist! 🚀';
  const text = `
    Thank you for joining the Avarith waitlist!
    
    You'll be among the first to know when we launch.
    
    Stay tuned for updates!
    
    - The Avarith Team
  `;
  
  return sendEmail({ to: email, subject, text });
};