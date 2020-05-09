import { createLogicMiddleware } from 'redux-logic';
import { createLogic } from './redux-logic-helper';
import { Dispatch, Done, ActionOf, PayloadOf } from 'redux-logic-helper';
import { applyMiddleware, createStore } from 'redux';
import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { fromTiles, Validator } from './hu';
import { Deal, nullDeal, discardTile, drawTile, dealHand, sortHand } from './deal';
const actionCreator = actionCreatorFactory();

export const gameActions = {
  appendMessage: actionCreator<{message: string}>('appendMessage'),
  discard: actionCreator<{position: number}>('discard'),
  draw: actionCreator<{}>('draw'),
  discardAndDraw: actionCreator<{position: number, timeBeforeDraw: number, timeBeforeSort: number}>('discardAndDraw'),
  declareHu: actionCreator<{next: Deal, validator: Validator, timeBeforeDraw: number, timeBeforeSort: number}>('declareHu'),
  reset: actionCreator<{deal: Deal}>('reset'),
  resetAndDraw: actionCreator<{deal: Deal, timeBeforeDraw: number, timeBeforeSort: number}>('resetAndDraw'),
  resetGame: actionCreator<({first: Deal, timeBeforeDraw: number, timeBeforeSort: number, timeOfGame: number})>('resetGame'),
  newGame: actionCreator<({started: Date})>('newGame'),
  sort: actionCreator<{}>('sort'),
  sortAndDraw: actionCreator<{timeBetweenSortDraw: number}>('sortAndDraw'),
  scoreHu: actionCreator<{time: Date, tbd: number}>('scoreHu'),
  scoreCuohu: actionCreator<{}>('scoreCuohu'),
  finish: actionCreator<{}>('finish'),
}

const discardAndDrawLogic = createLogic<GameState, PayloadOf<typeof gameActions.discardAndDraw>>(
  gameActions.discardAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.discardAndDraw>}, dispatch: Dispatch, done: Done)
    {
      dispatch(gameActions.discard({position: action.payload.position}));
      if (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
      {
        setTimeout(() => {
          dispatch(gameActions.sortAndDraw({timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort}));
          done();
        }, action.payload.timeBeforeSort);
      }
      else
        setTimeout(() => {
          dispatch(gameActions.draw({}));
          done();
        }, action.payload.timeBeforeDraw);
    }
  });
const resetAndDrawLogic = createLogic(
  gameActions.resetAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.resetAndDraw> }, dispatch: Dispatch, done: Done)
    {
      console.log(action);
      dispatch(gameActions.reset({deal: action.payload.deal}));
      if (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
      {
        setTimeout(() => {
          dispatch(gameActions.sortAndDraw({timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort}));
          done();
        }, action.payload.timeBeforeSort);
      }
      else
        setTimeout(() => {
          dispatch(gameActions.draw({deal: action.payload.deal}));
          done();
        }, action.payload.timeBeforeDraw);
    }
  });
const sortAndDrawLogic = createLogic(
  gameActions.sortAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.sortAndDraw> }, dispatch: Dispatch, done: Done)
    {
      console.log('dispatch(sort)');
      dispatch(gameActions.sort({}));
      setTimeout(() => {
        dispatch(gameActions.draw({}));
        done();
      }, action.payload.timeBetweenSortDraw);
    }
  });
const resetGamelogic = createLogic(
  gameActions.resetGame,
  {
    latest: true,
    process({ action }: { action: ActionOf<typeof gameActions.resetGame> }, dispatch: Dispatch, done: Done)
    {
      console.log(action.payload);
      dispatch(gameActions.newGame({started: action.payload.first.started!}));
      dispatch(gameActions.resetAndDraw({
        deal: action.payload.first,
        timeBeforeDraw: action.payload.timeBeforeDraw,
        timeBeforeSort: action.payload.timeBeforeSort,
      }));
      console.log(`${action.payload.timeOfGame} + ${new Date()}`);
      setTimeout(() => {
        console.log(`${new Date()}`);
        dispatch(gameActions.finish({}));
        console.log(`${new Date()}`);
        done();
        console.log(`${new Date()}`);
      }, action.payload.timeOfGame);
      console.log(`${new Date()}`);
    }
  });
const declareHuLogic = createLogic(
  gameActions.declareHu,
  {
    process({ action, getState }: { action: ActionOf<typeof gameActions.declareHu>, getState: () => GameState }, dispatch: Dispatch, done: Done)
    {
      let hu = action.payload.validator(fromTiles(getState().deal.hand));
      if (hu)
        dispatch(gameActions.scoreHu({time: action.payload.next.started!, tbd: action.payload.timeBeforeDraw}));
      else
        dispatch(gameActions.scoreCuohu({}));
      dispatch(gameActions.appendMessage({message: `declared ${hu} hu`}));
      dispatch(gameActions.resetAndDraw({
        deal: action.payload.next,
        timeBeforeDraw: action.payload.timeBeforeDraw,
        timeBeforeSort: action.payload.timeBeforeSort,
      }));
      done();
    }
  });
type GameState = {
  deal: Deal,
  score: number,
  started: Date | null,
  messages: Array<[number, string]>,
};
const nullGame: GameState = {
  deal: nullDeal,
  score: 0,
  started: null,
  messages: [],
};
const gameReducer = reducerWithInitialState(nullGame)
.case(gameActions.discard, (state, payload) => ({...state,
  deal: discardTile(state.deal, payload.position),
}))
.case(gameActions.draw, (state, _) => ({...state,
  deal: drawTile(state.deal),
}))
.case(gameActions.reset, (state, payload) => ({...state,
  deal: dealHand(payload.deal),
}))
.case(gameActions.sort, (state, _) => ({...state,
  deal: sortHand(state.deal),
}))
.case(gameActions.newGame, (_, payload) => ({...nullGame,
  started: payload.started,
  messages: appendMessage([], `new game started at ${payload.started}`),
}))
.case(gameActions.appendMessage, (state, payload) => ({...state,
  messages: appendMessage(state.messages, payload.message)
}))
.case(gameActions.scoreHu, (state, payload) => ({...state,
  score: state.score + Math.sqrt(payload.tbd / (payload.time.valueOf() - state.deal.started!.valueOf())),
}))
.case(gameActions.scoreCuohu, (state, _) => ({...state,
  score: state.score - 1,
}))
.case(gameActions.finish, (state, payload) => {
  console.log(`finish at: ${new Date()}`);
  console.log(state);
  console.log(payload);
  return {...nullGame,
  messages: appendMessage([], `finish! score: ${~~(state.score * 1000)}`),
};})
;
function appendMessage(messages: Array<[number, string]>, newMessage: string): Array<[number, string]>
{
  if (messages.length === 0) return [[0, newMessage]];
  const ret: Array<[number, string]> = [...messages, [messages[messages.length-1][0]+1, newMessage]];
  return ret.slice(-4);
}
const logics = [
  discardAndDrawLogic,
  resetAndDrawLogic,
  resetGamelogic,
  sortAndDrawLogic,
  declareHuLogic];
export const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware(logics)));
