import gsap from "/scripts/greensock/esm/all.js";
import { prepAnimation } from "./numberAnimations.js";

/**
 * Full-screen CSS glitch stack (Codrops-style) + big title roll value.
 * @param {string | number} num Roll value
 */
export function fumbleSceneGlitch(num) {
   const el = prepAnimation("dr-fumble-scene-glitch");
   el.setAttribute("role", "presentation");

   const stack = document.createElement("div");
   stack.className = "dr-fsglitch";
   for (let i = 0; i < 5; i++) {
      const layer = document.createElement("div");
      layer.className = "dr-fsglitch-img";
      stack.appendChild(layer);
   }

   const content = document.createElement("div");
   content.className = "dr-fsglitch-content";

   const title = document.createElement("div");
   title.className = "dr-fsglitch-title";
   title.textContent = String(num);

   const sub = document.createElement("div");
   sub.className = "dr-fsglitch-sub";
   sub.textContent = "Fumble";

   content.appendChild(title);
   content.appendChild(sub);
   el.appendChild(stack);
   el.appendChild(content);

   const t = gsap.timeline({
      onComplete: () => {
         t.kill();
         el.remove();
      },
   });

   t.set(el, { opacity: 0 })
      .to(el, { opacity: 1, duration: 0.35, ease: "power1.out" })
      .to({}, { duration: 6.25 })
      .to(el, { opacity: 0, duration: 0.85, ease: "power1.in" });
}
