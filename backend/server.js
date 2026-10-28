const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, '..', 'frontend');
const messagesPath = path.join(__dirname, 'data', 'messages.json');

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.static(frontendPath));

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function requireAdmin(req, res, next) {
  const [scheme, encoded] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.set('WWW-Authenticate', 'Basic realm="Valentino Business Technology Admin", charset="UTF-8"');
    return res.status(401).send('Admin login required.');
  }

  const credentials = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = credentials.indexOf(':');
  const username = separator < 0 ? '' : credentials.slice(0, separator);
  const password = separator < 0 ? '' : credentials.slice(separator + 1);
  const expectedUsername = process.env.ADMIN_USER || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  if (!expectedUsername || !expectedPassword) {
    return res.status(503).send('Admin login is not configured. Set ADMIN_USER and ADMIN_PASSWORD in backend/.env.');
  }
  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    res.set('WWW-Authenticate', 'Basic realm="Valentino Business Technology Admin", charset="UTF-8"');
    return res.status(401).send('Incorrect username or password.');
  }
  next();
}

async function readMessages() {
  try {
    return JSON.parse(await fs.readFile(messagesPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

app.post('/api/messages', async (req, res, next) => {
  try {
    const { name, email, phone = '', subject = '', message, website = '' } = req.body || {};
    if (website) return res.status(200).json({ success: true });
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
      return res.status(400).json({ error: 'Your message must be between 10 and 5,000 characters.' });
    }

    const messages = await readMessages();
    const entry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === 'string' ? phone.trim().slice(0, 40) : '',
      subject: typeof subject === 'string' ? subject.trim().slice(0, 120) : '',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };
    await fs.mkdir(path.dirname(messagesPath), { recursive: true });
    await fs.writeFile(messagesPath, JSON.stringify([entry, ...messages], null, 2));
    res.status(201).json({ success: true, message: 'Your message has been received.' });
  } catch (error) {
    next(error);
  }
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/api/messages', requireAdmin, async (req, res, next) => {
  try {
    res.json(await readMessages());
  } catch (error) {
    next(error);
  }
});

app.delete('/api/messages/:id', requireAdmin, async (req, res, next) => {
  try {
    const messages = await readMessages();
    const remaining = messages.filter((message) => message.id !== req.params.id);
    if (remaining.length === messages.length) return res.status(404).json({ error: 'Message not found.' });
    await fs.writeFile(messagesPath, JSON.stringify(remaining, null, 2));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(port, () => {
  console.log(`Valentino Business Technology is running at http://localhost:${port}`);
});