# widget-bench-bot

Widget Bench（設計サイト）で作った設定を、実際にDiscordのプロフィールへ反映させるためのローカルbotです。

固定値を反映するための、シンプルなbotです。自作のデータソース（ゲームAPIなど）に差し替えて継続的に更新する土台としても使えます。

## 使う前に

- これは**未文書化のAPI**を叩きます。仕様変更で突然動かなくなる可能性があります。
- `BOT_TOKEN` は絶対に公開リポジトリにコミットしないでください（`.gitignore` に `.env` を含めています）。
- 2026年6月4日以降、ウィジェットは**アプリケーションの所有者本人のアカウント**にしか表示されません。人に配布するツールとしては使えず、あくまで自分のプロフィール用です。

## セットアップ

### 1. 依存関係をインストール

```bash
cd bot-template
npm install
```

### 2. Discord Developer Portal でアプリケーションを準備

1. https://discord.com/developers/applications で新規アプリケーションを作成
2. サイドバーの **Games → Social SDK** で有効化
3. ウィジェット編集画面で、Widget Bench の「① Developer Portal で作成するフィールド一覧」に出力された名前・タイプと**完全に一致する**フィールドを作成
4. Bot タブでトークンを発行

### 3. `config.json` を配置

Widget Bench の最終ステップで「config.json をダウンロード」し、このディレクトリ（`bot-template/config.json`）に置きます。

### 4. `.env` を作成

```bash
cp .env.example .env
```

`APPLICATION_ID` / `USER_ID` / `BOT_TOKEN` を入力します。

### 5. プロフィールにウィジェットを追加

Widget Bench の「③ コンソールスクリプト」をDiscord（ブラウザ版）のDevToolsコンソールで実行し、実験フラグ `2026-03-application-widget-v2-renderer` を Variant 1 に設定した上で、プロフィールの「ウィジェットを追加」からアプリケーションを選択します。

### 6. botを起動

```bash
npm start
```

固定値プロバイダーなので、1回送信したら終了します。値を変えたいときは `config.json` を編集して再度 `npm start` してください。

## 自分のデータソースに差し替える

`providers/static.js` をコピーして `providers/your-source.js` を作り、`getValues(config)` の中身を好きなAPIやロジックに書き換えてください。`index.js` の `loadProvider()` の分岐に追加すれば使えるようになります。
