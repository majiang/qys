import React from 'react';
import { connect, Provider } from 'react-redux';
import { bindActionCreators, createStore } from 'redux';
import logo from './logo.svg';
import './App.css';

const gameActionTypes = {
  discard: 'discard',
  draw: 'draw',
  reset: 'reset',
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
  reset: (pile, handLength) => ({
    type: gameActionTypes.reset,
    handLength: handLength,
    pile: pile,
  }),
}

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
      return {
        hand: discardTile(state.hand, action.position),
        p: state.p,
        pile: state.pile,
      };
    case gameActionTypes.draw:
      return {
        hand: drawTile(state.hand, action.tile),
        p: state.p + 1,
        pile: state.pile,
      };
    case gameActionTypes.reset:
      return {
        hand: dealHand(action.handLength, action.pile),
        p: action.handLength,
        pile: action.pile,
      };
    default:
      //throw 'undefined action';
  }
};
const gameStore = createStore(gameReducer);
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
        <Hand ranks={this.props.hand} discard={this.props.actions.discard} />
        <Controls reset={this.props.actions.reset} />
    </>;
  }
}

class Hand extends React.Component
{
  renderTile(i, rank)
  {
    return (<Tile key={i} index={i} rank={rank} onClick={()=>this.props.discard(i)}/>);
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
        {[1, 4, 7, 10, 13, 16].map((l) => <ResetButton key={l} length={l} onClick={()=>this.props.reset(shufflePile(), l)}/>)}
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
    return (<div className="tile" onClick={this.props.onClick}>{this.props.index}:{this.props.rank}</div>);
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
