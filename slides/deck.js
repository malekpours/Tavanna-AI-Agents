// موتور اسلاید — «ایجنت‌های هوش مصنوعی» (نسخه‌ی مبتدی‌پسند)
// کلیدها: ← / فاصله = بعدی · → = قبلی · F تمام‌صفحه · Esc فهرست اسلایدها · P یادداشت مدرس · D حالت تیره · ? راهنما
// عنصرهای دارای کلاس step-in با هر بار «بعدی» یکی‌یکی ظاهر می‌شوند.

(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  var body = document.body;
  body.classList.add("deck-page");
  var cur = 0, presenter = false, notesBox = null, overlay = null;

  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function fa(n) { return String(n).replace(/\d/g, function (d) { return FA.charAt(d); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ----- حالت تیره (ذخیره‌ی انتخاب) -----
  try { if (localStorage.getItem("deck-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark"); } catch (e) {}
  function toggleDark() {
    var d = document.documentElement.getAttribute("data-theme") === "dark";
    if (d) document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", "dark");
    try { localStorage.setItem("deck-theme", d ? "light" : "dark"); } catch (e) {}
  }

  // ----- نوار بالا و پیشرفت -----
  var prog = document.getElementById("progress");
  if (!prog) { prog = document.createElement("div"); prog.id = "progress"; body.appendChild(prog); }

  var mod = body.getAttribute("data-mod"), title = body.getAttribute("data-title") || document.title;
  var top = document.createElement("header");
  top.className = "topbar";
  top.innerHTML =
    '<a class="home" href="index.html" title="فهرست درس‌ها">🏠 فهرست</a>' +
    (mod ? '<span class="mod">ماژول ' + fa(mod) + '</span>' : "") +
    '<span class="ttl">' + esc(title) + '</span><span class="sp"></span>' +
    '<button type="button" data-act="overview" title="فهرست اسلایدها (Esc)">☰ اسلایدها</button>' +
    '<button type="button" data-act="dark" title="حالت تیره (D)">🌙</button>' +
    '<button type="button" data-act="help" title="راهنمای کلیدها (?)">؟</button>';
  body.appendChild(top);

  var nav = document.createElement("div");
  nav.className = "nav";
  nav.innerHTML =
    '<button type="button" data-act="next" title="بعدی (فلش چپ یا فاصله)">بعدی ←</button>' +
    '<button type="button" data-act="prev" title="قبلی (فلش راست)">→ قبلی</button>';
  body.appendChild(nav);

  var counter = document.createElement("div");
  counter.className = "counter";
  body.appendChild(counter);

  // ----- گام‌به‌گام -----
  function stepsOf(s) { return Array.prototype.slice.call(s.querySelectorAll(".step-in")); }

  function title_of(s) {
    var h = s.querySelector("h1, h2");
    if (!h) return "اسلاید";
    var c = h.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll(".en-sub"), function (e) { e.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }

  function setHash() {
    var h = "#" + (cur + 1);
    try { history.replaceState(null, "", h); } catch (e) { location.hash = h; }
  }

  // mode: "fwd" (گام‌ها پنهان) | "back" / "jump" (همه نمایان)
  function show(i, mode) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, idx) { s.classList.toggle("active", idx === cur); });
    stepsOf(slides[cur]).forEach(function (el) { el.classList.toggle("on", mode !== "fwd"); });
    slides[cur].scrollTop = 0;
    counter.textContent = fa(cur + 1) + " / " + fa(slides.length);
    prog.style.width = ((cur + 1) / slides.length) * 100 + "%";
    setHash();
    if (presenter && notesBox) fillNotes();
  }

  function next() {
    var hidden = stepsOf(slides[cur]).filter(function (e) { return !e.classList.contains("on"); });
    if (hidden.length) { hidden[0].classList.add("on"); return; }
    if (cur < slides.length - 1) show(cur + 1, "fwd");
  }
  function prev() {
    var on = stepsOf(slides[cur]).filter(function (e) { return e.classList.contains("on"); });
    if (on.length) { on[on.length - 1].classList.remove("on"); return; }
    if (cur > 0) show(cur - 1, "back");
  }

  // ----- یادداشت مدرس -----
  function fillNotes() {
    var n = slides[cur].getAttribute("data-notes") || "برای این اسلاید یادداشتی نیست.";
    notesBox.innerHTML = "<h4>یادداشت مدرس</h4>" + esc(n);
  }
  function togglePresenter() {
    presenter = !presenter;
    body.classList.toggle("presenter", presenter);
    if (presenter) { notesBox = document.createElement("aside"); notesBox.className = "notes"; body.appendChild(notesBox); fillNotes(); }
    else if (notesBox) { notesBox.remove(); notesBox = null; }
  }

  // ----- پوشش‌ها: فهرست اسلایدها و راهنما -----
  function closeOverlay() { if (overlay) { overlay.remove(); overlay = null; return true; } return false; }

  function openOverview() {
    closeOverlay();
    overlay = document.createElement("div");
    overlay.className = "overlay";
    var h = '<h2>فهرست اسلایدها — برای رفتن کلیک کن</h2><div class="ov-grid">';
    slides.forEach(function (s, i) {
      h += '<button type="button" class="ov-item' + (i === cur ? " cur" : "") + '" data-go="' + i + '"><span class="n">' + fa(i + 1) + "</span><span>" + esc(title_of(s)) + "</span></button>";
    });
    overlay.innerHTML = h + "</div>";
    body.appendChild(overlay);
  }

  function openHelp() {
    closeOverlay();
    overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML =
      "<h2>راهنمای کلیدها</h2><ul class=\"help-list\">" +
      "<li><span><kbd>←</kbd> یا <kbd>فاصله</kbd></span><span>بعدی (یا نمایش گام بعد)</span></li>" +
      "<li><span><kbd>→</kbd></span><span>قبلی</span></li>" +
      "<li><span><kbd>Esc</kbd></span><span>فهرست اسلایدها</span></li>" +
      "<li><span><kbd>F</kbd></span><span>تمام‌صفحه</span></li>" +
      "<li><span><kbd>D</kbd></span><span>حالت تیره / روشن</span></li>" +
      "<li><span><kbd>P</kbd></span><span>یادداشت مدرس</span></li>" +
      "<li><span><kbd>Home</kbd> / <kbd>End</kbd></span><span>اول / آخر</span></li>" +
      "</ul><p class=\"small\">روی گوشی و تبلت: انگشت را روی صفحه بکش.</p><button type=\"button\" class=\"btn\" data-act=\"close\">بستن</button>";
    body.appendChild(overlay);
  }

  // ----- رویدادها -----
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    var k = e.key;
    if (k === "ArrowLeft" || k === " " || k === "PageDown" || k === "ArrowDown") { if (k === " " && t === "BUTTON") return; e.preventDefault(); closeOverlay(); next(); }
    else if (k === "ArrowRight" || k === "PageUp" || k === "ArrowUp") { e.preventDefault(); closeOverlay(); prev(); }
    else if (k === "Home") { e.preventDefault(); show(0, "jump"); }
    else if (k === "End") { e.preventDefault(); show(slides.length - 1, "jump"); }
    else if (k === "f" || k === "F") { if (!document.fullscreenElement) { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } else document.exitFullscreen(); }
    else if (k === "p" || k === "P") togglePresenter();
    else if (k === "d" || k === "D") toggleDark();
    else if (k === "?" || k === "؟") openHelp();
    else if (k === "Escape") { if (!closeOverlay()) openOverview(); }
  });

  document.addEventListener("click", function (e) {
    var el = e.target;
    if (!el || !el.closest) return;

    var act = el.closest("[data-act]");
    if (act) {
      var a = act.getAttribute("data-act");
      if (a === "next") next();
      else if (a === "prev") prev();
      else if (a === "overview") openOverview();
      else if (a === "dark") toggleDark();
      else if (a === "help") openHelp();
      else if (a === "close") closeOverlay();
      return;
    }

    var go = el.closest("[data-go]");
    if (go) { closeOverlay(); show(parseInt(go.getAttribute("data-go"), 10), "jump"); return; }

    // آزمونک
    var opt = el.closest(".quiz .opt");
    if (opt) {
      var q = opt.closest(".quiz");
      if (q.classList.contains("solved")) return;
      var fb = q.querySelector(".feedback");
      var ok = opt.getAttribute("data-correct") === "true";
      opt.classList.add(ok ? "right" : "wrong");
      if (!ok) opt.disabled = true;
      if (ok) {
        q.classList.add("solved");
        Array.prototype.forEach.call(q.querySelectorAll(".opt"), function (o) { if (o !== opt) o.disabled = true; });
      }
      if (fb) {
        fb.textContent = (ok ? "✅ درست! " : "🤔 هنوز نه. ") + (opt.getAttribute("data-why") || "");
        fb.className = "feedback show " + (ok ? "ok" : "no");
      }
      return;
    }

    // چک‌لیست
    var li = el.closest("ul.check li");
    if (li) { li.classList.toggle("done"); return; }

    // کپی پرامپت
    var cp = el.closest(".prompt .copy");
    if (cp) {
      var pt = cp.parentNode.querySelector(".pt");
      var txt = pt ? pt.innerText : "";
      var done = function () { cp.classList.add("done"); cp.textContent = "کپی شد ✓"; setTimeout(function () { cp.classList.remove("done"); cp.textContent = "کپی"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () {});
      else { var ta = document.createElement("textarea"); ta.value = txt; body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (x) {} ta.remove(); }
    }
  });

  // لمس (کشیدن انگشت)
  var tx = null, ty = null;
  document.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx > 0) prev(); else next(); }
    tx = null;
  }, { passive: true });

  window.addEventListener("hashchange", function () {
    var h = parseInt((location.hash || "").replace("#", ""), 10);
    if (!isNaN(h) && h >= 1 && h <= slides.length && h - 1 !== cur) show(h - 1, "jump");
  });

  var h0 = parseInt((location.hash || "").replace("#", ""), 10);
  show(!isNaN(h0) && h0 >= 1 && h0 <= slides.length ? h0 - 1 : 0, !isNaN(h0) && h0 > 1 ? "jump" : "fwd");
})();