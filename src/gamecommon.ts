import { sha512 } from "js-sha512";
import { MersenneTwister } from "./mt";
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
interface Random
{
  random(): number;
}
export function pileShuffler(random: Random)
{
  return () =>
  {
    let m = deck;
    let pile = Array.from(Array(m).keys());
    while (m)
    {
      const i = Math.floor(random.random() * (m--));
      [pile[i], pile[m]] = [pile[m], pile[i]];
    }
    return pile;
  };
}
export function MT19937(seed: string)
{
  let mt = new MersenneTwister();
  mt.init_by_array(sha512.digest(seed + '#QYSMJ'));
  return mt;
}
export const setSize = 3;
export const pairSize = 2;
export type Message = [number, string];
export type Messages = Array<Message>;
export function appendMessage(messages: Messages, newMessage: string): Messages
{
  if (messages.length === 0) return [[0, newMessage]];
  const ret: Messages = [...messages, [messages[messages.length-1][0]+1, newMessage]];
  return ret.slice(-4);
}
