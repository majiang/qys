import { createLogicMiddleware } from 'redux-logic';
import { createLogic } from '../redux-logic-helper';
import { Dispatch, Done, ActionOf, PayloadOf } from 'redux-logic-helper';
import { applyMiddleware, createStore, AnyAction } from 'redux';
import { actionCreatorFactory } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { fromTiles, Validator } from './hu';
import { Deal, discardTile, drawTile, dealHand, sortHand } from './deal';
import { Messages, appendMessage } from './common';
const actionCreator = actionCreatorFactory();

type NullGame =
{
  kind: 'null',
};
type PlayingGame =
{
  kind: 'playing',
  deal: Deal,
  score: number,
  started: Date,
};
type FinishedGame =
{
  kind: 'finished',
  score: number,
};

export type GameState = {
  game: NullGame | PlayingGame | FinishedGame,
  messages: Messages,
};
const nullGame: GameState =
{
  game: {kind: 'null'},
  messages: [],
};
function transitionPlaying(f: (deal: Deal) => Deal): (state: GameState) => GameState
{
  return (state: GameState) =>
  {
    if (state.game.kind !== 'playing')
      throw new TypeError();
    return {...state,
      game: {...state.game,
        deal: f(state.game.deal),
      }
    }
  }
}

export const gameActions = {
  appendMessage: actionCreator<{message: string}>('appendMessage'),
  discard: actionCreator<{position: number}>('discard'),
  draw: actionCreator<{}>('draw'),
  discardAndDraw: actionCreator<{position: number, timeBeforeDraw: number, timeBeforeSort: number}>('discardAndDraw'),
  declareHu: actionCreator<{next: Deal, validator: Validator, timeBeforeDraw: number, timeBeforeSort: number}>('declareHu'),
  deal: actionCreator<{deal: Deal}>('deal'),
  dealAndDraw: actionCreator<{deal: Deal, timeBeforeDraw: number, timeBeforeSort: number}>('dealAndDraw'),
  resetGame: actionCreator<({first: Deal, timeBeforeDraw: number, timeBeforeSort: number, timeOfGame: number})>('resetGame'),
  newGame: actionCreator<({deal: Deal})>('newGame'),
  newGameAndDraw: actionCreator<({deal: Deal, timeBeforeDraw: number, timeBeforeSort: number})>('newGameAndDraw'),
  sort: actionCreator<{}>('sort'),
  sortAndDraw: actionCreator<{timeBetweenSortDraw: number}>('sortAndDraw'),
  scoreHu: actionCreator<{time: Date, tbd: number}>('scoreHu'),
  scoreCuohu: actionCreator<{}>('scoreCuohu'),
  finish: actionCreator<{}>('finish'),
  nullGame: actionCreator<{}>('nullGame'),
};

const gameReducer = reducerWithInitialState(nullGame)
.case(gameActions.discard, (state, payload) =>
  transitionPlaying((deal) => discardTile(deal, payload.position))(state)
)
.case(gameActions.draw, (state, _) =>
  transitionPlaying(drawTile)(state)
)
.case(gameActions.deal, (state, payload) =>
  transitionPlaying((deal) => dealHand(payload.deal))(state)
)
.case(gameActions.sort, (state, _) =>
  transitionPlaying(sortHand)(state)
)
.case(gameActions.newGame, (_, payload) => ({
  game:
  {
    kind: 'playing',
    deal: payload.deal,
    score: 0,
    started: payload.deal.started
  },
  messages: appendMessage([], `new game started at ${payload.deal.started}`),
}))
.case(gameActions.appendMessage, (state, payload) => ({...state,
  messages: appendMessage(state.messages, payload.message)
}))
.case(gameActions.scoreHu, (state, payload) => {
  if (state.game.kind !== 'playing') throw new TypeError();
  return {...state,
    game: {...state.game,
      score: state.game.score + Math.sqrt(payload.tbd / (payload.time.valueOf() - state.game.deal.started.valueOf())),
    }
  };
})
.case(gameActions.scoreCuohu, (state, _) => {
  if (state.game.kind !== 'playing') throw new TypeError();
  return {...state,
    game: {...state.game,
      score: state.game.score - 1
    }};
})
.case(gameActions.finish, (state, payload) => {
  if (state.game.kind !== 'playing') throw new TypeError();
  console.log(`finish at: ${new Date()}`);
  console.log(state);
  console.log(payload);
  return {game: {kind: 'finished', score: state.game.score}, messages:
  appendMessage([], `finish! score: ${~~(state.game.score * 1000)}`),
};})
.case(gameActions.nullGame, (state, _) => ({
  ...state,
  game: {kind: 'null'}
}))
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
const dealAndDrawLogic = createLogic(
  gameActions.dealAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.dealAndDraw> }, dispatch: Dispatch, done: Done)
    {
      console.log(action);
      const [waitTimeMs, nextAction] = (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
        ? [action.payload.timeBeforeSort, gameActions.sortAndDraw({timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort})]
        : [action.payload.timeBeforeDraw, gameActions.draw({})];
      dispatchWaitDispatch(
        gameActions.deal({deal: action.payload.deal}),
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
const newGameAndDrawLogic = createLogic(
  gameActions.newGameAndDraw,
  {
    process({ action }: { action: ActionOf<typeof gameActions.newGameAndDraw> }, dispatch: Dispatch, done: Done)
    {
      const [waitTimeMs, nextAction] = (action.payload.timeBeforeSort <= action.payload.timeBeforeDraw)
        ? [action.payload.timeBeforeSort, gameActions.sortAndDraw({timeBetweenSortDraw: action.payload.timeBeforeDraw - action.payload.timeBeforeSort})]
        : [action.payload.timeBeforeDraw, gameActions.draw({})];
      dispatchWaitDispatch(
        gameActions.newGame({deal: action.payload.deal}),
        waitTimeMs,
        nextAction,
        dispatch, done);
    }
  }
);
const resetGamelogic = createLogic(
  gameActions.resetGame,
  {
    latest: true,
    warnTimeout: 0,
    process({ action }: { action: ActionOf<typeof gameActions.resetGame> }, dispatch: Dispatch, done: Done)
    {
      console.log(action.payload);
      dispatchWaitDispatch(
        gameActions.newGameAndDraw({
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
      const state = getState();
      if (state.game.kind !== 'playing') throw new TypeError();
      const hu = action.payload.validator(fromTiles(state.game.deal.hand));
      const firstAction = hu
        ? gameActions.scoreHu({time: action.payload.next.started, tbd: action.payload.timeBeforeDraw})
        : gameActions.scoreCuohu({});
      dispatchSequence([
        firstAction,
        gameActions.appendMessage({message: `declared ${hu} hu`}),
        gameActions.dealAndDraw({
          deal: action.payload.next,
          timeBeforeDraw: action.payload.timeBeforeDraw,
          timeBeforeSort: action.payload.timeBeforeSort,
        })], dispatch, done);
    }
  });
const logics = [
  discardAndDrawLogic,
  dealAndDrawLogic,
  resetGamelogic,
  sortAndDrawLogic,
  declareHuLogic,
  newGameAndDrawLogic,
];
export const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware(logics)));
