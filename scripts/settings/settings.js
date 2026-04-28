import constants from "../../constants.js";

import { ConfigureSoundSettingsForm } from "./configureSoundSettingsForm.js";
import { ConfigureAnimationSettingsForm } from "./configureAnimationsSettingsForm.js";
import soundEffectController from "../controllers/soundEffectController.js";
import animationController from "../controllers/animationController.js";
import { registerSoundMultiplierSettingHelper } from "./SoundMultiplierSettingHelper.js";

export const defaultSettings = {
   critSounds: soundEffectController.critSoundEffectFiles.map(
      (soundFilePath) => ({
         enabled: true,
         path: soundFilePath,
         isUserAddedSound: false,
         volume: 1.0,
      })
   ),
   fumbleSounds: soundEffectController.fumbleSoundEffectFiles.map(
      (soundFilePath) => ({
         enabled: true,
         path: soundFilePath,
         isUserAddedSound: false,
         volume: 1.0,
      })
   ),
   criticalAnimations: animationController.criticalAnimations.map(
      (animation) => ({
         enabled: true,
         id: animation.id,
      })
   ),
   fumbleAnimations: animationController.fumbleAnimations.map((animation) => ({
      enabled: true,
      id: animation.id,
   })),
};

const moduleSoundsPathPrefix = `modules/${constants.modName}/sounds/`;

const bundledSoundsNeedOggMigration = (sounds) =>
   Array.isArray(sounds) &&
   sounds.some(
      (s) =>
         !s.isUserAddedSound &&
         typeof s.path === "string" &&
         s.path.startsWith(moduleSoundsPathPrefix) &&
         s.path.endsWith(".mp3")
   );

export const handleMigrationSettings = () => {
   const settings = game.settings.get(constants.modName, "settings");

   if (bundledSoundsNeedOggMigration(settings.critSounds)) {
      const userCrit = settings.critSounds.filter((s) => s.isUserAddedSound);
      settings.critSounds = [...defaultSettings.critSounds, ...userCrit];
   }
   if (bundledSoundsNeedOggMigration(settings.fumbleSounds)) {
      const userFumble = settings.fumbleSounds.filter(
         (s) => s.isUserAddedSound
      );
      settings.fumbleSounds = [...defaultSettings.fumbleSounds, ...userFumble];
   }

   // Add settings for the animations if they are not already present
   if (!settings.criticalAnimations) {
      settings.criticalAnimations = defaultSettings.criticalAnimations;
   }
   if (!settings.fumbleAnimations) {
      settings.fumbleAnimations = defaultSettings.fumbleAnimations;
   }

   game.settings.set(constants.modName, "settings", settings);
};

export const registerSettings = () => {
   registerSoundMultiplierSettingHelper();

   game.settings.registerMenu(constants.modName, "configuration-menu", {
      name: "dramatic-d100.settings.configure-sounds.name",
      label: "dramatic-d100.settings.configure-sounds.name",
      hint: "dramatic-d100.settings.configure-sounds.label",
      icon: "fas fa-cogs",
      type: ConfigureSoundSettingsForm,
      scope: "world",
      restricted: true,
   });

   game.settings.registerMenu(constants.modName, "animation-menu", {
      name: "dramatic-d100.settings.configure-animations.name",
      label: "dramatic-d100.settings.configure-animations.name",
      hint: "dramatic-d100.settings.configure-animations.label",
      icon: "fas fa-cogs",
      type: ConfigureAnimationSettingsForm,
      scope: "world",
      restricted: true,
   });

   game.settings.register(constants.modName, "sound-volume-multiplier", {
      name: "dramatic-d100.settings.sound-volume-multiplier.name",
      hint: "dramatic-d100.settings.sound-volume-multiplier.label",
      scope: "user",
      config: true,
      default: 1.0,
      type: Number,
      range: {
         min: 0,
         max: 1,
         step: 0.01,
      },
   });

   game.settings.register(constants.modName, "settings", {
      name: `${constants.modName}-settings`,
      scope: "world",
      default: defaultSettings,
      type: Object,
      config: false,
   });

   game.settings.register(constants.modName, "disable-npc-rolls", {
      name: "dramatic-d100.settings.disable-npc-rolls.name",
      hint: "dramatic-d100.settings.disable-npc-rolls.label",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
   });

   game.settings.register(constants.modName, "trigger-on-public-only", {
      name: "dramatic-d100.settings.trigger-on-public-only.name",
      hint: "dramatic-d100.settings.trigger-on-public-only.label",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
   });

   game.settings.register(constants.modName, "play-animations", {
      name: "dramatic-d100.settings.play-animations.name",
      hint: "dramatic-d100.settings.play-animations.label",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
   });

   game.settings.register(constants.modName, "add-sound", {
      name: "dramatic-d100.settings.add-sound.name",
      hint: "dramatic-d100.settings.add-sound.label",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
   });

   if (game.system.id === "pf2e") {
      game.settings.register(
         constants.modName,
         "pf2e-trigger-on-degree-of-success",
         {
            name: "dramatic-d100.settings.pf2e-trigger-on-degree-of-success.name",
            hint: "dramatic-d100.settings.pf2e-trigger-on-degree-of-success.label",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
         }
      );
   }
};
