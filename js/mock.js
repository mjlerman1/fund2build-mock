(function () {
  const root = document.body.getAttribute("data-root") || ".";
  const p = (path) => root.replace(/\/$/, "") + "/" + path.replace(/^\//, "");

  const CAPTIONS = {
    "S-Get-Started": "This is a clickable preview. Nothing here charges a card, and the factory is pretend.",
    "S-Home-Top": "All-time is the lifetime shelf. Sort by upvotes or dollars — Trending stays a separate heat feed.",
    "S-Project-Overview": "A project page: the idea, who it’s for, and how close it is to being built.",
    "S-Project-Inspect": "Anyone can try the prototype. This is a preview, not the finished app.",
    "S-Project-Pledge": "A pledge backs the build. Extra pledges do not raise the spending cap.",
    "S-Studio-Home": "Makers write proposals in Studio, separate from the public feed.",
    "S-Studio-Examples": "Before submitting, makers look at a complete example of a good-enough upload.",
  };

  function tourMode() {
    const params = new URLSearchParams(location.search);
    if (params.get("tour") === "1") sessionStorage.setItem("f2b_tour", "1");
    if (params.get("tour") === "0") sessionStorage.removeItem("f2b_tour");
    if (sessionStorage.getItem("f2b_tour") !== "1") return false;
    document.body.classList.add("tour-on");
    const screen = document.body.getAttribute("data-screen");
    const text = CAPTIONS[screen];
    if (text && !document.querySelector(".tour-caption")) {
      const bar = document.createElement("div");
      bar.className = "tour-caption";
      bar.textContent = text;
      document.body.appendChild(bar);
    }
    return true;
  }

  function demoBanner() {
    if (document.querySelector(".demo-banner")) return;
    const b = document.createElement("div");
    b.className = "demo-banner";
    b.innerHTML =
      "<strong>Clickable mock</strong> — no real sign-in, no real payments. Build statuses are canned.";
    document.body.prepend(b);
  }

  window.F2B = {
    prefix: p,
    seenExamples: function () {
      return sessionStorage.getItem("f2b_examples") === "1";
    },
    markExamples: function () {
      sessionStorage.setItem("f2b_examples", "1");
    },
    requireExamples: function (wizardHref) {
      if (!this.seenExamples()) {
        location.href = p("studio/examples.html") + "?next=" + encodeURIComponent(wizardHref || "wizard.html");
      }
    },
    continueFromExamples: function () {
      this.markExamples();
      const params = new URLSearchParams(location.search);
      location.href = params.get("next") || "wizard.html";
    },
    factoryState: function () {
      const h = (location.hash || "#queued").slice(1);
      return ["queued", "running", "success", "abort", "fail"].indexOf(h) >= 0 ? h : "queued";
    },
  };

  const touring = tourMode();
  const screen = document.body.getAttribute("data-screen");
  if (screen !== "S-Get-Started" && !touring) demoBanner();

  document.querySelectorAll("[data-factory]").forEach(function (el) {
    const st = F2B.factoryState();
    el.querySelectorAll("[data-show]").forEach(function (node) {
      node.hidden = node.getAttribute("data-show") !== st;
    });
    el.querySelectorAll("a[href^='#']").forEach(function (a) {
      if (a.getAttribute("href") === "#" + st) a.classList.add("on");
    });
  });

  document.querySelectorAll(".sort-toggle button[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const sort = btn.getAttribute("data-sort");
      document.querySelectorAll(".sort-toggle button[data-sort]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      const up = document.getElementById("sort-upvotes");
      const dol = document.getElementById("sort-dollars");
      if (up && dol) {
        up.hidden = sort !== "upvotes";
        dol.hidden = sort !== "dollars";
      }
    });
  });

  document.querySelectorAll(".sort-toggle button[data-kind]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const kind = btn.getAttribute("data-kind");
      document.querySelectorAll(".sort-toggle button[data-kind]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      document.querySelectorAll(".card[data-kind]").forEach(function (card) {
        card.hidden = kind !== "all" && card.getAttribute("data-kind") !== kind;
      });
    });
  });

  document.querySelectorAll(".pitch").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      alert("~30s elevator pitch (D24). Mock only — no video in the spec demo. Public-facing; not part of the factory packet.");
    });
  });
})();
