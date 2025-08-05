//
// api/comment.js
// 用途：评论区CRUD接口，操作Cloudflare D1（SQLite）
//
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 使用标准 fetch 方式连接 D1
    const d1Url = process.env.DATABASE_URL;
    if (!d1Url) return res.status(500).json({ error: 'DATABASE_URL not configured' });

    if (req.method === 'GET') {
        try {
            const response = await fetch(`${d1Url}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: 'SELECT * FROM comments ORDER BY ts DESC LIMIT 100'
                })
            });
            const data = await response.json();
            return res.status(200).json(data.results || []);
        } catch (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
    }

    if (req.method === 'POST') {
        const { name, content } = req.body;
        if (!name || !content) return res.status(400).json({ error: '缺少参数' });
        try {
            await fetch(`${d1Url}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: 'INSERT INTO comments (name, content, ts) VALUES (?, ?, datetime("now"))',
                    params: [name, content]
                })
            });
            return res.status(200).json({ ok: true });
        } catch (error) {
            return res.status(500).json({ error: 'Database insert failed' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: '缺少id' });
        try {
            await fetch(`${d1Url}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: 'DELETE FROM comments WHERE id = ?',
                    params: [id]
                })
            });
            return res.status(200).json({ ok: true });
        } catch (error) {
            return res.status(500).json({ error: 'Database delete failed' });
        }
    }

    res.status(405).json({ error: 'Method Not Allowed' });
} 