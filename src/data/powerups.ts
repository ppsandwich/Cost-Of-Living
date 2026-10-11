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
    name: "Co-op membership",
    icon: "🤝",
    description:
      "All shelf prices are 10% lower. Buying together has its benefits.",
  },
  {
    id: "timewalker",
    name: "Time to shop",
    icon: "⏳",
    description:
      "20 extra seconds in timed rounds. Someone else is doing the school pickup.",
  },
  {
    id: "deep_pockets",
    name: "Grocery voucher",
    icon: "🎟️",
    description: "An extra $2 for each shop. A little breathing room.",
  },
  {
    id: "bulk_buyer",
    name: "Group order",
    icon: "📦",
    description:
      "One extra pack of each item is available. Share the order, expand the options.",
  },
  {
    id: "coupon_clipper",
    name: "Coupon clipper",
    icon: "✂️",
    description:
      "Two extra specials in each shop. Still worth checking the price.",
  },
  {
    id: "superstore",
    name: "Transport pass",
    icon: "🚌",
    description: "Reach a bigger shop with 30% more choice.",
  },
  {
    id: "embezzler",
    name: "Savings jar",
    icon: "🪙",
    rarity: "rare",
    description: "Half of the money left carries into the next shop.",
  },
  {
    id: "shared_kitchen",
    name: "Shared kitchen",
    icon: "🍳",
    description:
      "Access to a stove, oven, kettle and microwave. Dietary boundaries still apply.",
  },
  {
    id: "fridge",
    name: "Cold storage",
    icon: "🧊",
    description:
      "Access to a fridge and freezer makes chilled and frozen options usable.",
  },
  {
    id: "price_compare",
    name: "Price scout",
    icon: "🔎",
    description:
      "Show the cheapest usable option for each lunch component on the shelves.",
  },
  {
    id: "escape_rope",
    name: "Rain check",
    icon: "🪢",
    presentation: "mutated",
    description:
      "One use: move to the next shop without a score or a cleared-round credit. Cannot skip the final shop.",
  },
];

export const POWER_UP_BY_ID = Object.fromEntries(
  POWER_UPS.map((p) => [p.id, p]),
) as Record<PowerUpId, PowerUp>;
