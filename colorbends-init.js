const container = document.getElementById("heroBends");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mount once on first visibility. Repeatedly destroying/recreating the WebGL
// context while scrolling was fragile on long-lived/background tabs. The CSS
// gradient on .hero-bends is always present, so every failure mode still has a
// deliberate branded background rather than a blank hero.
if (container && !reduceMotion) {
  let didMount = false;

  const mount = async () => {
    if (didMount) return;
    didMount = true;
    try {
      const { mountColorBends } = await import("/colorbends.js?v=20260711-3");
      mountColorBends(container, {
        colors: ["#2e2c63", "#4a31bd", "#7c5cff"],
        rotation: 90,
        speed: 0.06,
        scale: 1.55,
        frequency: 1,
        warpStrength: 1,
        mouseInfluence: 0.25,
        parallax: 0.2,
        noise: 0.06,
        iterations: 1,
        intensity: 0.68,
        bandWidth: 6,
        transparent: true,
      });
      container.classList.add("is-mounted");
    } catch (error) {
      container.dataset.renderer = "fallback";
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        void mount();
      }
    }, { threshold: 0.01 });
    observer.observe(container);
  } else {
    void mount();
  }
}
