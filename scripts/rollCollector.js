import constants from "../constants.js";
import { handleEffects } from "./main.js";

/**
 * Pending Rolls Map
 *  Key = msgId
 *  Value = {
 *    rolls: [Roll]
 *    isPublicRoll: boolean
 *  }
 */
let pendingRolls = new Map();
let diceSoNiceActive = false;

export const initRollCollection = () => {
   Hooks.on("createChatMessage", (msg) => {
      // debugger;
      let rolls = msg.rolls;

      // Check for and parse inline rolls
      if (msg.content.indexOf("inline-roll") !== -1) {
         const inlineRolls = parseInlineRoll(msg);
         if (inlineRolls.length) {
            rolls = rolls.concat(inlineRolls);
         }
      }

      const isRoller = msg.author.id == game.userId;
      const isPublicRoll = rolls.length && !msg.whisper.length;

      if (!!rolls.length && isRoller && !disableDueToNPC(msg.speaker)) {
         pendingRolls.set(msg.id, { rolls, isPublicRoll });
      }
   });

   Hooks.on("renderChatMessage", async (msg, context) => {
      const storedInfo = pendingRolls.get(msg.id);

      if (!storedInfo) {
         return;
      }

      if (game.system.id === "deltagreen") {
         const report = {
            isCritical: false,
            isSuccess: false,
         };
         // this could be multiple results (ex. tommy gun)
         for (const r of msg.rolls) {
            report.isCritical ||= r.isCritical;
            report.isSuccess ||= r.isSuccess;
         }

         if (!report.isCritical && !report.isSuccess) {
            // no critical or success, so no need to handle effects
            return;
         }

         storedInfo.rolls = report;

         if (diceSoNiceActive) {
            pendingRolls.set(msg.id, {
               ...storedInfo
            });
            return;
         }

         void handleEffects(storedInfo.rolls, storedInfo.isPublicRoll);
         pendingRolls.delete(msg.id);
         return;
      }

      if (game.system.id === "mosh") {
         const report = {
            isCritical: false,
            isSuccess: false,
         };
         // currently only one roll is passed
         const r = msg.flags.mosh
         report.isCritical ||= r.critical;
         report.isSuccess ||= r.success;

         if (!report.isCritical && !report.isSuccess) {
            // no critical or success, so no need to handle effects
            return;
         }
         storedInfo.rolls = report;

         if (diceSoNiceActive) {
            pendingRolls.set(msg.id, {
               ...storedInfo
            });
            return;
         }

         void handleEffects(storedInfo.rolls, storedInfo.isPublicRoll);
         pendingRolls.delete(msg.id);
         return;
      }


      if (game.system.id === "CoC7" && typeof msg.flags.CoC7?.load?.as === 'string') {
         const report = {
            isCritical: false,
            isFumble: false,
            isExtremeSuccess: false,
            isPushedFail: false,
         };
         // this could be multiple results (ex. tommy gun)
         for (const r of await game.CoC7.messageResults(msg)) {
            report.isCritical ||= r.isCritical;
            report.isFumble ||= r.isFumble;
            report.isExtremeSuccess ||= r.isExtremeSuccess;
            report.isPushedFail ||= r.isPushed && !r.isSuccess;
         }
         storedInfo.rolls = report;

         if (!report.isCritical && !report.isExtremeSuccess && !report.isFumble) {
            // no need to handle effects
            return;
         }
         if (diceSoNiceActive) {
            pendingRolls.set(msg.id, {
               ...storedInfo
            });
            return;
         }

         void handleEffects(storedInfo.rolls, storedInfo.isPublicRoll);
         pendingRolls.delete(msg.id);
         return;
      }

      // Check for and parse inline rolls
      let rolls = msg.rolls;
      if (msg.content.indexOf("inline-roll") !== -1) {
         const inlineRolls = parseInlineRoll(msg);
         if (inlineRolls.length) {
            rolls = rolls.concat(inlineRolls);
         }
      }

      // Update the stored rolls with the determined results but delay handling effects until the
      // diceSoNice rolling animation is complete
      if (diceSoNiceActive) {
         pendingRolls.set(msg.id, {
            rolls: rolls,
            isPublicRoll: storedInfo.isPublicRoll,
         });
         return;
      }

      if (rolls) {
         handleEffects(rolls, storedInfo.isPublicRoll);
         pendingRolls.delete(msg.id);
      }
   });

   if (game.modules.get("dice-so-nice")?.active) {
      diceSoNiceActive = true;

      Hooks.on("diceSoNiceRollComplete", (msgId) => {
         const storedInfo = pendingRolls.get(msgId);

         if (storedInfo?.rolls) {
            handleEffects(storedInfo.rolls, storedInfo.isPublicRoll, storedInfo.coc7Html || null);
            pendingRolls.delete(msgId);
         }
      });
   }

   if (game.modules.get("midi-qol")?.active) {
      // Handles the midi-qol merge rolls onto one card setting
      Hooks.on("midi-qol.AttackRollComplete", (workflow) => {
         const rolls = [workflow.attackRoll];
         const isPublic = workflow.attackRoll.options.rollMode === "roll";
         !disableDueToNPC(workflow.speaker) && handleEffects(rolls, isPublic);
      });
   }
};

const disableDueToNPC = (speaker) => {
   const settingEnabled = game.settings.get(
      constants.modName,
      "disable-npc-rolls"
   );
   const actor = ChatMessage.getSpeakerActor(speaker);
   const actorHasPlayerOwner = actor ? actor.hasPlayerOwner : false;
   const isGM = game.users.get(game.userId).isGM;

   return settingEnabled && !actorHasPlayerOwner && isGM;
};

const parseInlineRoll = (msg) => {
   let JqInlineRolls = $($.parseHTML(msg.content)).filter(
      ".inline-roll.inline-result"
   );

   if (JqInlineRolls.length == 0 && !msg.isRoll) {
      //it was a false positive
      return [];
   }

   let inlineRollList = [];
   JqInlineRolls.each((index, el) => {
      inlineRollList.push(Roll.fromJSON(unescape(el.dataset.roll)));
   });

   return inlineRollList;
};
