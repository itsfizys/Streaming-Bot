# Discord Stream Bot

Stream any video into a Discord voice channel 24/7, automatically looping.

> **Credits** — [itsfizys](https://discord.gg/AeroX)

---

## Features

- Streams an MP4 file on a continuous loop into any voice channel
- Auto-reconnects if disconnected
- Clean colored console output

---

## Requirements

- Node.js v20+
- FFmpeg installed on your system (`sudo apt install ffmpeg`)
- A Discord user token (selfbot)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/itsfizys/Streaming-Bot.git
cd Streaming-Bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the bot

Open `config.js` and fill in your token, server ID and channel ID:

```js
module.exports = {
    token: 'YOUR_TOKEN_HERE',
    server: {
        id:      'YOUR_GUILD_ID',
        channel: 'YOUR_VOICE_CHANNEL_ID'
    },
    stream: {
        file: 'stream.mp4',
        quality: {
            width:   1280,
            height:  720,
            fps:     25,
            bitrate: 1800
        }
    }
};
```

### 4. Add your video

Place your video file in the root directory and make sure the filename matches `stream.file` in `config.js` (default: `stream.mp4`).

### 5. Run

```bash
node index.js
```

---

## Getting Your Token

1. Open Discord in your **browser**
2. Press `F12` → Console tab
3. Paste this and hit Enter:

```js
window.webpackChunkdiscord_app.push([[Math.random()],{},(req)=>{for(const m of Object.keys(req.c).map((x)=>req.c[x].exports).filter((x)=>x)){if(m.default&&m.default.getToken!==undefined){return copy(m.default.getToken())}if(m.getToken!==undefined){return copy(m.getToken())}}}])
```

Your token is now in your clipboard.

> ⚠️ Never share your token with anyone.

---

## Getting Server & Channel IDs

1. Enable **Developer Mode** in Discord settings (Appearance → Developer Mode)
2. Right-click your server → **Copy Server ID** → paste as `server.id`
3. Right-click the voice channel → **Copy Channel ID** → paste as `server.channel`

---

## Credits

Made by **itsfizys** — [discord.gg/AeroX](https://discord.gg/AeroX)
