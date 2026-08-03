/**
 * Shared language switcher for the brooks-lint GitHub Pages site.
 *
 * Every page carries its translations inline as `data-<lang>` attributes; this
 * script swaps them, remembers the choice, and falls back to navigator.language
 * on a first visit. It lived as three near-identical copies (index / gallery /
 * guide) that had already drifted — only index.html handled `data-src-*` — so
 * adding a language meant three edits and one of them would be forgotten.
 *
 * Pages without `data-src-*` elements simply have nothing for that pass to do.
 */
(function () {
  var STORE = "brooks-lint-lang";
  var HTML_LANG = { en: "en", zh: "zh-CN", zhtw: "zh-TW", ja: "ja", ko: "ko", es: "es" };

  function apply(lang) {
    document.documentElement.lang = HTML_LANG[lang] || "en";
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var v = el.getAttribute("data-" + lang);
      // innerHTML, not textContent: several translations carry inline markup
      // (`<b>28/100</b>`, `<em>surface</em>`) that must render, not print. The
      // source is the page's own hand-authored attributes — this site takes no
      // user input, reads no query string, and fetches nothing, so there is no
      // untrusted path into here. Adding one would mean sanitizing first.
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-src-en]").forEach(function (el) {
      var s = el.getAttribute("data-src-" + lang);
      if (s != null) el.setAttribute("src", s);
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-set-lang") === lang);
    });
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function preferredLang() {
    var nav = (navigator.language || "").toLowerCase();
    if (nav.indexOf("zh-tw") === 0 || nav.indexOf("zh-hant") === 0
        || nav.indexOf("zh-hk") === 0 || nav.indexOf("zh-mo") === 0) return "zhtw";
    if (nav.indexOf("zh") === 0) return "zh";
    if (nav.indexOf("ja") === 0) return "ja";
    if (nav.indexOf("ko") === 0) return "ko";
    if (nav.indexOf("es") === 0) return "es";
    return "en";
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { apply(b.getAttribute("data-set-lang")); });
  });

  var saved;
  try { saved = localStorage.getItem(STORE); } catch (e) {}
  apply(saved || preferredLang());
})();
