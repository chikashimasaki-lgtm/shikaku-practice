// 公開版の問題集HTMLを作る。本番の AaiaQuiz.html などから、GASへの依存を外した単一HTMLにする。
// usage: node make_public2.js <src.html> <dst.html> "<題名>" "<公式機関の注記（例: ISACA）>" ["<事実関係の注記>"]
const fs = require('fs');
const [src, dst, title, org, note] = process.argv.slice(2);
let h = fs.readFileSync(src, 'utf8');
// 1) 本番GASへのリンク（ヘッダーのチャット・ポータル）を除去
h = h.replace(/<a class="header-btn" href="https:\/\/script\.google\.com[^"]*"[^>]*>[^<]*<\/a>/g, '');
// 2) GAS_WEBAPP_URL を空にする
h = h.replace(/const GAS_WEBAPP_URL = '[^']*';/, "const GAS_WEBAPP_URL = '';");
// 3) google.script のスタブ（読み込み系は「保存なし」、書き込み・AI系は案内を返す）
const stub = `<meta name="robots" content="noindex,nofollow">
<script>
(function () {
  function make(ok, fail) {
    return new Proxy({}, { get: function (_, name) {
      if (name === "withSuccessHandler") return function (f) { return make(f, fail); };
      if (name === "withFailureHandler") return function (f) { return make(ok, f); };
      return function () {
        var reading = /^(apiLoad|apiGet)/.test(String(name));
        setTimeout(function () {
          if (reading) { if (ok) ok(null); }
          else if (fail) fail(new Error("公開版では記録・AI助言は使えません"));
        }, 0);
      };
    } });
  }
  window.google = { script: { run: make(null, null) } };
})();
</script>`;
h = h.replace(/<\/title>/, '</title>\n' + stub);
h = h.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
// 4) 注記バナー（body直後）と「チャットに聞く」ボタンの非表示
const banner = `<div style="background:#fff4d6;color:#5b4300;padding:10px 14px;font-size:14px;line-height:1.6;border-bottom:1px solid #e6c96b">
<strong>非公式・個人作成の仮問題です。</strong>${org}の公式の試験・規格とは無関係で、公式の出題・難度とは一致しません。${note || '事実関係は公式テキストで未照合です。'}この公開版では成績・途中経過は保存されません。
</div>`;
h = h.replace(/<body[^>]*>/, m => m + '\n' + banner);
h = h.replace('</head>', '<style>#askBtn,#adviceBtn{display:none !important}</style>\n</head>');
fs.writeFileSync(dst, h);
console.log('written', dst, h.length);
