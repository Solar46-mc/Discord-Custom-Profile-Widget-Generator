// 固定値プロバイダー
// config.json の staticValues をそのまま各フィールドの値として使う、いちばん単純なプロバイダー。
// 「一度送ったら変わらないウィジェット」を作るときはこれを使う。
// 独自データ（自作サーバーのAPIなど）に差し替えたい場合は getValues() の中身を書き換えるだけでよい。

module.exports = {
  // 常に固定値を返す = 値が変わらないので、bot側は1回送信したらポーリングを止めてよい
  once: true,

  async getValues(config) {
    const values = {};
    for (const field of config.fields) {
      values[field.name] = config.staticValues[field.name] ?? (field.type === 2 ? 0 : '');
    }
    return values;
  }
};
