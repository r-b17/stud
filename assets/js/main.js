// Interactions: the mouth-opening hero, typing intro, stacked cards, eyes that follow the pointer,
// blinking, menu, notes carousel, count-ups and a contact form that opens the email app.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ── menu ── */
  var menuBtn = document.querySelector('.bar-menu'), menu = document.getElementById('menu');
  function setMenu(open) {
    menu.hidden = !open; menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); } else menuBtn.focus({ preventScroll: true });
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.querySelector('.menu-close').addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  }

  /* ── eyes follow the pointer, and blink ── */
  var faces = Array.prototype.slice.call(document.querySelectorAll('.face'));
  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      faces.forEach(function (f) {
        var r = f.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !r.width) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height * 0.46;
        var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 300) * 5;
        f.querySelectorAll('.pupil').forEach(function (p) { p.style.transform = 'translate(' + (dx / d * m).toFixed(2) + 'px,' + (dy / d * m).toFixed(2) + 'px)'; });
      });
    }, { passive: true });
    (function blink() {
      setTimeout(function () {
        faces.forEach(function (f) { f.classList.add('blink'); });
        setTimeout(function () { faces.forEach(function (f) { f.classList.remove('blink'); }); }, 140);
        blink();
      }, 2200 + Math.random() * 2800);
    })();
  }

  /* ── typing intro: split into characters ── */
  var typeEl = document.querySelector('[data-type]'), chars = [];
  if (typeEl) {
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          Array.prototype.forEach.call(n.textContent, function (ch) {
            var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.appendChild(s); chars.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) split(n);
      });
    })(typeEl);
    typeEl.setAttribute('aria-label', typeEl.textContent);
  }

  /* ── hero: mouth opens, black portal grows from it ── */
  var hero = document.querySelector('.hero'), wrap = document.querySelector('.face-wrap'), portal = document.querySelector('.portal');
  var heroSvg = document.querySelector('.face-hero'), mouth = heroSvg && heroSvg.querySelector('.mouth'), smile = heroSvg && heroSvg.querySelector('.smile');
  var marquee = document.querySelector('.marquee');
  var animate = !reduce && hero && wrap && portal && mouth && typeof CSS !== 'undefined' && CSS.supports('clip-path', 'circle(1px at 1px 1px)');
  var geo = null;

  function measure() {
    wrap.style.setProperty('--s', 1); wrap.style.setProperty('--tx', '0px'); wrap.style.setProperty('--ty', '0px');
    var pin = portal.parentElement.getBoundingClientRect(), r = wrap.getBoundingClientRect(), k = r.width / 400;
    var mx = r.left + 200 * k, my = r.top + 266 * k;                 // mouth centre on screen at scale 1
    wrap.style.setProperty('--ox', (mx - r.left) + 'px'); wrap.style.setProperty('--oy', (my - r.top) + 'px');
    var vw = pin.width, vh = pin.height, cx = vw / 2, cy = vh / 2;
    var cover = Math.hypot(vw / 2, vh / 2) * 1.08;
    geo = { k: k, mx: mx - pin.left, my: my - pin.top, cx: cx, cy: cy, sEnd: Math.max(2, cover / (0.9 * 67 * k)) };
  }

  var last = -1;
  function update() {
    var rect = hero.getBoundingClientRect(), range = rect.height - innerHeight;
    var p = clamp(-rect.top / (range || 1), 0, 1);
    document.body.classList.toggle('past-hero', p >= 0.98 || rect.bottom < innerHeight * 0.5);
    if (Math.abs(p - last) < 0.0005) return; last = p;
    var a = clamp(p / 0.1, 0, 1), b = clamp((p - 0.1) / 0.4, 0, 1);
    var rx = 12 * a + 58 * b, ry = 14 * a + 62 * b;
    mouth.setAttribute('rx', rx.toFixed(2)); mouth.setAttribute('ry', ry.toFixed(2));
    smile.style.opacity = String(1 - a);
    var eb = b * b * (3 - 2 * b), s = 1 + (geo.sEnd - 1) * Math.pow(b, 3);
    var tx = (geo.cx - geo.mx) * eb, ty = (geo.cy - geo.my) * eb;
    wrap.style.setProperty('--s', s.toFixed(4)); wrap.style.setProperty('--tx', tx.toFixed(1) + 'px'); wrap.style.setProperty('--ty', ty.toFixed(1) + 'px');
    root.classList.toggle('opening', p > 0.02);
    if (b >= 1) { portal.style.clipPath = 'none'; wrap.style.visibility = 'hidden'; }
    else {
      wrap.style.visibility = '';
      var rad = b > 0 ? Math.max(0, (Math.min(rx, ry) - 4) * geo.k * s * 0.97) : 0;
      portal.style.clipPath = 'circle(' + rad.toFixed(1) + 'px at ' + (geo.mx + tx).toFixed(1) + 'px ' + (geo.my + ty).toFixed(1) + 'px)';
    }
    var t = clamp((p - 0.5) / 0.32, 0, 1), n = Math.round(t * chars.length);
    for (var i = 0; i < chars.length; i++) chars[i].classList.toggle('on', i < n);
    if (marquee) marquee.classList.toggle('on', p > 0.78);
  }

  if (animate) {
    root.classList.add('anim');
    measure(); update();
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); stack(); }); } }, { passive: true });
    window.addEventListener('resize', function () { measure(); last = -1; update(); });
  } else {
    chars.forEach(function (c) { c.classList.add('on'); });
    document.body.classList.add('past-hero');
  }

  /* ── stacked cards: earlier cards shrink a little as the next one covers them ── */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  function stack() {
    if (reduce) return;
    cards.forEach(function (c, i) {
      var st = c.querySelector('.sticker'), r = c.getBoundingClientRect();
      if (st) st.style.setProperty('--rot', (-6 + (r.top / innerHeight) * 10).toFixed(2) + 'deg');
      var next = cards[i + 1]; if (!next) { c.style.transform = ''; return; }
      var nr = next.getBoundingClientRect(), k = clamp(1 - (nr.top - r.top) / (innerHeight * 0.75), 0, 1);
      c.style.transform = 'scale(' + (1 - 0.05 * k).toFixed(4) + ')';
    });
  }
  if (!animate && !reduce) window.addEventListener('scroll', function () { requestAnimationFrame(stack); }, { passive: true });
  stack();

  /* ── notes carousel ── */
  var notes = Array.prototype.slice.call(document.querySelectorAll('.note')), ni = 0, nIdx = document.getElementById('note-i');
  document.querySelectorAll('.note-nav .round').forEach(function (b) {
    b.addEventListener('click', function () {
      ni = (ni + (+b.getAttribute('data-dir')) + notes.length) % notes.length;
      notes.forEach(function (n, j) { n.hidden = j !== ni; });
      if (nIdx) nIdx.textContent = ni + 1;
    });
  });

  /* ── contact form → email app ── */
  var form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), topics = f.getAll('topic');
    var body = 'Name: ' + f.get('name') + '\nEmail: ' + f.get('email') + (f.get('company') ? '\nCompany: ' + f.get('company') : '') +
      (topics.length ? '\nInterested in: ' + topics.join(', ') : '') + '\n\n' + f.get('message');
    location.href = 'mailto:' + form.getAttribute('data-email') + '?subject=' + encodeURIComponent('Hello from your portfolio · ' + f.get('name')) + '&body=' + encodeURIComponent(body);
  });

  if (reduce || !('IntersectionObserver' in window)) return;

  /* ── reveal + count-ups ── */
  var revealEls = document.querySelectorAll('.about-text > *, .about-photo, .note-card, .faq-list details, .form, .services .wrap:first-child > *');
  revealEls.forEach(function (el, i) { el.setAttribute('data-reveal', ''); el.style.transitionDelay = (i % 4) * 60 + 'ms'; });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.15 });
  revealEls.forEach(function (el) { io.observe(el); });

  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, end = parseFloat(el.getAttribute('data-count')), t0 = null;
      (function step(ts) {
        if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1200);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { co.observe(el); });
})();
