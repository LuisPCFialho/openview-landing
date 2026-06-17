// Reveal ao scroll
(function () {
  var els = document.querySelectorAll('.reveal');
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

// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Versão mais recente + asset, via API do GitHub (com fallback no link estático)
(function () {
  var REPO = 'LuisPCFialho/openview-releases';
  var FALLBACK = 'https://github.com/' + REPO + '/releases/latest/download/app-release.apk';
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
      var apk = (rel.assets || []).filter(function (a) {
        return /\.apk$/i.test(a.name);
      })[0];
      var url = apk ? apk.browser_download_url : FALLBACK;
      document.querySelectorAll('a.btn-download').forEach(function (a) {
        a.setAttribute('href', url);
      });
    })
    .catch(function () { /* fica o link estático */ });
})();
