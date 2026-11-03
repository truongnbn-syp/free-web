// Japanese / Vietnamese for the labels and notes of this page.
// The page is written in Japanese; Vietnamese replaces each text (whitespace collapsed) listed in VI_TEXTS.
// Texts not listed (attribute names, test values such as 山田 太郎) stay as they are.
// The language comes from ?lang=vi|ja, else the last choice of this browser, else Japanese.
(function () {
  const LANG_KEY = 'input-attributes-form:lang';
  const LANGUAGES = ['ja', 'vi'];
  const TITLE = 'Co-browsing - input属性の確認';
  const TRANSLATED_ATTRIBUTES = ['placeholder', 'title', 'aria-label'];
  const SKIPPED_TAGS = ['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE'];
  // Rendered by script.js in the current language
  const SKIPPED_SELECTOR = '#log, .meta.auto, #extension-status, #copy-status';

  const VI_TEXTS = {
    // Header
    'Co-browsing - input属性の確認': 'Co-browsing - Kiểm tra thuộc tính input',
    '← メニュー': '← Menu',
    'Co-browsing - input属性の確認（#7628 機能要件 1-3）': 'Co-browsing - Kiểm tra thuộc tính input (#7628 Yêu cầu chức năng 1-3)',
    'このページをホスト側のブラウザで開き、このタブを画面操作共有してください。拡張機能:':
      'Mở trang này trên trình duyệt phía host rồi chia sẻ thao tác màn hình (co-browsing) tab này. Extension:',
    '各項目の': 'Mã',
    'は openspec gl7628 の Scenario ID（S-7628-xx）。': 'ở mỗi mục là Scenario ID của openspec gl7628 (S-7628-xx).',

    // A
    'A. キーボードの種類（type / inputmode / enterkeyhint）': 'A. Loại bàn phím (type / inputmode / enterkeyhint)',
    'ゲスト端末（iPhone / iPad / Android）で各項目をタップし、表示されるキーボードを確認してください（S-01・S-02・S-03）。7 種（text・search・email・password・tel・url・number）以外の type は入力欄を開かない。':
      'Trên máy guest (iPhone / iPad / Android), chạm vào từng ô và kiểm tra bàn phím hiện ra (S-01・S-02・S-03). Các type ngoài 7 loại (text・search・email・password・tel・url・number) thì không mở ô nhập.',
    'テキスト': 'Văn bản',
    'メールアドレス': 'Địa chỉ email',
    '整数': 'Số nguyên',
    '小数': 'Số thập phân',
    '数値（負数可）': 'Số (cho phép số âm)',
    'S-24: 「-5」の入力途中の「-」・「12-」はホスト側の値が空、ゲスト側は入力した文字列のまま（メッセージなし）。':
      'S-24: Khi đang gõ 「-5」, ở bước 「-」 và khi nhập 「12-」 thì giá trị phía host rỗng; phía guest giữ nguyên chuỗi đã nhập (không có message).',
    '電話番号': 'Số điện thoại',
    '検索': 'Tìm kiếm',
    'パスワード': 'Mật khẩu',
    'email + multiple（カンマ区切り可）': 'email + multiple (cho phép phân cách bằng dấu phẩy)',
    'dir=rtl（右寄せ）': 'dir=rtl (căn phải)',
    '反映しない属性（list / form / onchange — S-06）': 'Thuộc tính không phản ánh (list / form / onchange — S-06)',
    'ゲスト側に候補（datalist）が出ない・ホストのスクリプトはゲストで動かないこと。':
      'Phía guest không hiện gợi ý (datalist), script của host không chạy ở guest.',
    '1,000 文字を超える属性値（placeholder）': 'Giá trị thuộc tính dài hơn 1.000 ký tự (placeholder)',
    '拡張機能は 1,000 文字超の属性値を送らないため、ゲスト側にプレースホルダーが出ないこと。':
      'Extension không gửi giá trị thuộc tính dài hơn 1.000 ký tự, nên phía guest không hiện placeholder.',
    '日付（入力欄を開かない）': 'Ngày (không mở ô nhập)',
    'チェックボックス / ラジオ': 'Checkbox / Radio',
    '同意する': 'Đồng ý',
    'はい': 'Có',
    'いいえ': 'Không',

    // B
    'B. ゲスト側の入力制御（maxlength / minlength / placeholder / textarea / 高さ）':
      'B. Kiểm soát nhập phía guest (maxlength / minlength / placeholder / textarea / chiều cao)',
    '最大5文字（S-04）': 'Tối đa 5 ký tự (S-04)',
    'UTF-16 で数える: 「あ」= 1、「𠮷」「😀」= 2、「👍🏻」= 4。': 'Đếm theo UTF-16: 「あ」= 1, 「𠮷」「😀」= 2, 「👍🏻」= 4.',
    '現在値が maxlength 超（input・最大5文字 — S-21）': 'Giá trị hiện tại vượt maxlength (input, tối đa 5 ký tự — S-21)',
    '現在値を7文字にする（スクリプト）': 'Đặt giá trị hiện tại thành 7 ký tự (script)',
    '7文字のまま表示・削除は可・増やす入力は不可・1文字選択して置き換え → 6文字。':
      'Giữ nguyên 7 ký tự; xoá được; không gõ thêm được; chọn 1 ký tự rồi gõ đè → 6 ký tự.',
    '最小3文字': 'Tối thiểu 3 ký tự',
    'プレースホルダー': 'Placeholder',
    'テキストエリア（5〜20文字）': 'Textarea (5–20 ký tự)',
    '現在値が maxlength 超（textarea・最大5文字 — S-21）': 'Giá trị hiện tại vượt maxlength (textarea, tối đa 5 ký tự — S-21)',
    'textarea の属性（最大100文字・自動修正なし・大文字 — S-08）': 'Thuộc tính textarea (tối đa 100 ký tự, không tự sửa, viết hoa — S-08)',
    'Enter は改行（確定しない）。確定は入力欄の外のタップ・Esc・iOS「完了」。':
      'Enter là xuống dòng (không xác nhận). Xác nhận bằng chạm ra ngoài ô, Esc, hoặc 「完了」 trên iOS.',
    '高さ 700px の textarea（最大 600 — S-11・S-40）': 'Textarea cao 700px (tối đa 600 — S-11・S-40)',
    '現在値を40行にする（スクリプト）': 'Đặt giá trị hiện tại thành 40 dòng (script)',
    '入力欄内でスクロールできること。横向きでは表示領域に縮むこと。': 'Cuộn được trong ô nhập. Khi xoay ngang, ô thu nhỏ vừa vùng hiển thị.',
    '高さ 40px の textarea（最小 100 — S-11）': 'Textarea cao 40px (tối thiểu 100 — S-11)',
    '高さ 64px の input（実際の高さ — S-11）': 'Input cao 64px (chiều cao thật — S-11)',
    'ホストで検証（参考）': 'Kiểm tra trên host (tham khảo)',
    '例: 山田 太郎': 'Ví dụ: Nguyễn Văn A',
    'ご要望を入力してください': 'Vui lòng nhập yêu cầu',
    '住所を入力してください': 'Vui lòng nhập địa chỉ',

    // C
    'C. 入力制御を満たさない値（メッセージを表示しない — S-13）': 'C. Giá trị không thoả kiểm soát nhập (không hiện message — S-13)',
    'ゲスト側・ホスト側とも econy は検証メッセージを表示しない（QA #7678）。値はそのまま共有元へ反映され、各項目の下の「検証」が NG になること。「ホストで検証（参考）」はホストのブラウザー自身の吹き出し（共有元画面の動作）。':
      'Cả phía guest và host, econy không hiện message kiểm tra (QA #7678). Giá trị được phản ánh nguyên trạng sang trang gốc, mục 「Kiểm tra」 dưới mỗi ô thành NG. Nút 「Kiểm tra trên host (tham khảo)」 là bong bóng của chính trình duyệt host (hành vi của trang gốc).',
    '最小3文字 + 数字のみ（「ab」を入力 — S-13）': 'Tối thiểu 3 ký tự + chỉ số (nhập 「ab」 — S-13)',
    '必須': 'Bắt buộc',
    '数字3桁（pattern）': '3 chữ số (pattern)',
    '数字3桁': '3 chữ số',
    '0〜100の数値': 'Số từ 0 đến 100',
    '5刻みの数値（step）': 'Số theo bước 5 (step)',
    'メールアドレス形式': 'Định dạng email',
    'ページ独自の検証（「NG」を含むとエラー）': 'Kiểm tra riêng của trang (chứa 「NG」 thì lỗi)',

    // D
    'D. ホスト画面のイベント（input / change / keydown / iframe）': 'D. Event trên màn hình host (input / change / keydown / iframe)',
    '文字数カウント（inputイベント）': 'Đếm ký tự (event input)',
    '残り': 'Còn',
    '文字（最大30文字、ページのJSで計算）': 'ký tự (tối đa 30, JS của trang tính)',
    '確定時に大文字化（changeイベント）': 'Viết hoa khi xác nhận (event change)',
    'changeイベント回数:': 'Số lần event change:',
    '（入力中は増えず、ゲストが確定したときのみ増える）': '(không tăng khi đang gõ, chỉ tăng khi guest xác nhận)',
    '値を変えて確定（Enter・外のタップ — S-14・S-15）、Esc・戻る・リサイズで閉じる（S-23）、iOS「完了」（S-41）→ +1。値を変えずに確定（S-22）・日本語変換中の Enter（S-16）・共有終了で閉じる（S-43）→ 増えない。入力直後の確定でも +1（S-17）。':
      'Đổi giá trị rồi xác nhận (Enter, chạm ra ngoài — S-14・S-15), đóng bằng Esc / back / resize (S-23), 「完了」 trên iOS (S-41) → +1. Xác nhận mà không đổi giá trị (S-22), Enter khi đang chuyển đổi IME tiếng Nhật (S-16), đóng do kết thúc chia sẻ (S-43) → không tăng. Xác nhận ngay sau khi gõ cũng +1 (S-17).',
    '数字のみ入力（keydownで制御）': 'Chỉ nhập số (chặn bằng keydown)',
    'ホストのキーボードでは数字以外を入力できない。ゲストからの入力はブロックされない想定（対応範囲外）。':
      'Bàn phím của host không nhập được ký tự ngoài số. Giá trị nhập từ guest không bị chặn (ngoài phạm vi).',
    '同一オリジンiframe内の入力欄': 'Ô nhập trong iframe cùng origin',
    '同一オリジンのiframe': 'iframe cùng origin',

    // E
    'E. リグレッション確認（select — S-09）': 'E. Kiểm tra hồi quy (select — S-09)',
    'ドロップダウン（必須）': 'Dropdown (bắt buộc)',
    '選択してください': 'Vui lòng chọn',
    '東京': 'Tokyo',
    '大阪': 'Osaka',
    '福岡': 'Fukuoka',

    // S
    'S. secure 指定の入力項目（別経路 — S-25～S-39・S-42）': 'S. Ô nhập có thuộc tính secure (đường riêng — S-25～S-39・S-42)',
    '開くと読み込み中 → 現在値が表示されて入力可（S-28）。入力中はホストに反映されない（S-26）。確定するとゲスト画面全体にローディング → 1〜2秒でホストに反映（S-25・S-38）。 値を変えずに Enter → input のみ（change なし — S-27）。Firestore のイベントに値が無いこと（Firebase コンソール）。 続けて2項目を確定 → 確定順に反映（S-37）。保存中に共有終了 → 反映なし・ローディングはメッセージなしで解除（S-36）。':
      'Mở ô thì hiện đang tải → hiện giá trị hiện tại rồi mới nhập được (S-28). Khi đang gõ, host không được phản ánh (S-26). Xác nhận thì toàn màn hình guest hiện loading → 1–2 giây sau phản ánh sang host (S-25・S-38). Enter mà không đổi giá trị → chỉ input (không có change — S-27). Event trên Firestore không có giá trị (xem Firebase console). Xác nhận liên tiếp 2 ô → phản ánh theo thứ tự xác nhận (S-37). Kết thúc chia sẻ khi đang lưu → không phản ánh, loading tắt không có message (S-36).',
    'secure 空欄（現在値が空 — S-28）': 'secure để trống (giá trị hiện tại rỗng — S-28)',
    'secure・maxlength なし（10,000 文字 — S-34・S-42）': 'secure, không có maxlength (10.000 ký tự — S-34・S-42)',
    'ゲスト: G の文字列を貼り付けて確定。10,000 文字 → 反映、10,001 文字 → ローディングなしで ECN0266E。':
      'Guest: dán chuỗi ở mục G rồi xác nhận. 10.000 ký tự → phản ánh; 10.001 ký tự → ECN0266E, không có loading.',
    'ホスト:': 'Host:',
    '現在値を10,000文字にする': 'Đặt giá trị hiện tại 10.000 ký tự',
    '現在値を10,001文字にする': 'Đặt giá trị hiện tại 10.001 ký tự',
    '→ 10,001 文字はゲストが開くと ECN0267E。': '→ Với 10.001 ký tự, guest mở ô sẽ thấy ECN0267E.',
    'secure select（現行どおり Firestore — S-29）': 'secure select (qua Firestore như hiện tại — S-29)',
    '普通': 'Thường',
    '当座': 'Vãng lai',

    // F
    'F. shadow DOM 内の入力項目（S-18・S-35）': 'F. Ô nhập trong shadow DOM (S-18・S-35)',
    'クリック応答に属性が含まれないため type のみで判定し、secure も通常の経路になる（共有元画面は secure を shadow DOM 内に置かない制約）。反映先の要素を特定できないため、値が反映されない場合がある（現行の制約）。':
      'Phản hồi click không có thuộc tính nên chỉ xét theo type, secure cũng đi đường thường (ràng buộc: trang gốc không đặt ô secure trong shadow DOM). Vì không xác định được phần tử đích, giá trị có thể không được phản ánh (giới hạn hiện tại).',
    'F1 tel・maxlength=5（type のみ反映 — S-18）': 'F1 tel・maxlength=5 (chỉ phản ánh type — S-18)',
    'F2 secure（通常の経路 — S-35）': 'F2 secure (đường thường — S-35)',
    '反映されない': 'Không được phản ánh',

    // G
    'G. ゲスト端末用: 長い文字列のコピー': 'G. Dùng cho máy guest: copy chuỗi dài',
    'このページをゲスト端末のブラウザーで直接開き（画面操作共有とは別のタブ）、コピーして S10 に貼り付ける。':
      'Mở trực tiếp trang này trên trình duyệt của máy guest (tab khác với tab co-browsing), copy rồi dán vào S10.',
    '10,000 文字をコピー': 'Copy 10.000 ký tự',
    '10,001 文字をコピー': 'Copy 10.001 ký tự',
    'コピー用の文字列': 'Chuỗi để copy',

    // Log
    'ホスト側イベントログ': 'Log event phía host',
    'input（青）/ change（黄）/ keydown（赤）/ click（緑）。パスワードの値はマスク表示。':
      'input (xanh dương) / change (vàng) / keydown (đỏ) / click (xanh lá). Giá trị mật khẩu được che.',
    'ログを消去': 'Xoá log'
  };

  // Texts rendered by script.js. {0} is replaced with the argument.
  const MESSAGES = {
    hostValue: { ja: 'ホスト側の値: ', vi: 'Giá trị phía host: ' },
    charCount: { ja: '（{0}文字）', vi: ' ({0} ký tự)' },
    validity: { ja: '検証: ', vi: 'Kiểm tra: ' },
    setByScript: { ja: 'スクリプトで現在値を設定', vi: 'Đặt giá trị hiện tại bằng script' },
    allValid: { ja: 'すべて有効', vi: 'Tất cả hợp lệ' },
    extensionFound: { ja: '検出済み（v{0}）', vi: 'Đã phát hiện (v{0})' },
    extensionNotFound: { ja: '未検出', vi: 'Chưa phát hiện' },
    copied: { ja: '{0} 文字をコピーしました', vi: 'Đã copy {0} ký tự' },
    copyManually: { ja: '下の欄を選択してコピーしてください', vi: 'Hãy chọn ô bên dưới rồi copy' },
    longPlaceholder: { ja: 'この文言はゲスト側に表示されない。', vi: 'Dòng này không hiện ở phía guest. ' },
    lineLabel: { ja: '{0}行目', vi: 'Dòng {0}' },
    c6Error: { ja: '「NG」を含む値は入力できません（ページ独自の検証）', vi: 'Không được nhập giá trị chứa 「NG」 (kiểm tra riêng của trang)' },
    d4Label: { ja: '1〜10の数値（必須）', vi: 'Số từ 1 đến 10 (bắt buộc)' }
  };

  const originalTexts = new WeakMap(); // text node → Japanese text
  const originalAttributes = new WeakMap(); // element → { attribute name: Japanese value }
  const roots = [];
  const listeners = [];
  let lang = 'ja';

  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  // Keeps the spaces around the text (e.g. between a label and a counter)
  function translateText(original) {
    if (lang === 'ja') return original;
    const translated = VI_TEXTS[normalize(original)];
    if (!translated) return original;
    return original.match(/^\s*/)[0] + translated + original.match(/\s*$/)[0];
  }

  function isSkipped(element) {
    return !element || SKIPPED_TAGS.indexOf(element.tagName) >= 0 || !!element.closest(SKIPPED_SELECTOR);
  }

  function translateTree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (isSkipped(node.parentElement) || !normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!originalTexts.has(node)) originalTexts.set(node, node.nodeValue);
      node.nodeValue = translateText(originalTexts.get(node));
    }
    // The attributes of a textarea are translated too (only its content is a test value)
    root.querySelectorAll('[' + TRANSLATED_ATTRIBUTES.join('],[') + ']').forEach(function (element) {
      if (element.closest(SKIPPED_SELECTOR)) return;
      if (!originalAttributes.has(element)) originalAttributes.set(element, {});
      const originals = originalAttributes.get(element);
      TRANSLATED_ATTRIBUTES.forEach(function (name) {
        if (!element.hasAttribute(name)) return;
        if (!(name in originals)) originals[name] = element.getAttribute(name);
        element.setAttribute(name, translateText(originals[name]));
      });
    });
  }

  function apply() {
    document.documentElement.lang = lang;
    document.title = translateText(TITLE);
    roots.forEach(translateTree);
    document.querySelectorAll('[data-lang]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    });
    listeners.forEach(function (listener) { listener(lang); });
  }

  function initialLanguage() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGUAGES.indexOf(fromUrl) >= 0) return fromUrl;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (LANGUAGES.indexOf(saved) >= 0) return saved;
    } catch (error) { /* storage unavailable */ }
    return 'ja';
  }

  window.i18n = {
    t: function (key, arg) {
      const message = MESSAGES[key] ? MESSAGES[key][lang] : key;
      return arg === undefined ? message : message.replace('{0}', String(arg));
    },
    getLanguage: function () { return lang; },
    // A tree translated with the page (the document, a shadow root)
    addRoot: function (root) { roots.push(root); },
    onChange: function (listener) { listeners.push(listener); },
    setLanguage: function (next) {
      if (LANGUAGES.indexOf(next) < 0) return;
      lang = next;
      try { localStorage.setItem(LANG_KEY, lang); } catch (error) { /* storage unavailable */ }
      apply();
    },
    // Called by script.js once the page (shadow DOM, iframe) is built
    start: function () {
      lang = initialLanguage();
      document.querySelectorAll('[data-lang]').forEach(function (button) {
        button.addEventListener('click', function () { window.i18n.setLanguage(button.dataset.lang); });
      });
      apply();
    }
  };
  window.i18n.addRoot(document.body);
})();
