//
// api/gpx.js
// 用途：上传GPX/GeoJSON，返回标准GeoJSON并持久化，Cloudflare D1（SQLite）
//
import { D1Client } from '@cloudflare/workers-api';

function parseGeoJSON(text) {
    try { return JSON.parse(text); } catch { return null; }
}

function parseGPX(gpxText) {
    // 简易GPX转GeoJSON，仅支持track
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxText, 'application/xml');
    const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
    const coords = trkpts.map(pt => [parseFloat(pt.getAttribute('lon')), parseFloat(pt.getAttribute('lat'))]);
    return {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {}
    };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const db = new D1Client(process.env.DATABASE_URL);
    if (req.method === 'POST') {
        const { name, file, type } = req.body;
        let geojson = null;
        if (type === 'geojson') geojson = parseGeoJSON(file);
        else if (type === 'gpx') geojson = parseGPX(file);
        if (!geojson) return res.status(400).json({ error: '文件解析失败' });
        await db.prepare('INSERT INTO tracks (name, geojson, uploaded) VALUES (?, ?, datetime("now"))').bind(name, JSON.stringify(geojson)).run();
        return res.status(200).json({ geojson });
    }
    res.status(405).json({ error: 'Method Not Allowed' });
} 