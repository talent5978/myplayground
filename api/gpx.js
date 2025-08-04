//
// api/gpx.js
// 用途：上传GPX/GeoJSON，返回标准GeoJSON并持久化，Cloudflare D1（SQLite）
//
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 使用标准 fetch 方式连接 D1
    const d1Url = process.env.DATABASE_URL;
    if (!d1Url) return res.status(500).json({ error: 'DATABASE_URL not configured' });

    function parseGeoJSON(text) {
        try { return JSON.parse(text); } catch { return null; }
    }

    function parseGPX(gpxText) {
        // 简易GPX转GeoJSON，使用正则表达式解析
        const trkptRegex = /<trkpt[^>]*lat="([^"]*)"[^>]*lon="([^"]*)"[^>]*>/g;
        const coords = [];
        let match;
        while ((match = trkptRegex.exec(gpxText)) !== null) {
            coords.push([parseFloat(match[2]), parseFloat(match[1])]);
        }
        return coords.length > 0 ? {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
            properties: {}
        } : null;
    }
    if (req.method === 'POST') {
        const { name, file, type } = req.body;
        let geojson = null;
        if (type === 'geojson') geojson = parseGeoJSON(file);
        else if (type === 'gpx') geojson = parseGPX(file);
        if (!geojson) return res.status(400).json({ error: '文件解析失败' });
        try {
            await fetch(`${d1Url}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sql: 'INSERT INTO tracks (name, geojson, uploaded) VALUES (?, ?, datetime("now"))',
                    params: [name, JSON.stringify(geojson)]
                })
            });
            return res.status(200).json({ geojson });
        } catch (error) {
            return res.status(500).json({ error: 'Database insert failed' });
        }
    }
    res.status(405).json({ error: 'Method Not Allowed' });
} 