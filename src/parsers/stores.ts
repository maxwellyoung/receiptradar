export const STORES = {
  COUNTDOWN: "Countdown",
  NEW_WORLD: "New World",
  PAKNSAVE: "Pak'nSave",
  FOUR_SQUARE: "Four Square",
};

export const STORE_IDENTIFIERS: { [key: string]: RegExp } = {
  [STORES.COUNTDOWN]: /countdown/i,
  [STORES.NEW_WORLD]: /new world/i,
  [STORES.PAKNSAVE]: /pak'n'save|paknsave|pak n save/i,
  [STORES.FOUR_SQUARE]: /four square/i,
};
