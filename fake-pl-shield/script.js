(function () {
  // Mô phỏng luồng chống nhấn 2 lần (二重押下抑制) của hệ thống PL (paperless-dg-app-front).
  // Tham khảo: file đính kèm #4179 "二重押下抑制フロー.xlsx" (source ①〜⑤).
  const SETTINGS_KEY = 'fake-pl-shield:settings';
  const PANEL_COLLAPSED_KEY = 'fake-pl-shield:panel-collapsed';
  const KEEPALIVE_ID = '__co-browse-keepalive';
  const MAX_LOG_LINES = 200;
  const FADE_MS = 300;
  const KANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨワヲンラリルレロ';

  const appElement = document.getElementById('app');
  const shieldElement = document.getElementById('sys_spnner');
  const logElement = document.getElementById('log');
  const kanaModal = document.getElementById('kana-modal');
  const kanaInput = document.getElementById('kana-input');
  const panelElement = document.querySelector('aside');
  const togglePanelButton = document.getElementById('toggle-panel');
  const unseenElement = document.getElementById('log-unseen');

  const options = {
    apiDelay: document.getElementById('opt-api-delay'),
    routeLoad: document.getElementById('opt-route-load'),
    rows: document.getElementById('opt-rows'),
    block: document.getElementById('opt-block'),
    apiShield: document.getElementById('opt-api-shield'),
    keepalive: document.getElementById('opt-keepalive'),
    fade: document.getElementById('opt-fade'),
    autoDelay: document.getElementById('opt-auto-delay'),
    autoInterval: document.getElementById('opt-auto-interval'),
    autoJitter: document.getElementById('opt-auto-jitter'),
    autoCount: document.getElementById('opt-auto-count'),
    autoFull: document.getElementById('opt-auto-full'),
  };
  const autoToggleButton = document.getElementById('auto-toggle');

  let currentScreen = null;
  let opNo = 0;
  let table1Visible = true;
  let selectedAnswer = null;
  let panelCollapsed = false;
  let unseenCount = 0;
  let autoRunId = 0;
  let autoRunning = false;
  let autoSubStep = 0;

  function now() {
    const date = new Date();
    return date.toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  }

  function writeLog(message) {
    const line = document.createElement('div');
    line.textContent = now() + ' ' + message;
    logElement.prepend(line);
    while (logElement.childElementCount > MAX_LOG_LINES) logElement.lastElementChild.remove();
    if (panelCollapsed) {
      unseenCount += 1;
      unseenElement.textContent = '+' + unseenCount;
      unseenElement.hidden = false;
    }
  }

  // ---- Thu gọn / mở panel thiết lập & log (lưu lựa chọn theo trình duyệt) ----
  function setPanelCollapsed(collapsed) {
    panelCollapsed = collapsed;
    panelElement.classList.toggle('collapsed', collapsed);
    panelElement.parentElement.classList.toggle('panel-collapsed', collapsed);
    togglePanelButton.setAttribute('aria-expanded', String(!collapsed));
    if (!collapsed) {
      unseenCount = 0;
      unseenElement.hidden = true;
    }
    try { localStorage.setItem(PANEL_COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (e) { /* không dùng được storage */ }
  }

  // ---- Thiết lập ----
  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      for (const [key, control] of Object.entries(options)) {
        if (!(key in saved)) continue;
        if (control.type === 'checkbox') control.checked = saved[key];
        else control.value = saved[key];
      }
    } catch (e) {
      // Không đọc được giá trị đã lưu thì dùng giá trị mặc định
    }
  }

  function saveSettings() {
    const values = {};
    for (const [key, control] of Object.entries(options)) {
      values[key] = control.type === 'checkbox' ? control.checked : control.value;
    }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
    } catch (e) {
      // Không lưu được cũng không ảnh hưởng đến hoạt động
    }
  }

  function numberOption(control) {
    const value = Number(control.value);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  // ---- Shield (source ③ ui.sieldService) ----
  function keydownListener(event) {
    if (event.key === 'Tab') event.preventDefault();
  }

  function applyHidden() {
    shieldElement.classList.remove('visible', 'show', 'fading');
    shieldElement.classList.add('invisible', 'hide');
  }

  function sieldService(flg) {
    if (flg) {
      // Bật spinner
      if (document.activeElement) document.activeElement.blur();
      shieldElement.classList.remove('invisible', 'hide', 'fading');
      shieldElement.classList.add('visible', 'show');
      document.addEventListener('keydown', keydownListener);
      writeLog('Shield BẬT');
      return;
    }
    // Tắt spinner
    document.removeEventListener('keydown', keydownListener);
    if (options.fade.checked) {
      // Đối sách B: không tắt ngay, mà giảm opacity dần
      shieldElement.classList.add('fading');
      setTimeout(() => {
        if (shieldElement.classList.contains('fading')) applyHidden();
      }, FADE_MS + 50);
      writeLog('Shield TẮT (mờ dần)');
      return;
    }
    applyHidden();
    writeLog('Shield TẮT');
  }

  // ---- Gọi API (source ③ apiCaller.httpServiceWithShield) ----
  function fakeApi() {
    return new Promise((resolve) => setTimeout(() => resolve({ ResponseCode: '0' }), numberOption(options.apiDelay)));
  }

  async function httpServiceWithShield(label) {
    sieldService(true);
    try {
      writeLog('Gọi API: ' + label);
      return await fakeApi();
    } finally {
      sieldService(false);
    }
  }

  function blockMainThread() {
    const ms = numberOption(options.block);
    if (!ms) return;
    const end = performance.now() + ms;
    while (performance.now() < end) {
      // Chiếm main thread thay cho xử lý DOM nặng
    }
    writeLog('Chiếm main thread ' + ms + 'ms');
  }

  // ---- Màn hình ----
  function dataRowsHtml() {
    const rows = numberOption(options.rows);
    let html = '';
    for (let i = 1; i <= rows; i++) {
      html += '<tr><td>' + i + '</td><td>Mục kiểm tra ' + i + '</td><td>' + (opNo * 1000 + i) + '</td></tr>';
    }
    return '<h3>Dữ liệu tham khảo (' + rows + ' dòng)</h3><table class="data-rows"><tr><th>No</th><th>Mục</th><th>Giá trị</th></tr>' + html + '</table>';
  }

  function headHtml(title, screenId) {
    return '<div class="screen-head"><h2>' + title + '</h2>' +
      '<span class="screen-id">' + screenId + '</span>' +
      '<span class="op-no">Thao tác #' + opNo + '</span>' +
      '<span class="rendered-at">Vẽ lúc ' + now() + '</span></div>';
  }

  const SCREENS = {
    FDGIK211103: () =>
      headHtml('Trước khi khai báo', 'FDGIK211103') +
      '<p>Tiếp theo, hệ thống sẽ hỏi về tình trạng sức khỏe của khách hàng.</p>' +
      '<p>Vui lòng trả lời chính xác. Câu trả lời được dùng để xét duyệt hợp đồng.</p>' +
      '<div class="buttons"><button data-action="start">Bắt đầu khai báo</button></div>' +
      dataRowsHtml(),

    FDGIK211104: () =>
      headHtml('Khai báo - Câu hỏi 1', 'FDGIK211104') +
      '<div class="question">Câu hỏi 1</div>' +
      '<p>Trong 3 năm gần đây, khách hàng có khám, xét nghiệm, điều trị hoặc dùng thuốc do bệnh/chấn thương trong [Bảng 1] không?</p>' +
      '<div class="choices">' +
      '<button data-action="answer" data-value="no" class="' + (selectedAnswer === 'no' ? 'selected' : '') + '">Không</button>' +
      '<button data-action="answer" data-value="yes" class="' + (selectedAnswer === 'yes' ? 'selected' : '') + '">Có</button>' +
      '<button data-action="kana">Nhập 50 âm</button>' +
      '</div>' +
      (table1Visible
        ? '<div class="table1"><div class="table1-head"><span>[Bảng 1] Sau khi xem xong, nhấn button "Đóng [Bảng 1]".</span>' +
          '<button data-action="close-table1">Đóng [Bảng 1]</button></div>' +
          '<table><tr><th>① Tim hoặc huyết áp</th><td>Cao huyết áp, đau thắt ngực, nhồi máu cơ tim, bệnh van tim</td></tr>' +
          '<tr><th>② Phổi hoặc phế quản</th><td>Viêm phổi, lao, hen suyễn, viêm phế quản mạn</td></tr>' +
          '<tr><th>③ Dạ dày hoặc ruột</th><td>Loét dạ dày, tá tràng, viêm loét đại tràng</td></tr>' +
          '<tr><th>④ Gan, túi mật hoặc tụy</th><td>Viêm gan, xơ gan, sỏi mật, viêm tụy</td></tr>' +
          '<tr><th>⑤ Thận hoặc nước tiểu bất thường</th><td>Viêm thận, hội chứng thận hư, suy thận, sỏi niệu quản</td></tr></table></div>'
        : '<div class="buttons"><button data-action="open-table1">Hiển thị [Bảng 1]</button></div>') +
      '<div class="buttons">' +
      '<button data-action="cancel">Hủy</button>' +
      '<button data-action="back">Quay lại</button>' +
      '<button data-action="next">Tiếp theo</button></div>' +
      dataRowsHtml(),

    FDGIK211105: () =>
      headHtml('Khai báo - Câu hỏi 2', 'FDGIK211105') +
      '<div class="question">Câu hỏi 2</div>' +
      '<p>Hiện tại khách hàng có đang nằm viện không? Hoặc trong 3 tháng gần đây, bác sĩ có đề nghị nhập viện/phẫu thuật không?</p>' +
      '<div class="buttons">' +
      '<button data-action="back">Quay lại</button>' +
      '<button data-action="finish">Hoàn tất</button></div>' +
      dataRowsHtml(),
  };
  const NRI_SCREEN_IDS = Object.keys(SCREENS);

  function render(screenId) {
    currentScreen = screenId;
    appElement.innerHTML = SCREENS[screenId]();
    writeLog('Vẽ màn hình: ' + screenId + ' (thao tác #' + opNo + ')');
  }

  // ---- Router (mô phỏng push / afterEach của vue-router) ----
  function screenFromUrl() {
    const screenId = new URLSearchParams(location.search).get('screen');
    return NRI_SCREEN_IDS.includes(screenId) ? screenId : NRI_SCREEN_IDS[0];
  }

  // Source ⑤ main.js router.afterEach
  function afterEach(to, from) {
    history.pushState(null, null, null);
    if (from && NRI_SCREEN_IDS.includes(from)) {
      // Tắt shield
      sieldService(false);
    }
  }

  async function routerPush(screenId) {
    const from = currentScreen;
    // Giống vue-router: tải component của màn hình mới (lazy load) trước khi xác nhận chuyển màn hình
    const routeLoad = numberOption(options.routeLoad);
    if (routeLoad) await new Promise((resolve) => setTimeout(resolve, routeLoad));
    opNo++;
    history.pushState({ screen: screenId }, '', '?screen=' + screenId);
    afterEach(screenId, from);
    // Giống vue-router: vẽ màn hình mới sau afterEach
    queueMicrotask(() => {
      render(screenId);
      blockMainThread();
    });
  }

  window.addEventListener('popstate', () => {
    const screenId = screenFromUrl();
    if (screenId === currentScreen) return;
    const from = currentScreen;
    opNo++;
    afterEach(screenId, from);
    render(screenId);
  });

  // ---- Chuyển màn hình (source ①④ _clickInputOksJouhou) ----
  async function transition(screenId) {
    writeLog('Nhấn button → ' + screenId);
    // ② Check phía SPA, ③ check phía API (④ bật shield → ⑤ gửi → ⑥ tắt shield)
    if (options.apiShield.checked) {
      const resp = await httpServiceWithShield('Check trước khi chuyển màn hình');
      if (!resp) return;
    }
    // ⑧ Bật shield trước khi chuyển màn hình (tắt ở ⑨ afterEach)
    sieldService(true);
    await routerPush(screenId);
  }

  // ---- Modal nhập 50 âm ----
  function buildKanaKeys() {
    const keys = document.getElementById('kana-keys');
    for (const char of KANA) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = char;
      button.addEventListener('click', () => { kanaInput.value += char; });
      keys.appendChild(button);
    }
  }

  async function openKana() {
    await httpServiceWithShield('Mở nhập 50 âm');
    opNo++;
    kanaInput.value = '';
    kanaModal.classList.remove('hide');
    render(currentScreen);
  }

  async function closeKana() {
    await httpServiceWithShield('Đóng nhập 50 âm');
    opNo++;
    kanaModal.classList.add('hide');
    render(currentScreen);
  }

  // ---- Bảng 1 ----
  async function toggleTable1(visible) {
    await httpServiceWithShield(visible ? 'Hiển thị [Bảng 1]' : 'Đóng [Bảng 1]');
    opNo++;
    table1Visible = visible;
    render(currentScreen);
  }

  appElement.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    switch (button.dataset.action) {
      case 'start': transition('FDGIK211104'); break;
      case 'next': transition('FDGIK211105'); break;
      case 'cancel':
      case 'finish': transition('FDGIK211103'); break;
      case 'back': history.back(); break;
      case 'answer':
        selectedAnswer = button.dataset.value;
        render(currentScreen);
        break;
      case 'kana': openKana(); break;
      case 'close-table1': toggleTable1(false); break;
      case 'open-table1': toggleTable1(true); break;
    }
  });
  document.getElementById('kana-close').addEventListener('click', closeKana);

  // ---- Tự chạy: lặp lại thao tác để quay video bằng chứng ----
  // Trong lúc chờ không thay đổi gì trên trang (không đếm ngược), để không che mất lỗi.
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Chọn thao tác tiếp theo theo màn hình hiện tại: 103 → 104 → (Bảng 1, 50 âm) → 105 → 103
  function nextAutoAction() {
    if (currentScreen === 'FDGIK211103') return { label: 'Bắt đầu khai báo', run: () => transition('FDGIK211104') };
    if (currentScreen === 'FDGIK211105') return { label: 'Hoàn tất', run: () => transition('FDGIK211103') };
    if (options.autoFull.checked && autoSubStep < 4) {
      const step = autoSubStep++;
      if (step === 0 || step === 1) {
        return { label: table1Visible ? 'Đóng [Bảng 1]' : 'Hiển thị [Bảng 1]', run: () => toggleTable1(!table1Visible) };
      }
      if (step === 2) return { label: 'Mở nhập 50 âm', run: openKana };
      return { label: 'Đóng nhập 50 âm', run: closeKana };
    }
    autoSubStep = 0;
    return { label: 'Tiếp theo', run: () => transition('FDGIK211105') };
  }

  function setAutoRunning(running) {
    autoRunning = running;
    autoToggleButton.classList.toggle('running', running);
    autoToggleButton.textContent = running ? 'Dừng tự chạy (phím R)' : 'Bắt đầu tự chạy (phím R)';
  }

  async function startAutoRun() {
    const runId = ++autoRunId;
    const count = numberOption(options.autoCount);
    const isActive = () => autoRunning && runId === autoRunId;
    setAutoRunning(true);
    autoSubStep = 0;
    writeLog('Tự chạy: bắt đầu sau ' + numberOption(options.autoDelay) + 's, số lần ' + (count || 'không giới hạn'));
    await sleep(numberOption(options.autoDelay) * 1000);
    for (let i = 1; isActive() && (!count || i <= count); i++) {
      const action = nextAutoAction();
      writeLog('Tự chạy lần ' + i + ': ' + action.label);
      await action.run();
      const jitter = numberOption(options.autoJitter);
      const wait = Math.max(1, numberOption(options.autoInterval) + (Math.random() * 2 - 1) * jitter);
      await sleep(wait * 1000);
    }
    if (runId === autoRunId) {
      setAutoRunning(false);
      writeLog('Tự chạy: kết thúc');
    }
  }

  function stopAutoRun() {
    autoRunId++;
    setAutoRunning(false);
    writeLog('Tự chạy: dừng');
  }

  function toggleAutoRun() {
    if (autoRunning) stopAutoRun();
    else startAutoRun();
  }

  autoToggleButton.addEventListener('click', toggleAutoRun);
  // Phím R: bắt đầu / dừng mà không cần dùng chuột
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'r' && event.key !== 'R') return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target.closest('input, select, textarea')) return;
    toggleAutoRun();
  });

  // ---- Đối sách A: keep-alive (code đề xuất ở #4179 note_1555368) ----
  function stopFrameKeepAlive() {
    document.getElementById(KEEPALIVE_ID)?.remove();
  }

  function startFrameKeepAlive(mode) {
    stopFrameKeepAlive();
    const el = document.createElement('div');
    el.id = KEEPALIVE_ID;
    el.setAttribute('aria-hidden', 'true');
    const style = el.style;
    style.position = 'fixed';
    style.bottom = '0';
    style.right = '0';
    style.width = '1px';
    style.height = '1px';
    style.overflow = 'hidden';
    style.pointerEvents = 'none';
    style.zIndex = mode === 'front' ? '2147483647' : '-1';
    style.opacity = '0.01';
    style.background = '#000';
    style.animation = 'cob-keepalive 2s infinite';
    document.body.appendChild(el);
  }

  function applyKeepAlive() {
    const mode = options.keepalive.value;
    if (mode === 'off') stopFrameKeepAlive();
    else startFrameKeepAlive(mode);
    writeLog('Keep-alive: ' + mode);
  }

  // ---- Khởi tạo ----
  loadSettings();
  for (const control of Object.values(options)) {
    control.addEventListener('change', () => {
      saveSettings();
      if (control === options.keepalive) applyKeepAlive();
    });
  }
  document.getElementById('clear-log').addEventListener('click', () => { logElement.textContent = ''; });
  togglePanelButton.addEventListener('click', () => setPanelCollapsed(!panelCollapsed));
  try { setPanelCollapsed(localStorage.getItem(PANEL_COLLAPSED_KEY) === '1'); } catch (e) { /* không dùng được storage */ }

  buildKanaKeys();
  applyKeepAlive();
  render(screenFromUrl());
  history.replaceState({ screen: currentScreen }, '', '?screen=' + currentScreen);
})();
