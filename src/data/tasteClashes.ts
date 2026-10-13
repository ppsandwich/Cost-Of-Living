/** Deliberately narrow cooking clashes, not judgements about foods or cultures.
 * Fruit, drinks and sweet/savoury tags alone never trigger a penalty.
 * A recognised dish takes priority, leaving unrelated purchases on the side.
 */
export const TASTE_CLASHES = [{
  sweet: ["budget-cereal", "ice-cream-tub", "chocolate-bar", "fancy-chocolates", "chocolate-biscuits", "bakery-doughnuts", "discount-pudding"],
  savoury: ["tinned-tuna", "tinned-sardines", "white-fish-fillets-500g", "fish-fingers", "baked-beans", "pasta-sauce", "tomato-paste", "garlic-bulb", "onions", "red-onions-500g", "curry-powder", "instant-noodles", "pot-noodle"],
}] as const;
