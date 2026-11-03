(function () {
  const MAX_LOG_LINES = 300;
  const MAX_DISPLAY_LENGTH = 60;
  const HIDDEN_ATTRIBUTES = ['id', 'name', 'class', 'style'];
  const LOG_COLLAPSED_KEY = 'input-attributes-form:log-collapsed';
  const logElement = document.getElementById('log');
  const logPanel = logElement.closest('aside');
  const toggleLogButton = document.getElementById('toggle-log');
  const unseenElement = document.getElementById('log-unseen');
  let logCollapsed = false;
  let unseenCount = 0;

  function now() {
    const date = new Date();
    return date.toLocaleTimeString('ja-JP', { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  }

  // Long values (e.g. 10,000 characters) are shortened in the log and under the controls.
  function shorten(text) {
    return text.length > MAX_DISPLAY_LENGTH ? text.slice(0, MAX_DISPLAY_LENGTH) + '…' : text;
  }

  function displayValue(control) {
    if (control.type === 'checkbox' || control.type === 'radio') return control.checked ? 'checked' : 'unchecked';
    if (control.type === 'password') return shorten('•'.repeat(control.value.length));
    return shorten(control.value);
  }

  // A text of the given length (UTF-16 code units = String.length), easy to check by its end.
  function makeText(length) {
    let text = '';
    while (text.length < length) text += '0123456789';
    return text.slice(0, length);
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
    if (logCollapsed) {
      unseenCount += 1;
      unseenElement.textContent = '+' + unseenCount;
      unseenElement.hidden = false;
    }
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

  // Collapse / expand the log panel; the choice is remembered per browser.
  function setLogCollapsed(collapsed) {
    logCollapsed = collapsed;
    logPanel.classList.toggle('collapsed', collapsed);
    logPanel.parentElement.classList.toggle('log-collapsed', collapsed);
    toggleLogButton.setAttribute('aria-expanded', String(!collapsed));
    if (!collapsed) {
      unseenCount = 0;
      unseenElement.hidden = true;
    }
    try { localStorage.setItem(LOG_COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (error) { /* storage unavailable */ }
  }

  toggleLogButton.addEventListener('click', function () {
    setLogCollapsed(!logCollapsed);
  });

  try { setLogCollapsed(localStorage.getItem(LOG_COLLAPSED_KEY) === '1'); } catch (error) { /* storage unavailable */ }

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
      .map(function (attribute) { return attribute.name + '="' + shorten(attribute.value) + '"'; })
      .join(' ');
    const validity = validityText(control);
    const stateClass = validity.indexOf('NG') === 0 ? 'ng' : 'ok';
    meta.innerHTML = '';
    const tag = document.createElement('code');
    tag.textContent = '<' + control.tagName.toLowerCase() + (attributes ? ' ' + attributes : '') + '>';
    const state = document.createElement('div');
    state.className = 'state';
    state.innerHTML = i18n.t('hostValue') + '<code></code>' + i18n.t('charCount', control.value.length) +
      (validity ? ' &nbsp; ' + i18n.t('validity') + '<span class="' + stateClass + '"></span>' : '');
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
  function checkC6() {
    c6.setCustomValidity(c6.value.indexOf('NG') >= 0 ? i18n.t('c6Error') : '');
    renderMeta(c6);
  }
  c6.addEventListener('input', checkC6);

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
      if (form.reportValidity()) window.writeLog('change', form.id, i18n.t('allValid'));
    });
  });

  // D4: same-origin iframe (srcdoc inherits the origin of this page). Built again when the language changes.
  const frame = document.getElementById('d4-frame');
  function buildFrame() {
    frame.srcdoc = [
      '<!doctype html><html lang="' + i18n.getLanguage() + '"><head><meta charset="utf-8">',
      '<style>body{font-family:"Segoe UI",Roboto,Arial,sans-serif;font-size:18px;margin:12px}',
      'input{font-size:18px;padding:8px;width:300px;max-width:100%;box-sizing:border-box;border:1px solid #cbd2d9;border-radius:6px}',
      'input:invalid{border-color:#c62828}.state{font-size:14px;color:#616e7c;margin-top:4px}</style></head><body>',
      '<label for="d4">' + i18n.t('d4Label') + '</label><br>',
      '<input id="d4" type="number" min="1" max="10" required>',
      '<div class="state" id="d4-state"></div>',
      '<script>',
      'var input=document.getElementById("d4"),state=document.getElementById("d4-state");',
      'function render(){state.textContent=parent.i18n.t("hostValue")+input.value+"  "+parent.i18n.t("validity")+',
      '(input.validity.valid?"OK":"NG: "+input.validationMessage);}',
      '["input","change"].forEach(function(type){input.addEventListener(type,function(){render();',
      'parent.writeLog(type,"D4",\'value="\'+input.value+\'"\'+" "+(input.validity.valid?"OK":"NG: "+input.validationMessage));});});',
      'render();',
      '<\/script></body></html>'
    ].join('');
  }

  // A15: an attribute value over 1,000 characters (the extension leaves it out)
  const a15 = document.getElementById('a15');
  function setLongPlaceholder() {
    a15.placeholder = i18n.t('longPlaceholder') + makeText(1001);
    renderMeta(a15);
  }

  // B6 / B7 / B9 / S10: a current value set by the page's script (over maxlength, many lines, 10,000 characters)
  document.querySelectorAll('[data-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      const target = document.getElementById(button.dataset.target);
      if (button.dataset.setLines) {
        const lines = [];
        for (let i = 1; i <= Number(button.dataset.setLines); i++) lines.push(i18n.t('lineLabel', i));
        target.value = lines.join('\n');
      } else {
        target.value = button.dataset.setLength === '7' ? 'abcdefg' : makeText(Number(button.dataset.setLength));
      }
      renderMeta(target);
      window.writeLog('click', caseOf(target), i18n.t('setByScript') + ' len=' + target.value.length);
    });
  });

  // F: controls in a shadow DOM (the click response of the extension has no attributes for them)
  const shadow = document.getElementById('f-shadow').attachShadow({ mode: 'open' });
  shadow.innerHTML = [
    '<style>label{display:block;font-weight:bold;margin:8px 0 4px}',
    'input{font-size:18px;padding:8px;width:300px;max-width:100%;box-sizing:border-box;border:1px solid #cbd2d9;border-radius:6px}</style>',
    '<label for="f1">F1 tel・maxlength=5（type のみ反映 — S-18）</label>',
    '<input id="f1" data-case="F1" type="tel" maxlength="5" placeholder="反映されない">',
    '<label for="f2">F2 secure（通常の経路 — S-35）</label>',
    '<input id="f2" data-case="F2" type="text" secure value="shadow 内の値">'
  ].join('');
  i18n.addRoot(shadow);
  shadow.querySelectorAll('input').forEach(function (input) {
    ['input', 'change'].forEach(function (type) {
      input.addEventListener(type, function () {
        window.writeLog(type, input.dataset.case, 'value="' + shorten(input.value) + '" len=' + input.value.length);
      });
    });
  });

  // G: long texts for the guest to paste (the guest opens this page on its own device)
  const copyText = document.getElementById('copy-text');
  const copyStatus = document.getElementById('copy-status');
  document.querySelectorAll('[data-copy-length]').forEach(function (button) {
    button.addEventListener('click', function () {
      const length = Number(button.dataset.copyLength);
      copyText.value = makeText(length);
      copyText.select();
      const done = function () { copyStatus.textContent = i18n.t('copied', length.toLocaleString()); };
      const fallback = function () {
        copyText.select();
        copyStatus.textContent = document.execCommand('copy') ?
          i18n.t('copied', length.toLocaleString()) : i18n.t('copyManually');
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText.value).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  // Extension marker (co-browser-marker) inserted by the content script
  function showExtensionStatus() {
    const marker = document.getElementById('co-browser-marker');
    const status = document.getElementById('extension-status');
    status.textContent = marker ?
      i18n.t('extensionFound', marker.getAttribute('version') || '?') : i18n.t('extensionNotFound');
  }
  setTimeout(showExtensionStatus, 1000);

  // Language (Japanese / Vietnamese): the texts rendered here follow each change
  i18n.onChange(function () {
    controls.forEach(renderMeta);
    if (c6.value) checkC6();
    setLongPlaceholder();
    buildFrame();
    showExtensionStatus();
  });
  i18n.start();
})();
