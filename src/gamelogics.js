import { createLogic, createLogicMiddleware } from 'redux-logic';
import { applyMiddleware, createStore } from 'redux';

const gameActionTypes = {
    discard: 'discard',
    draw: 'draw',
    discardAndDraw: 'discardAndDraw',
    reset: 'reset',
    resetAndDraw: 'resetAndDraw',
    sort: 'sort',
    sortAndDraw: 'sortAndDraw',
  };
export const gameActions = {
  discard: (position) => ({
    type: gameActionTypes.discard,
    position: position,
  }),
  draw: (pile, p) => ({
    type: gameActionTypes.draw,
    tile: pile[p],
  }),
  discardAndDraw: (p, pile, position, timeBeforeDraw, timeBeforeSort) => ({
    type: gameActionTypes.discardAndDraw,
    p,
    pile,
    position,
    timeBeforeDraw,
    timeBeforeSort,
  }),
  reset: (pile, p) => ({
    type: gameActionTypes.reset,
    p,
    pile,
  }),
  resetAndDraw: (pile, p, timeBeforeDraw, timeBeforeSort) => ({
    type: gameActionTypes.resetAndDraw,
    p,
    pile,
    timeBeforeDraw,
    timeBeforeSort,
  }),
  sort: () => ({
    type: gameActionTypes.sort,
  }),
  sortAndDraw: (pile, p, timeBetweenSortDraw) => ({
    type: gameActionTypes.sortAndDraw,
    p,
    pile,
    timeBetweenSortDraw,
  })
}
const discardAndDrawLogic = createLogic({
  type: gameActionTypes.discardAndDraw,
  process({ getState, action }, dispatch, done)
  {
    dispatch(gameActions.discard(action.position));
    if (action.timeBeforeSort <= action.timeBeforeDraw)
    {
      setTimeout(() => {
        dispatch(gameActions.sortAndDraw(action.pile, action.p, action.timeBeforeDraw - action.timeBeforeSort));
        done();
      }, action.timeBeforeSort);
    }
    else
      setTimeout(() => {
        dispatch(gameActions.draw(action.pile, action.p));
        done();
      }, action.timeBeforeDraw);
  }
});
const resetAndDrawLogic = createLogic({
  type: gameActionTypes.resetAndDraw,
  process({ getState, action }, dispatch, done)
  {
    dispatch(gameActions.reset(action.pile, action.p));
    if (action.timeBeforeSort <= action.timeBeforeDraw)
    {
      setTimeout(() => {
        dispatch(gameActions.sortAndDraw(action.pile, action.p, action.timeBeforeDraw - action.timeBeforeSort));
        done();
      }, action.timeBeforeSort);
    }
    else
      setTimeout(() => {
        dispatch(gameActions.draw(action.pile, action.p));
        done();
      }, action.timeBeforeDraw);
  }
});
const sortAndDrawLogic = createLogic({
  type: gameActionTypes.sortAndDraw,
  process({ getState, action }, dispatch, done)
  {
    dispatch(gameActions.sort());
    setTimeout(() => {
      dispatch(gameActions.draw(action.pile, action.p));
      done();
    }, action.timeBetweenSortDraw);
  }
});
const nullGame = {
  hand: [],
  p: 0,
  pile: [],
};
const gameReducer = (state = nullGame, action) => {
  console.log(state);
  console.log(action);
  switch (action.type)
  {
    case gameActionTypes.discard:
      return {...state,
        hand: discardTile(state.hand, action.position),
      };
    case gameActionTypes.draw:
      return {...state,
        hand: drawTile(state.hand, action.tile),
        p: state.p + 1,
      };
    case gameActionTypes.reset:
      return {
        hand: dealHand(action.p, action.pile),
        p: action.p,
        pile: action.pile,
      };
    case gameActionTypes.sort:
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
function discardTile(hand, position)
{
  hand = [...hand];
  hand.splice(position, 1);
  return hand;
}
function drawTile(hand, tile)
{
  hand = [...hand];
  hand.push(tile);
  return hand;
}
function dealHand(length, pile)
{
  return pile.slice(0, length);
}
function sortHand(hand)
{
  hand = [...hand];
  hand.sort((a, b) => (a - b));
  return hand;
}
