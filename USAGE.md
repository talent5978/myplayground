# MyPlayGround 使用说明

## 🚀 快速开始

### 启动服务器
```bash
# 方法1：使用启动脚本（推荐）
./start.sh

# 方法2：手动启动
npm install
node server.js
```

服务器启动后，访问 http://localhost:3000

### 测试API功能
```bash
# 运行API测试脚本
./test-api.sh
```

## 🎮 功能介绍

### 1. 跑酷小游戏
- 点击"跑酷小游戏"按钮打开游戏窗口
- 使用空格键或点击跳跃
- 避开障碍物，分数越高速度越快
- 游戏结束后可以重新开始

### 2. 电子足迹地图
- 点击"电子足迹地图"按钮打开地图窗口
- 支持上传GPX和GeoJSON文件
- 自动解析轨迹并在地图上显示
- 基于Leaflet地图库

### 3. 音乐播放器
- 点击"音乐播放器"按钮打开播放器窗口
- 支持上传MP3文件播放
- 实时显示音频频谱
- 基于Web Audio API

### 4. 实时评论区
- 点击"实时评论区"按钮打开评论窗口
- 输入昵称和内容发表评论
- 支持删除评论功能
- 数据实时同步

### 5. 时光邮局
- 点击"时光邮局"按钮打开邮局窗口
- 输入收信邮箱、发送时间和内容
- 创建未来邮件（本地版本仅存储，不实际发送）
- 查看所有已创建的时光邮件

## 🛠️ 技术架构

### 前端
- **HTML5 + CSS3**：基础页面结构和样式
- **Tailwind CSS**：现代化CSS框架
- **Vanilla JavaScript**：纯原生JS，无框架依赖
- **Canvas API**：游戏渲染和音频可视化
- **Leaflet**：地图功能
- **Web Audio API**：音频处理

### 后端（本地开发）
- **Node.js + Express**：HTTP服务器
- **ES6 Modules**：现代JavaScript模块系统
- **内存数据库**：模拟Cloudflare D1数据库
- **动态API加载**：支持热重载API模块

### 生产环境
- **Vercel**：Serverless部署平台
- **Cloudflare D1**：SQLite数据库
- **Nodemailer**：邮件发送服务

## 📁 项目结构

```
MyPlayGround/
├── index.html          # 主页面（包含所有功能）
├── server.js           # 本地开发服务器
├── start.sh            # 启动脚本
├── test-api.sh         # API测试脚本
├── package.json        # 项目依赖
├── vercel.json         # Vercel部署配置
├── api/                # API接口目录
│   ├── comment.js      # 评论API
│   ├── timecapsule.js  # 时光邮局API
│   ├── gpx.js          # GPX上传API
│   └── cron_send.js    # 定时邮件API
├── db/                 # 数据库相关
│   ├── schema.sql      # 数据库结构
│   └── seed.sql        # 示例数据
└── README.md           # 项目说明
```

## 🔧 API 接口

### 评论API (`/api/comment`)
- `GET`：获取所有评论
- `POST`：添加新评论
  ```json
  {
    "name": "用户名",
    "content": "评论内容"
  }
  ```
- `DELETE`：删除评论
  ```json
  {
    "id": 评论ID
  }
  ```

### 时光邮局API (`/api/timecapsule`)
- `GET`：获取所有时光邮件
- `POST`：创建新的时光邮件
  ```json
  {
    "to_email": "收信邮箱",
    "send_at": "2025-12-31T00:00:00",
    "content": "邮件内容"
  }
  ```

### GPX上传API (`/api/gpx`)
- `POST`：上传GPX或GeoJSON文件
  ```json
  {
    "name": "文件名",
    "file": "文件内容",
    "type": "gpx|geojson"
  }
  ```

## 🌐 部署到生产环境

1. **推送代码到GitHub**
2. **在Vercel中导入项目**
3. **配置环境变量**：
   - `DATABASE_URL`：Cloudflare D1数据库URL
   - `SMTP_HOST/PORT/USER/PASS`：邮件服务器配置
   - `ADMIN_EMAIL`：管理员邮箱
4. **在Cloudflare D1中执行数据库初始化脚本**
5. **访问部署后的URL**

## 🐛 故障排除

### 服务器无法启动
- 检查Node.js是否已安装：`node --version`
- 检查端口3000是否被占用：`lsof -i :3000`
- 查看错误日志

### API请求失败
- 确认服务器正在运行
- 检查请求URL和参数格式
- 查看浏览器开发者工具的网络面板

### 前端功能异常
- 检查浏览器控制台错误信息
- 确认所有CDN资源加载正常
- 验证API响应数据格式

## 📝 开发注意事项

- 本地开发使用内存数据库，服务器重启后数据会丢失
- 生产环境使用持久化数据库
- API接口完全兼容Vercel Serverless Functions
- 支持热重载，修改API文件后自动生效