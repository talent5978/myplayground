#!/bin/bash

echo "🚀 启动 MyPlayGround 本地开发服务器..."

# 检查是否已有服务器在运行
if pgrep -f "node server.js" > /dev/null; then
    echo "⚠️  检测到已有服务器在运行，先停止它..."
    pkill -f "node server.js"
    sleep 2
fi

# 检查Node.js是否可用
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未找到，请先安装 Node.js"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务器
echo "🌟 启动服务器在端口 3000..."
node server.js &

# 等待服务器启动
sleep 3

# 测试服务器是否正常
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 服务器启动成功！"
    echo "🌐 访问地址: http://localhost:3000"
    echo "📝 API端点:"
    echo "   - 评论API: http://localhost:3000/api/comment"
    echo "   - 时光邮局: http://localhost:3000/api/timecapsule"
    echo "   - GPX上传: http://localhost:3000/api/gpx"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    
    # 保持脚本运行，等待用户中断
    wait
else
    echo "❌ 服务器启动失败，请检查错误信息"
    exit 1
fi