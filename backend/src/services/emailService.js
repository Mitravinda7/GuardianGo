import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
});

export const sendEmergencyEmail = async (to, userName, location, message) => {
  try {
    const mapLink = `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`;
    await transporter.sendMail({
      from: `"GuardianGo Emergency" <${ENV.EMAIL_USER}>`,
      to,
      subject: `🚨 EMERGENCY ALERT - ${userName} needs help!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:2px solid #E74C3C;border-radius:8px;padding:24px;">
          <h1 style="color:#E74C3C;">🚨 Emergency Alert</h1>
          <p><strong>${userName}</strong> has triggered an SOS alert on GuardianGo.</p>
          <p><strong>Message:</strong> ${message || 'Emergency! I need help immediately.'}</p>
          <p><strong>Location:</strong> ${location.address || location.city || 'Unknown'}</p>
          <p><strong>Coordinates:</strong> ${location.coordinates.lat}, ${location.coordinates.lng}</p>
          <a href="${mapLink}" style="background:#E74C3C;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px;">
            📍 View on Map
          </a>
          <p style="margin-top:24px;color:#666;font-size:12px;">This is an automated alert from GuardianGo Safety Platform.</p>
        </div>
      `,
    });
    console.log(`✅ Emergency email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
  }
};