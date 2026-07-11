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

  // Feature explorer: keep the preview stage and every row geometrically
  // stable, then crossfade between two preloaded image layers. Hover previews
  // a surface, click pins it, and keyboard arrows move through the tablist.
  const explorer = document.getElementById("featureExplorer");
  if (explorer) {
    const rows = Array.from(explorer.querySelectorAll(".feature-row"));
    const list = explorer.querySelector(".feature-list");
    const layers = [
      document.getElementById("featurePreviewImg"),
      document.getElementById("featurePreviewIncoming"),
    ];
    const previewTitle = document.getElementById("featurePreviewTitle");
    const previewDescription = document.getElementById("featurePreviewDescription");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visibleLayer = 0;
    let currentSrc = layers[0].getAttribute("src");
    let pinnedRow = rows[0];
    let hoverTimer;
    let transitionToken = 0;

    rows.forEach((row) => {
      const image = new Image();
      image.src = row.dataset.preview;
    });

    function descriptionFor(row) {
      return row.querySelector(".feature-row-sub")?.textContent.trim() || "";
    }

    function updateSelection(row) {
      rows.forEach((r) => {
        const selected = r === row;
        r.classList.toggle("is-active", selected);
        r.setAttribute("aria-selected", selected ? "true" : "false");
        r.setAttribute("tabindex", selected ? "0" : "-1");
      });
      if (previewTitle) {
        previewTitle.textContent = row.querySelector(".feature-row-title")?.textContent || "";
      }
      if (previewDescription) previewDescription.textContent = descriptionFor(row);
    }

    function transitionTo(row) {
      const src = row.dataset.preview;
      if (!src || src === currentSrc) return;

      const token = ++transitionToken;
      const outgoing = layers[visibleLayer];
      const nextLayer = visibleLayer === 0 ? 1 : 0;
      const incoming = layers[nextLayer];
      incoming.setAttribute("src", src);
      incoming.setAttribute("alt", row.dataset.alt || "");

      const reveal = () => {
        if (token !== transitionToken) return;
        incoming.classList.add("is-visible");
        outgoing.classList.remove("is-visible");
        outgoing.setAttribute("alt", "");
        visibleLayer = nextLayer;
        currentSrc = src;
      };

      if (reduceMotion || incoming.complete) {
        window.requestAnimationFrame(reveal);
      } else {
        incoming.addEventListener("load", reveal, { once: true });
      }
    }

    function show(row, immediate = false) {
      window.clearTimeout(hoverTimer);
      updateSelection(row);
      if (immediate || reduceMotion) {
        transitionTo(row);
      } else {
        hoverTimer = window.setTimeout(() => transitionTo(row), 55);
      }
    }

    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => show(row));
      row.addEventListener("click", () => {
        pinnedRow = row;
        show(row, true);
      });
      row.addEventListener("focus", () => show(row));
      row.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const current = rows.indexOf(row);
        const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
        let next = forward ? current + 1 : current - 1;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = rows.length - 1;
        next = (next + rows.length) % rows.length;
        rows[next].focus();
      });
    });

    list.addEventListener("mouseleave", () => show(pinnedRow));
  }
})();
