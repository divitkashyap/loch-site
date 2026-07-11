(() => {
  const COMMAND = "brew install --cask divitkashyap/tap/loch";

  // navigator.clipboard needs a secure context (HTTPS/localhost) -- falls
  // back to the older execCommand path so copy still works over plain HTTP
  // (e.g. while a custom domain's cert is still provisioning) or in any
  // browser that denies/lacks the async Clipboard API.
  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // fall through to the legacy path below
      }
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function wireCopy(button, iconOrLabel, isIcon) {
    if (!button) return;
    button.addEventListener("click", async () => {
      const ok = await copyText(COMMAND);
      if (!ok) return;
      button.classList.add("copied");
      const original = isIcon ? null : iconOrLabel.textContent;
      if (!isIcon) iconOrLabel.textContent = "Copied";
      window.clearTimeout(button._copyTimer);
      button._copyTimer = window.setTimeout(() => {
        button.classList.remove("copied");
        if (!isIcon) iconOrLabel.textContent = original;
      }, 1800);
    });
  }

  wireCopy(document.getElementById("copyBtn"), document.getElementById("copyIcon"), true);
  wireCopy(document.getElementById("termCopyBtn"), document.getElementById("termCopyBtn"), false);

  // Signature hero: cycle the mock notch through the same states the real
  // app uses. Pauses on hover/focus so a visitor can actually look at it.
  const notch = document.getElementById("notch");
  const caption = document.getElementById("stageCaption");
  if (notch) {
    const states = ["idle", "compact", "expanded"];
    const holdMs = { idle: 700, compact: 1000, expanded: 2400 };
    const captions = {
      idle: "Idle — out of the way",
      compact: "A track starts playing",
      expanded: "Tap to see the full player",
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    let paused = false;
    let timer;

    function setState(state) {
      notch.dataset.state = state;
      if (caption) caption.textContent = captions[state];
    }

    function tick() {
      if (!paused) {
        i = (i + 1) % states.length;
        setState(states[i]);
      }
      timer = window.setTimeout(tick, holdMs[states[i]]);
    }

    if (reduceMotion) {
      setState("expanded");
    } else {
      const stage = notch.closest(".stage");
      stage.addEventListener("mouseenter", () => (paused = true));
      stage.addEventListener("mouseleave", () => (paused = false));
      timer = window.setTimeout(tick, holdMs.idle);
    }
  }

  // Feature explorer: sidebar list -> large preview on the right. Hover
  // previews instantly (desktop); click pins it (and is the only way to
  // switch on touch, since there's no hover there).
  const explorer = document.getElementById("featureExplorer");
  if (explorer) {
    const rows = Array.from(explorer.querySelectorAll(".feature-row"));
    const notch = document.getElementById("featurePreviewNotch");
    const previewImg = document.getElementById("featurePreviewImg");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const morphMs = 280;
    let morphing = false;

    function show(row) {
      rows.forEach((r) => {
        r.classList.toggle("is-active", r === row);
        r.setAttribute("aria-selected", r === row ? "true" : "false");
      });
      const src = row.dataset.preview;
      if (previewImg.getAttribute("src") === src || morphing) return;

      const swap = () => {
        previewImg.setAttribute("src", src);
        previewImg.setAttribute("alt", row.dataset.alt || "");
      };

      if (reduceMotion) {
        swap();
        return;
      }

      morphing = true;
      notch.classList.add("is-morphing");
      window.setTimeout(() => {
        swap();
        notch.classList.remove("is-morphing");
        window.setTimeout(() => (morphing = false), morphMs);
      }, morphMs);
    }

    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => show(row));
      row.addEventListener("click", () => show(row));
      row.addEventListener("focus", () => show(row));
    });
  }
})();
