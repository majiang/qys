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
  let m = 36;
  let pile = Array.from(Array(m).keys());
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
        <Hand tileClass={PostModernDots} tiles={this.props.hand} m={this.props.m} discard={
          (position)=>this.props.actions.discardAndDraw(this.props.p, this.props.pile, position)} />
        <Controls reset={(i)=>this.props.actions.resetAndDraw(shufflePile(), i)} />
    </>;
  }
}

class Hand extends React.Component
{
  renderTile(i, tile)
  {
    return (<this.props.tileClass key={tile} index={i} rank={tile % 9} m={this.props.m} onClick={()=>this.props.discard(i)}/>);
  }
  render()
  {
    console.log(this);
    if (this.props.tiles) return (<div className="hand">
      {this.props.tiles.map((tile, i)=>this.renderTile(i, tile))}
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
    return <div className="tile" onClick={this.props.onClick}><img src={this.imageUrl()} style={this.generateStyle(this.props.rank)} /></div>
  }
  imageUrl()
  {
    throw new TypeError("imageUrl() is not implemented");
  }
  generateStyle(r)
  {
    return {
        clip: `rect(${this.top(r)}, ${this.right(r)}, ${this.bottom(r)}, ${this.left(r)})`,
        top: -this.top(r),
        left: -this.left(r),
    };
  }
  top(r){throw new TypeError("top() is not implemented");}
  right(r){throw new TypeError("right() is not implemented");}
  bottom(r){throw new TypeError("bottom() is not implemented");}
  left(r){throw new TypeError("left() is not implemented");}
}

class PostModernTile extends Tile
{
  top(r){return 0;}
  bottom(r){return 88;}
  imageUrl()
  {
    return "postmodern.svg";
  }
}

class PostModernBamboos extends PostModernTile
{
  left(r){return (24+r)*64;}
  right(r){return (25+r)*64;}
}

class PostModernCharacters extends PostModernTile
{
  left(r){return (15+r)*64;}
  right(r){return (16+r)*64;}
}

class PostModernDots extends PostModernTile
{
  left(r){return (0+r)*64;}
  right(r){return (1+r)*64;}
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
