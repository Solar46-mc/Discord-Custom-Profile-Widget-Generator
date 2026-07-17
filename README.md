# Widget Bench

Discord の **Profile Widgets V2**（実験的機能）を、コードを書かずに組み立てるための非公式ツールです。

- `index.html` / `styles.css` / `app.js` — ブラウザだけで動く設計ツール（GitHub Pagesにそのまま置けます）
- `bot-template/` — 実際にDiscordへ値を送るNode.js製のローカルbot（固定値の送信に対応。自作データソースへの拡張が可能）

Discord, Inc. とは関係のない、コミュニティ制作のツールです。

## 先に知っておいてほしいこと

- Widgets V2 は **Discordが正式に公開しているUI機能ではありません**。Developer Portal の未文書化の設定画面、DevToolsコンソールでの内部モジュール操作、未文書化のAPIエンドポイントを組み合わせて動いています。
- Discord側の変更で、事前の告知なく動作しなくなる可能性があります。
- 2026年6月4日以降、ウィジェットは**アプリケーションを作成した本人のアカウント**にしか表示されません。他人に配布して使わせる用途には向きません。
- Botトークンなどの認証情報は、このサイト（ブラウザ側）には一切送信されません。すべてローカルの `bot-template` 内、あなたのマシン上でのみ扱われます。

## 使い方

### 1. 設計サイトを開く

GitHub Pagesで公開するか、`index.html` をブラウザで直接開きます。

1. **ウィジェット上部**のレイアウト（ヒーロー／コンパクト）とタイトル・サブタイトル・画像を設定
2. **ミニプロフィール**のレイアウト（名前＋説明／代表的な統計値／カスタムテキスト）を設定
3. 必要なら**ウィジェット下部**（統計グリッド／進捗バー／コレクション）を追加
4. **データの取得元**を選択（固定値 / 自作bot）
5. **書き出し**タブで、Developer Portal用のフィールド一覧・PATCH用JSON・コンソールスクリプト・curl/PowerShellコマンドをコピーし、`config.json` をダウンロード

### 2. Discord側の設定

書き出しタブの手順どおりに、Developer Portalでのアプリ作成・フィールド作成・コンソールスクリプトの実行・実験フラグの設定を行います。

### 3. bot-template を動かす

固定値だけなら書き出しタブのcurl/PowerShellコマンドを1回実行するだけでも構いません。継続的に更新したい場合は `bot-template/README.md` の手順で Node.js のbotを動かします。

## GitHub Pagesへの公開

このリポジトリをGitHubにpushし、リポジトリの **Settings → Pages** で公開ブランチ（例: `main`）とルートディレクトリを指定するだけで、ビルド不要で `index.html` が公開されます。

```bash
git init
git add .
git commit -m "Widget Bench"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

`bot-template/` はローカル実行専用なので、GitHub Pagesの公開対象からは自然に外れます（静的サイトとして配信されるのは `index.html` などのみです）。

## ディレクトリ構成

```
.
├── index.html          設計ツール本体
├── styles.css
├── app.js
├── README.md
└── bot-template/        ローカルで動かすbot
    ├── index.js
    ├── package.json
    ├── .env.example
    ├── providers/
    │   └── static.js    固定値プロバイダー（土台として拡張可能）
    └── README.md
```

## 免責

未文書化のAPI・実験的機能を扱うツールです。動作を保証するものではなく、Discordの利用規約の解釈は利用者ご自身の判断に委ねられます。何か問題が起きても作者・Anthropicは責任を負いません。
