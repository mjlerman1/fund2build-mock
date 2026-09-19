(function () {
  const params = new URLSearchParams(location.search);
  const spec = params.get("spec") === "1";
  const owner = params.get("owner") === "1";
  const signedin = params.get("signedin") === "1" || owner || sessionStorage.getItem("f2bSigned") === "1";
  const primary = params.get("primary") === "try" ? "try" : "back";
  const chip = params.get("chip") === "safety";
  const root = document.body.getAttribute("data-root") || ".";
  const tab = params.get("tab") || "";

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

  function prefix(path) {
    return root.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
  }

  if (!document.querySelector(".demo-banner") && document.body.getAttribute("data-app") !== "1") {
    const b = document.createElement("div");
    b.className = "demo-banner";
    b.innerHTML = spec
      ? '<strong>Clickable mock</strong> — spec demo, nothing charges a card. <a href="' +
        prefix("screens.html") +
        '">Fixture map</a>'
      : "<strong>Clickable mock</strong> — spec demo, nothing charges a card.";
    document.body.prepend(b);
  }

  function keepKeys() {
    const keep = {};
    ["spec", "owner", "signedin", "primary", "chip", "tab"].forEach(function (k) {
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
      if (!existing.get(k)) existing.set(k, keep[k]);
    });
    if (keep.owner && /you\.html/.test(path)) existing.delete("owner");
    if (!/you\.html/.test(path)) existing.delete("tab");
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
  (function showSort() {
    const want = params.get("sort") === "new" || params.get("listed") === "1" ? "new" : "";
    if (!want) return;
    const newBtn = document.querySelector('[data-sort="new"]');
    document.querySelectorAll(".sort-row button[data-sort]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-sort") === "new" ? "true" : "false");
    });
    document.querySelectorAll("[data-sort-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-sort-panel") !== "new";
    });
    const dollar = document.getElementById("top-dollar");
    if (dollar) dollar.hidden = true;
  })();

  function follows() {
    try {
      return JSON.parse(sessionStorage.getItem("f2bFollow") || "[]");
    } catch (e) {
      return [];
    }
  }
  function setFollows(arr) {
    sessionStorage.setItem("f2bFollow", JSON.stringify(arr));
  }

  function listingLocked(li) {
    if (!li) return true;
    if (li.hasAttribute("data-spoke-prelist")) return true;
    if (sessionStorage.getItem("f2bRejected") === "1" && (li.hasAttribute("data-listed-card") || li.hasAttribute("data-spoke-prelist"))) {
      return true;
    }
    if (li.hasAttribute("data-listed-card")) {
      return sessionStorage.getItem("f2bListed") !== "1" && params.get("listed") !== "1";
    }
    return false;
  }

  const follow = document.querySelector("[data-following]");
  if (follow) {
    follow.addEventListener("click", function () {
      const on = follow.getAttribute("aria-checked") !== "true";
      follow.setAttribute("aria-checked", on ? "true" : "false");
      const extra = follows();
      document.querySelectorAll(".card").forEach(function (card) {
        const li = card.closest("li");
        if (!li) return;
        if (listingLocked(li)) {
          li.hidden = true;
          return;
        }
        if (!on) {
          li.hidden = false;
          return;
        }
        const slug = (card.querySelector("h2 a") || {}).textContent || "";
        const marked = card.getAttribute("data-followed") === "1" || extra.indexOf(slug) >= 0;
        li.hidden = !marked;
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
        if (listingLocked(li)) {
          li.hidden = true;
          return;
        }
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

  document.querySelectorAll("[data-follow-project]").forEach(function (btn) {
    const name = btn.getAttribute("data-follow-project");
    if (follows().indexOf(name) >= 0) btn.textContent = "Following";
    btn.addEventListener("click", function () {
      const arr = follows();
      if (arr.indexOf(name) < 0) arr.push(name);
      setFollows(arr);
      sessionStorage.setItem("f2bSigned", "1");
      btn.textContent = "Following";
    });
  });

  if (sessionStorage.getItem("f2bRejected") === "1") {
    document.querySelectorAll("[data-listed-card], [data-spoke-prelist]").forEach(function (el) {
      el.hidden = true;
    });
  } else if (sessionStorage.getItem("f2bListed") === "1" || params.get("listed") === "1") {
    document.querySelectorAll("[data-listed-card]").forEach(function (el) {
      el.hidden = false;
    });
  }

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
    if (paused) {
      const ban = document.getElementById("paused-banner") || document.querySelector(".paused-banner");
      if (ban) {
        ban.hidden = false;
        ban.focus && ban.focus();
      }
      return;
    }
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
      const email = sheet.querySelector("[data-pay-email]");
      if (!signedin && email && !(email.value || "").trim()) {
        email.hidden = false;
        email.focus();
        email.setAttribute("required", "required");
        const hint = sheet.querySelector("[data-pay-hint]");
        if (hint) hint.hidden = false;
        return;
      }
      if (email && email.value) sessionStorage.setItem("f2bSigned", "1");
      const fail = params.get("pay") === "fail" || btn.getAttribute("data-pay") === "fail";
      const past = sheet.getAttribute("data-receipt") || "Your " + money(amt) + " is held for the build.";
      body.innerHTML =
        "<p role=\"status\" aria-live=\"polite\">We're confirming your payment…</p>";
      setTimeout(function () {
        if (fail) {
          body.innerHTML =
            "<p role=\"status\">That payment didn't go through. Nothing was held. You can try again.</p>" +
            "<p><button class=\"btn accent\" type=\"button\" data-close-sheet>Close</button></p>";
          body.querySelector("[data-close-sheet]").addEventListener("click", function () {
            closeSheet(sheet);
          });
          return;
        }
        const bar = document.querySelector(".proj-head .bar, .bar[data-live-bar]");
        const count = document.querySelector("[data-backer-count]");
        if (bar) {
          const now = Number(bar.getAttribute("aria-valuenow") || 0) + Number(amt);
          const max = Number(bar.getAttribute("aria-valuemax") || 1);
          bar.setAttribute("aria-valuenow", String(now));
          const span = bar.querySelector("span");
          if (span) span.style.width = Math.min(100, (now / max) * 100) + "%";
        }
        if (count) {
          const n = Number(count.getAttribute("data-backer-count") || count.textContent) + 1;
          count.setAttribute("data-backer-count", String(n));
          count.textContent = n + " backers";
        }
        const maker = sheet.getAttribute("data-owner-backing") === "1";
        body.innerHTML =
          "<p role=\"status\" aria-live=\"polite\">You backed " +
          title +
          ". " +
          past.replace("$25", money(amt)) +
          (maker ? " Labelled on the bar as from the maker." : "") +
          "</p><p><a class=\"btn\" href=\"" +
          prefix("you.html") +
          "\">You › Backed</a></p>";
      }, 500);
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
    const from = params.get("from");
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
      recitalboard: {
        q1: "Volunteer sign-ups for school recitals.",
        q2: "Parents and volunteer coordinators.",
        q3: "Sign up for recital jobs.\nSee open slots.\nRemind volunteers the day before.",
        q4: "It should not take ticket payments.\nIt should not post photos of children.",
        q5: "Board. Slot. Remind.",
        q6: "A parent can claim a slot.\nA coordinator can see who is in.\nReminders go out the day before.",
        policy: true,
      },
    };
    const fill =
      from === "recitalboard"
        ? drafts.recitalboard
        : from === "spokeroster"
          ? drafts.complete
          : drafts[state] || {};
    Object.keys(fields).forEach(function (k) {
      if (!fields[k] || fill[k] == null) return;
      if (fields[k].type === "checkbox") fields[k].checked = !!fill[k];
      else fields[k].value = fill[k];
    });
    if (state === "listed" || from === "recitalboard" || from === "spokeroster") {
      const banner = editor.querySelector("[data-listed-banner]");
      if (banner) {
        banner.hidden = false;
        if (from === "recitalboard") banner.textContent = "Fund version 2 — pre-filled from RecitalBoard. Parent history stays on that page.";
        if (from === "spokeroster") banner.textContent = "Fund version 2 — pre-filled from SpokeRoster. Club history stays on that page.";
      }
    }

    function bits(v) {
      return (v || "")
        .split(/\n|;|•|\u2022|(?:\d+[.)]\s+)|(?:\.\s+)/)
        .map(function (s) {
          return s.trim();
        })
        .filter(function (s) {
          return s.length > 1;
        });
    }
    function filled(el) {
      return !!(el && (el.value || "").trim());
    }
    function score() {
      const q1ok = filled(fields.q1);
      const q2ok = filled(fields.q2);
      const q3n = bits(fields.q3.value);
      const q4n = bits(fields.q4.value);
      const q5n = bits(fields.q5.value);
      const q6n = bits(fields.q6.value);
      const q3ok = q3n.length >= 3 || (filled(fields.q3) && (fields.q3.value || "").trim().length >= 20);
      const q4ok = q4n.length >= 2 || (filled(fields.q4) && (fields.q4.value || "").trim().length >= 12);
      const q5ok = q5n.length >= 1 || filled(fields.q5);
      const q6ok = q6n.length >= 3 || (filled(fields.q6) && (fields.q6.value || "").trim().length >= 20);
      const six = q1ok && q2ok && q3ok && q4ok && q5ok && q6ok;
      if (six && fields.policy && !fields.policy.checked) fields.policy.checked = true;
      return [
        ["What it does", q1ok],
        ["Who it's for", q2ok],
        ["Must do (3–7)", q3ok],
        ["Must not do", q4ok],
        ["Screens (≥ 1)", q5ok],
        ["Done when (≥ 3)", q6ok],
        ["Fits a personal web app", q2ok],
        ["Policy accepted", !!(fields.policy && fields.policy.checked) || six],
        ["Nothing generated yet", true],
      ];
    }
    function renderCheck() {
      const items = score();
      const n = items.filter(function (i) {
        return i[1];
      }).length;
      editor.querySelectorAll("[data-check-count]").forEach(function (live) {
        live.textContent = "Ready to publish " + n + "/9";
      });
      editor.querySelectorAll("[data-check-list]").forEach(function (ul) {
        ul.innerHTML = items
          .map(function (i) {
            return "<li class=\"" + (i[1] ? "yes" : "no") + "\">" + (i[1] ? "✓" : "✗") + " " + i[0] + "</li>";
          })
          .join("");
      });
      const firstNo = items.find(function (i) {
        return !i[1];
      });
      document.querySelectorAll("[data-publish]").forEach(function (pub) {
        pub.disabled = n !== 9;
        if (firstNo) pub.setAttribute("aria-describedby", "check-live");
        else pub.removeAttribute("aria-describedby");
      });
      const preview = editor.querySelector("[data-preview-line]");
      if (preview) preview.textContent = (fields.q1.value || "What it does").trim() || "What it does";
    }
    editor.addEventListener("input", renderCheck);
    editor.addEventListener("change", renderCheck);
    renderCheck();
    document.querySelectorAll("[data-publish]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        const dest = params.get("outcome") === "revise"
          ? prefix("project/spokeroster.html") + "?owner=1&strip=revise"
          : params.get("outcome") === "reject"
            ? prefix("project/spokeroster.html") + "?owner=1&strip=rejected"
            : prefix("project/spokeroster.html") + "?owner=1&strip=checks";
        location.href = dest;
      });
    });
    document.querySelectorAll("[data-open-help]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const p = document.getElementById("help-panel");
        if (p) {
          p.hidden = false;
          p.scrollIntoView({ block: "nearest" });
        }
      });
    });
    document.querySelectorAll("[data-close-help]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const p = document.getElementById("help-panel");
        if (p) p.hidden = true;
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
      checks: [
        "Checks running: Fits ✓ · Cost ✓ · Safety …",
        '<div class="cost-table-wrap" data-cost-table><p class="kicker">Cost (instant)</p><table class="cost-table"><caption>Cost table</caption><thead><tr><th>Step</th><th>Budget (fixed)</th></tr></thead><tbody><tr><td>Sketches</td><td>$80</td></tr><tr><td>Prototype</td><td>$320</td></tr><tr><td>Build</td><td>$800</td></tr></tbody></table></div><button class="btn" type="button" data-finish-checks>Safety done — list it</button>',
      ],
      revise: [
        "Changes requested — say who it's for in one group, not everyone.",
        '<a class="btn" href="' + prefix("editor.html") + '?draft=listed">Edit</a>',
      ],
      rejected: [
        "Not approved — this didn't fit a personal web app.",
        '<a class="btn" href="' + prefix("unavailable.html") + '" data-appeal>Appeal</a>',
      ],
      listed: [
        "You're listed. Approve the build when you're ready.",
        '<button class="btn" type="button" data-approve-build="1">Approve the build</button> <a class="btn secondary" href="#back" data-open-sheet="back-sheet">Back your own project</a> <button class="btn secondary" type="button">Share</button> <button class="btn secondary" type="button">Withdraw</button> <a class="btn secondary" href="' +
          prefix("index.html") +
          '?sort=new&listed=1">See it in New</a>',
      ],
      approved: [
        "Build approved ✓ · Needs: goal · $1,080 to go.",
        '<a class="btn tour-next" href="' +
          prefix("project/spokeroster-sketches.html") +
          '?owner=1&strip=review-sketches">Sketches are ready — review</a> <a class="btn secondary" href="#back" data-open-sheet="back-sheet">Back your own project</a> <button class="btn secondary" type="button">Share</button> <button class="btn secondary" type="button" data-post-update>Post an update</button> <button class="btn secondary" type="button">Withdraw</button>',
      ],
      reapprove: [
        "Your proposal changed — approve the build again.",
        '<button class="btn" type="button" data-confirm="reapprove">Re-approve the build</button>',
      ],
      "review-sketches": [
        "Sketches are ready for your review.",
        '<button class="btn" type="button" data-review="sketches">Review sketches</button>',
      ],
      "review-prototype": [
        "The prototype is ready for your review.",
        '<button class="btn" type="button" data-review="prototype">Review prototype</button>',
      ],
      funded: [
        "Funded. Build starts automatically. Budget $800 (fixed).",
        '<a class="btn tour-next" href="' +
          prefix("project/spokeroster-building.html") +
          '?owner=1&strip=building">See the build</a>',
      ],
      building: [
        "Build in progress · attempt 1 · $210 of $800.",
        '<a class="btn secondary tour-next" href="' +
          prefix("project/spokeroster-failed.html") +
          '?owner=1&strip=failed">Attempt failed</a>',
      ],
      failed: [
        "Build attempt 2 failed · retrying at our cost.",
        '<a class="btn tour-next" href="' +
          prefix("project/spokeroster-final.html") +
          '?owner=1&strip=final">Final safety check</a>',
      ],
      final: [
        "Final safety check.",
        '<a class="btn tour-next" href="' +
          prefix("project/spokeroster-ready.html") +
          '?owner=1&strip=extra">Released</a>',
      ],
      ready: ["Ready. Share it.", ""],
      extra: [
        "Extra money: $720.",
        '<button class="btn" type="button" data-extra="keep">Keep</button><button class="btn secondary" type="button" data-extra="save">Save for updates</button>',
      ],
      paused: [
        "Backing paused — appeal in review.",
        '<a class="btn secondary" href="' + prefix("project/spokeroster-paused.html") + '?owner=1&strip=paused">Appeal in review</a>',
      ],
      closed: ["Closed — goal not reached.", '<a class="btn" href="' + prefix("editor.html") + '">Propose again</a>'],
      nudge: [
        "It's been 3 weeks since your last update.",
        '<button class="btn" type="button" data-post-update>Post an update</button>',
      ],
    };
    if (map[strip] && line) {
      line.textContent = map[strip][0];
      if (acts && map[strip][1]) {
        const skip =
          (strip === "extra" && acts.querySelector("[data-extra]")) ||
          ((strip === "review-sketches" || strip === "review-prototype") && acts.querySelector("[data-review]")) ||
          (acts.querySelector(".tour-next") && /funded|building|failed|final/.test(strip));
        if (strip === "checks" || strip === "approved") {
          acts.innerHTML = map[strip][1];
        } else if (strip === "listed") {
          if (!acts.querySelector("[data-approve-build]")) acts.innerHTML = map[strip][1];
          if (!acts.querySelector('[href*="sort=new"]')) {
            acts.insertAdjacentHTML(
              "beforeend",
              ' <a class="btn secondary" href="' + prefix("index.html") + '?sort=new&listed=1">See it in New</a>'
            );
          }
        } else if (!skip) {
          acts.insertAdjacentHTML("afterbegin", map[strip][1]);
        }
      }
    }
  }

  document.querySelectorAll("[data-finish-checks]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      sessionStorage.setItem("f2bListed", "1");
      sessionStorage.removeItem("f2bRejected");
      location.href = prefix("project/spokeroster.html") + "?owner=1&strip=listed";
    });
  });
  document.querySelectorAll("[data-appeal]").forEach(function (a) {
    a.addEventListener("click", function () {
      sessionStorage.setItem("f2bRejected", "1");
      sessionStorage.removeItem("f2bListed");
    });
  });
  if (owner && strip === "rejected") {
    sessionStorage.setItem("f2bRejected", "1");
    sessionStorage.removeItem("f2bListed");
  }

  function confirmDialog(title, body, onYes) {
    let box = document.getElementById("confirm-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "confirm-box";
      box.className = "confirm";
      box.hidden = true;
      box.innerHTML =
        '<div class="confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">' +
        '<h2 id="confirm-title"></h2><p id="confirm-body"></p>' +
        '<p><button class="btn" type="button" data-confirm-yes>Confirm</button> ' +
        '<button class="btn secondary" type="button" data-confirm-no>Cancel</button></p></div>';
      document.body.appendChild(box);
    }
    box.querySelector("#confirm-title").textContent = title;
    box.querySelector("#confirm-body").textContent = body;
    box.hidden = false;
    box.querySelector("[data-confirm-yes]").onclick = function () {
      box.hidden = true;
      onYes();
    };
    box.querySelector("[data-confirm-no]").onclick = function () {
      box.hidden = true;
    };
    box.querySelector("[data-confirm-yes]").focus();
  }

  function bindApprove() {
    document.querySelectorAll("[data-approve-build]").forEach(function (btn) {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", function () {
        confirmDialog("Approve the build?", "Locks your spec at the listed budget (fixed).", function () {
          location.href = prefix("project/spokeroster.html") + "?owner=1&strip=approved";
        });
      });
    });
  }
  document.querySelectorAll(".owner-actions button, .owner-actions .btn").forEach(function (btn) {
    if (/Approve the build/.test(btn.textContent || "")) btn.setAttribute("data-approve-build", "1");
  });
  bindApprove();

  document.querySelectorAll("[data-confirm='reapprove']").forEach(function (btn) {
    btn.addEventListener("click", function () {
      confirmDialog("Re-approve the build?", "Your proposal changed. This locks the new spec at the listed budget.", function () {
        location.href = prefix("project/spokeroster-proto.html") + "?owner=1&strip=review-prototype";
      });
    });
  });

  document.querySelectorAll("button").forEach(function (btn) {
    if (!/Withdraw/.test(btn.textContent || "")) return;
    btn.addEventListener("click", function () {
      confirmDialog("Withdraw this project?", "Held money is refunded. Consumed steps stay public.", function () {
        location.href = prefix("project/spokeroster-withdrawn.html") + "?owner=1";
      });
    });
  });

  document.querySelectorAll("button").forEach(function (btn) {
    if (!/^Share$/.test((btn.textContent || "").trim())) return;
    btn.addEventListener("click", function () {
      const live = document.createElement("p");
      live.setAttribute("role", "status");
      live.textContent = "Link copied (mock).";
      btn.replaceWith(live);
    });
  });

  document.querySelectorAll("[data-review]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const kind = btn.getAttribute("data-review");
      if (kind === "sketches") {
        const gal = document.getElementById("sketches");
        if (gal) gal.hidden = false;
        location.href = prefix("project/spokeroster-sketches.html") + "?owner=1&strip=reapprove";
      } else {
        location.href = prefix("project/spokeroster-funded.html") + "?owner=1&strip=funded";
      }
    });
  });

  document.querySelectorAll("[data-post-update], .owner-actions button").forEach(function (btn) {
    if (btn.getAttribute("data-post-update") == null && !/Post an update/.test(btn.textContent || "")) return;
    btn.addEventListener("click", function () {
      const sec = document.getElementById("updates");
      if (!sec) return;
      const p = document.createElement("p");
      p.textContent = "Update · mock — Sketches are in. Next is the prototype.";
      sec.appendChild(p);
      const live = document.createElement("p");
      live.setAttribute("role", "status");
      live.textContent = "Update posted.";
      btn.replaceWith(live);
    });
  });

  document.querySelectorAll("[data-extra]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const choice = btn.getAttribute("data-extra") === "keep" ? "Keep" : "Save for updates";
      const ready = document.getElementById("ready");
      if (ready) {
        const p = document.createElement("p");
        p.textContent = "Extra money: the maker chose " + choice + ".";
        ready.appendChild(p);
      }
      const line = document.querySelector("[data-strip-line]");
      if (line) line.textContent = "Extra money: " + choice + ".";
    });
  });

  if (document.body.getAttribute("data-screen") === "you") {
    const panels = {
      "": "backed",
      backed: "backed",
      following: "following",
      projects: "projects",
      notifications: "notifications",
      settings: "settings",
    };
    const show = panels[tab] || "backed";
    document.querySelectorAll("[data-you-panel]").forEach(function (p) {
      p.hidden = p.getAttribute("data-you-panel") !== show;
    });
    document.querySelectorAll(".you-tabs a").forEach(function (a) {
      const href = a.getAttribute("href") || "";
      const on =
        (show === "backed" && href.indexOf("tab=") < 0) || href.indexOf("tab=" + show) >= 0;
      a.classList.toggle("on", on);
      a.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const extra = follows();
    if (show === "following" && extra.length) {
      const host = document.querySelector('[data-you-panel="following"] .feed');
      extra.forEach(function (name) {
        if (host && host.textContent.indexOf(name) < 0) {
          const li = document.createElement("li");
          li.innerHTML = "<p>Following " + name + " (from this session).</p>";
          host.appendChild(li);
        }
      });
    }
  }

  if (location.hash === "#back") {
    const opener = document.querySelector("[data-open-sheet='back-sheet']");
    if (opener) openSheet("back-sheet", opener);
  }

  if (document.body.getAttribute("data-screen") === "search") {
    const q = (params.get("q") || "").trim();
    document.querySelectorAll('input[name="q"]').forEach(function (inp) {
      inp.value = q;
    });
    const cards = document.querySelectorAll(".feed .card");
    let shown = 0;
    cards.forEach(function (card) {
      const li = card.closest("li");
      const hay = (card.textContent || "").toLowerCase();
      const hit = !q || hay.indexOf(q.toLowerCase()) >= 0;
      if (li) li.hidden = !hit;
      if (hit) shown += 1;
    });
    let empty = document.querySelector("[data-search-empty]");
    if (!empty) {
      empty = document.createElement("p");
      empty.setAttribute("data-search-empty", "1");
      empty.textContent = "No projects match that search.";
      const feed = document.querySelector(".feed");
      if (feed) feed.after(empty);
    }
    empty.hidden = shown > 0;
    const h1 = document.querySelector("h1.page-title");
    if (h1 && q) h1.textContent = "Search · " + q;
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
