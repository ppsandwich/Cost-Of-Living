export type PowerUpId =
  | "iron_stomach"
  | "haggler"
  | "shoplifter"
  | "plant_lover"
  | "timewalker"
  | "sweet_tooth"
  | "deep_pockets"
  | "minimalist"
  | "bulk_buyer"
  | "label_reader"
  | "treat_whisperer"
  | "protein_shaker"
  | "cast_iron_arteries"
  | "coupon_clipper"
  | "camp_chef"
  | "superstore"
  | "exposure_therapy"
  | "carb_loading"
  | "sugar_free"
  | "zero_carb"
  | "fat_free";

export interface PowerUp {
  id: PowerUpId;
  name: string;
  icon: string;
  description: string;
  rarity?: "rare";
}

export const POWER_UPS: PowerUp[] = [
  {
    id: "iron_stomach",
    name: "Iron Stomach",
    icon: "🦾",
    description: "Expired food is 50% more nutritious. Best-before dates fear you.",
  },
  {
    id: "haggler",
    name: "Haggler",
    icon: "🤝",
    description: "All food is 10% cheaper. The till operator has given up arguing.",
  },
  {
    id: "shoplifter",
    name: "Shoplifter",
    icon: "🧤",
    description:
      "The first time an item lands in the basket each round, 20% chance its nutrition and happiness count twice.",
  },
  {
    id: "plant_lover",
    name: "Plant Lover",
    icon: "🌱",
    description: "Fresh food provides 20% more nutrition and happiness.",
  },
  {
    id: "timewalker",
    name: "Timewalker",
    icon: "⏳",
    description: "Every round lasts 20 seconds longer.",
  },
  {
    id: "sweet_tooth",
    name: "Sweet Tooth",
    icon: "🍭",
    description: "Sugar limits are 25% higher. Dessert is a food group now.",
  },
  {
    id: "deep_pockets",
    name: "Deep Pockets",
    icon: "👛",
    description: "Every round's budget is $2.00 bigger. Found it down the sofa.",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    icon: "🧘",
    description: "No repetition penalty — the third beige carbohydrate is as joyful as the first.",
  },
  {
    id: "bulk_buyer",
    name: "Bulk Buyer",
    icon: "📦",
    description: "Every item's purchase limit is one higher.",
  },
  {
    id: "label_reader",
    name: "Label Reader",
    icon: "🔍",
    description: "Shrinkflated items lose only a quarter of their value instead of half.",
  },
  {
    id: "treat_whisperer",
    name: "Treat Whisperer",
    icon: "🍰",
    description: "Treats and comfort food give 25% more happiness.",
  },
  {
    id: "protein_shaker",
    name: "Protein Shaker",
    icon: "🥤",
    description: "Protein contributes 50% more nutrition.",
  },
  {
    id: "cast_iron_arteries",
    name: "Cast-Iron Arteries",
    icon: "🫀",
    description: "Fat limits are 25% higher. Butter is on notice.",
  },
  {
    id: "coupon_clipper",
    name: "Coupon Clipper",
    icon: "✂️",
    description: "Two extra discount stickers appear in every store.",
  },
  {
    id: "camp_chef",
    name: "Camp Chef",
    icon: "🔥",
    description: "Missing kitchen equipment only half as punishing — improvisation is a skill.",
  },
  {
    id: "superstore",
    name: "Superstore",
    icon: "🏬",
    rarity: "rare",
    description: "30% more items on the shelves. The aisle goes on forever.",
  },
  {
    id: "exposure_therapy",
    name: "Exposure Therapy",
    icon: "💉",
    rarity: "rare",
    description: "Characters no longer have allergies or aversions. Everything is on the menu.",
  },
  {
    id: "carb_loading",
    name: "Carb Loading",
    icon: "🍝",
    rarity: "rare",
    description: "Carb limits are 25% higher. The marathon is implied.",
  },
  {
    id: "sugar_free",
    name: "Sugar Free",
    icon: "🦷",
    description: "Items no longer contain any sugar. The dentist weeps with joy.",
  },
  {
    id: "zero_carb",
    name: "Zero Carb",
    icon: "⚡",
    description: "Items no longer contain carbs. Bread is now a concept.",
  },
  {
    id: "fat_free",
    name: "Fat Free",
    icon: "🪶",
    description: "Items no longer contain fat. Everything floats a little.",
  },
];

export const POWER_UP_BY_ID: Record<PowerUpId, PowerUp> = Object.fromEntries(
  POWER_UPS.map((p) => [p.id, p])
) as Record<PowerUpId, PowerUp>;
