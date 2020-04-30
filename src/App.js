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
  sort: 'sort',
  sortAndDraw: 'sortAndDraw',
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
const gameStore = createStore(gameReducer, applyMiddleware(createLogicMiddleware([
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
  constructor (props)
  {
    super (props);
    this.state = {
      handLength: 13,
      tileStyle: "PostModern",
      tileSuit: "dots",
      allowPairs: "allow-pairs",
      timeBeforeDraw: 1000,
      timeBeforeSort: 500,
    };
  }
  handleHandLengthChanged = (e) =>
  {
    this.setState({handLength: e.target.value});
  };
  handleTileStyleChanged = (e) =>
  {
    this.setState({tileStyle: e.target.value});
  };
  handleTileSuitChanged = (e) =>
  {
    this.setState({tileSuit: e.target.value});
  };
  handleAllowPairsChanged = (e) =>
  {
    this.setState({allowPairs: e.target.value});
  }
  handleTimeBeforeDrawChanged = (e) =>
  {
    this.setState({timeBeforeDraw: e.target.value});
  };
  handleTimeBeforeSortChanged = (e) =>
  {
    this.setState({timeBeforeSort: e.target.value});
  };
  tileClass()
  {
    console.log(this.state.tileStyle);
    console.log(this.state.tileSuit);
    if (this.state.tileStyle == 'PostModern')
    {
      switch (this.state.tileSuit)
      {
        case 'bamboos': return PostModernBamboos;
        case 'characters': return PostModernCharacters;
        case 'dots': return PostModernDots;
      }
    }
    else throw new RangeError('PostModern is the only currently supported tileStyle');
  }
  render()
  {
    return <>
        <Hand tileClass={this.tileClass()} tiles={this.props.hand} discard={
          (position)=>this.props.actions.discardAndDraw(this.props.p, this.props.pile, position, this.state.timeBeforeDraw, this.state.timeBeforeSort)} />
        <Controls reset={()=>this.props.actions.resetAndDraw(shufflePile(), this.state.handLength, this.state.timeBeforeDraw, this.state.timeBeforeSort)}
            handLength={{handler: this.handleHandLengthChanged}}
            tileStyle={{handler: this.handleTileStyleChanged}}
            tileSuit={{handler: this.handleTileSuitChanged}}
            allowPairs={{handler: this.handleAllowPairsChanged}}
            timeBeforeDraw={{handler: this.handleTimeBeforeDrawChanged, value: this.state.timeBeforeDraw}}
            timeBeforeSort={{handler: this.handleTimeBeforeSortChanged, value: this.state.timeBeforeSort}}
        />
    </>;
  }
}

class Hand extends React.Component
{
  renderTile(i, tile)
  {
    return (<this.props.tileClass key={tile} index={i} rank={~~(tile/4)} onClick={()=>this.props.discard(i)}/>);
  }
  render()
  {
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
    return <form className="controls">
      <StartButton onClick={this.props.reset} />
      <fieldset className="hand-length">
        <span className="radio-label">#tiles</span>
        {[1, 4, 7, 10, 13, 16].map((v, i) =>
        <HandLengthRadio key={i} value={v} onChange={this.props.handLength.handler} />)}
      </fieldset>
      <fieldset className="tile-style">
        <span className="radio-label">tile style</span>
        {["PostModern"].map((v, i) =>
        <TileStyleRadio key={i} value={v} onChange={this.props.tileStyle.handler} />)}
      </fieldset>
      <fieldset className="tile-suit">
        <span className="radio-label">suit</span>
        {[
          {display: "bams/索/条", value: "bamboos"},
          {display: "chars/萬/万", value: "characters"},
          {display: "dots/筒/饼", value: "dots"}].map((v, i) =>
        <TileSuitRadio key={i} value={v} onChange={this.props.tileSuit.handler} />)}
      </fieldset>
      <fieldset className="allow-pairs">
        <span className="radio-label">pairs</span>
        {[
          {display: "disallow", value: "disallow"},
          {display: "allow", value: "allow"},
          {display: "tile hog", value: "allow-hog"},
        ].map((v, i) =>
        <AllowPairsRadio key={i} value={v} onChange={this.props.allowPairs.handler} />)}
      </fieldset>
      <fieldset><TimeBeforeDraw io={this.props.timeBeforeDraw} /></fieldset>
      <fieldset><TimeBeforeSort io={this.props.timeBeforeSort} /></fieldset>
    </form>;
  }
}
class HandLengthRadio extends React.Component
{
  render()
  {
    return <><input type="radio" name="hand-length"
        id={`hand-length-${this.props.value}`}
        value={this.props.value}
        onChange={this.props.onChange}
        defaultChecked={this.props.value===13} />
      <label htmlFor={`hand-length-${this.props.value}`}>
        {formatDigits(this.props.value, 2)}
      </label></>;
  }
}
class TileStyleRadio extends React.Component
{
  render()
  {
    return <><input type="radio" name="tile-style"
        id={`tile-style-${this.props.value}`}
        value={this.props.value.value}
        onChange={this.props.onChange}
        defaultChecked={this.props.value==="PostModern"} />
      <label htmlFor={`tile-style-${this.props.value}`}>
        {this.props.value}
      </label></>;
  }
}
class TileSuitRadio extends React.Component
{
  render()
  {
    return <><input type="radio" name="tile-suit"
        id={`tile-suit-${this.props.value.value}`}
        value={this.props.value.value}
        onChange={this.props.onChange}
        defaultChecked={this.props.value.value==="dots"} />
      <label htmlFor={`tile-suit-${this.props.value.value}`}>
        {this.props.value.display}
      </label></>;
  }
}
class AllowPairsRadio extends React.Component
{
  render()
  {
    return <>
      <input type="radio" name="allow-pairs"
        id={`allow-pairs-${this.props.value.value}`}
        value={this.props.value.value}
        onChange={this.props.onChange}
        defaultChecked={this.props.value.value==="allow"} />
      <label htmlFor={`allow-pairs-${this.props.value.value}`}>
        {this.props.value.display}
      </label></>;
  }
}
class TimeBeforeDraw extends React.Component
{
  render()
  {
    return <>
      <label htmlFor="time-before-draw">time before draw</label>
      <input type="range" id="time-before-draw" name="time-before-draw"
          min="100" max="9900" step="100" defaultValue="1000"
          ref={this.props.io.ref} onChange={this.props.io.handler} />
      <output htmlFor="time-before-draw">{(this.props.io.value/1000).toFixed(1)}s</output>
    </>;
  }
}
class TimeBeforeSort extends React.Component
{
  render()
  {
    return <>
      <label htmlFor="time-before-sort">time before sort</label>
      <input type="range" id="time-before-sort" name="time-before-sort"
          min="0" max="9900" step="100" defaultValue="500"
          ref={this.props.io.ref} onChange={this.props.io.handler} />
      <output htmlFor="time-before-sort">{(this.props.io.value/1000).toFixed(1)}s</output>
    </>;
  }
}
class StartButton extends React.Component
{
  render()
  {
    return <div className="start-button" onClick={this.props.onClick}>start</div>;
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

class GameRules
{
  constructor (m, allowPairs, allowPairsWithHog)
  {
    this._m = m;
    this._allowPairs = allowPairs;
    this._allowPairsWithHog = allowPairsWithHog;
  }
}

class GameSettings
{
  constructor (timeBeforeDraw, timeBeforeSort)
  {
    this._timeBeforeDraw = timeBeforeDraw;
    this._timeBeforeSort = timeBeforeSort;
  }
}

function formatDigits(n, d)
{
  const s = n.toString();
  const l = s.length;
  return <><span className="transparent">{"0".repeat(d-l)}</span>{n}</>;
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
