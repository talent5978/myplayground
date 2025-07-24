# MyPlayGround

> 你的全能小站，支持跑酷小游戏、电子足迹地图、音乐播放器、评论区、时光邮局。

## 快速部署

1. **推送代码到 GitHub 仓库**
2. **Vercel 导入 GitHub 仓库**
   - 配置环境变量：
     - `DATABASE_URL` 你的 Cloudflare D1 绑定
     - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` 发件邮箱
     - `ADMIN_EMAIL` 站长收信地址
3. **Cloudflare D1 控制台执行 /db/schema.sql 初始化表结构**
   - 可选：/db/seed.sql 导入示例数据
4. **访问 Vercel 部署地址，网站上线！**

## 目录结构

- `/index.html`         前端单页（所有功能小窗）
- `/api/*.js`           Vercel Serverless API（评论、时光邮局、GPX轨迹、定时邮件）
- `/db/schema.sql`      Cloudflare D1 初始化表
- `/db/seed.sql`        示例数据
- `/vercel.json`        路由与构建配置
- `/package.json`       依赖声明

## 主要功能

- 跑酷小游戏（Canvas，随分数加速）
- 电子足迹地图（Leaflet，支持GPX/GeoJSON上传）
- 音乐播放器（MP3上传/频谱）
- 实时评论区（D1持久化）
- 时光邮局（未来邮件，定时发送）

## API 说明

- `/api/comment` 评论区 CRUD
- `/api/timecapsule` 时光邮局（写信/查信）
- `/api/gpx` 上传轨迹（GPX/GeoJSON）
- `/api/cron_send` 定时邮件钩子（每日触发）

## 环境变量

- `DATABASE_URL`   Cloudflare D1 绑定
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` 邮箱配置
- `ADMIN_EMAIL`    站长收信地址

## 触发定时邮件

建议用 GitHub Actions 定时请求 `/api/cron_send`，如：

```yaml
# .github/workflows/cron-send.yml
name: Cron Send Timecapsule
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - name: Curl send
        run: |
          curl -X POST ${{ secrets.VERCEL_URL }}/api/cron_send
``` 