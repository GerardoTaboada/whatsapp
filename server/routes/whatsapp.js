const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

// Store WhatsApp clients by user ID
const whatsappClients = {};

// Initialize WhatsApp client for user
router.post('/init', async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if client already exists
    if (whatsappClients[userId]) {
      return res.status(400).json({ error: 'Client already initialized' });
    }

    // Create session directory if it doesn't exist
    const sessionDir = path.join(process.env.WHATSAPP_SESSION_DIR, userId.toString());
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Initialize WhatsApp client
    const client = new Client({
      sessionPath: path.join(sessionDir, 'session.json'),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // QR code generation
    client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      whatsappClients[userId].qr = qr;
    });

    // When client is ready
    client.on('ready', () => {
      console.log(`Client ${userId} is ready!`);
      whatsappClients[userId].ready = true;
    });

    // Store client
    whatsappClients[userId] = {
      client,
      qr: null,
      ready: false,
    };

    // Start client
    await client.initialize();

    res.json({ message: 'WhatsApp client initializing. QR code will be generated shortly.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initialize WhatsApp client' });
  }
});

// Get QR code
router.get('/qr/:userId', (req, res) => {
  const { userId } = req.params;
  const clientData = whatsappClients[userId];

  if (!clientData) {
    return res.status(404).json({ error: 'Client not found' });
  }

  if (!clientData.qr) {
    return res.status(404).json({ error: 'QR code not generated yet' });
  }

  res.json({ qr: clientData.qr });
});

// Schedule message
router.post('/schedule', async (req, res) => {
  const { userId, phoneNumber, message, scheduledTime } = req.body;

  try {
    // Validate client is ready
    const clientData = whatsappClients[userId];
    if (!clientData || !clientData.ready) {
      return res.status(400).json({ error: 'WhatsApp client not ready' });
    }

    // Save to database
    const scheduledMessage = await pool.query(
      'INSERT INTO scheduled_messages (user_id, phone_number, message, scheduled_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, phoneNumber, message, scheduledTime]
    );

    res.json(scheduledMessage.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule message' });
  }
});

// Get scheduled messages
router.get('/scheduled/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const scheduledMessages = await pool.query(
      'SELECT * FROM scheduled_messages WHERE user_id = $1 ORDER BY scheduled_time ASC',
      [userId]
    );

    res.json(scheduledMessages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get scheduled messages' });
  }
});

module.exports = router;
