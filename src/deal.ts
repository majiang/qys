import { Hand, Pile, shufflePile } from './gamecommon';
export type Deal =
{
  hand: Hand,
  p: number,
  pile: Pile,
  started: Date | null,
};
export const nullDeal: Deal =
{
  hand: [],
  p: 0,
  pile: [],
  started: null,
};
export function discardTile(deal: Deal, position: number)
{
  let hand = [...deal.hand];
  hand.splice(position, 1);
  return {...deal,
    hand,
  };
}
export function drawTile(deal: Deal)
{
  let hand = [...deal.hand];
  hand.push(deal.pile[deal.p]);
  return {...deal,
    hand,
    p: deal.p+1,
  };
}
export function dealHand(deal: Deal): Deal
{
  return {...deal,
    hand: deal.pile.slice(0, deal.p),
  };
}
export function sortHand(deal: Deal): Deal
{
  console.log(deal);
  let hand = [...deal.hand];
  hand.sort((a, b) => (a - b));
  const ret = {...deal,
    hand,
  };
  console.log(ret);
  return ret;
}
export function newDeal(shuffle: () => Pile, date: () => Date, p: number): Deal
{
  const pile = shufflePile();
  const started = date();
  return dealHand({...nullDeal,
    p,
    pile,
    started,
  });
}
