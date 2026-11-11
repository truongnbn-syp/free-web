(function () {
  const MAX_LOG_LINES = 200;
  const urlInput = document.getElementById('target-url');
  const logElement = document.getElementById('log');

  function now() {
    const date = new Date();
    return date.toLocaleTimeString('ja-JP', { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  }

  function writeLog(className, text) {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = now() + ' ' + text;
    logElement.prepend(line);
    while (logElement.childElementCount > MAX_LOG_LINES) logElement.lastElementChild.remove();
  }

  // Without a scheme, window.open would resolve the text against this page's URL.
  function toAbsoluteUrl(text) {
    return /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : 'https://' + text;
  }

  document.getElementById('open-url').addEventListener('click', function (event) {
    const text = urlInput.value.trim();
    if (!text) {
      writeLog('ng', 'click trusted=' + event.isTrusted + ' → URL が未入力のため開きません');
      urlInput.focus();
      return;
    }
    const url = toAbsoluteUrl(text);
    // Without 'noopener' so that the return value tells whether the popup was blocked.
    const opened = window.open(url, '_blank');
    if (opened) {
      opened.opener = null;
      writeLog('ok', 'click trusted=' + event.isTrusted + ' → 新しいタブで開きました: ' + url);
    } else {
      writeLog('ng', 'click trusted=' + event.isTrusted + ' → 新しいタブを開けませんでした（ポップアップブロック）: ' + url);
    }
  });

  document.getElementById('clear-log').addEventListener('click', function () {
    logElement.textContent = '';
  });
})();
