export const PURCHASE_FEEDBACK = {
  nutritious: [
    "Nutrition improved. Happiness looked at it and shrugged.",
    "Objectively a good choice. Emotionally a beige one.",
    "The body says thank you. The soul says nothing.",
    "Vitamins acquired. Joy pending.",
  ],
  happy: [
    "Happiness up. Nutrition is pretending not to notice.",
    "That's not food, that's morale.",
    "The heart wants what the heart wants. The heart wants snacks.",
    "Joy purchased at a reasonable unit price.",
  ],
  balanced: [
    "Cheap, filling, and spiritually beige.",
    "A solid, sensible purchase. Suspiciously sensible.",
    "Both meters moved. This is what victory smells like.",
    "Decent food at a decent price. Don't get used to it.",
  ],
  junk: [
    "Technically food. Emotionally a hug. Nutritionally a rumour.",
    "The basket is judging you. The basket can't afford to judge anyone.",
    "Delicious. Moving on quickly.",
    "Budget remaining: technically money, emotionally confetti.",
  ],
  equipmentMismatch: [
    "Hard to enjoy this when your cooking equipment is 'optimism'.",
    "Bought, yes. Cookable? That's between them and the universe.",
    "A bold purchase for someone with that kitchen.",
  ],
  repetition: [
    "That is technically food. It is also the third beige carbohydrate in a row.",
    "Variety has left the basket.",
    "The basket is becoming a monoculture.",
  ],
  restriction: [
    "They can't really eat this. The basket accepts it anyway, sadly.",
    "A purchase that ignores who it's for.",
    "This one's going to sit in the cupboard radiating awkwardness.",
  ],
};

export const WARNING_FEEDBACK: Record<string, string> = {
  sugar: "Sugar is getting dangerous. The bargain dessert aisle is making eye contact.",
  fat: "Fat levels climbing. The butter is winning.",
  carbs: "Carbs approaching critical beige.",
  calories: "Calorie count entering 'ambitious' territory.",
  sodium: "Sodium rising. The noodles were not your friend.",
};

export const DEATH_MESSAGES: Record<string, (name: string) => string> = {
  sugar: (n) => `${n} has been defeated by sugar, which arrived in multipack form.`,
  fat: (n) => `${n} has been defeated by the economy fat surplus.`,
  carbs: (n) => `${n} has been buried under an avalanche of affordable carbohydrate.`,
  calories: (n) => `${n} has been defeated by sheer caloric ambition.`,
  sodium: (n) => `${n} has been defeated by the $2.20 sodium economy.`,
};

export const LOSS_MESSAGES: Record<string, string> = {
  timer_expired: "Time's up. The basket contains food, technically, but not a plan.",
  submitted_failed:
    "The basket was checked out. The basket was insufficient. The basket apologises.",
  out_of_money:
    "You are out of money and still short on needs. The game is over, which is rude but accurate.",
};

export const WIN_MESSAGES = [
  (n: string) => `You did it. ${n} is fed, broadly content, and only mildly suspicious of the lentils.`,
  (n: string) => `${n} survives another week of groceries. The receipt is a small war memorial.`,
  (n: string) => `Needs met. ${n} would clap, but they're holding the shopping.`,
  (n: string) => `${n} is fed and happy. Capitalism blinks first, this round.`,
];

export const RUN_SUMMARY_LINES: ((rounds: number) => string)[] = [
  (r) => `You survived ${r} round${r === 1 ? "" : "s"}. Then the budget became decorative.`,
  (r) => `${r} round${r === 1 ? "" : "s"} survived. The spreadsheet sends its condolences.`,
  (r) => `You made it through ${r} round${r === 1 ? "" : "s"} before the maths won.`,
];

export const TUTORIAL_COPY =
  "Buy food. Keep them fed. Keep them happy. Do not accidentally turn the snack aisle into a boss fight. Every round you survive makes the next budget worse, because apparently this game has read the news.";
