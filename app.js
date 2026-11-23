// Эффекты по прокрутке (работают и с телефона): кулисы обложки расходятся,
// парад героев едет вдоль сцены, блоки появляются при входе в экран.
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // появление
  var items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // пунктир ленты рисуется, когда лента в кадре
  var timeline = document.querySelector('.timeline');
  if (timeline && !reduce && 'IntersectionObserver' in window) {
    timeline.style.setProperty('--draw', 0);
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { timeline.style.setProperty('--draw', 1); obs.disconnect(); }
    }, { threshold: 0.3 }).observe(timeline);
  }


  // мелочи на иллюстрациях: снег, искры; играют только когда картинка на экране
  function rnd(a, b) { return a + Math.random() * (b - a); }
  if (!reduce) {
    document.querySelectorAll('[data-snow]').forEach(function (box) {
      var n = +box.getAttribute('data-snow'), sz = (box.getAttribute('data-size') || '1,2').split(',').map(Number);
      for (var i = 0; i < n; i++) {
        var f = document.createElement('i'), d = rnd(7, 13);
        f.style.cssText = '--x:' + rnd(0, 100).toFixed(1) + '%;--s:' + rnd(sz[0], sz[1]).toFixed(2) + ';--d:' + d.toFixed(1) + 's;--delay:-' + rnd(0, d).toFixed(1) + 's;--dx:' + rnd(-8, 8).toFixed(1) + 'cqw;opacity:' + rnd(.85, 1).toFixed(2);
        box.appendChild(f);
      }
    });
    document.querySelectorAll('[data-sparks]').forEach(function (box) {
      var n = +box.getAttribute('data-sparks');
      for (var i = 0; i < n; i++) {
        var f = document.createElement('i'), d = rnd(1.8, 3.2);
        f.style.cssText = '--x:' + rnd(25, 75).toFixed(1) + '%;--s:' + rnd(2.2, 4).toFixed(2) + ';--d:' + d.toFixed(1) + 's;--delay:-' + rnd(0, d).toFixed(1) + 's;--dx:' + rnd(-25, 25).toFixed(1) + 'cqw;--c:' + (i % 3 ? '#fff' : 'var(--red)');
        box.appendChild(f);
      }
    });
  }
  var anims = document.querySelectorAll('.anim');
  if ('IntersectionObserver' in window) {
    var ao = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-play', e.isIntersecting); });
    }, { rootMargin: '80px 0px' });
    anims.forEach(function (el) { ao.observe(el); });
  } else { anims.forEach(function (el) { el.classList.add('is-play'); }); }

  if (reduce) return;
  var cover = document.querySelector('.cover');
  var parade = document.querySelector('.parade');
  var row = parade && parade.querySelector('.parade__row');
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    // кулисы: чем дальше ушла обложка, тем шире раскрыты
    if (cover) {
      var r = cover.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
      cover.style.setProperty('--open', Math.round(p * Math.min(120, r.width * 0.12)) + 'px');
    }
    // парад: от правого края к левому, пока сцена проходит через экран
    if (row) {
      var pr = parade.getBoundingClientRect();
      var t = Math.min(1, Math.max(0, (vh - pr.top) / (vh + pr.height)));
      var extra = row.scrollWidth - parade.clientWidth;
      var from = extra > 0 ? 0 : (parade.clientWidth - row.scrollWidth) / 2;
      var shift = extra > 0 ? -extra * t : from;
      row.style.setProperty('--shift', shift.toFixed(1) + 'px');
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();
})();
