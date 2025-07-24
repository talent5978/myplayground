//
// api/cron_send.js
// 用途：定时邮件钩子，每日由GitHub Action触发，发送到期的时光邮局信件
//
import { D1Client } from '@cloudflare/workers-api';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const db = new D1Client(process.env.DATABASE_URL);
    const now = new Date().toISOString();
    const rows = await db.prepare('SELECT * FROM timecapsule WHERE send_at <= ? AND sent IS NULL').bind(now).all();
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    for (const row of rows.results) {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            subject: '你的时光邮局来信',
            text: row.content
        });
        await db.prepare('UPDATE timecapsule SET sent = 1 WHERE id = ?').bind(row.id).run();
    }
    res.status(200).json({ sent: rows.results.length });
} 