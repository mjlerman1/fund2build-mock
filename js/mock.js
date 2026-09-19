(function () {
  const params = new URLSearchParams(location.search);
  const spec = params.get("spec") === "1";
  const owner = params.get("owner") === "1";
  const signedin = params.get("signedin") === "1" || owner;
  const primary = params.get("primary") === "try" ? "try" : "back";
  const chip = params.get("chip") === "safety";
  const root = document.body.getAttribute("data-root") || ".";

  document.body.classList.toggle("spec", spec);
  document.body.classList.toggle("owner", owner);
  document.body.classList.toggle("signedin", signedin);

  if (!spec) {
    document.querySelectorAll(".spec-only").forEach(function (el) {
      el.remove();
    });
  }
  if (!owner) {
    document.querySelectorAll("[data-owner-strip]").forEach(function (el) {
      el.remove();
    });
  }
  if (!signedin) {
    document.querySelectorAll("[data-signedin]").forEach(function (el) {
      el.remove();
    });
  } else {
    document.querySelectorAll("[data-signedout]").forEach(function (el) {
      el.remove();
    });
  }

  if (!document.querySelector(".demo-banner") && document.body.getAttribute("data-app") !== "1") {
    const b = document.createElement("div");
    b.className = "demo-banner";
    b.innerHTML =
      spec
        ? '<strong>Clickable mock</strong> — spec demo, nothing charges a card. <a href="' +
          prefix("screens.html") +
          '">Fixture map</a>'
        : "<strong>Clickable mock</strong> — spec demo, nothing charges a card.";
    document.body.prepend(b);
  }

  function prefix(path) {
    return root.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
  }

  function keepKeys() {
    const keep = {};
    ["spec", "owner", "signedin", "primary", "chip"].forEach(function (k) {
      if (params.get(k)) keep[k] = params.get(k);
    });
    return keep;
  }

  function decorateHref(href) {
    if (!href || href.startsWith("mailto:") || href.startsWith("javascript:")) return href;
    if (/^https?:/i.test(href)) return href;
    if (href.charAt(0) === "#" && href.length > 1) return href;
    const hashAt = href.indexOf("#");
    const hash = hashAt >= 0 ? href.slice(hashAt) : "";
    const pre = hashAt >= 0 ? href.slice(0, hashAt) : href;
    if (!pre) return href;
    const qAt = pre.indexOf("?");
    const path = qAt >= 0 ? pre.slice(0, qAt) : pre;
    const existing = new URLSearchParams(qAt >= 0 ? pre.slice(qAt + 1) : "");
    const keep = keepKeys();
    Object.keys(keep).forEach(function (k) {
      existing.set(k, keep[k]);
    });
    const qs = existing.toString();
    return path + (qs ? "?" + qs : "") + hash;
  }

  document.querySelectorAll("a[href]").forEach(function (a) {
    a.setAttribute("href", decorateHref(a.getAttribute("href")));
  });

  if (primary === "try") {
    document.querySelectorAll("[data-primary-swap]").forEach(function (wrap) {
      const tryBtn = wrap.querySelector('[data-act="try"]');
      const backBtn = wrap.querySelector('[data-act="back"]');
      if (tryBtn && backBtn) {
        tryBtn.classList.remove("secondary");
        tryBtn.classList.add("accent");
        backBtn.classList.remove("accent");
        backBtn.classList.add("secondary");
        wrap.insertBefore(tryBtn, backBtn);
      }
    });
  }

  if (chip) {
    document.querySelectorAll("[data-safety-slot]").forEach(function (el) {
      const s = document.createElement("span");
      s.className = "chip spec-only";
      s.textContent = "Safety: checked";
      el.appendChild(s);
    });
  }

  const searchToggle = document.querySelector("[data-search-toggle]");
  if (searchToggle) {
    searchToggle.addEventListener("click", function () {
      const open = document.body.classList.toggle("search-open");
      searchToggle.setAttribute("aria-expanded", open ? "true" : "false");
      const input = document.querySelector(".search input");
      if (open && input) input.focus();
    });
  }

  const youBtn = document.querySelector("[data-you-menu]");
  const youMenu = document.getElementById("you-menu");
  if (youBtn && youMenu) {
    youBtn.addEventListener("click", function () {
      const open = youMenu.hasAttribute("hidden");
      if (open) youMenu.removeAttribute("hidden");
      else youMenu.setAttribute("hidden", "");
      youBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".sort-row button[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".sort-row button[data-sort]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      const sort = btn.getAttribute("data-sort");
      const dollar = document.getElementById("top-dollar");
      if (dollar) dollar.hidden = sort !== "top";
      document.querySelectorAll("[data-sort-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-sort-panel") !== sort;
      });
    });
  });

  const follow = document.querySelector("[data-following]");
  if (follow) {
    follow.addEventListener("click", function () {
      const on = follow.getAttribute("aria-checked") !== "true";
      follow.setAttribute("aria-checked", on ? "true" : "false");
      document.querySelectorAll(".card").forEach(function (card) {
        if (!on) {
          card.closest("li").hidden = false;
          return;
        }
        card.closest("li").hidden = card.getAttribute("data-followed") !== "1";
      });
    });
  }

  document.querySelectorAll(".type-row button[data-kind]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".type-row button[data-kind]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      const kind = btn.getAttribute("data-kind");
      document.querySelectorAll(".card[data-kind]").forEach(function (card) {
        const li = card.closest("li");
        li.hidden = kind !== "all" && card.getAttribute("data-kind") !== kind;
      });
    });
  });

  document.querySelectorAll(".upvote").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", pressed ? "false" : "true");
    });
  });

  const sheets = [];
  function closeSheet(sheet) {
    sheet.hidden = true;
    const back = document.getElementById("sheet-backdrop");
    if (back) back.hidden = true;
    document.body.style.overflow = "";
    const page = document.getElementById("page-inert");
    if (page) page.removeAttribute("inert");
    const opener = sheet._opener;
    if (opener) opener.focus();
  }
  function openSheet(id, opener) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    const paused = sheet.getAttribute("data-paused") === "1";
    if (paused) return;
    sheet.hidden = false;
    sheet._opener = opener;
    const back = document.getElementById("sheet-backdrop");
    if (back) back.hidden = false;
    document.body.style.overflow = "hidden";
    const page = document.getElementById("page-inert");
    if (page) page.setAttribute("inert", "");
    const amt = sheet.querySelector(".amount");
    if (amt) amt.focus();
    else {
      const close = sheet.querySelector("[data-close-sheet]");
      if (close) close.focus();
    }
    sheets.push(sheet);
  }

  document.querySelectorAll("[data-open-sheet]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openSheet(btn.getAttribute("data-open-sheet"), btn);
    });
  });
  document.querySelectorAll("[data-close-sheet]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeSheet(btn.closest(".sheet"));
    });
  });
  const backdrop = document.getElementById("sheet-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      document.querySelectorAll(".sheet:not([hidden])").forEach(closeSheet);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".sheet:not([hidden])").forEach(closeSheet);
      document.querySelectorAll(".confirm:not([hidden])").forEach(function (d) {
        d.hidden = true;
      });
    }
  });

  document.querySelectorAll(".sheet").forEach(function (sheet) {
    sheet.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || sheet.hidden) return;
      const focusable = sheet.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  });

  function money(n) {
    return "$" + n;
  }

  document.querySelectorAll("[data-preset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const sheet = btn.closest(".sheet");
      sheet.querySelectorAll("[data-preset]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      const amt = sheet.querySelector(".amount");
      if (btn.getAttribute("data-preset") === "other") {
        amt.removeAttribute("readonly");
        amt.focus();
        return;
      }
      amt.value = btn.getAttribute("data-preset");
      updateSheetAmount(sheet);
    });
  });

  function updateSheetAmount(sheet) {
    const amt = sheet.querySelector(".amount");
    const n = amt ? amt.value : "25";
    sheet.querySelectorAll("[data-amt]").forEach(function (el) {
      el.textContent = money(n);
    });
    const pay = sheet.querySelector("[data-pay]");
    if (pay) pay.textContent = "Pay " + money(n);
  }

  document.querySelectorAll(".sheet .amount").forEach(function (input) {
    input.addEventListener("input", function () {
      updateSheetAmount(input.closest(".sheet"));
    });
  });

  document.querySelectorAll("[data-pay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const sheet = btn.closest(".sheet");
      const body = sheet.querySelector("[data-sheet-body]");
      const title = sheet.getAttribute("data-title") || "this project";
      const amt = sheet.querySelector(".amount").value;
      const past = sheet.getAttribute("data-receipt") || "Your " + money(amt) + " is held for the build.";
      body.innerHTML =
        "<p role=\"status\" aria-live=\"polite\">You backed " +
        title +
        ". " +
        past.replace("$25", money(amt)).replace("$‹amount›", money(amt)) +
        "</p><p>Confirming your payment…</p>";
      setTimeout(function () {
        body.innerHTML =
          "<p role=\"status\" aria-live=\"polite\">You backed " +
          title +
          ". " +
          past.replace("$25", money(amt)) +
          "</p><p><a class=\"btn\" href=\"" +
          prefix("you.html") +
          "\">You › Backed</a></p>";
      }, 600);
    });
  });

  document.querySelectorAll("[data-hosted-option]").forEach(function (input) {
    input.addEventListener("change", function () {
      const sheet = input.closest(".sheet");
      sheet.querySelectorAll("[data-hosted-reveal]").forEach(function (el) {
        el.hidden = true;
      });
      const reveal = sheet.querySelector('[data-hosted-reveal="' + input.value + '"]');
      if (reveal) reveal.hidden = false;
    });
  });

  window.addEventListener("scroll", function () {
    document.body.classList.toggle("scrolled", window.scrollY > 180);
  });

  const editor = document.querySelector("[data-editor]");
  if (editor) {
    const state = params.get("draft") || editor.getAttribute("data-draft") || "empty";
    const fields = {
      q1: editor.querySelector('[name="q1"]'),
      q2: editor.querySelector('[name="q2"]'),
      q3: editor.querySelector('[name="q3"]'),
      q4: editor.querySelector('[name="q4"]'),
      q5: editor.querySelector('[name="q5"]'),
      q6: editor.querySelector('[name="q6"]'),
      policy: editor.querySelector('[name="policy"]'),
    };
    const drafts = {
      empty: {},
      partial: {
        q1: "Bike club roster: who paid, who rides Thursday.",
        q2: "Officers of a 40-person bike club.",
        q3: "When someone pays dues, they show as current.\nWhen Thursday rides fill, the list shows who is in.\nWhen a member lapses, they drop off the paid list.",
        q5: "Roster. Who paid. Thursday ride.",
      },
      complete: {
        q1: "Bike club roster: who paid, who rides Thursday.",
        q2: "Officers of a 40-person bike club.",
        q3: "When someone pays dues, they show as current.\nWhen Thursday rides fill, the list shows who is in.\nWhen a member lapses, they drop off the paid list.",
        q4: "It should not take card payments.\nIt should not message people outside the club.",
        q5: "Roster. Who paid. Thursday ride.",
        q6: "I can see who has paid this season.\nI can mark a rider in for Thursday.\nA new officer can open the list on their phone.",
        policy: true,
      },
      listed: {
        q1: "Bike club roster: who paid, who rides Thursday.",
        q2: "Officers of a 40-person bike club.",
        q3: "When someone pays dues, they show as current.\nWhen Thursday rides fill, the list shows who is in.\nWhen a member lapses, they drop off the paid list.",
        q4: "It should not take card payments.\nIt should not message people outside the club.",
        q5: "Roster. Who paid. Thursday ride.",
        q6: "I can see who has paid this season.\nI can mark a rider in for Thursday.\nA new officer can open the list on their phone.",
        policy: true,
      },
    };
    const fill = drafts[state] || {};
    Object.keys(fields).forEach(function (k) {
      if (!fields[k] || fill[k] == null) return;
      if (fields[k].type === "checkbox") fields[k].checked = !!fill[k];
      else fields[k].value = fill[k];
    });
    if (state === "listed") {
      const banner = editor.querySelector("[data-listed-banner]");
      if (banner) banner.hidden = false;
    }

    function lines(v) {
      return (v || "")
        .split(/\n/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }
    function score() {
      const q1 = (fields.q1.value || "").trim();
      const q2 = (fields.q2.value || "").trim();
      const q3 = lines(fields.q3.value);
      const q4 = lines(fields.q4.value);
      const q5 = lines(fields.q5.value);
      const q6 = lines(fields.q6.value);
      const items = [
        ["What it does", q1.length > 0],
        ["Who it's for", q2.length > 0 && !/^every(one|body)|anyone$/i.test(q2)],
        ["Must do (3–7)", q3.length >= 3 && q3.length <= 7],
        ["Must not do", q4.length >= 2],
        ["Screens (≥ 1)", q5.length >= 1],
        ["Done when (≥ 3)", q6.length >= 3],
        ["Fits a personal web app", q2.length > 0],
        ["Policy accepted", fields.policy.checked],
        ["Nothing generated yet", true],
      ];
      return items;
    }
    function renderCheck() {
      const items = score();
      const n = items.filter(function (i) {
        return i[1];
      }).length;
      const countText = "Ready to publish " + n + "/9";
      editor.querySelectorAll("[data-check-count]").forEach(function (live) {
        live.textContent = countText;
      });
      const listHtml = items
        .map(function (i) {
          return "<li class=\"" + (i[1] ? "yes" : "no") + "\">" + (i[1] ? "✓" : "✗") + " " + i[0] + "</li>";
        })
        .join("");
      editor.querySelectorAll("[data-check-list]").forEach(function (ul) {
        ul.innerHTML = listHtml;
      });
      const pub = editor.querySelector("[data-publish]");
      const firstNo = items.find(function (i) {
        return !i[1];
      });
      if (pub) {
        pub.disabled = n !== 9;
        if (firstNo) pub.setAttribute("aria-describedby", "check-live");
        else pub.removeAttribute("aria-describedby");
      }
      const preview = editor.querySelector("[data-preview-line]");
      if (preview) preview.textContent = (fields.q1.value || "What it does").trim() || "What it does";
    }
    editor.addEventListener("input", renderCheck);
    editor.addEventListener("change", renderCheck);
    renderCheck();
    editor.querySelectorAll("[data-publish]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        location.href = decorateHref(prefix("project/spokeroster.html") + (owner ? "" : "")).replace(
          "spokeroster.html",
          "spokeroster.html"
        );
        const u = new URL(prefix("project/spokeroster.html"), location.href);
        u.searchParams.set("owner", "1");
        u.searchParams.set("strip", "checks");
        if (spec) u.searchParams.set("spec", "1");
        location.href = u.pathname.replace(/^.*\/project\//, "project/") + u.search;
      });
    });
  }

  document.querySelectorAll("[data-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("aria-controls");
      const region = document.getElementById(id);
      const open = region.hasAttribute("hidden");
      if (open) region.removeAttribute("hidden");
      else region.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  const hosting = document.querySelector("[name='hosting']");
  if (hosting && spec) {
    document.querySelectorAll("[name='hosting']").forEach(function (r) {
      r.addEventListener("change", function () {
        const sec = document.getElementById("hosting-section");
        if (sec) sec.hidden = document.querySelector("[name='hosting']:checked").value !== "yes";
      });
    });
  } else {
    document.querySelectorAll("[data-hosting-q]").forEach(function (el) {
      if (!spec) el.remove();
    });
  }

  const strip = params.get("strip");
  if (owner && strip) {
    const line = document.querySelector("[data-strip-line]");
    const acts = document.querySelector("[data-strip-actions]");
    const map = {
      checks: ["Checks running: Fits ✓ · Cost ✓ · Safety …", ""],
      revise: ["Changes requested — say who it's for in one group, not everyone.", '<a class="btn" href="' + prefix("editor.html") + '?draft=listed">Edit</a>'],
      rejected: ["Not approved — this didn't fit a personal web app.", '<button class="btn" type="button">Appeal</button>'],
      listed: ["You're listed. Approve the build when you're ready.", ""],
      approved: ["Build approved ✓ · Needs: goal · $1,080 to go.", ""],
      reapprove: ["Your proposal changed — approve the build again.", '<button class="btn" type="button">Re-approve the build</button>'],
      "review-sketches": ["Sketches are ready for your review.", '<button class="btn" type="button">Review sketches</button>'],
      "review-prototype": ["The prototype is ready for your review.", '<button class="btn" type="button">Review prototype</button>'],
      funded: ["Funded. Build starts automatically. Budget $3,200 (fixed).", ""],
      building: ["Build in progress · attempt 1 · $610 of $3,200.", ""],
      failed: ["Attempt 1 failed — retrying at our cost.", ""],
      final: ["Final checks before it's ready.", ""],
      ready: ["Ready. Share it.", ""],
      extra: ["Extra money: $720.", '<button class="btn" type="button">Keep</button><button class="btn secondary" type="button">Save for updates</button>'],
      paused: ["Backing paused — appeal in review.", ""],
      closed: ["Closed — goal not reached.", '<a class="btn" href="' + prefix("editor.html") + '">Propose again</a>'],
      nudge: ["It's been 3 weeks since your last update.", '<button class="btn" type="button">Post an update</button>'],
      address: ["Built. Add your site address — 10 days left.", '<button class="btn" type="button">Add address</button>'],
      online: ["Online ✓", '<button class="btn secondary" type="button" data-confirm="shutdown">Declare shutdown</button>'],
      payout: ["Finish payout setup to receive $2,100.", '<button class="btn" type="button">Finish setup</button>'],
    };
    if (map[strip] && line) {
      line.textContent = map[strip][0];
      if (acts && map[strip][1]) acts.insertAdjacentHTML("afterbegin", map[strip][1]);
    }
  }

  if (location.hash === "#back") {
    const opener = document.querySelector("[data-open-sheet='back-sheet']");
    if (opener) openSheet("back-sheet", opener);
  }

  document.querySelectorAll("[data-waitlist]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const out = form.querySelector("[data-waitlist-done]");
      if (out) {
        out.hidden = false;
        out.textContent = "You're on the waitlist. Stated amount: " + (form.amount.value || "not given") + ".";
      }
    });
  });
})();
