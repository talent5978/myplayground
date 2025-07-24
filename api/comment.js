//
// api/comment.js
// 用途：评论区CRUD接口，操作Cloudflare D1（SQLite）
//
import { D1Client } from '@cloudflare/workers-api';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const db = new D1Client(process.env.DATABASE_URL);
    if (req.method === 'GET') {
        const rows = await db.prepare('SELECT * FROM comments ORDER BY ts DESC LIMIT 100').all();
        return res.status(200).json(rows.results);
    }
    if (req.method === 'POST') {
        const { name, content } = req.body;
        if (!name || !content) return res.status(400).json({ error: '缺少参数' });
        await db.prepare('INSERT INTO comments (name, content, ts) VALUES (?, ?, datetime("now"))').bind(name, content).run();
        return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: '缺少id' });
        await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
        return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method Not Allowed' });
} 