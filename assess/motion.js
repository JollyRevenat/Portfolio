// Subtle motion for the one-page site. Does nothing unless html.motion is set
// (i.e. the visitor hasn't asked for reduced motion). See the "Motion" section in styles.css.
(function () {
  window.__motion = true;
  var root = document.documentElement;
  if (!root.classList.contains("motion") || !("IntersectionObserver" in window)) {
    root.classList.remove("motion");
    return;
  }

  // ---- Scroll reveals: fade up a few pixels, staggered within each group ----
  var groups = [
    ".intro > *",
    ".cards > *",
    ".bento > *",
    ".steps > *",
    ".also",
    ".split-copy > *",
    ".split > .window",
    ".clients .wrap > *",
    ".stat-row > *",
    ".cta-panel > *",
  ];
  groups.forEach(function (sel) {
    var seen = new Map();
    document.querySelectorAll(sel).forEach(function (el) {
      var i = seen.get(el.parentNode) || 0;
      seen.set(el.parentNode, i + 1);
      el.classList.add("rv");
      el.style.setProperty("--d", Math.min(i * 90, 360) + "ms");
    });
  });

  var watched = document.querySelectorAll(".rv, .scribble, .m-quiz, .m-bars");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.classList.contains("m-bars")) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });
  watched.forEach(function (el) { io.observe(el); });

  // ---- Results numbers count up alongside the bars ----
  function countUp(box) {
    box.querySelectorAll(".num").forEach(function (n) {
      var target = parseInt(n.textContent, 10), suffix = n.textContent.replace(/[0-9]/g, "");
      var start = performance.now(), dur = 1100;
      (function tick(now) {
        var t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - t, 3);
        n.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    });
  }

  // ---- Share-link mockup slowly flips between Link and Embed while it's on screen ----
  document.querySelectorAll(".m-link").forEach(function (box) {
    var url = box.querySelector(".url"), tabs = box.querySelectorAll(".tab");
    if (!url || !url.dataset.embed || tabs.length < 2) return;
    var visible = false, embed = false;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(box);
    setInterval(function () {
      if (!visible || document.hidden) return;
      embed = !embed;
      url.classList.add("swap");
      setTimeout(function () {
        url.textContent = embed ? url.dataset.embed : url.dataset.link;
        tabs[0].classList.toggle("on", !embed);
        tabs[1].classList.toggle("on", embed);
        url.classList.remove("swap");
      }, 350);
    }, 4200);
  });
})();
