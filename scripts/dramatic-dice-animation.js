const MODULE_ID = "dramatic-d100";
const AUTO_DISMISS_MS = 5000;

/** Remove transient roll animation layer and any open prompt overlay. */
export function dismissDramaticPresentation() {
   document.getElementById("dramatic-d100-animation")?.remove();
   document.querySelectorAll("#dramatic-dice-animation-prompt").forEach((el) => el.remove());
}

/**
 * Temporary fullscreen-style overlay (created on demand, removed on dismiss).
 * Crit/fumble animations use the persistent host; this is separate.
 * @param {object} [data] - passed to template as `data`
 * @returns {Promise<void>}
 */
export async function showDramaticDiceAnimation(data = {}) {
   document.querySelectorAll("#dramatic-dice-animation-prompt").forEach((el) => el.remove());

   const overlay = document.createElement("div");
   overlay.id = "dramatic-dice-animation-prompt";
   overlay.className = "dda-prompt-overlay";

   const backdrop = document.createElement("div");
   backdrop.className = "dda-prompt-backdrop";
   backdrop.setAttribute("aria-hidden", "true");

   const inner = document.createElement("div");
   inner.className = "dda-prompt-inner";

   const templatePath = `modules/${MODULE_ID}/templates/dramatic-dice-animation-overlay.hbs`;
   try {
      inner.innerHTML = await foundry.applications.handlebars.renderTemplate(templatePath, {
         data,
      });
   } catch (err) {
      console.error("dramatic-d100: dramatic-dice-animation template failed", err);
      ui.notifications?.error?.("dramatic-d100: could not show dramatic dice animation.");
      return;
   }

   overlay.appendChild(backdrop);
   overlay.appendChild(inner);

   let dismissed = false;
   let timeoutId;
   const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(timeoutId);
      overlay.remove();
   };

   timeoutId = setTimeout(dismiss, AUTO_DISMISS_MS);

   overlay.addEventListener("click", dismiss);

   document.body.appendChild(overlay);
}
