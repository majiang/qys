import { createLogic, createLogicMiddleware } from 'redux-logic';
import { Dispatch, Done} from 'redux-logic-helper';
import { applyMiddleware, createStore } from 'redux';
import { actionCreatorFactory, isType } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Hand, Pile, Tile } from './gamecommon';
import { fromTiles, Validator } from './hu';
const actionCreator = actionCreatorFactory();

export const gameActions = {
  discard: actionCreator<{position: number}>('discard'),
  draw: actionCreator<{tile: Tile}>('draw'),
  discardAndDraw: actionCreator<{p: number, pile: Pile, position: number, timeBeforeDraw: number, timeBeforeSort: number}>('discardAndDraw'),
  declareHu: actionCreator<{hand: Hand, validator: Validator}>('declareHu'),
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
type GameState = {
  hand: Hand,
  p: number,
  pile: Pile,
  messages: Array<string>
};
const nullGame: GameState = {
  hand: [],
  p: 0,
  pile: [],
  messages: [],
};
const gameReducer = reducerWithInitialState(nullGame)
.case(gameActions.discard, (state, payload) => ({...state,
  hand: discardTile(state.hand, payload.position),
}))
.case(gameActions.draw, (state, payload) => ({...state,
  hand: drawTile(state.hand, payload.tile),
  p: state.p + 1,
}))
.case(gameActions.reset, (state, payload) => ({...state,
  hand: dealHand(payload.p, payload.pile),
  p: payload.p,
  pile: payload.pile,
}))
.case(gameActions.sort, (state, payload) => ({...state,
  hand: sortHand(state.hand),
}))
.case(gameActions.declareHu, (state, payload) => ({...state,
  messages: payload.validator(fromTiles(payload.hand)) ? [...state.messages, "HU!"] : [...state.messages, "Cuohu..."],
}))
;
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
