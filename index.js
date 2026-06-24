const { Client } = require('discord.js-selfbot-v13');
const { Streamer, prepareStream, playStream, GatewayOpCodes } = require('@dank074/discord-video-stream');
const fs = require('fs');
const cfg = require('./config');

// ─── logger ─────────────────────────────────────────────────────────────────

const c = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    green:   '\x1b[38;5;83m',
    cyan:    '\x1b[38;5;51m',
    magenta: '\x1b[38;5;207m',
    yellow:  '\x1b[38;5;220m',
    red:     '\x1b[38;5;203m',
    gray:    '\x1b[38;5;245m',
    white:   '\x1b[97m',
};

const tag = (color, label) => `${c.bold}${color}[${label}]${c.reset}`;

const log = {
    auth:   (...m) => console.log(tag(c.green,   'AUTH  '), ...m),
    voice:  (...m) => console.log(tag(c.cyan,    'VOICE '), ...m),
    stream: (...m) => console.log(tag(c.magenta, 'STREAM'), ...m),
    warn:   (...m) => console.log(tag(c.yellow,  'WARN  '), ...m),
    error:  (...m) => console.log(tag(c.red,     'ERROR '), ...m),
    info:   (...m) => console.log(tag(c.gray,    'INFO  '), ...m),
};

function banner() {
    const line = `${c.bold}${c.cyan}`;
    const rst  = c.reset;
    console.log();
    console.log(`${line}  ╔══════════════════════════════════════╗${rst}`);
    console.log(`${line}  ║${rst}  ${c.bold}${c.white}Discord Stream Bot${rst}                  ${line}║${rst}`);
    console.log(`${line}  ║${rst}  ${c.dim}Stream video into voice 24/7${rst}         ${line}║${rst}`);
    console.log(`${line}  ╠══════════════════════════════════════╣${rst}`);
    console.log(`${line}  ║${rst}  ${c.gray}Credits  ${c.white}itsfizys${rst}                    ${line}║${rst}`);
    console.log(`${line}  ║${rst}  ${c.gray}Discord  ${c.cyan}discord.gg/AeroX${rst}             ${line}║${rst}`);
    console.log(`${line}  ╚══════════════════════════════════════╝${rst}`);
    console.log();
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadToken() {
    const file = './token.txt';
    if (!fs.existsSync(file)) {
        log.error(`${c.red}token.txt not found. Create it and paste your token inside.${c.reset}`);
        process.exit(1);
    }
    const token = fs.readFileSync(file, 'utf-8').trim();
    if (!token) {
        log.error('token.txt is empty.');
        process.exit(1);
    }
    return token;
}

function setUndeafened(streamer) {
    streamer.sendOpcode(GatewayOpCodes.VOICE_STATE_UPDATE, {
        guild_id:   cfg.server.id,
        channel_id: cfg.server.channel,
        self_mute:  false,
        self_deaf:  false,
        self_video: false,
    });
}

// ─── stream ──────────────────────────────────────────────────────────────────

async function startStream(streamer) {
    const { width, height, fps, bitrate } = cfg.stream.quality;

    const opts = {
        width,
        height,
        frameRate: fps,
        bitrateVideo: bitrate,
        minimizeLatency: true,
        customInputOptions: ['-stream_loop', '-1', '-re'],
    };

    log.stream(`Playing ${c.bold}${c.white}${cfg.stream.file}${c.reset} ${c.gray}(${width}x${height} · ${fps}fps · ${bitrate}kbps)${c.reset}`);

    const { command, output } = prepareStream(cfg.stream.file, opts);
    command.on('error', err => log.error('FFmpeg —', err.message));

    try {
        await playStream(output, streamer);
        log.stream(`Stream ended — restarting...`);
    } catch (err) {
        log.error('Playback —', err.message);
    } finally {
        try { command.kill('SIGTERM'); } catch {}
    }

    setTimeout(() => startStream(streamer).catch(console.error), 3000);
}

// ─── entry ───────────────────────────────────────────────────────────────────

async function launch() {
    banner();

    const token = loadToken();
    const client = new Client({ checkUpdate: false });
    const streamer = new Streamer(client);

    client.once('ready', async () => {
        log.auth(`Logged in as ${c.bold}${c.white}${client.user.tag}${c.reset}`);

        const vc = client.channels.cache.get(cfg.server.channel);
        if (!vc?.isVoice()) {
            log.error(`Channel ${cfg.server.channel} not found or is not a voice channel.`);
            return;
        }

        await streamer.joinVoice(cfg.server.id, cfg.server.channel);
        setUndeafened(streamer);
        log.voice(`Joined ${c.bold}${c.white}${vc.name}${c.reset} ${c.gray}(${cfg.server.id})${c.reset}`);

        await new Promise(r => setTimeout(r, 3000));
        startStream(streamer).catch(console.error);
    });

    client.on('disconnect', () => {
        log.warn(`Disconnected — reconnecting in 10s...`);
        setTimeout(launch, 10000);
    });

    await client.login(token).catch(err => {
        log.error(`Login failed — ${err.message}`);
        process.exit(1);
    });
}

launch();
