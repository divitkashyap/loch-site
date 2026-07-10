import { mountColorBends } from "/colorbends.js";

const container = document.getElementById("heroBends");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Restrained, brand-toned pass -- monochrome indigo/violet family (not the
// component's demo rainbow palette), slow and subtle so it reads as ambient
// atmosphere behind the hero copy and the notch demo, never competing with them.
if (container && !reduceMotion && "IntersectionObserver" in window) {
  let destroy = null;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !destroy) {
          destroy = mountColorBends(container, {
            colors: ["#2e2c63", "#4a31bd", "#7c5cff"],
            rotation: 90,
            speed: 0.07,
            scale: 1.6,
            frequency: 0.7,
            warpStrength: 0.6,
            mouseInfluence: 0.2,
            parallax: 0.3,
            noise: 0.05,
            iterations: 2,
            intensity: 0.85,
            bandWidth: 4.5,
            transparent: true,
          });
        } else if (!entry.isIntersecting && destroy) {
          destroy();
          destroy = null;
        }
      }
    },
    { threshold: 0.01 }
  );
  io.observe(container);
}
