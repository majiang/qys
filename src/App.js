import React from 'react';
import { connect, Provider } from 'react-redux';
import { applyMiddleware, bindActionCreators, createStore } from 'redux';
import { createLogic, createLogicMiddleware } from 'redux-logic';
import logo from './logo.svg';
import './App.css';

const gameActionTypes = {
  discard: 'discard',
  draw: 'draw',
  discardAndDraw: 'discardAndDraw',
  reset: 'reset',
  resetAndDraw: 'resetAndDraw',
};
const gameActions = {
  discard: (position) => ({
    type: gameActionTypes.discard,
    position: position,
  }),
  draw: (pile, p) => ({
    type: gameActionTypes.draw,
    tile: pile[p],
  }),
  discardAndDraw: (p, pile, position) => ({
    type: gameActionTypes.discardAndDraw,
    p,
    pile,
    position,
  }),
  reset: (pile, m) => ({
    type: gameActionTypes.reset,
    m,
    pile,
  }),
  resetAndDraw: (pile, m) => ({
    type: gameActionTypes.resetAndDraw,
    m,
    p: m * 3 + 1,
    pile,
  }),
}
const discardAndDrawLogic = createLogic({
  type: gameActionTypes.discardAndDraw,
  process({ getState, action }, dispatch, done)
  {
    dispatch(gameActions.discard(action.position));
    setTimeout(() => {
      dispatch(gameActions.draw(action.pile, action.p));
      done();
    }, 1000);
  }
});
const resetAndDrawLogic = createLogic({
  type: gameActionTypes.resetAndDraw,
  process({ getState, action }, dispatch, done)
  {
    dispatch(gameActions.reset(action.pile, action.m));
    setTimeout(() => {
      dispatch(gameActions.draw(action.pile, action.p));
      done();
    }, 1000);
  }
});
const nullGame = {
  hand: [],
  m: 0,
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
        hand: dealHand(action.m * 3 + 1, action.pile),
        m: action.m,
        p: action.m * 3 + 1,
        pile: action.pile,
      };
    default:
      return state;
  }
};
const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware([discardAndDrawLogic, resetAndDrawLogic])));
function discardTile(hand, position)
{
  hand = hand.slice();
  hand.splice(position, 1);
  return hand;
}
function drawTile(hand, tile)
{
  hand = hand.slice();
  hand.push(tile);
  return hand;
}
function dealHand(length, pile)
{
  return pile.slice(0, length);
}

function shufflePile()
{
  let pile = [
      0, 1, 2, 3, 4, 5, 6, 7, 8,
      0, 1, 2, 3, 4, 5, 6, 7, 8,
      0, 1, 2, 3, 4, 5, 6, 7, 8,
      0, 1, 2, 3, 4, 5, 6, 7, 8,
  ];
  let m = 36;
  while (m)
  {
    const i = Math.floor(Math.random() * (m--));
    [pile[i], pile[m]] = [pile[m], pile[i]];
  }
  return pile;
}

class Game extends React.Component
{
  render()
  {
    console.log(this);
    return <>
        <Hand ranks={this.props.hand} m={this.props.m} discard={
          (position)=>this.props.actions.discardAndDraw(this.props.p, this.props.pile, position)} />
        <Controls reset={(i)=>this.props.actions.resetAndDraw(shufflePile(), i)} />
    </>;
  }
}

class Hand extends React.Component
{
  renderTile(i, rank)
  {
    return (<Tile key={i} index={i} rank={rank} m={this.props.m} onClick={()=>this.props.discard(i)}/>);
  }
  render()
  {
    console.log(this);
    if (this.props.ranks) return (<div className="hand">
      {this.props.ranks.map((rank, i)=>this.renderTile(i, rank))}
    </div>);
    else return <></>;
  }
}
class Controls extends React.Component
{
  render()
  {
    return <div className="controls">
        {[1, 4, 7, 10, 13, 16].map((l, i) =>
            <ResetButton key={i} length={l} onClick={()=>this.props.reset(i)}/>)}
    </div>;
  }
}
class ResetButton extends React.Component
{
  render()
  {
    return <div className="resetButton" onClick={this.props.onClick}>{this.props.length}</div>;
  }
}

class Tile extends React.Component
{
  render()
  {
    return (<div className={"tile m"+this.props.m} onClick={this.props.onClick}>
        <span className="tile-index">{this.props.index}:</span>
        <span className="tile-value">{this.props.rank+1}</span>
    </div>);
  }
}

const _Game = connect(
    (storeState) => (storeState),
    (dispatch) => ({actions: bindActionCreators(gameActions, dispatch)}),
)(Game);

function App() {
  return (
    <Provider store={gameStore}>
      <_Game />
    </Provider>
  );
}

export default App;
