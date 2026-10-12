export const SHOPS = [
  { id: "corner", name: "The corner shop", icon: "🏪", sign: "Little shop. Big lunch plans.", sound: [523, 659, 784] },
  { id: "market", name: "Market day", icon: "🌻", sign: "Find your favourites under the awning.", sound: [784, 988, 880] },
  { id: "supermarket", name: "Supermarket sweep", icon: "🛒", sign: "Aisle by aisle. Make it add up.", sound: [392, 494, 587] },
] as const;
export function shopForRound(round: number) {
  return SHOPS[(round - 1) % SHOPS.length];
}
export const POWER_UP_STOPS = [1, 3, 5, 8, 12, 16, 19];
