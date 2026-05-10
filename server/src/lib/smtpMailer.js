const net = require('net');
const tls = require('tls');
const os = require('os');

function trimHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function formatHeaderList(values) {
  return values.map((value) => trimHeader(value)).filter(Boolean).join(', ');
}

function normalizeLineEndings(value) {
  return String(value ?? '').replace(/\r?\n/g, '\r\n');
}

function buildMessage({ from, to, subject, text, replyTo }) {
  const lines = [
    `From: ${trimHeader(from)}`,
    `To: ${formatHeaderList(Array.isArray(to) ? to : [to])}`,
    `Subject: ${trimHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
  ];

  if (replyTo) {
    lines.push(`Reply-To: ${trimHeader(replyTo)}`);
  }

  lines.push('', normalizeLineEndings(text).replace(/\n/g, '\r\n'));
  return lines.join('\r\n');
}

function createSession(socket) {
  let buffer = '';
  let pending = null;
  let currentLines = [];

  const settle = (err, response) => {
    if (!pending) return;
    const { resolve, reject } = pending;
    pending = null;
    currentLines = [];
    if (err) reject(err);
    else resolve(response);
  };

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      const rawLine = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      const line = rawLine.replace(/\r$/, '');

      if (!line) continue;
      currentLines.push(line);

      if (/^\d{3} /.test(line)) {
        const code = Number(line.slice(0, 3));
        settle(null, { code, lines: currentLines.slice() });
      }
    }
  });

  socket.on('error', (error) => {
    settle(error);
  });

  socket.on('close', () => {
    if (pending) {
      settle(new Error('SMTP connection closed unexpectedly.'));
    }
  });

  return {
    waitForResponse() {
      if (pending) {
        throw new Error('SMTP session already waiting for a response.');
      }

      return new Promise((resolve, reject) => {
        pending = { resolve, reject };
      });
    },
    send(command) {
      socket.write(`${command}\r\n`);
    },
    close() {
      socket.end();
    },
  };
}

function connectSocket({ host, port, secure }) {
  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host, port, servername: host, rejectUnauthorized: false })
      : net.createConnection({ host, port });

    const onError = (error) => reject(error);
    const onReady = () => {
      socket.off('error', onError);
      resolve(socket);
    };

    socket.once('error', onError);
    socket.once(secure ? 'secureConnect' : 'connect', onReady);
  });
}

async function expect(session, expectedCodes) {
  const response = await session.waitForResponse();
  const allowed = Array.isArray(expectedCodes) ? expectedCodes : [expectedCodes];

  if (!allowed.includes(response.code)) {
    throw new Error(`SMTP error ${response.code}: ${response.lines.join(' | ')}`);
  }

  return response;
}

function getMailConfig() {
  const host = process.env.DEAL_SUPPORT_SMTP_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.DEAL_SUPPORT_SMTP_PORT || process.env.SMTP_PORT || 465);
  const secureRaw = process.env.DEAL_SUPPORT_SMTP_SECURE ?? process.env.SMTP_SECURE;
  const secure = secureRaw == null ? true : String(secureRaw).toLowerCase() !== 'false';
  const user = process.env.DEAL_SUPPORT_SMTP_USER || process.env.SMTP_USER || '';
  const pass = process.env.DEAL_SUPPORT_SMTP_PASS || process.env.SMTP_PASS || '';
  const from = process.env.DEAL_SUPPORT_FROM_EMAIL || process.env.SMTP_FROM || user || 'no-reply@tradafy.eu';

  if (!host) {
    throw new Error('SMTP host is not configured. Set DEAL_SUPPORT_SMTP_HOST or SMTP_HOST.');
  }

  return { host, port, secure, user, pass, from };
}

function hasMailConfig() {
  try {
    getMailConfig();
    return true;
  } catch (error) {
    return false;
  }
}

async function sendMail({ to, subject, text, replyTo }) {
  const config = getMailConfig();
  const socket = await connectSocket(config);
  const session = createSession(socket);

  try {
    await expect(session, 220);
    session.send(`EHLO ${os.hostname()}`);
    await expect(session, 250);

    if (config.user && config.pass) {
      session.send('AUTH LOGIN');
      await expect(session, 334);
      session.send(Buffer.from(config.user, 'utf8').toString('base64'));
      await expect(session, 334);
      session.send(Buffer.from(config.pass, 'utf8').toString('base64'));
      await expect(session, 235);
    }

    session.send(`MAIL FROM:<${trimHeader(config.from)}>`);
    await expect(session, [250, 251]);

    session.send(`RCPT TO:<${trimHeader(to)}>`);
    await expect(session, [250, 251]);

    session.send('DATA');
    await expect(session, 354);

    const message = buildMessage({ from: config.from, to, subject, text, replyTo });
    socket.write(`${message}\r\n.\r\n`);
    await expect(session, [250, 251]);

    session.send('QUIT');
    await expect(session, 221);
  } finally {
    session.close();
  }
}

module.exports = { sendMail, hasMailConfig };
