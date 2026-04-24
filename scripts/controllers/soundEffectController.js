import constants from "../../constants.js";

const baseSoundPath = `modules/${constants.modName}/sounds`;

// Returns random int between 0 and max (exclusive)
const getRandomInt = (max) => {
   return Math.floor(Math.random() * Math.floor(max));
};

const critSoundEffectFiles = [
   "choral_woosh.ogg",
   "choral_woosh_1.ogg",
   "Impact.ogg",
   "Impact_1.ogg",
   "level-complete-magical-sparkle.ogg",
   "resonant_chimes.ogg",
   "rumble.ogg",
   "thompy_woosh.ogg",
].map((fileName) => `${baseSoundPath}/crit/${fileName}`);

const fumbleSoundEffectFiles = [
   "Apperance_Whoosh.ogg",
   "Minor_Hits.ogg",
   "power-down.ogg",
   "SaxophoneDowner.ogg",
   "Sword_Swish.ogg",
   "Thunder_Whoosh.ogg",
   "video-game-game-over.ogg",
   "Whoosh_ghostly.ogg",
   "WindWhoosh.ogg",
].map((fileName) => `${baseSoundPath}/fumble/${fileName}`);

const getCritSoundEffect = () => {
   const sounds = game.settings.get(constants.modName, "settings").critSounds;
   const enabledSounds = sounds.filter((s) => s.enabled);
   const selectedSound = enabledSounds[getRandomInt(enabledSounds.length)];
   return selectedSound;
};

const getFumbleSoundEffect = () => {
   const sounds = game.settings.get(constants.modName, "settings").fumbleSounds;
   const enabledSounds = sounds.filter((s) => s.enabled);
   const selectedSound = enabledSounds[getRandomInt(enabledSounds.length)];
   return selectedSound;
};

const playSound = (soundParams, broadcastSound, overrideVolume = null) => {
   // Apply per-player volume multiplier
   const volumeMultiplier = overrideVolume ?? game.settings.get(
      constants.modName,
      "sound-volume-multiplier"
   );
   const adjustedVolume = (soundParams.volume || 1.0) * volumeMultiplier;
   const adjustedSoundParams = {
      ...soundParams,
      volume: adjustedVolume,
   };

   if (foundry?.audio?.AudioHelper) {
      foundry.audio.AudioHelper.play(adjustedSoundParams, broadcastSound);
   } else {
      AudioHelper.play(adjustedSoundParams, broadcastSound);
   }
}

export default {
   critSoundEffectFiles,
   fumbleSoundEffectFiles,
   getCritSoundEffect,
   getFumbleSoundEffect,
   playSound
};
