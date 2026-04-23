import gsap from "/scripts/greensock/esm/all.js";
import { prepAnimation } from "./numberAnimations.js";

/**
 * Fumble-only typography overlays. Each uses prepAnimation(), stays ~2.5–4s, then removes DOM.
 * @param {string | number} num Roll value shown to the table
 */

export function fumbleGlitchText(num) {
   const el = prepAnimation("dr-fumble-glitch");
   const label = document.createElement("span");
   label.className = "dr-fumble-glitch-num";
   label.textContent = String(num);
   el.appendChild(label);

   const t = gsap.timeline({
      onComplete: () => {
         t.kill();
         el.remove();
      },
   });

   const shakeFrames = [
      { x: -6, y: 3, rotation: -1 },
      { x: 5, y: -4, rotation: 1 },
      { x: -4, y: -2, rotation: 0.5 },
      { x: 7, y: 2, rotation: -0.5 },
      { x: -3, y: 5, rotation: 0 },
      { x: 4, y: -3, rotation: 1 },
      { x: -5, y: -1, rotation: -0.5 },
      { x: 3, y: 4, rotation: 0.5 },
      { x: -4, y: 2, rotation: -0.5 },
      { x: 5, y: -2, rotation: 0.5 },
      { x: 0, y: 0, rotation: 0 },
   ];

   t.set(el, { opacity: 1 })
      .fromTo(
         label,
         { scale: 0.85, opacity: 0 },
         { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
      )
      .to(label, {
         keyframes: shakeFrames.map((f) => ({
            ...f,
            duration: 0.1,
            ease: "none",
         })),
      })
      .to(label, { x: 0, y: 0, rotation: 0, duration: 0.45, ease: "power2.out" })
      .to(el, { opacity: 0, duration: 0.85, ease: "power1.in" }, "-=0.1");
}

export function fumbleRetroType(num) {
   const el = prepAnimation("dr-fumble-retro");
   const scan = document.createElement("div");
   scan.className = "dr-fumble-retro-scanlines";
   const wrap = document.createElement("div");
   wrap.className = "dr-fumble-retro-clipwrap";
   const label = document.createElement("span");
   label.className = "dr-fumble-retro-num";
   label.textContent = String(num);
   wrap.appendChild(label);
   el.appendChild(scan);
   el.appendChild(wrap);

   const t = gsap.timeline({
      onComplete: () => {
         t.kill();
         el.remove();
      },
   });

   t.set(el, { opacity: 0 })
      .to(el, { opacity: 1, duration: 0.35, ease: "power1.out" })
      .fromTo(
         wrap,
         { clipPath: "inset(0 100% 0 0)" },
         { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "steps(10)" },
         "-=0.15"
      )
      .to(
         label,
         {
            textShadow:
               "0 0 12px rgba(139, 0, 255, 0.7), 0 0 24px rgba(75, 0, 130, 0.5)",
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
         },
         "-=0.4"
      )
      .to({}, { duration: 0.55 })
      .to(el, { opacity: 0, duration: 0.7, ease: "power1.in" });
}

export function fumbleFlickerText(num) {
   const el = prepAnimation("dr-fumble-flicker");
   const label = document.createElement("span");
   label.className = "dr-fumble-flicker-num";
   label.textContent = String(num);
   el.appendChild(label);

   const flicker = gsap.timeline();
   for (let i = 0; i < 18; i++) {
      flicker.to(label, {
         opacity: i % 2 === 0 ? 0.22 : 1,
         duration: 0.08,
         ease: "none",
      });
   }

   const t = gsap.timeline({
      onComplete: () => {
         t.kill();
         flicker.kill();
         el.remove();
      },
   });

   t.set(el, { opacity: 1 })
      .fromTo(
         label,
         { scale: 0.6, opacity: 0 },
         { scale: 1, opacity: 1, duration: 0.2, ease: "power3.out" }
      )
      .add(flicker)
      .to(label, { scale: 1.06, duration: 0.35, ease: "power1.inOut" })
      .to(el, { opacity: 0, duration: 0.65, ease: "power1.in" });
}

/** CSS step-flicker + skew (UnifrakturCook), ~4.5s */
export function fumbleHorrorUnifrakturText(num) {
   const el = prepAnimation("dr-fumble-horror-text");
   const center = document.createElement("div");
   center.className = "dr-horror-center";
   const label = document.createElement("span");
   label.className = "dr-horror-text";
   label.textContent = String(num);
   center.appendChild(label);
   el.appendChild(center);

   const t = gsap.timeline({
      onComplete: () => {
         t.kill();
         el.remove();
      },
   });

   t.set(el, { opacity: 0 })
      .to(el, { opacity: 1, duration: 0.3, ease: "power1.out" })
      .to({}, { duration: 3.6 })
      .to(el, { opacity: 0, duration: 0.6, ease: "power1.in" });
}
