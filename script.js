(function () {
  'use strict';
  // "lite" (TV / hardware fraco / reduced-motion) reusa o gate reduce: desliga
  // canvas de partículas, spotlight, tilt 3D e botões magnéticos. Classe posta no
  // <head> antes do CSS (ver index.html).
  var lite = document.documentElement.classList.contains('lite');
  var reduce = lite || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- reveal ao scroll (com stagger) ---------- */
  (function () {
    var els = document.querySelectorAll('.reveal');
    // índice para stagger em grupos
    document.querySelectorAll('.cards .card, .steps .step').forEach(function (el, i) {
      el.style.setProperty('--i', (i % 6));
    });
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- progresso de scroll + nav sólida ---------- */
  var bar = document.querySelector('.scroll-progress');
  var nav = document.querySelector('.nav');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 12);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- spotlight + brilho dos cards ---------- */
  if (!reduce) {
    var root = document.documentElement;
    var cards = document.querySelectorAll('.card.spot');
    window.addEventListener('pointermove', function (e) {
      root.style.setProperty('--mx', e.clientX + 'px');
      root.style.setProperty('--my', e.clientY + 'px');
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          cards[i].style.setProperty('--cx', (e.clientX - r.left) + 'px');
          cards[i].style.setProperty('--cy', (e.clientY - r.top) + 'px');
        }
      }
    }, { passive: true });
  }

  /* ---------- tilt 3D do mockup ---------- */
  var tilt = document.getElementById('tilt');
  if (tilt && !reduce) {
    var hero = tilt.closest('.hero-art');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty('--ry', (-12 + px * 18) + 'deg');
      tilt.style.setProperty('--rx', (6 - py * 16) + 'deg');
    });
    hero.addEventListener('pointerleave', function () {
      tilt.style.setProperty('--ry', '-12deg');
      tilt.style.setProperty('--rx', '6deg');
    });
  }

  /* ---------- botões magnéticos ---------- */
  if (!reduce) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.28) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- contadores animados ---------- */
  (function () {
    var nums = document.querySelectorAll('.count');
    if (!nums.length) return;
    function run(el) {
      var to = parseInt(el.getAttribute('data-to'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = to + suffix; return; }
      var start = null, dur = 1400;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- canvas: rede de partículas ---------- */
  (function () {
    var canvas = document.getElementById('net');
    if (!canvas || reduce) { if (canvas) canvas.style.display = 'none'; return; }
    var ctx = canvas.getContext('2d');
    var w, h, dpr, pts;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      var count = Math.min(90, Math.floor(innerWidth * innerHeight / 16000));
      pts = [];
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25 * dpr,
          vy: (Math.random() - 0.5) * 0.25 * dpr
        });
      }
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

    var LINK = 130 * (dpr || 1);
    function frame() {
      ctx.clearRect(0, 0, w, h);
      LINK = 130 * dpr;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // atração suave ao rato
        var mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        var md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 160 * dpr && md > 0.01) { p.x += mdx / md * 0.6; p.y += mdy / md * 0.6; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150,170,255,.55)';
        ctx.fill();

        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            var a = (1 - d / LINK) * 0.5;
            ctx.strokeStyle = 'rgba(123,124,255,' + a + ')';
            ctx.lineWidth = dpr;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------- ripple no play do mockup ---------- */
  var play = document.querySelector('.screen .play');
  if (play) play.addEventListener('click', function () {
    play.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(.88)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 280 });
  });

  /* ---------- ano no rodapé ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- versão + asset via API do GitHub ---------- */
  (function () {
    var REPO = 'LuisPCFialho/openview-releases';
    var FALLBACK = 'https://github.com/' + REPO + '/releases/latest/download/OpenViewIPTV.apk';
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json' }
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rel) {
        if (!rel) return;
        if (rel.tag_name) {
          var v = document.getElementById('version');
          if (v) v.textContent = 'Versão ' + rel.tag_name + ' disponível';
        }
        var apk = (rel.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
        var url = apk ? apk.browser_download_url : FALLBACK;
        document.querySelectorAll('a.btn-download').forEach(function (a) { a.setAttribute('href', url); });
      })
      .catch(function () { /* fica o link estático */ });
  })();
})();
