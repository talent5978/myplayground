import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES6 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置环境变量
process.env.DATABASE_URL = 'http://localhost:mock-db';

// 简单的内存数据库
const mockDb = {
    comments: [],
    timecapsules: [],
    nextId: 1
};

// 模拟 fetch 函数
global.fetch = async (url, options) => {
    if (url.includes('/query')) {
        const body = JSON.parse(options.body);
        const sql = body.sql.toLowerCase();
        
        if (sql.includes('select') && sql.includes('comments')) {
            return {
                ok: true,
                json: async () => ({ results: mockDb.comments })
            };
        }
        
        if (sql.includes('insert') && sql.includes('comments')) {
            const comment = {
                id: mockDb.nextId++,
                name: body.params[0] || 'Anonymous',
                content: body.params[1] || '',
                ts: new Date().toISOString()
            };
            mockDb.comments.push(comment);
            return {
                ok: true,
                json: async () => ({ success: true, meta: { last_row_id: comment.id } })
            };
        }
        
        if (sql.includes('delete') && sql.includes('comments')) {
            const id = parseInt(body.params[0]);
            const index = mockDb.comments.findIndex(c => c.id === id);
            if (index !== -1) {
                mockDb.comments.splice(index, 1);
            }
            return {
                ok: true,
                json: async () => ({ success: true })
            };
        }
        
        if (sql.includes('select') && sql.includes('timecapsule')) {
            return {
                ok: true,
                json: async () => ({ results: mockDb.timecapsules })
            };
        }
        
        if (sql.includes('insert') && sql.includes('timecapsule')) {
            const capsule = {
                id: mockDb.nextId++,
                to_email: body.params[0] || '',
                content: body.params[1] || '',
                send_at: body.params[2] || new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            mockDb.timecapsules.push(capsule);
            return {
                ok: true,
                json: async () => ({ success: true, meta: { last_row_id: capsule.id } })
            };
        }
    }
    
    return {
        ok: false,
        json: async () => ({ error: 'Not found' })
    };
};

const app = express();
const PORT = 3000;

// 中间件
app.use(express.json());
app.use(express.static('.'));

// API 路由处理
app.all('/api/:route', async (req, res) => {
    const route = req.params.route;
    const apiPath = path.join(__dirname, 'api', `${route}.js`);
    
    try {
        // 检查API文件是否存在
        if (!fs.existsSync(apiPath)) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        
        // 动态导入API模块 (ES6 modules)
        const apiModule = await import(`file://${apiPath}`);
        
        // 创建模拟的Vercel请求和响应对象
        const mockReq = {
            method: req.method,
            body: req.body,
            query: req.query,
            headers: req.headers
        };
        
        const mockRes = {
            status: (code) => {
                res.status(code);
                return mockRes;
            },
            json: (data) => {
                res.json(data);
                return mockRes;
            },
            send: (data) => {
                res.send(data);
                return mockRes;
            },
            end: () => {
                res.end();
                return mockRes;
            },
            setHeader: (name, value) => {
                res.setHeader(name, value);
                return mockRes;
            }
        };
        
        // 执行API函数
        if (typeof apiModule.default === 'function') {
            await apiModule.default(mockReq, mockRes);
        } else {
            res.status(500).json({ error: 'Invalid API module - no default export' });
        }
        
    } catch (error) {
        console.error(`API Error for ${route}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Static files served from current directory');
    console.log('API endpoints available at /api/*');
});