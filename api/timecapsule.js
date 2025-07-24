//
// api/timecapsule.js
// 用途：时光邮局接口，存储/查询信件，Cloudflare D1（SQLite）
//
import { D1Client } from '@cloudflare/workers-api';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const db = new D1Client(process.env.DATABASE_URL);
    if (req.method === 'GET') {
        const rows = await db.prepare('SELECT * FROM timecapsule ORDER BY send_at DESC LIMIT 100').all();
        return res.status(200).json(rows.results);
    }
    if (req.method === 'POST') {
        const { to_email, send_at, content } = req.body;
        if (!to_email || !send_at || !content) return res.status(400).json({ error: '缺少参数' });
        await db.prepare('INSERT INTO timecapsule (to_email, send_at, content, created) VALUES (?, ?, ?, datetime("now"))').bind(to_email, send_at, content).run();
        return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method Not Allowed' });
} 