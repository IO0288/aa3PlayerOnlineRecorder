# AA3 Player

ARMA 3 服务器玩家在线时长统计工具。

## 功能

- 每 5 分钟自动轮询 ARMA 3 服务器，获取在线玩家列表
- 记录每位玩家的累计游戏时间（自动处理断连重连）
- 每日数据独立存储
- 前端页面展示统计数据，支持搜索和排序

## 目录结构

```
aa3player/
├── index.js       # 主程序（轮询服务器）
├── db.js          # 数据汇总脚本
├── db.json        # 汇总后的数据库
├── index.html     # 前端统计页面
├── daily/         # 每日数据目录
│   ├── 2026-03-19.json
│   └── 2026-03-20.json
└── package.json
```

## 使用方法

```bash
# 安装依赖
npm install

# 启动轮询程序（后台运行）
npm start

# 启动 Web 前端
npm run web
```

## 数据说明

- `daily/` 目录存放每日玩家数据，按日期命名
- `db.json` 是前端展示用的汇总数据
- 玩家时间 = 基准时间(baseTime) + 当前会话时间(time)
