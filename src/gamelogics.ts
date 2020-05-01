import { createLogic, createLogicMiddleware } from 'redux-logic';
import { Dispatch, Done} from 'redux-logic-helper';
import { applyMiddleware, createStore } from 'redux';
import { actionCreatorFactory, isType, Action, AnyAction } from 'typescript-fsa';
import { act } from 'react-dom/test-utils';
const actionCreator = actionCreatorFactory();

export const gameActions = {
  discard: actionCreator<{position: number}>('discard'),
  draw: actionCreator<{tile: Tile}>('draw'),
  discardAndDraw: actionCreator<{p: number, pile: Pile, position: number, timeBeforeDraw: number, timeBeforeSort: number}>('discardAndDraw'),
  reset: actionCreator<{pile: Pile, p: number}>('reset'),
  resetAndDraw: actionCreator<{pile: Pile, p: number, timeBeforeDraw: number, timeBeforeSort: number}>('resetAndDraw'),
  sort: actionCreator<void>('sort'),
  sortAndDraw: actionCreator<{pile: Pile, p: number, timeBetweenSortDraw: number}>('sortAndDraw'),
}
const discardAndDrawLogic = createLogic({
  type: gameActions.discardAndDraw.type,
  process({ action }: { action: any }, dispatch: Dispatch, done: Done)
  {
    if (!isType(action, gameActions.discardAndDraw)) throw new TypeError();
      dispatch(gameActions.discard({position: action.payload.position}));
    if (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
    {
      setTimeout(() => {
        dispatch(gameActions.sortAndDraw({pile: action.payload.pile, p: action.payload.p, timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort}));
        done();
      }, action.payload.timeBeforeSort);
    }
    else
      setTimeout(() => {
        dispatch(gameActions.draw({tile: action.payload.pile[action.payload.p]}));
        done();
      }, action.payload.timeBeforeDraw);
  }
});
const resetAndDrawLogic = createLogic({
  type: gameActions.resetAndDraw.type,
  process({  action }: { action: any }, dispatch: Dispatch, done: Done)
  {
    if (!isType(action, gameActions.resetAndDraw)) throw new TypeError();
    console.log(action);
    dispatch(gameActions.reset({pile: action.payload.pile, p: action.payload.p}));
    if (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
    {
      setTimeout(() => {
        dispatch(gameActions.sortAndDraw({pile: action.payload.pile, p: action.payload.p, timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort}));
        done();
      }, action.payload.timeBeforeSort);
    }
    else
      setTimeout(() => {
        dispatch(gameActions.draw({tile: action.payload.pile[action.payload.p]}));
        done();
      }, action.payload.timeBeforeDraw);
  }
});
const sortAndDrawLogic = createLogic({
  type: gameActions.sortAndDraw.type,
  process({ action }: { action: any }, dispatch: Dispatch, done: Done)
  {
    if (!isType(action, gameActions.sortAndDraw)) throw new TypeError();
    dispatch(gameActions.sort());
    setTimeout(() => {
      dispatch(gameActions.draw({tile: action.payload.pile[action.payload.p]}));
      done();
    }, action.payload.timeBetweenSortDraw);
  }
});
type Hand = Array<number>;
type Pile = Array<number>;
type Tile = number;
type GameState = {
  hand: Hand,
  p: number,
  pile: Pile,
};
const nullGame: GameState = {
  hand: [],
  p: 0,
  pile: [],
};
const gameReducer = (state = nullGame, action: Action<unknown>) => {
  console.log(state);
  console.log(action);
  switch (action.type)
  {
    case gameActions.discard.type:
      if (!isType(action, gameActions.discard)) throw new TypeError();
      return {...state,
        hand: discardTile(state.hand, action.payload.position),
      };
    case gameActions.draw.type:
      if (!isType(action, gameActions.draw)) throw new TypeError();
      return {...state,
        hand: drawTile(state.hand, action.payload.tile),
        p: state.p + 1,
      };
    case gameActions.reset.type:
      if (!isType(action, gameActions.reset)) throw new TypeError();
      return {
        hand: dealHand(action.payload.p, action.payload.pile),
        p: action.payload.p,
        pile: action.payload.pile,
      };
    case gameActions.sort.type:
      if (!isType(action, gameActions.sort)) throw new TypeError();
      return {...state,
        hand: sortHand(state.hand),
      }
    default:
      return state;
  }
};
export const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware([
    discardAndDrawLogic,
    resetAndDrawLogic,
    sortAndDrawLogic])));
function discardTile(hand: Hand, position: number)
{
  hand = [...hand];
  hand.splice(position, 1);
  return hand;
}
function drawTile(hand: Hand, tile: Tile)
{
  hand = [...hand];
  hand.push(tile);
  return hand;
}
function dealHand(length: number, pile: Pile)
{
  return pile.slice(0, length);
}
function sortHand(hand: Hand)
{
  hand = [...hand];
  hand.sort((a, b) => (a - b));
  return hand;
}