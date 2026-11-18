(() => {
  const cards = [...document.querySelectorAll('.camera')];
  const dialog = document.querySelector('#camera-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogDirection = document.querySelector('#dialog-direction');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogCount = document.querySelector('#dialog-count');
  const prev = document.querySelector('#prev-camera');
  const next = document.querySelector('#next-camera');
  let activeCard;
  let triggerCard;
  let pointerDownOnBackdrop = false;

  function watchImage(img) {
    const frame = img.parentElement;
    function update() {
      frame.classList.toggle('is-unavailable', img.complete && img.naturalWidth === 0);
    }
    img.addEventListener('load', update);
    img.addEventListener('error', update);
    if (img.hasAttribute('src') && img.complete) update();
  }

  function requestImage(img, url) {
    img.parentElement.classList.remove('is-unavailable');
    img.src = url;
  }

  function showCamera(card) {
    activeCard = card;
    const title = card.querySelector('.camera-title').textContent;
    const direction = card.querySelector('.camera-direction')?.textContent || '';
    const index = cards.indexOf(card);
    dialogTitle.textContent = title;
    dialogDirection.textContent = direction;
    dialogDirection.hidden = !direction;
    dialogImage.alt = direction ? title + ' - ' + direction : title;
    requestImage(dialogImage, card.querySelector('img').src);
    dialogCount.textContent = (index + 1) + ' av ' + cards.length;
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  }

  function moveCamera(step) {
    const card = cards[cards.indexOf(activeCard) + step];
    if (card) showCamera(card);
  }

  function reloadCamera() {
    const img = activeCard.querySelector('img');
    const url = new URL(img.src);
    url.searchParams.set('oppdatert', Date.now());
    requestImage(img, url);
    requestImage(dialogImage, url);
  }

  // The article wrapper listens only to this iframe and uses the same
  // temporary full-viewport layout as the sports embeds.
  const embedded = window.parent !== window;
  function notifyHost(type, detail = {}) {
    if (embedded) window.parent.postMessage({ widget: 'bygdebladet-trafikk', type, ...detail }, '*');
  }

  function reportHeight() {
    notifyHost('height', { height: Math.ceil(document.body.getBoundingClientRect().height) });
  }

  if (embedded) {
    new ResizeObserver(reportHeight).observe(document.body);
    window.addEventListener('message', event => {
      if (event.source === window.parent && event.data?.widget === 'bygdebladet-trafikk' &&
          event.data.type === 'measure') requestAnimationFrame(reportHeight);
    });
  }

  for (const card of cards) {
    watchImage(card.querySelector('img'));
    card.addEventListener('click', () => {
      triggerCard = card;
      showCamera(card);
      dialog.showModal();
      notifyHost('open');
    });
  }

  watchImage(dialogImage);
  document.querySelector('#refresh-camera').addEventListener('click', reloadCamera);
  dialog.querySelector('.close-button').addEventListener('click', () => dialog.close());
  prev.addEventListener('click', () => moveCamera(-1));
  next.addEventListener('click', () => moveCamera(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') moveCamera(-1);
    if (event.key === 'ArrowRight') moveCamera(1);
  });
  dialog.addEventListener('pointerdown', event => { pointerDownOnBackdrop = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && pointerDownOnBackdrop) dialog.close();
    pointerDownOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    notifyHost('close');
    triggerCard?.focus({ preventScroll: true });
    triggerCard = undefined;
    activeCard = undefined;
  });
})();
