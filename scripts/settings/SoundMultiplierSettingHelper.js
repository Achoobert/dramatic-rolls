import constants from "../../constants.js";
import soundEffectController from "../controllers/soundEffectController.js";

const setupVolumeSliderListener = () => {
   const settingName = "sound-volume-multiplier";
   const sliderId = `settings-config-${constants.modName}.${settingName}`;
   const slider = document.getElementById(sliderId);

   if (slider && !slider.dataset.volumeListenerAttached) {
      slider.dataset.volumeListenerAttached = "true";
      let debounceTimeout = null;
      
      slider.addEventListener("input", (event) => {
         const value = parseFloat(event.target.value);
         
         // Clear any existing timeout
         if (debounceTimeout) {
            clearTimeout(debounceTimeout);
         }
         
         // Set a new timeout to play sound after 250ms of no changes (trailing edge)
         debounceTimeout = setTimeout(() => {
            const settings = game.settings.get(constants.modName, "settings");
            const allEnabledSounds = [
               ...settings.critSounds.filter((s) => s.enabled),
               ...settings.fumbleSounds.filter((s) => s.enabled),
            ];

            if (allEnabledSounds.length > 0) {
               const randomSound =
                  allEnabledSounds[
                     Math.floor(Math.random() * allEnabledSounds.length)
                  ];
               soundEffectController.playSound(
                  {
                     src: randomSound.path,
                     volume: randomSound.volume,
                     autoplay: true,
                     loop: false,
                  },
                  false,
                  value
               );
            }
            debounceTimeout = null;
         }, 500);
      });
      return true; // Successfully attached
   }
   return false; // Element not found or already attached
};

export const registerSoundMultiplierSettingHelper = () => {
   // Hook into settings config render to attach volume slider listener
   Hooks.on("renderSettingsConfig", (app, html) => {
      // Try to attach immediately
      if (setupVolumeSliderListener()) {
         return; // Successfully attached, no need for interval
      }

      // Set up an interval to check for the element until it's found
      const checkInterval = setInterval(() => {
         if (setupVolumeSliderListener()) {
            clearInterval(checkInterval);
         }
      }, 100);
   });
};

