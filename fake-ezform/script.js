(() => {
  const canvas = document.querySelector('#signatureCanvas');
  const preview = document.querySelector('#signaturePreview');
  const ctx = canvas.getContext('2d');
  const previewCtx = preview.getContext('2d');

  const signatureState = {
    strokes: [],
    currentStroke: null,
    submittedStrokes: [],
  };

  const setupContext = (context) => {
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#111';
  };

  setupContext(ctx);
  setupContext(previewCtx);

  const getPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // A press without movement is a dot of the signature.
  const drawDot = (context, point) => {
    context.beginPath();
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fillStyle = context.strokeStyle;
    context.fill();
  };

  const drawStrokeOnContext = (context, stroke) => {
    if (!stroke.length) return;
    if (stroke.length === 1) {
      drawDot(context, stroke[0]);
      return;
    }

    context.beginPath();
    context.moveTo(stroke[0].x, stroke[0].y);

    for (const point of stroke.slice(1)) {
      context.lineTo(point.x, point.y);
    }

    context.stroke();
    context.closePath();
  };

  const renderPreviewFromState = () => {
    previewCtx.clearRect(0, 0, preview.width, preview.height);
    setupContext(previewCtx);

    for (const stroke of signatureState.submittedStrokes) {
      drawStrokeOnContext(previewCtx, stroke);
    }
  };

  const startStroke = (event) => {
    const point = getPoint(event);

    signatureState.currentStroke = [point];
    signatureState.strokes.push(signatureState.currentStroke);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const moveStroke = (event) => {
    if (!signatureState.currentStroke) return;

    const point = getPoint(event);
    signatureState.currentStroke.push(point);

    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    event.preventDefault();
  };

  const endStroke = (event) => {
    if (!signatureState.currentStroke) return;

    ctx.closePath();
    if (signatureState.currentStroke.length === 1) {
      drawDot(ctx, signatureState.currentStroke[0]);
    }
    signatureState.currentStroke = null;

    event.preventDefault();
  };

  const submitSignature = () => {
    signatureState.submittedStrokes = signatureState.strokes.map((stroke) =>
      stroke.map((point) => ({ ...point }))
    );

    renderPreviewFromState();

    console.log('[fake-ezform] submitted from state', signatureState.submittedStrokes);
  };

  const clearSignature = () => {
    signatureState.strokes = [];
    signatureState.currentStroke = null;
    signatureState.submittedStrokes = [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    previewCtx.clearRect(0, 0, preview.width, preview.height);
  };

  canvas.addEventListener('pointerdown', startStroke);
  canvas.addEventListener('pointermove', moveStroke);
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  document.querySelector('#submitSignature').addEventListener('click', submitSignature);
  document.querySelector('#clearSignature').addEventListener('click', clearSignature);

  window.__fakeEzformSignatureState = signatureState;

  console.log('[fake-ezform] ready');
})();
