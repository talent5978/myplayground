// 简单的游戏逻辑测试
console.log('开始测试游戏逻辑...');

// 模拟游戏类
class TestGame {
    constructor() {
        this.width = 1200;
        this.height = 700;
        this.state = 'menu';
        this.currentLevel = null;
        this.player = null;
        this.enemies = [];
        this.wave = 0;
        this.waveTimer = 0;
    }
    
    startLevel(level) {
        console.log('开始关卡:', level.name);
        this.currentLevel = level;
        this.state = 'playing';
        this.gameTime = 0;
        this.kills = 0;
        this.wave = 0;
        this.waveTimer = 0;
        
        // 初始化玩家
        this.player = new TestPlayer(this.width / 2, this.height / 2);
        this.enemies = [];
        
        console.log('玩家创建在:', this.player.x, this.player.y);
        console.log('关卡生成率:', this.currentLevel.enemySpawnRate);
    }
    
    spawnEnemies(deltaTime) {
        const spawnRate = this.currentLevel.enemySpawnRate * (1 + this.wave * 0.1);
        const spawnChance = spawnRate * deltaTime;
        
        console.log('生成检查 - 生成率:', spawnRate, '机会:', spawnChance, 'deltaTime:', deltaTime);
        
        if (Math.random() < spawnChance) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const enemy = new TestEnemy(x, y, 'zombie');
            this.enemies.push(enemy);
            console.log('生成敌人:', enemy.type, '在', x, y, '总敌人数:', this.enemies.length);
        }
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // 更新波次
        this.waveTimer += deltaTime;
        if (this.waveTimer >= 30) {
            this.waveTimer = 0;
            this.wave++;
            console.log('新波次:', this.wave);
        }
        
        // 生成敌人
        this.spawnEnemies(deltaTime);
        
        // 更新敌人
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player);
        });
    }
}

class TestPlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = '#FFD700';
    }
}

class TestEnemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.health = 30;
        this.speed = 80;
    }
    
    update(deltaTime, player) {
        // 向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * deltaTime;
            this.y += (dy / dist) * this.speed * deltaTime;
        }
    }
}

// 测试
const game = new TestGame();
const testLevel = {
    name: '测试关卡',
    enemySpawnRate: 2,
    enemyHealthMultiplier: 1,
    duration: 300
};

game.startLevel(testLevel);

// 模拟游戏循环
let time = 0;
const deltaTime = 1/60; // 60 FPS

console.log('\n开始模拟游戏循环...');
for (let i = 0; i < 60; i++) { // 模拟1秒
    time += deltaTime;
    game.update(deltaTime);
    
    if (i % 10 === 0) {
        console.log(`时间: ${time.toFixed(2)}s, 敌人数: ${game.enemies.length}, 波次: ${game.wave}`);
    }
}

console.log('\n测试完成!');
console.log('最终敌人数:', game.enemies.length);
console.log('最终波次:', game.wave);