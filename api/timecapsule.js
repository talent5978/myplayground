//
// api/timecapsule.js
// 用途：时光邮局接口，存储/查询信件，Cloudflare D1（SQLite）
//
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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
                    sql: 'SELECT * FROM timecapsule ORDER BY send_at DESC LIMIT 100'
                })
            });
            const data = await response.json();
            return res.status(200).json(data.results || []);
        } catch (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
    }

    if (req.method === 'POST') {
        const { to_email, send_at, content } = req.body;
        if (!to_email || !send_at || !content) return res.status(400).json({ error: '缺少参数' });
        try {
            await fetch(`${d1Url}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: 'INSERT INTO timecapsule (to_email, send_at, content, created) VALUES (?, ?, ?, datetime("now"))',
                    params: [to_email, send_at, content]
                })
            });
            return res.status(200).json({ ok: true });
        } catch (error) {
            return res.status(500).json({ error: 'Database insert failed' });
        }
    }

    res.status(405).json({ error: 'Method Not Allowed' });
} 