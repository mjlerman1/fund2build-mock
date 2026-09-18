(function () {
  if (localStorage.getItem("f2b_welcome") === "1") return;
  if (/\bnowelcome\b/.test(location.search)) return;
  if (document.getElementById("f2b-welcome")) return;

  var css = document.createElement("style");
  css.textContent =
    "body.welcome-lock{overflow:hidden}" +
    "#f2b-welcome{position:fixed;inset:0;z-index:80;background:rgba(28,25,23,.55);display:grid;place-items:center;padding:1.25rem}" +
    ".welcome-card{background:#fff;max-width:28rem;padding:1.6rem 1.5rem 1.35rem;border-radius:16px;box-shadow:0 8px 30px rgba(28,25,23,.12);text-align:left}" +
    ".welcome-kicker{margin:0 0 .4rem;font-size:.8rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#d4512a}" +
    ".welcome-card h2{margin:0 0 .75rem;font-size:1.35rem;letter-spacing:-.03em;line-height:1.25}" +
    ".welcome-card p{margin:0 0 1rem;color:#78716c;line-height:1.45}" +
    ".welcome-actions{margin:0!important}" +
    ".welcome-actions .btn{width:100%;border:0;cursor:pointer;font:inherit;padding:.7rem 1rem;border-radius:10px;background:#d4512a;color:#fff;font-weight:600}";
  document.head.appendChild(css);

  var wrap = document.createElement("div");
  wrap.id = "f2b-welcome";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-labelledby", "f2b-welcome-title");
  wrap.innerHTML =
    '<div class="welcome-card">' +
    '<p class="welcome-kicker">Fund2Build</p>' +
    '<h2 id="f2b-welcome-title">Personal software, funded by the people who want it.</h2>' +
    "<p>This is a clickable mock. Discover ideas, inspect a pretend prototype, pledge toward a real build. Nothing here charges a card. Click around, then tell Matt what feels off.</p>" +
    '<p class="welcome-actions"><button type="button" class="btn" id="f2b-welcome-go">Proceed to the feed</button></p>' +
    "</div>";
  document.body.appendChild(wrap);
  document.body.classList.add("welcome-lock");
  document.getElementById("f2b-welcome-go").onclick = function () {
    localStorage.setItem("f2b_welcome", "1");
    wrap.remove();
    document.body.classList.remove("welcome-lock");
  };
})();
