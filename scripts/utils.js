export const getDistinct = (array, pick) => {
   const sample = [];
   const arrayClone = [...array];

   for (var i = 0; i < pick; i++) {
      sample.push(arrayClone.splice(Math.random() * arrayClone.length, 1));
   }

   return sample.flat();
};

export const getRandomArbitrary = (min, max) => {
   return Math.random() * (max - min) + min;
};

/*
 * In GURPS critical success and failure are decided by specific results in 3d6 dice
 * or by margin of success/failure.
 *
 * Critical success occur when:
 *    1. The roll result is 4 or lower.
 *    2. The roll result is 5 or 6, and the margin of success is 10 or more.
 * Critical failure occur when:
 *    1. The roll result is 18.
 *    2. The roll result is 17, and the margin fails for -2 or more.
 *    3. The roll result is 5 or more and the margin fails for more than -10.
 *
 * In GURPS Game Aid System, GurpsRoll stores the rolls inside GurpsDie and the margin
 * is positive for success rolls or negative for failures. For rolls without a target number
 * margin is undefined.
 *
 * Because we can use On-The-Fly formulas to roll dice,
 * we need to check if the roll is a 3d6, if it has a valid flavor (internal reference
 * for attributes, skills, spells, etc.) and a margin.
 *
 * @param {roll} - GurpsRoll object.
 * @returns {Object} - An object containing the critical results
 */
export const parseFromGurpsRoll = (roll) => {
   // Get GurpsDie and results from GurpsRoll
   const gurpsDie = roll.dice[0]
   const pureDiceResult = gurpsDie.values.reduce((acc, result) => acc + result, 0)
   const numberOfDice = gurpsDie.values.length
   const margin = roll.data.margin
   const flavor = gurpsDie.flavor

   // Check flavor
   const ForbiddenFlavors = ["damage"]
   const isValidFlavor = !!flavor && !ForbiddenFlavors.includes(flavor.toLowerCase())

   let criticalSuccess = false
   let criticalFailure = false

   if (numberOfDice === 3 && isValidFlavor && !!margin) {
      criticalSuccess = (
          pureDiceResult <= 4 ||
          (pureDiceResult <= 6 && margin >= 10)
      )
      criticalFailure = (
          pureDiceResult === 18 ||
          (pureDiceResult === 17 && margin <= -2) ||
          (pureDiceResult > 4 && margin <= -10)
      )
   }

   return {
      isCritSuccess: criticalSuccess,
      isCritFailure: criticalFailure,
   }
}

/*
 * For Call of Cthulhu We're getting the degree of success 
 * from the 'dice-total' html element
 */
const OUTCOME_CLASSES = ["critical", "fumble", "success-extreme"];

function findOutcomeFromElement(rootEl) {
   // dice-total success-extreme
   if (!rootEl?.querySelectorAll) return null;
   const formulas = rootEl.querySelectorAll(".dice-total");
   for (const el of formulas) {
      for (const cls of OUTCOME_CLASSES) {
         if (el?.classList?.contains(cls)) return cls;
      }
   }

   return null; // no outcome found
}

export const parseCoCDiceMessage = (html_string) => {
   if (typeof html_string === "string") {
      const doc = new DOMParser().parseFromString(html_string, "text/html");
      return findOutcomeFromElement(doc.body);
   }
   return null;
}