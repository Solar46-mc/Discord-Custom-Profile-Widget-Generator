require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('[widget-bench-bot] config.json が見つかりません。');
    console.error('Widget Bench（設計サイト）の「⑤ config.jsonをダウンロード」から取得し、');
    console.error(`このディレクトリ（${__dirname}）に置いてください。`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadProvider(config) {
  // 現状は固定値プロバイダーのみ同梱。自作データソースを使う場合は
  // providers/ に新しいファイルを追加し、ここの分岐に加えてください。
  return require('./providers/static.js');
}

function requireEnv(keys) {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`[widget-bench-bot] .env に以下の値を設定してください: ${missing.join(', ')}`);
    process.exit(1);
  }
}

function buildPatchBody(config, values) {
  const dynamic = config.fields.map(f => {
    const raw = values[f.name] ?? '';
    if (f.type === 3) return { type: 3, name: f.name, value: { url: raw || '' } };
    if (f.type === 2) return { type: 2, name: f.name, value: raw === '' ? 0 : Number(raw) };
    return { type: 1, name: f.name, value: String(raw) };
  });
  return { data: { dynamic } };
}

async function pushToDiscord(body) {
  const url = `https://discord.com/api/v9/applications/${process.env.APPLICATION_ID}/users/${process.env.USER_ID}/identities/0/profile`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${process.env.BOT_TOKEN}`,
      'User-Agent': 'widget-bench-bot (local, personal use)'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Discordへの送信に失敗しました (${res.status}): ${text}`);
  }
}

async function main() {
  const config = loadConfig();
  const provider = loadProvider(config);

  requireEnv(['APPLICATION_ID', 'USER_ID', 'BOT_TOKEN']);

  const pollInterval = Number(process.env.POLL_INTERVAL_MS || 30000);
  let lastPayload = null;

  async function tick() {
    let values;
    try {
      values = await provider.getValues(config);
    } catch (err) {
      console.error('[widget-bench-bot] データ取得エラー:', err.message);
      return;
    }

    const body = buildPatchBody(config, values);
    const payloadStr = JSON.stringify(body);

    if (payloadStr === lastPayload) {
      return; // 変化なし。無駄なAPI呼び出しを避ける
    }

    try {
      await pushToDiscord(body);
      lastPayload = payloadStr;
      console.log(`[widget-bench-bot] ${new Date().toLocaleTimeString()} 更新しました:`, values);
    } catch (err) {
      console.error('[widget-bench-bot] 送信エラー:', err.message);
    }
  }

  await tick();

  if (provider.once) {
    console.log('[widget-bench-bot] 固定値プロバイダーのため、初回送信のみで終了します。');
    return;
  }

  console.log(`[widget-bench-bot] ${pollInterval}ms 間隔でポーリングを開始します。Ctrl+Cで終了します。`);
  setInterval(tick, pollInterval);
}

main().catch(err => {
  console.error('[widget-bench-bot] 致命的エラー:', err);
  process.exit(1);
});
