(() => {
  const cards = [...document.querySelectorAll('.camera')];
  const filters = [...document.querySelectorAll('.filters button')];
  const count = document.querySelector('#result-count');
  const dialog = document.querySelector('#camera-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogDirection = document.querySelector('#dialog-direction');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogCount = document.querySelector('#dialog-count');
  const prev = document.querySelector('#prev-camera');
  const next = document.querySelector('#next-camera');
  const refreshStatus = document.querySelector('#refresh-status');
  let visibleCards = cards;
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
    const index = visibleCards.indexOf(card);
    dialogTitle.textContent = title;
    dialogDirection.textContent = direction;
    dialogDirection.hidden = !direction;
    dialogImage.alt = direction ? title + ' - ' + direction : title;
    requestImage(dialogImage, card.querySelector('img').src);
    dialogCount.textContent = (index + 1) + ' av ' + visibleCards.length;
    prev.disabled = index === 0;
    next.disabled = index === visibleCards.length - 1;
  }

  function moveCamera(step) {
    const card = visibleCards[visibleCards.indexOf(activeCard) + step];
    if (card) showCamera(card);
  }

  function filterBy(button) {
    const area = button.dataset.area;
    for (const item of filters) item.setAttribute('aria-pressed', item === button);
    for (const card of cards) card.hidden = area !== 'alle' && card.dataset.area !== area;
    visibleCards = cards.filter(card => !card.hidden);
    count.textContent = area === 'alle'
      ? cards.length + ' kamera'
      : visibleCards.length + ' av ' + cards.length + ' kamera';
  }

  function reloadImages(selection) {
    const timestamp = Date.now();
    for (const card of selection) {
      const img = card.querySelector('img');
      const url = new URL(img.src);
      url.searchParams.set('oppdatert', timestamp);
      requestImage(img, url);
      if (dialog.open && card === activeCard) requestImage(dialogImage, url);
    }
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
  for (const filter of filters) filter.addEventListener('click', () => filterBy(filter));
  filterBy(filters[0]);
  count.hidden = false;
  document.querySelector('.toolbar').hidden = false;

  document.querySelector('#refresh-grid').addEventListener('click', () => {
    reloadImages(visibleCards);
    refreshStatus.textContent = 'Hentar kamerabileta på nytt.';
  });
  document.querySelector('#refresh-camera').addEventListener('click', () => reloadImages([activeCard]));
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
