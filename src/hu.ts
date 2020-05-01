import * as gamecommon from './gamecommon';
import { range } from './common';

export function fromTiles(hand: gamecommon.Hand): Array<number>
{
  let ret = new Array(gamecommon.ranks).fill(0);
  hand.forEach(tile => {ret[gamecommon.rank(tile)] += 1});
  return ret;
}

export type Validator = (hand: Array<number>) => boolean;

export function isNormalHu(hand: Array<number>): boolean
{
  for (const [rank, count] of hand.entries())
  {
    if (count < gamecommon.pairSize)
    continue;
    let handCopied = [...hand];
    handCopied[rank] -= gamecommon.pairSize;
    if (isSets(handCopied)) return true;
  }
  return false;
}

export function isSets(hand: Array<number>): boolean
{
  for (const rank of range(gamecommon.ranks - gamecommon.setSize + 1))
  {
    if (hand[rank] < 0) return false;
    hand[rank] %= gamecommon.setSize;
    const c = hand[rank];
    for (const d of range(gamecommon.setSize))
    {
      hand[rank + d] -= c;
    }
  }
  for (const count of hand)
  {
    if (count % gamecommon.setSize) return false;
  }
  return true;
}

export function isPairs(hand: Array<number>): boolean
{
  let sets = 0;
  let pairs = 0;
  for (const count of hand)
  {
    switch (count)
    {
      case 0: continue;
      case gamecommon.setSize: sets += 1; continue;
      case gamecommon.pairSize: pairs += 1; continue;
      default: return false;
    }
  }
  return (sets <= 1) && (pairs % gamecommon.setSize === 1);
}

export function isPairsWithHog(hand: Array<number>): boolean
{
  let sets = 0;
  let pairs = 0;
  for (const count of hand)
  {
    if (count === gamecommon.setSize)
    {
      sets += 1;
      continue;
    }
    if (count % gamecommon.pairSize)
      return false;
    pairs += count / gamecommon.pairSize;
  }
  return (sets <= 1) && (pairs % gamecommon.setSize === 1);
}
