export const STORES = {
  COUNTDOWN: "Countdown",
  NEW_WORLD: "New World",
  PAKNSAVE: "Pak'nSave",
  FOUR_SQUARE: "Four Square",
  MOORE_WILSONS: "Moore Wilson's Fresh",
  WAREHOUSE: "The Warehouse",
  FRESH_CHOICE: "Fresh Choice",
};

export const STORE_IDENTIFIERS: { [key: string]: RegExp } = {
  [STORES.COUNTDOWN]: /countdown/i,
  [STORES.NEW_WORLD]: /new world/i,
  [STORES.PAKNSAVE]: /pak'n'save|paknsave|pak n save/i,
  [STORES.FOUR_SQUARE]: /four square/i,
  [STORES.MOORE_WILSONS]: /moore wilson|wilson fresh/i,
  [STORES.WAREHOUSE]: /warehouse|the warehouse/i,
  [STORES.FRESH_CHOICE]: /fresh choice|freshchoice/i,
};
