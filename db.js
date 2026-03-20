import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dailyDir = path.join(__dirname, 'daily');

// 读取 daily 目录下所有 JSON 文件
const files = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));

const db = {
  daily: []
};

files.forEach(file => {
  const filePath = path.join(dailyDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 从文件名提取日期 (如 2026-03-20.json -> 2026-03-20)
  const date = file.replace('.json', '');

  // 将每天的数据转换为一组记录
  if (data.players && Array.isArray(data.players)) {
    data.players.forEach(player => {
      db.daily.push({
        date,
        timestamp: data.timestamp,
        playerName: player.name,
        baseTime: player.raw?.baseTime ?? null,
        score: player.raw?.score ?? null,
        time: player.raw?.time ?? null,
        totalTime: player.raw?.totalTime ?? null
      });
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
