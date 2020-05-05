import { createLogic, createLogicMiddleware } from 'redux-logic';
import { Dispatch, Done} from 'redux-logic-helper';
import { applyMiddleware, createStore } from 'redux';
import { actionCreatorFactory, isType } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Hand, Pile, Tile } from './gamecommon';
import { fromTiles, Validator } from './hu';
const actionCreator = actionCreatorFactory();

export const gameActions = {
  appendMessage: actionCreator<{message: string}>('appendMessage'),
  discard: actionCreator<{position: number}>('discard'),
  draw: actionCreator<{tile: Tile}>('draw'),
  discardAndDraw: actionCreator<{p: number, pile: Pile, position: number, timeBeforeDraw: number, timeBeforeSort: number}>('discardAndDraw'),
  declareHu: actionCreator<{p: number, pile: Pile, hand: Hand, validator: Validator, time: Date, timeBeforeDraw: number, timeBeforeSort: number}>('declareHu'),
  reset: actionCreator<{pile: Pile, p: number, started: Date}>('reset'),
  resetAndDraw: actionCreator<{pile: Pile, p: number, started: Date, timeBeforeDraw: number, timeBeforeSort: number}>('resetAndDraw'),
  resetGame: actionCreator<({started: Date, pile: Pile, p: number, timeBeforeDraw: number, timeBeforeSort: number})>('resetGame'),
  newGame: actionCreator<({started: Date})>('newGame'),
  sort: actionCreator<void>('sort'),
  sortAndDraw: actionCreator<{pile: Pile, p: number, timeBetweenSortDraw: number}>('sortAndDraw'),
  scoreHu: actionCreator<{time: Date, tbd: number}>('scoreHu'),
  scoreCuohu: actionCreator<{}>('scoreCuohu'),
  finish: actionCreator<{}>('finish'),
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
    dispatch(gameActions.reset({pile: action.payload.pile, p: action.payload.p, started: action.payload.started}));
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
const resetGamelogic = createLogic({
  type: gameActions.resetGame.type,
  latest: true,
  process({ action }: { action: any }, dispatch: Dispatch, done: Done)
  {
    if (!isType(action, gameActions.resetGame)) throw new TypeError();
    dispatch(gameActions.newGame({started: action.payload.started}));
    dispatch(gameActions.resetAndDraw({
      pile: action.payload.pile,
      p: action.payload.p,
      started: action.payload.started,
      timeBeforeDraw: action.payload.timeBeforeDraw,
      timeBeforeSort: action.payload.timeBeforeSort,
    }));
    setTimeout(() => {
      dispatch(gameActions.finish({}));
      done();
    }, 30000);
  }
});
const declareHuLogic = createLogic({
  type: gameActions.declareHu.type,
  process({ action }: { action: any }, dispatch: Dispatch, done: Done)
  {
    if (!isType(action, gameActions.declareHu)) throw new TypeError();
    let hu = action.payload.validator(fromTiles(action.payload.hand));
    if (hu)
      dispatch(gameActions.scoreHu({time: action.payload.time, tbd: action.payload.timeBeforeDraw}));
    else
      dispatch(gameActions.scoreCuohu({}));
    dispatch(gameActions.appendMessage({message: `declared ${hu} hu at ${action.payload.time}`}));
    dispatch(gameActions.resetAndDraw({
      pile: action.payload.pile,
      p: action.payload.p,
      started: action.payload.time,
      timeBeforeDraw: action.payload.timeBeforeDraw,
      timeBeforeSort: action.payload.timeBeforeSort,
    }));
    done();
  }
})
type GameState = {
  hand: Hand,
  p: number,
  pile: Pile,
  score: number,
  started: Date | null,
  handStarted: Date | null,
  messages: Array<[number, string]>,
};
const nullGame: GameState = {
  hand: [],
  p: 0,
  pile: [],
  score: 0,
  started: null,
  handStarted: null,
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
  handStarted: payload.started,
}))
.case(gameActions.sort, (state, payload) => ({...state,
  hand: sortHand(state.hand),
}))
.case(gameActions.declareHu, (state, payload) => ({...state,
  messages: appendMessage(state.messages, payload.validator(fromTiles(payload.hand)) ? "HU!" : "cuohu..."),
}))
.case(gameActions.newGame, (state, payload) => ({...nullGame,
  started: payload.started,
  messages: [[0, `new game started at ${payload.started}`]],
}))
.case(gameActions.appendMessage, (state, payload) => ({...state,
  messages: appendMessage(state.messages, payload.message)
}))
.case(gameActions.scoreHu, (state, payload) => ({...state,
  score: state.score + Math.sqrt(payload.tbd / (payload.time.valueOf() - state.handStarted!.valueOf())),
}))
.case(gameActions.scoreCuohu, (state, payload) => ({...state,
  score: state.score - 1,
}))
.case(gameActions.finish, (state, payload) => ({...state,
  messages: appendMessage(state.messages, `score: ${state.score}`),
}))
;
function appendMessage(messages: Array<[number, string]>, newMessage: string): Array<[number, string]>
{
  if (messages.length === 0) return [[0, newMessage]];
  const ret: Array<[number, string]> = [...messages, [messages[messages.length-1][0]+1, newMessage]];
  return ret.slice(-4);
}
export const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware([
    discardAndDrawLogic,
    resetAndDrawLogic,
    resetGamelogic,
    sortAndDrawLogic,
    declareHuLogic])));
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
