(() => {
  const COMMAND = "brew install --cask divitkashyap/tap/loch";

  function wireCopy(button, iconOrLabel, isIcon) {
    if (!button) return;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(COMMAND);
      } catch (err) {
        return;
      }
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
    const holdMs = { idle: 1800, compact: 2200, expanded: 3200 };
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
})();
