(function () {
  const MAX_LOG_LINES = 300;
  const HIDDEN_ATTRIBUTES = ['id', 'name', 'class', 'style'];
  const logElement = document.getElementById('log');

  function now() {
    const date = new Date();
    return date.toLocaleTimeString('vi-VN', { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  }

  function displayValue(control) {
    if (control.type === 'checkbox' || control.type === 'radio') return control.checked ? 'checked' : 'unchecked';
    if (control.type === 'password') return '•'.repeat(control.value.length);
    return control.value;
  }

  function caseOf(control) {
    const field = control.closest('.field');
    return field ? field.dataset.case : (control.dataset.case || control.id);
  }

  function validityText(control) {
    if (!control.willValidate) return '';
    return control.validity.valid ? 'OK' : 'NG: ' + control.validationMessage;
  }

  // Shared with the iframe (same origin) so that its events are in the same log.
  window.writeLog = function (type, caseId, detail) {
    const line = document.createElement('div');
    line.className = 'ev-' + type;
    line.textContent = now() + ' [' + caseId + '] ' + type + (detail ? ' ' + detail : '');
    logElement.prepend(line);
    while (logElement.childElementCount > MAX_LOG_LINES) logElement.lastElementChild.remove();
  };

  function logControlEvent(event) {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement ||
      control instanceof HTMLSelectElement)) return;
    let detail = '';
    if (event.type === 'keydown') {
      detail = 'key="' + event.key + '" trusted=' + event.isTrusted;
    } else if (event.type === 'click') {
      detail = 'trusted=' + event.isTrusted;
    } else {
      const validity = validityText(control);
      detail = 'value="' + displayValue(control) + '" len=' + control.value.length + (validity ? ' ' + validity : '');
    }
    window.writeLog(event.type, caseOf(control), detail);
  }

  // Bubble phase: the page's own listeners (e.g. setCustomValidity of C6) run first.
  ['input', 'change', 'keydown', 'click'].forEach(function (type) {
    document.addEventListener(type, logControlEvent);
  });

  document.getElementById('clear-log').addEventListener('click', function () {
    logElement.textContent = '';
  });

  // Attribute list and live state under each control
  function renderMeta(control) {
    const field = control.closest('.field');
    if (!field || field.dataset.case === 'A12-2') return;
    let meta = field.querySelector('.meta.auto');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'meta auto';
      field.appendChild(meta);
    }
    const attributes = Array.from(control.attributes)
      .filter(function (attribute) { return HIDDEN_ATTRIBUTES.indexOf(attribute.name) < 0; })
      .map(function (attribute) { return attribute.name + '="' + attribute.value + '"'; })
      .join(' ');
    const validity = validityText(control);
    const stateClass = validity.indexOf('NG') === 0 ? 'ng' : 'ok';
    meta.innerHTML = '';
    const tag = document.createElement('code');
    tag.textContent = '<' + control.tagName.toLowerCase() + (attributes ? ' ' + attributes : '') + '>';
    const state = document.createElement('div');
    state.className = 'state';
    state.innerHTML = 'Giá trị trên host: <code></code> (' + control.value.length + ' ký tự)' +
      (validity ? ' &nbsp; Kiểm tra: <span class="' + stateClass + '"></span>' : '');
    state.querySelector('code').textContent = displayValue(control);
    if (validity) state.querySelector('span').textContent = validity;
    meta.appendChild(tag);
    meta.appendChild(state);
  }

  const controls = document.querySelectorAll('.field input, .field textarea, .field select');
  controls.forEach(function (control) {
    renderMeta(control);
    ['input', 'change'].forEach(function (type) {
      control.addEventListener(type, function () { renderMeta(control); });
    });
  });

  // C6: a check of the page itself (setCustomValidity on input)
  const c6 = document.getElementById('c6');
  c6.addEventListener('input', function () {
    c6.setCustomValidity(c6.value.indexOf('NG') >= 0 ? 'Không được nhập giá trị chứa "NG" (kiểm tra riêng của trang)' : '');
    renderMeta(c6);
  });

  // D1: a counter computed by the page on input
  const d1 = document.getElementById('d1');
  const d1Counter = document.getElementById('d1-counter');
  d1.addEventListener('input', function () {
    d1Counter.textContent = String(30 - d1.value.length);
  });

  // D2: the page formats the value on change
  const d2 = document.getElementById('d2');
  const d2Counter = document.getElementById('d2-counter');
  let d2Changes = 0;
  d2.addEventListener('change', function () {
    d2Changes += 1;
    d2Counter.textContent = String(d2Changes);
    d2.value = d2.value.toUpperCase();
    renderMeta(d2);
  });

  // D3: the page blocks non-digit keys on keydown
  const d3 = document.getElementById('d3');
  d3.addEventListener('keydown', function (event) {
    const isControlKey = event.key.length > 1 || event.ctrlKey || event.metaKey;
    if (!isControlKey && !/^[0-9]$/.test(event.key)) event.preventDefault();
  });

  // B / C: check on the host with the browser's own bubble, without leaving the page
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.reportValidity()) window.writeLog('change', form.id, 'tất cả hợp lệ');
    });
  });

  // D4: same-origin iframe (srcdoc inherits the origin of this page)
  const frame = document.getElementById('d4-frame');
  frame.srcdoc = [
    '<!doctype html><html lang="vi"><head><meta charset="utf-8">',
    '<style>body{font-family:"Segoe UI",Roboto,Arial,sans-serif;font-size:18px;margin:12px}',
    'input{font-size:18px;padding:8px;width:300px;max-width:100%;box-sizing:border-box;border:1px solid #cbd2d9;border-radius:6px}',
    'input:invalid{border-color:#c62828}.state{font-size:14px;color:#616e7c;margin-top:4px}</style></head><body>',
    '<label for="d4">Số từ 1 đến 10 (bắt buộc)</label><br>',
    '<input id="d4" type="number" min="1" max="10" required>',
    '<div class="state" id="d4-state"></div>',
    '<script>',
    'var input=document.getElementById("d4"),state=document.getElementById("d4-state");',
    'function render(){state.textContent="Giá trị trên host: "+input.value+"  Kiểm tra: "+(input.validity.valid?"OK":"NG: "+input.validationMessage);}',
    '["input","change"].forEach(function(type){input.addEventListener(type,function(){render();',
    'parent.writeLog(type,"D4",\'value="\'+input.value+\'"\'+" "+(input.validity.valid?"OK":"NG: "+input.validationMessage));});});',
    'render();',
    '<\/script></body></html>'
  ].join('');

  // Extension marker (co-browser-marker) inserted by the content script
  function showExtensionStatus() {
    const marker = document.getElementById('co-browser-marker');
    const status = document.getElementById('extension-status');
    status.textContent = marker ? 'Đã phát hiện (v' + (marker.getAttribute('version') || '?') + ')' : 'Không phát hiện';
  }
  showExtensionStatus();
  setTimeout(showExtensionStatus, 1000);
})();
