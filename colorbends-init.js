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
            speed: 0.06,
            scale: 1,
            frequency: 1,
            warpStrength: 1,
            mouseInfluence: 0.25,
            parallax: 0.2,
            noise: 0.06,
            iterations: 1,
            intensity: 0.45,
            bandWidth: 6,
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
