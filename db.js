import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dailyDir = path.join(__dirname, 'daily');

// 读取 daily 目录下所有 JSON 文件
const files = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));

// 按玩家名汇总数据
const playerMap = new Map();

files.forEach(file => {
  const filePath = path.join(dailyDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const date = file.replace('.json', '');

  if (data.players && Array.isArray(data.players)) {
    data.players.forEach(player => {
      const name = player.name;
      if (!name) return;

      const existing = playerMap.get(name);
      if (!existing) {
        playerMap.set(name, {
          playerName: name,
          totalTime: player.raw?.totalTime ?? 0,
          lastDate: date,
          lastTimestamp: data.timestamp,
          baseTime: player.raw?.baseTime ?? null,
          score: player.raw?.score ?? null,
          time: player.raw?.time ?? null
        });
      } else {
        // 累加总时间
        existing.totalTime += player.raw?.totalTime ?? 0;
        // 更新最后在线日期
        if (data.timestamp > existing.lastTimestamp) {
          existing.lastDate = date;
          existing.lastTimestamp = data.timestamp;
        }
      }
    });
  }
});

const db = {
  daily: Array.from(playerMap.values())
};

fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
