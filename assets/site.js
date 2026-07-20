/* CMF 2026 學習網站共用腳本 */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll reveal ---- */
  const targets = document.querySelectorAll(".course, .quick a, .view, .q, .theme-card, .daily");
  if (!reduce && "IntersectionObserver" in window && targets.length) {
    targets.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    targets.forEach((el) => io.observe(el));
  }

  /* ---- stats count-up ---- */
  const nums = document.querySelectorAll("[data-count]");
  if (nums.length) {
    const run = (el) => {
      const to = parseInt(el.dataset.count, 10);
      if (reduce) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 900;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io2 = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { run(e.target); io2.unobserve(e.target); } });
    });
    nums.forEach((el) => io2.observe(el));
  }

  /* ---- 今日一句 ---- */
  const daily = document.getElementById("dailyQuote");
  if (daily && typeof QUOTES_DATA !== "undefined") {
    const d = new Date();
    const seed = d.getFullYear() * 366 + (d.getMonth() + 1) * 31 + d.getDate();
    const pick = QUOTES_DATA[seed % QUOTES_DATA.length];
    daily.querySelector("blockquote").textContent = pick.q;
    daily.querySelector(".dq-src").textContent = pick.s + "｜" + pick.t;
    daily.querySelector("a.dq-link").href = "notes/" + pick.f + ".html";
    const btn = daily.querySelector(".dq-next");
    if (btn) btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const p = QUOTES_DATA[Math.floor(Math.random() * QUOTES_DATA.length)];
      daily.querySelector("blockquote").textContent = p.q;
      daily.querySelector(".dq-src").textContent = p.s + "｜" + p.t;
      daily.querySelector("a.dq-link").href = "notes/" + p.f + ".html";
    });
  }

  /* ---- 全站搜尋 ---- */
  const btn = document.getElementById("searchBtn");
  if (!btn || typeof SEARCH_INDEX === "undefined") return;
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchInput");
  const list = document.getElementById("searchResults");
  const open = () => { overlay.classList.add("show"); setTimeout(() => input.focus(), 60); };
  const close = () => { overlay.classList.remove("show"); };
  btn.addEventListener("click", open);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
  });
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const render = () => {
    const raw = input.value.trim();
    if (!raw) { list.innerHTML = '<div class="s-hint">輸入關鍵字，搜尋 16 堂課的全部筆記內容（例：轉介紹、心理帳戶、信託）</div>'; return; }
    const terms = raw.split(/\s+/).filter(Boolean);
    const hits = [];
    for (const it of SEARCH_INDEX) {
      const hay = it.h + " " + it.t + " " + it.s + " " + it.c;
      if (terms.every((t) => hay.includes(t))) hits.push(it);
      if (hits.length >= 40) break;
    }
    if (!hits.length) { list.innerHTML = '<div class="s-hint">找不到「' + esc(raw) + '」，換個關鍵字試試。</div>'; return; }
    list.innerHTML = hits.map((it) => {
      let snip = it.t;
      const pos = snip.indexOf(terms[0]);
      if (pos > 60) snip = "…" + snip.slice(pos - 30);
      snip = esc(snip.slice(0, 120)) + "…";
      terms.forEach((t) => { snip = snip.split(esc(t)).join("<mark>" + esc(t) + "</mark>"); });
      const href = "notes/" + it.f + ".html" + (it.a ? "#" + it.a : "");
      return '<a class="s-item" href="' + href + '"><b>' + esc(it.h) + '</b><span>' + esc(it.s) + "｜" + esc(it.c) + '</span><p>' + snip + '</p></a>';
    }).join("");
  };
  input.addEventListener("input", render);
  render();
})();