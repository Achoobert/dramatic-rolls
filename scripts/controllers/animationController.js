
import soundEffectController from "./soundEffectController.js";
import {
   numberPop,
   numberFlyInFallDown,
   numberFontSwitch,
} from "../animations/numberAnimations.js";
import constants from "../../constants.js";
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
import { dismissDramaticPresentation } from "../dramatic-dice-animation.js";

class Animation {
   constructor(id, name, animationFunction, playSoundEffect = true) {
      this.id = id;
      this.name = name;
      this.animationFunction = animationFunction;
      this.playSoundEffect = playSoundEffect;
   }

   /** World `play-animations`: visuals only; sounds use world `add-sound`. */
   play = (num) => {
      if (game.settings.get(constants.modName, "play-animations")) {
         this.animationFunction(num);
      }
   };
}

class AnimationController {
   constructor() {
      this.criticalAnimations = [
         new Animation("confetti", "Confetti", fireConfetti),
         new Animation("number-pop-critical", "Number Pop Critical", (num) =>
            numberPop(num, true, false)
         ),
         new Animation(
            "firework-confetti",
            "Firework Confetti",
            fireFireworkConfetti
         ),
         new Animation(
            "emoji-confetti",
            "Emoji Confetti",
            fireEmojiConfetti,
            false
         ),
         new Animation(
            "number-fly-in-fall-down-critical",
            "Number Fly In Then Fall Down Critical",
            (num) => numberFlyInFallDown(num, true)
         ),
         new Animation(
            "number-font-switch-critical",
            "Number Font Switch Critical",
            (num) => numberFontSwitch(num, true)
         ),
         new Animation(
            "ufo-drop-text",
            "UFO Drop Text",
            (text) => ufoDropText(text),
            false
         ),
      ];

      this.fumbleAnimations = [
         new Animation("number-pop-fumble", "Number Pop Fumble", (num) =>
            numberPop(num, false, true)
         ),
         new Animation(
            "crossbones-confetti",
            "Crossbones Confetti",
            fireCrossBonesConfetti
         ),
         new Animation(
            "number-fly-in-fall-down-fumble",
            "Number Fly In Then Fall Down fumble",
            (num) => numberFlyInFallDown(num, false)
         ),
         new Animation(
            "number-font-switch-fumble",
            "Number Font Switch Fumble",
            (num) => numberFontSwitch(num, false)
         ),
         new Animation(
            "fumble-glitch-text",
            "Glitch Text Fumble",
            (num) => fumbleGlitchText(num)
         ),
         new Animation(
            "fumble-retro-type",
            "Retro Pixel Type Fumble",
            (num) => fumbleRetroType(num)
         ),
         new Animation(
            "fumble-flicker-text",
            "Flicker Horror Text Fumble",
            (num) => fumbleFlickerText(num)
         ),
         new Animation(
            "fumble-horror-unifraktur-text",
            "Unifraktur Step Flicker Fumble",
            (num) => fumbleHorrorUnifrakturText(num)
         ),
         new Animation(
            "fumble-scene-glitch",
            "Full Screen Glitch Scene Fumble",
            (num) => fumbleSceneGlitch(num)
         ),
      ];

      this.#setupAnimations();

      Hooks.on("ready", () => {
         game.socket.on(constants.socketName, (data) =>
            this.playById(data.id, data.num)
         );
      });
   }

   #setupAnimations = () => {
      if (document.getElementById("dramatic-d100-animation-host")) return;

      const host = document.createElement("div");
      host.id = "dramatic-d100-animation-host";

      const viewport = document.createElement("div");
      viewport.id = "dramatic-d100-animation-viewport";

      const animationContainer = document.createElement("div");
      animationContainer.id = "dramatic-d100-animation-container";

      viewport.appendChild(animationContainer);
      host.appendChild(viewport);
      document.body.appendChild(host);

      window.addEventListener("keydown", (e) => {
         if (e.key !== "Escape" || e.repeat) return;
         const hasAnim = document.getElementById("dramatic-d100-animation");
         const hasPrompt = document.getElementById("dramatic-dice-animation-prompt");
         if (!hasAnim && !hasPrompt) return;
         e.preventDefault();
         dismissDramaticPresentation();
      });
   };

   /** Missing row for an id defaults to enabled (migration / new animations). */
   #isAnimationEnabledInList(storedList, animation) {
      if (!Array.isArray(storedList)) return true;
      const row = storedList.find((a) => a.id === animation.id);
      if (!row) return true;
      return row.enabled !== false;
   }

   #eligibleCriticalAnimations() {
      const stored = game.settings.get(constants.modName, "settings");
      return this.criticalAnimations.filter((a) =>
         this.#isAnimationEnabledInList(stored?.criticalAnimations, a)
      );
   }

   #eligibleFumbleAnimations() {
      const stored = game.settings.get(constants.modName, "settings");
      return this.fumbleAnimations.filter((a) =>
         this.#isAnimationEnabledInList(stored?.fumbleAnimations, a)
      );
   }

   #playSound = (soundEffect, broadcastSound) => {
      if (
         soundEffect &&
         soundEffect.path &&
         game.settings.get(constants.modName, "add-sound")
      ) {
         soundEffectController.playSound(
            {
               src: soundEffect.path,
               volume: soundEffect.volume,
               autoplay: true,
               loop: false,
            },
            broadcastSound
         );
      }
   };

   playById = (id, num) => {
      const crit = this.criticalAnimations.find((a) => a.id === id);
      const fum = this.fumbleAnimations.find((a) => a.id === id);
      const animation = crit || fum;
      if (!animation) {
         console.error(`Animation with id "${id}" not found.`);
         return;
      }
      const stored = game.settings.get(constants.modName, "settings");
      const list = crit ? stored?.criticalAnimations : stored?.fumbleAnimations;
      if (!this.#isAnimationEnabledInList(list, animation)) {
         return;
      }
      animation.play(num);
   };

   playCriticalAnimation = (num, shouldBroadcastToOtherPlayers) => {
      const soundEffect = soundEffectController.getCritSoundEffect();
      const eligibleAnimations = this.#eligibleCriticalAnimations();

      if (eligibleAnimations.length === 0) {
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
         return;
      }

      const animation =
         eligibleAnimations[
         Math.floor(Math.random() * eligibleAnimations.length)
         ];

      if (animation.playSoundEffect) {
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
      }

      animation.play(num);

      if (shouldBroadcastToOtherPlayers) {
         game.socket.emit(constants.socketName, {
            type: "play-animation",
            id: animation.id,
            num,
         });
      }
   };

   playFumbleAnimation = (num, shouldBroadcastToOtherPlayers) => {
      const soundEffect = soundEffectController.getFumbleSoundEffect();
      const eligibleAnimations = this.#eligibleFumbleAnimations();

      if (eligibleAnimations.length === 0) {
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
         return;
      }

      const animation =
         eligibleAnimations[
         Math.floor(Math.random() * eligibleAnimations.length)
         ];

      if (animation.playSoundEffect) {
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
      }

      animation.play(num);

      if (shouldBroadcastToOtherPlayers) {
         game.socket.emit(constants.socketName, {
            type: "play-animation",
            id: animation.id,
            num,
         });
      }
   };
}

export default new AnimationController();
