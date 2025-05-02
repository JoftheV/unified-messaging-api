
# Unified Messaging API

A full-featured messaging gateway that routes messages intelligently across SMS, WhatsApp, Telegram, Facebook Messenger, and RCS using a single REST API endpoint.

---

## Features

- Unified `/send-message` endpoint
- Platform auto-detection using metadata
- Real integrations:
  - Twilio (SMS + WhatsApp)
  - Telegram Bot API
  - Facebook Messenger API
- Docker-ready, CI/CD-friendly
- Secure token-based authentication (optional)
- Webhook listener for replies (optional)
- Logging and delivery history using Firebase or MongoDB (optional)

---

## Environment Variables

Copy `.env.example` and update with your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Sender number for SMS |
| `TWILIO_WHATSAPP_NUMBER` | Sender number for WhatsApp |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token |
| `MESSENGER_PAGE_ACCESS_TOKEN` | Facebook Page Token |
| `AUTH_TOKEN` | Optional bearer token to secure the API |

---

## API Usage

**POST** `/send-message`

```json
{
  "to": "+1234567890",
  "platform": "auto",
  "message": "Hello world!",
  "metadata": {
    "whatsapp_user": true
  }
}
```

**Response:**
```json
{
  "status": "sent",
  "platform_used": "whatsapp",
  "timestamp": "2025-05-01T00:00:00Z"
}
```

---

## Webhook Endpoint (Optional)

To handle incoming messages, add this route:

```js
app.post('/webhook', (req, res) => {
  console.log('Received inbound message:', req.body);
  res.sendStatus(200);
});
```

---

## Securing with Bearer Token

To require an auth token:

1. Add to `.env`:
   ```
   AUTH_TOKEN=your_secure_key
   ```

2. Add middleware to `index.js`:
```js
app.use((req, res, next) => {
  if (process.env.AUTH_TOKEN && req.headers.authorization !== `Bearer ${process.env.AUTH_TOKEN}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
});
```

---

## Logging with Firebase or MongoDB

You can extend the API to log all messages:

### MongoDB Example:

```js
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("unified_api");
await db.collection("logs").insertOne({ to, platform, message, timestamp: new Date() });
```

---

## Deploying

### Option A: **Google Cloud Run**

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/unified-api
gcloud run deploy unified-api --image gcr.io/YOUR_PROJECT_ID/unified-api --platform managed --allow-unauthenticated
```

### Option B: **Render**

- Connect GitHub repo
- Use Docker
- Add environment variables
- Deploy

### Option C: **Vercel**

- Import GitHub repo
- Add env vars in dashboard
- Set entry point and output directory

---

## License

MIT


### Encryption
Uses AES-256-CBC to encrypt messages before logging/transmission.

Set `ENCRYPTION_SECRET` in `.env`.
