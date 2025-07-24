--
-- db/seed.sql
-- 用途：Cloudflare D1 示例数据
--
INSERT INTO comments (name, content) VALUES ('Alice', 'Hello World!'), ('Bob', 'Nice site!');
INSERT INTO timecapsule (to_email, send_at, content) VALUES ('test@example.com', datetime('now', '+1 day'), '未来的你会更好！');
INSERT INTO tracks (name, geojson) VALUES ('示例轨迹', '{"type":"Feature","geometry":{"type":"LineString","coordinates":[[120,30],[121,31]]},"properties":{}}'); 