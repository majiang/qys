export type Hand = Array<number>;
export type Pile = Array<number>;
export type Tile = number;
export const ranks = 9;
export const duplicates = 4;
export const deck = ranks * duplicates;
export function rank(tile: Tile): number
{
    return ~~(tile/duplicates);
}
export function shufflePile(): Pile
{
  let m = deck;
  let pile = Array.from(Array(m).keys());
  while (m)
  {
    const i = Math.floor(Math.random() * (m--));
    [pile[i], pile[m]] = [pile[m], pile[i]];
  }
  return pile;
}
export const setSize = 3;
export const pairSize = 2;
