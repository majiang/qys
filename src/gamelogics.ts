import { createLogicMiddleware } from 'redux-logic';
import { createLogic } from './redux-logic-helper';
import { Dispatch, Done, ActionOf, PayloadOf } from 'redux-logic-helper';
import { applyMiddleware, createStore, AnyAction } from 'redux';
import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { fromTiles, Validator } from './hu';
import { Deal, nullDeal, discardTile, drawTile, dealHand, sortHand } from './deal';
import { Messages, appendMessage } from './gamecommon';
const actionCreator = actionCreatorFactory();

type GameState = {
  deal: Deal,
  score: number,
  started: Date | null,
  messages: Messages,
};
const nullGame: GameState = {
  deal: nullDeal,
  score: 0,
  started: null,
  messages: [],
};

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

function dispatchWaitDispatch(firstAction: AnyAction, waitTimeMs: number, secondAction: AnyAction, dispatch: Dispatch, done: Done)
{
  dispatch(firstAction);
  setTimeout(() => {
    dispatch(secondAction);
    done();
  }, waitTimeMs);
}

function dispatchSequence(actions: AnyAction[], dispatch: Dispatch, done: Done)
{
  actions.forEach(action => {
    dispatch(action);
  });
  done();
}

const discardAndDrawLogic = createLogic<GameState, PayloadOf<typeof gameActions.discardAndDraw>>(
  gameActions.discardAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.discardAndDraw>}, dispatch: Dispatch, done: Done)
    {
      const [waitTimeMs, nextAction] = (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
        ? [action.payload.timeBeforeSort, gameActions.sortAndDraw({timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort})]
        : [action.payload.timeBeforeDraw, gameActions.draw({})];
      dispatchWaitDispatch(
        gameActions.discard({position: action.payload.position}),
        waitTimeMs, nextAction,
        dispatch, done);
    }
  });
const resetAndDrawLogic = createLogic(
  gameActions.resetAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.resetAndDraw> }, dispatch: Dispatch, done: Done)
    {
      console.log(action);
      const [waitTimeMs, nextAction] = (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
        ? [action.payload.timeBeforeSort, gameActions.sortAndDraw({timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort})]
        : [action.payload.timeBeforeDraw, gameActions.draw({})];
      dispatchWaitDispatch(
        gameActions.reset({deal: action.payload.deal}),
        waitTimeMs, nextAction,
        dispatch, done);
    }
  });
const sortAndDrawLogic = createLogic(
  gameActions.sortAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.sortAndDraw> }, dispatch: Dispatch, done: Done)
    {
      dispatchWaitDispatch(
        gameActions.sort({}),
        action.payload.timeBetweenSortDraw,
        gameActions.draw({}),
        dispatch, done);
    }
  });
const resetGamelogic = createLogic(
  gameActions.resetGame,
  {
    latest: true,
    warnTimeout: 0,
    process({ action }: { action: ActionOf<typeof gameActions.resetGame> }, dispatch: Dispatch, done: Done)
    {
      console.log(action.payload);
      dispatch(gameActions.newGame({started: action.payload.first.started!}));
      dispatchWaitDispatch(
        gameActions.resetAndDraw({
          deal: action.payload.first,
          timeBeforeDraw: action.payload.timeBeforeDraw,
          timeBeforeSort: action.payload.timeBeforeSort,
        }),
        action.payload.timeOfGame,
        gameActions.finish({}),
        dispatch, done);
      console.log(`${new Date()}`);
    }
  });
const declareHuLogic = createLogic(
  gameActions.declareHu,
  {
    process({ action, getState }: { action: ActionOf<typeof gameActions.declareHu>, getState: () => GameState }, dispatch: Dispatch, done: Done)
    {
      const hu = action.payload.validator(fromTiles(getState().deal.hand));
      const firstAction = hu
        ? gameActions.scoreHu({time: action.payload.next.started!, tbd: action.payload.timeBeforeDraw})
        : gameActions.scoreCuohu({});
      dispatchSequence([
        firstAction,
        gameActions.appendMessage({message: `declared ${hu} hu`}),
        gameActions.resetAndDraw({
          deal: action.payload.next,
          timeBeforeDraw: action.payload.timeBeforeDraw,
          timeBeforeSort: action.payload.timeBeforeSort,
        })], dispatch, done);
    }
  });
const logics = [
  discardAndDrawLogic,
  resetAndDrawLogic,
  resetGamelogic,
  sortAndDrawLogic,
  declareHuLogic];
export const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware(logics)));
