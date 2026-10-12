// 公開ポータル（GitHub Pages）を生成する。
// 1) 各資格の問題集HTML（shikaku-chat-api/src/<X>Quiz.html）を、make_public2.js で公開版にする
// 2) ルートに資格一覧のポータル index.html を作る
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const home = process.env.HOME;
const apiSrc = path.join(home, 'projects/shikaku-chat-api/src');
const script = path.join(__dirname, 'make_public2.js');
const out = path.join(__dirname, '..');
const exams = require(path.join(home, 'projects/shikaku-chat-portal/src/exams.js'));

const ORG = {
  aaia: 'ISACA（AAIA）',
  isms: 'ISO/IEC 27001・JIS Q 27001（ISMS）の規格・認証制度',
  au: 'IPA（システム監査技術者試験）・経済産業省（システム監査基準）',
  pms: 'プライバシーマーク制度（JIPDEC）・個人情報保護委員会・JIS Q 15001',
  jsox: '金融庁・企業会計審議会（内部統制報告制度）',
  cisa: 'ISACA（CISA）',
  pmp: 'PMI（PMP）',
  claudecode: 'Anthropic（Claude Code）',
  github: 'GitHub, Inc.（GitHub）',
  ippfcyber: '内部監査人協会（IIA）',
};
const ids = ['aaia', 'isms', 'au', 'pms', 'jsox', 'cisa', 'pmp', 'claudecode', 'github', 'ippfcyber'];
const quizzes = ids.map((id) => exams.find((e) => e.id === id && e.quiz)).filter(Boolean);
// 注記の「事実関係」の一文を差し替える問題集
const NOTE = {
  claudecode: '事実関係は公式ドキュメントで確認した内容に基づきますが、Claude Code は頻繁に更新されるため最新の公式ドキュメントで確認してください。',
  github: '事実関係は GitHub の公式ドキュメントで確認した内容に基づきますが、GitHub は頻繁に更新されるため最新の公式ドキュメントで確認してください。',
  ippfcyber: '事実関係は IIA の公式文書（トピック別要求事項の本文・ユーザーガイド・Q&A）で確認した内容に基づきますが、トピック別要求事項は定期的に見直されるため最新の公式文書で確認してください。',
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

fs.mkdirSync(out, { recursive: true });
for (const e of quizzes) {
  const dir = path.join(out, e.id);
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('node', [script, path.join(apiSrc, cap(e.id) + 'Quiz.html'), path.join(dir, 'index.html'), e.quiz.title, ORG[e.id], NOTE[e.id] || ''], { stdio: 'inherit' });
}

const cards = quizzes.map((e) => `    <a class="card" href="./${e.id}/">
      <div class="icon" aria-hidden="true">${e.quiz.icon}</div>
      <div class="body">
        <h2>${e.quiz.title}</h2>
        <p>${e.quiz.portalDesc}</p>
        <span class="go">問題を解く →</span>
      </div>
    </a>`).join('\n');

const index = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>資格学習 練習問題（非公式）</title>
<style>
  :root { --bg:#f6f7f9; --fg:#1d2330; --muted:#5b6475; --card:#ffffff; --line:#dfe3ea; --accent:#2b5c8a; --warn-bg:#fff4d6; --warn-fg:#5b4300; --warn-line:#e6c96b; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg:#141821; --fg:#e7eaf0; --muted:#9aa3b5; --card:#1d2330; --line:#2c3445; --accent:#8ab8e6; --warn-bg:#3a3010; --warn-fg:#f3e3a6; --warn-line:#7a6420; }
  }
  :root[data-theme="dark"] { --bg:#141821; --fg:#e7eaf0; --muted:#9aa3b5; --card:#1d2330; --line:#2c3445; --accent:#8ab8e6; --warn-bg:#3a3010; --warn-fg:#f3e3a6; --warn-line:#7a6420; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font-family: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif; line-height: 1.6; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 1.5rem; margin: 8px 0 4px; }
  .lead { color: var(--muted); margin: 0 0 16px; }
  .notice { background: var(--warn-bg); color: var(--warn-fg); border: 1px solid var(--warn-line); border-radius: 8px; padding: 12px 14px; font-size: 14px; margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
  @media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
  .card { display: flex; gap: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 16px; text-decoration: none; color: inherit; }
  .card:hover { border-color: var(--accent); }
  .icon { font-size: 28px; line-height: 1; }
  .body h2 { font-size: 1.05rem; margin: 0 0 6px; color: var(--fg); }
  .body p { font-size: 14px; color: var(--muted); margin: 0 0 8px; }
  .go { font-size: 14px; color: var(--accent); font-weight: 600; }
  footer { margin-top: 28px; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>資格学習 練習問題</h1>
  <p class="lead">4択の練習問題（個人作成）を資格ごとに掲載しています。回答するとすぐに正誤と解説が確認できます。</p>
  <div class="notice">
    <strong>非公式・個人作成です。</strong>掲載の問題はすべて個人が書き下ろした仮問題で、各資格の公式な試験問題・公式問題集ではありません。Anthropic、ISACA、PMI、IPA、経済産業省、金融庁、JIPDEC、個人情報保護委員会、ISO などの団体とは無関係で、公式の出題・難度とは一致しません。事実関係は公式の資料での確認が必要です。この公開版では成績・途中経過は保存されません。
  </div>
  <div class="grid">
${cards}
  </div>
  <footer>問題は予告なく修正されることがあります。誤りを見つけた場合はご連絡ください。</footer>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(out, 'index.html'), index);
console.log('portal written', out, quizzes.map((e) => e.id).join(','));
