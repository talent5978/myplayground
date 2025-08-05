# Vercel 部署指南

## 🚀 修复说明

已修复Vercel部署的404问题：

### ✅ 修复内容
1. **API格式转换**：将所有API文件从ES6模块转换为CommonJS格式
2. **package.json优化**：移除`"type": "module"`设置
3. **依赖调整**：将express移至devDependencies
4. **部署优化**：添加.vercelignore排除本地开发文件

## 📋 部署步骤

### 1. 推送代码
```bash
git push
```

### 2. Vercel重新部署
- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 找到您的项目
- 点击 "Redeploy" 重新部署

### 3. 配置环境变量（如需要）
在Vercel项目设置中添加：
- `DATABASE_URL` - Cloudflare D1数据库连接URL
- `SMTP_HOST` - 邮件服务器地址
- `SMTP_PORT` - 邮件服务器端口
- `SMTP_USER` - 邮件用户名
- `SMTP_PASS` - 邮件密码
- `ADMIN_EMAIL` - 管理员邮箱

### 4. 数据库初始化（如需要）
如果使用Cloudflare D1，在D1控制台执行：
```sql
-- 执行 db/schema.sql 中的建表语句
-- 可选：执行 db/seed.sql 中的示例数据
```

## 🔧 验证部署

部署完成后，访问您的Vercel域名：
- 首页应该正常显示
- API端点应该可以访问：
  - `/api/comment`
  - `/api/timecapsule` 
  - `/api/gpx`
  - `/api/cron_send`

## 🐛 如果仍然404

1. **检查构建日志**：在Vercel Dashboard查看构建错误
2. **检查函数日志**：查看serverless函数的运行日志
3. **验证路由**：确认vercel.json路由配置正确

## 📝 技术说明

### 本地开发 vs 生产环境
- **本地**：使用Express服务器 + 内存数据库
- **生产**：使用Vercel Serverless Functions + Cloudflare D1

### API兼容性
- 所有API文件现在使用CommonJS格式，完全兼容Vercel
- 保持了与本地开发环境的功能一致性

## 🆘 故障排除

如果遇到问题，请检查：
1. Vercel构建日志中的错误信息
2. API函数的运行时错误
3. 环境变量配置是否正确
4. 数据库连接是否正常