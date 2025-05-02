
require('dotenv').config();
const express = require('express');
const { encryptMessage, decryptMessage } = require('./crypto-utils');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function detectBestPlatform(to, metadata) {
  if (metadata?.whatsapp_user) return "whatsapp";
  if (metadata?.telegram_user) return "telegram";
  if (metadata?.rcs_enabled) return "rcs";
  if (metadata?.messenger_user) return "messenger";
  return "sms";
}

// Twilio SMS
async function sendSMS(to, message) {
  const encryptedBody = encryptMessage(message);
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
  return { status: "sent", platformUsed: "sms" };
}

// Twilio WhatsApp
async function sendWhatsApp(to, message) {
  const encryptedBody = encryptMessage(message);
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${to}`
  });
  return { status: "sent", platformUsed: "whatsapp" };
}

// Telegram API
async function sendTelegram(to, message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const encryptedBody = encryptMessage(message);
  await axios.post(url, { chat_id: to, text: message });
  return { status: "sent", platformUsed: "telegram" };
}

// Facebook Messenger API
async function sendMessenger(to, message) {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${token}`;
  const encryptedBody = encryptMessage(message);
  await axios.post(url, {
    recipient: { id: to },
    message: { text: message },
    messaging_type: "RESPONSE"
  });
  return { status: "sent", platformUsed: "messenger" };
}

// Placeholder for RCS
async function sendRCS(to, message) {
  const encryptedBody = encryptMessage(message);
  console.log(`RCS to ${to}: ${encryptedBody}`);
  return { status: "sent", platformUsed: "rcs" };
}

app.post('/send-message', async (req, res) => {
  const { to, platform = "auto", message, metadata = {} } = req.body;

  let selectedPlatform = platform.toLowerCase();
  if (selectedPlatform === 'auto') {
    selectedPlatform = detectBestPlatform(to, metadata);
  }

  try {
    let result;
    switch (selectedPlatform) {
      case 'sms': result = await sendSMS(to, message); break;
      case 'whatsapp': result = await sendWhatsApp(to, message); break;
      case 'telegram': result = await sendTelegram(to, message); break;
      case 'messenger': result = await sendMessenger(to, message); break;
      case 'rcs': result = await sendRCS(to, message); break;
      default: throw new Error("Unsupported platform");
    }

    res.json({
      status: result.status,
      platform_used: result.platformUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Unified Messaging API running on port ${PORT}`);
});
