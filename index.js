const gamedig = require('gamedig');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  type: 'arma3',
  host: 'odst.top',
  port: 12241,
  timeout: 5000
};

const DAILY_DIR = './daily';

// 全局变量
let playerData = {};

// 确保 daily 目录存在
if (!fs.existsSync(DAILY_DIR)) {
  fs.mkdirSync(DAILY_DIR, { recursive: true });
}

function getDailyFilePath() {
  const date = new Date().toISOString().split('T')[0];
  return path.join(DAILY_DIR, `${date}.json`);
}

// 加载数据 - 将数组转换为以 name 为 key 的对象
function loadData() {
  const filePath = getDailyFilePath();
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (data.players && Array.isArray(data.players)) {
      // 将数组转换为以 name 为 key 的对象
      playerData = {};
      for (const p of data.players) {
        playerData[p.name] = { raw: p.raw };
      }
    } else {
      playerData = {};
    }
  } else {
    playerData = {};
  }
}

// 保存数据 - 将对象转换为数组
function saveData() {
  const filePath = getDailyFilePath();
  const playersArray = Object.entries(playerData).map(([name, data]) => ({
    name,
    raw: data.raw
  }));
  const json = {
    timestamp: Date.now(),
    players: playersArray
  };
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

async function queryServer() {
  try {
    const state = await gamedig.query(CONFIG);

    // 根据 name 更新在线玩家的 raw.time
    for (const p of state.players) {
      const existing = playerData[p.name];

      if (existing) {
        // 已有玩家 - 累加时间
        const currentTime = Math.round(p.raw.time);
        const totalTime = Math.round(existing.raw.time);
        let baseTime = existing.raw.baseTime || 0;
        // 如果当前计数小于基时间，则判断为发生过断连（断连过的玩家总时间为 baseTime + time）
        if (currentTime < totalTime) {
          baseTime = existing.raw.time;
        }

        // 累加游戏时间（无论玩家是否退出重入，都累加当前游戏时间）
        playerData[p.name] = {
          raw: {
            baseTime: baseTime,
            score: p.raw.score,
            time: currentTime
          }
        };
      } else {
        // 新玩家 - 首次记录时间
        playerData[p.name] = {
          raw: {
            baseTime: 0,
            score: p.raw.score,
            time: p.raw.time
          }
        };
      }
    }

    // 保存到文件
    saveData();

    console.log(`[${new Date().toISOString()}] 查询成功 - ${state.players.length} 名玩家在线`);
    return playerData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 查询失败: ${error.message}`);
    throw error;
  }
}

// 启动时加载数据
loadData();

// 每 30 秒轮询一次
setInterval(queryServer, 30000);
queryServer(); // 立即执行一次
