export type PowerUpId =
  | "haggler"
  | "timewalker"
  | "deep_pockets"
  | "bulk_buyer"
  | "coupon_clipper"
  | "superstore"
  | "embezzler"
  | "escape_rope"
  | "shared_kitchen"
  | "fridge"
  | "price_compare";

export interface PowerUp {
  id: PowerUpId;
  name: string;
  icon: string;
  description: string;
  rarity?: "rare";
  presentation?: "mutated";
}

export const POWER_UPS: PowerUp[] = [
  {
    id: "haggler",
    name: "Shop membership",
    icon: "🤝",
    description:
      "Pay 10% less for every item.",
  },
  {
    id: "timewalker",
    name: "Time to shop",
    icon: "⏳",
    description:
      "Get 20 extra seconds in each timed round.",
  },
  {
    id: "deep_pockets",
    name: "Grocery voucher",
    icon: "🎟️",
    description: "Get $2 extra to spend in every shop.",
  },
  {
    id: "bulk_buyer",
    name: "Group order",
    icon: "📦",
    description:
      "One extra pack of every item on the shelves.",
  },
  {
    id: "coupon_clipper",
    name: "Extra specials",
    icon: "✂️",
    description:
      "Two more items go on sale in each shop.",
  },
  {
    id: "superstore",
    name: "Transport pass",
    icon: "🚌",
    description: "Visit a bigger shop with 30% more items.",
  },
  {
    id: "embezzler",
    name: "Savings jar",
    icon: "🪙",
    rarity: "rare",
    description: "Add half your leftover money to the next budget.",
  },
  {
    id: "shared_kitchen",
    name: "Shared kitchen",
    icon: "🍳",
    description:
      "Use a stove, oven, kettle and microwave. Food rules stay the same.",
  },
  {
    id: "fridge",
    name: "Fridge and freezer",
    icon: "🧊",
    description:
      "Use chilled and frozen foods with a fridge and freezer.",
  },
  {
    id: "price_compare",
    name: "Price scout",
    icon: "🔎",
    description:
      "Mark the cheapest pack you can use for each part of lunch.",
  },
  {
    id: "escape_rope",
    name: "Skip a shop",
    icon: "🪢",
    presentation: "mutated",
    description:
      "Skip once. No points or lunch counted. Not for the final round.",
  },
];

export const POWER_UP_BY_ID = Object.fromEntries(
  POWER_UPS.map((p) => [p.id, p]),
) as Record<PowerUpId, PowerUp>;
