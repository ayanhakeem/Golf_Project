const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = `"Golf for Good" <${process.env.EMAIL_USER}>`;

// ─── Email Templates ──────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  max-width: 600px;
  margin: 0 auto;
`;
const headerStyle = `
  background: linear-gradient(135deg, #1B4332, #2d6a4f);
  padding: 32px 24px;
  text-align: center;
  border-radius: 12px 12px 0 0;
`;
const bodyStyle = `
  background: #ffffff;
  padding: 32px 24px;
`;
const footerStyle = `
  background: #f5f5f5;
  padding: 16px 24px;
  text-align: center;
  font-size: 12px;
  color: #666;
  border-radius: 0 0 12px 12px;
`;
const goldBadge = `
  display: inline-block;
  background: #D4AF37;
  color: #1B4332;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 18px;
  margin: 16px 0;
`;
const btnStyle = `
  display: inline-block;
  background: #1B4332;
  color: #ffffff;
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 20px;
`;

// ─── sendWinnerNotification ───────────────────────────────────────────────────

const sendWinnerNotification = async ({ to, name, matchType, prizeAmount, drawMonth, dashboardUrl }) => {
  const subject = `🏆 Congratulations ${name} — You Won the ${drawMonth} Draw!`;
  const html = `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="color:#D4AF37;margin:0;font-size:28px;">Golf for Good</h1>
      <p style="color:#a8d5b5;margin:8px 0 0;">Monthly Prize Draw</p>
    </div>
    <div style="${bodyStyle}">
      <h2 style="color:#1B4332;">You're a Winner! 🎉</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your scores matched <span style="${goldBadge}">${matchType}</span> in the <strong>${drawMonth}</strong> draw!</p>
      <p style="font-size:28px;font-weight:bold;color:#1B4332;">Prize: £${(prizeAmount / 100).toFixed(2)}</p>
      <p>To claim your prize, please log in to your dashboard and upload a screenshot of your golf score record as proof.</p>
      <a href="${dashboardUrl}/winner" style="${btnStyle}">Upload Proof Now →</a>
      <p style="margin-top:24px;color:#666;font-size:14px;">
        Once submitted, our team will review and approve your claim within 2 business days.
      </p>
    </div>
    <div style="${footerStyle}">
      <p>Golf for Good · Combining your love of golf with meaningful charity impact.</p>
    </div>
  </div>`;

  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ─── sendDrawResults ──────────────────────────────────────────────────────────

const sendDrawResults = async ({ to, name, drawMonth, drawNumbers, nextJackpot, dashboardUrl }) => {
  const subject = `📊 ${drawMonth} Draw Results — Golf for Good`;
  const html = `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="color:#D4AF37;margin:0;">Golf for Good</h1>
      <p style="color:#a8d5b5;margin:8px 0 0;">${drawMonth} Monthly Draw Results</p>
    </div>
    <div style="${bodyStyle}">
      <h2 style="color:#1B4332;">This Month's Draw Numbers</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <div style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap;">
        ${drawNumbers.map(n => `<span style="background:#1B4332;color:#D4AF37;border-radius:50%;width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;">${n}</span>`).join('')}
      </div>
      ${nextJackpot > 0 ? `<p>No exact 5-match this month — the jackpot rolls over to <strong>£${(nextJackpot / 100).toFixed(2)}</strong> next month!</p>` : ''}
      <a href="${dashboardUrl}" style="${btnStyle}">View Full Results →</a>
    </div>
    <div style="${footerStyle}">
      <p>Golf for Good · Making every swing count for charity.</p>
    </div>
  </div>`;

  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ─── sendPaymentConfirmation ──────────────────────────────────────────────────

const sendPaymentConfirmation = async ({ to, name, prizeAmount }) => {
  const subject = `💸 Prize Payment Confirmed — Golf for Good`;
  const html = `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="color:#D4AF37;margin:0;">Golf for Good</h1>
    </div>
    <div style="${bodyStyle}">
      <h2 style="color:#1B4332;">Payment Sent!</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your prize of <strong>£${(prizeAmount / 100).toFixed(2)}</strong> has been sent. 🎉</p>
      <p>Thank you for playing and supporting our partner charities.</p>
    </div>
    <div style="${footerStyle}">
      <p>Golf for Good</p>
    </div>
  </div>`;

  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ─── sendVerificationUpdate ───────────────────────────────────────────────────

const sendVerificationUpdate = async ({ to, name, status, reviewNote }) => {
  const approved = status === 'approved';
  const subject = approved
    ? `✅ Your Prize Claim Approved — Golf for Good`
    : `❌ Prize Claim Update — Golf for Good`;

  const html = `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="color:#D4AF37;margin:0;">Golf for Good</h1>
    </div>
    <div style="${bodyStyle}">
      <h2 style="color:#1B4332;">${approved ? 'Claim Approved!' : 'Claim Not Approved'}</h2>
      <p>Hi <strong>${name}</strong>,</p>
      ${approved
        ? '<p>Great news — your proof has been verified and your payment is being processed!</p>'
        : `<p>Unfortunately your claim could not be approved at this time.</p>${reviewNote ? `<p><strong>Reason:</strong> ${reviewNote}</p>` : ''}`
      }
    </div>
    <div style="${footerStyle}"><p>Golf for Good</p></div>
  </div>`;

  await transporter.sendMail({ from: FROM, to, subject, html });
};

module.exports = {
  sendWinnerNotification,
  sendDrawResults,
  sendPaymentConfirmation,
  sendVerificationUpdate,
};
