import { ENV } from '../config/env.js';

export const sendEmergencySMS = async (to, userName, location, message) => {
  try {
    // Only use Twilio if real credentials are provided
    if (!ENV.TWILIO_ACCOUNT_SID || !ENV.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      console.log(`📱 SMS skipped (no Twilio credentials) - would send to ${to}`);
      return;
    }

    const twilio = await import('twilio');
    const client = twilio.default(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

    const mapLink = `https://maps.google.com/?q=${location.coordinates.lat},${location.coordinates.lng}`;
    await client.messages.create({
      body: `🚨 EMERGENCY from GuardianGo!\n${userName} needs help!\nMessage: ${message || 'Emergency!'}\nLocation: ${location.address || location.city || 'Unknown'}\nMap: ${mapLink}`,
      from: ENV.TWILIO_PHONE,
      to,
    });
    console.log(`✅ Emergency SMS sent to ${to}`);
  } catch (error) {
    console.error(`❌ SMS error: ${error.message}`);
  }
};