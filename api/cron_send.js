//
// api/cron_send.js
// 用途：定时邮件钩子，每日由GitHub Action触发，发送到期的时光邮局信件
//
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // 使用标准 fetch 方式连接 D1
    const d1Url = process.env.DATABASE_URL;
    if (!d1Url) return res.status(500).json({ error: 'DATABASE_URL not configured' });

    try {
        // 查询到期的信件
        const now = new Date().toISOString();
        const response = await fetch(`${d1Url}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sql: 'SELECT * FROM timecapsule WHERE send_at <= ? AND sent IS NULL',
                params: [now]
            })
        });
        const data = await response.json();
        const rows = data.results || [];

        if (rows.length === 0) {
            return res.status(200).json({ sent: 0 });
        }

        // 配置邮件发送
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        // 发送邮件
        for (const row of rows) {
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.ADMIN_EMAIL,
                subject: '你的时光邮局来信',
                text: row.content
            });

            // 标记为已发送
            await fetch(`${d1Url}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: 'UPDATE timecapsule SET sent = 1 WHERE id = ?',
                    params: [row.id]
                })
            });
        }

        res.status(200).json({ sent: rows.length });
    } catch (error) {
        console.error('Cron send error:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
} 