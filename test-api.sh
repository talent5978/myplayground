#!/bin/bash

BASE_URL="http://localhost:3000"
echo "🧪 测试 MyPlayGround API 功能..."

# 检查服务器是否运行
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ 服务器未运行，请先启动服务器：./start.sh"
    exit 1
fi

echo "✅ 服务器运行正常"
echo ""

# 测试评论API
echo "📝 测试评论API..."
echo "  - 获取评论列表："
curl -s "$BASE_URL/api/comment"

echo ""
echo "  - 添加评论："
curl -s -X POST "$BASE_URL/api/comment" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","content":"这是一条测试评论"}'

echo ""
echo "  - 验证评论已添加："
curl -s "$BASE_URL/api/comment"
echo ""

# 测试时光邮局API
echo "💌 测试时光邮局API..."
echo "  - 获取时光邮局列表："
curl -s "$BASE_URL/api/timecapsule"

echo ""
echo "  - 添加时光邮局条目："
curl -s -X POST "$BASE_URL/api/timecapsule" \
  -H "Content-Type: application/json" \
  -d '{"to_email":"future@example.com","content":"给未来的自己的信","send_at":"2025-12-31T00:00:00"}'

echo ""
echo "  - 验证时光邮局条目已添加："
curl -s "$BASE_URL/api/timecapsule"
echo ""

# 测试GPX上传API
echo "🗺️  测试GPX上传API..."
GPX_DATA='<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test">
  <trk>
    <name>测试轨迹</name>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074">
        <ele>50</ele>
      </trkpt>
      <trkpt lat="39.9043" lon="116.4075">
        <ele>51</ele>
      </trkpt>
      <trkpt lat="39.9044" lon="116.4076">
        <ele>52</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>'

echo "  - 上传GPX文件："
curl -s -X POST "$BASE_URL/api/gpx" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"test.gpx\",\"file\":\"$(echo "$GPX_DATA" | sed 's/"/\\"/g' | tr '\n' ' ')\",\"type\":\"gpx\"}"

echo ""
echo "🎉 所有API测试完成！"
echo "🌐 访问 $BASE_URL 来使用完整的Web界面"