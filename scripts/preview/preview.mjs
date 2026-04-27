import {
   numberPop,
   numberFlyInFallDown,
   numberFontSwitch,
} from "../animations/numberAnimations.js";
import {
   fireConfetti,
   fireFireworkConfetti,
   fireEmojiConfetti,
   fireCrossBonesConfetti,
} from "../animations/confetti.js";
import { ufoDropText } from "../animations/ufoAnimations.js";
import {
   fumbleGlitchText,
   fumbleRetroType,
   fumbleFlickerText,
   fumbleHorrorUnifrakturText,
} from "../animations/fumbleTypography.js";
import { fumbleSceneGlitch } from "../animations/fumbleSceneGlitch.js";

function sampleValue() {
   const input = document.getElementById("preview-value");
   return input?.value?.trim() || "20";
}

/** @type {{ section: string; label: string; run: () => void }[]} */
const previews = [
   {
      section: "Critical",
      label: "Confetti",
      run: () => fireConfetti(),
   },
   {
      section: "Critical",
      label: "Number Pop Critical",
      run: () => numberPop(sampleValue(), true, false),
   },
   {
      section: "Critical",
      label: "Firework Confetti",
      run: () => fireFireworkConfetti(),
   },
   {
      section: "Critical",
      label: "Emoji Confetti",
      run: () => fireEmojiConfetti(),
   },
   {
      section: "Critical",
      label: "Number Fly In Fall Down Critical",
      run: () => numberFlyInFallDown(sampleValue(), true),
   },
   {
      section: "Critical",
      label: "Number Font Switch Critical",
      run: () => numberFontSwitch(sampleValue(), true),
   },
   {
      section: "Critical",
      label: "UFO Drop Text",
      run: () => ufoDropText(sampleValue()),
   },
   {
      section: "Fumble",
      label: "Number Pop Fumble",
      run: () => numberPop(sampleValue(), false, true),
   },
   {
      section: "Fumble",
      label: "Crossbones Confetti",
      run: () => fireCrossBonesConfetti(),
   },
   {
      section: "Fumble",
      label: "Number Fly In Fall Down Fumble",
      run: () => numberFlyInFallDown(sampleValue(), false),
   },
   {
      section: "Fumble",
      label: "Number Font Switch Fumble",
      run: () => numberFontSwitch(sampleValue(), false),
   },
   {
      section: "Fumble",
      label: "Glitch Text Fumble",
      run: () => fumbleGlitchText(sampleValue()),
   },
   {
      section: "Fumble",
      label: "Retro Pixel Type Fumble",
      run: () => fumbleRetroType(sampleValue()),
   },
   {
      section: "Fumble",
      label: "Flicker Horror Text Fumble",
      run: () => fumbleFlickerText(sampleValue()),
   },
   {
      section: "Fumble",
      label: "Unifraktur Step Flicker Fumble",
      run: () => fumbleHorrorUnifrakturText(sampleValue()),
   },
   {
      section: "Fumble",
      label: "Full Screen Glitch Scene Fumble",
      run: () => fumbleSceneGlitch(sampleValue()),
   },
];

function ensureAnimationContainer() {
   const stage = document.getElementById("preview-stage");
   if (!stage) return null;
   let el = document.getElementById("dramatic-d100-animation-container");
   if (!el) {
      el = document.createElement("div");
      el.id = "dramatic-d100-animation-container";
      stage.appendChild(el);
   }
   return el;
}

function mountButtons() {
   const wrap = document.getElementById("preview-buttons");
   if (!wrap) return;

   let currentSection = "";
   for (const item of previews) {
      if (item.section !== currentSection) {
         currentSection = item.section;
         const h = document.createElement("h3");
         h.textContent = currentSection;
         h.style.cssText = "width:100%;margin:12px 0 6px;font-size:0.95rem;opacity:0.85";
         wrap.appendChild(h);
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
         ensureAnimationContainer();
         try {
            item.run();
         } catch (e) {
            console.error(e);
            alert(String(e));
         }
      });
      wrap.appendChild(btn);
   }
}

ensureAnimationContainer();
mountButtons();
