import React from 'react';
import Modal from 'react-modal';
import * as gamecommon from '../qys/common';
import { GameState } from '../qys/gamelogics';
import { isNormalHu, isPairs, isPairsWithHog, Validator } from '../qys/hu';
import { gameActions } from '../qys/gamelogics';
import { newDeal } from '../qys/deal';
import { tileClass, TileProps } from './tile';

Modal.setAppElement('#root');

type AllowPairs = "disallow" | "allow" | "allow-hog";
type TileStyle = "PostModern" | "GLMahjongTile";
type TileSuit = "bamboos" | "characters" | "dots";

type GameProps =
{
  initializer: ()=>Array<number>,
  actions: typeof gameActions,
} & GameState;
type Settings =
{
  handLength: number,
  allowPairs: AllowPairs,
  timeBeforeDraw: number,
  timeBeforeSort: number,
  timeOfGame: number,
};
function toString(settings: Settings): string
{
  return `${settings.handLength}${(
    settings.allowPairs === 'disallow' ? '' :
    settings.allowPairs === 'allow' ? 'p' : 'pp'
  )} ${settings.timeOfGame/1000}/${settings.timeBeforeDraw/1000}` + (
    settings.timeBeforeSort < settings.timeBeforeDraw ? `(${settings.timeBeforeSort/1000})` : ''
  );
}
function huValidator(allowPairs: AllowPairs): Validator
{
  switch (allowPairs)
  {
    case 'disallow': return isNormalHu;
    case 'allow': return (hand) => isNormalHu(hand) || isPairs(hand);
    case 'allow-hog': return (hand) => isNormalHu(hand) || isPairs(hand) || isPairsWithHog(hand);
  }
}
export type Theme =
{
  tileStyle: TileStyle,
  tileSuit: TileSuit,
}
function tileHeight(theme: Theme): number
{
  switch (theme.tileStyle)
  {
    case 'PostModern': return 88;
    case 'GLMahjongTile': return 91;
  }
}
type GameComponentState =
{
  settings: Settings,
  theme: Theme,
  timeRest: number | null,
  displayTime: NodeJS.Timeout | null,
  windowInnerWidth: number,
};

export class Game extends React.Component<GameProps, GameComponentState>
{
  constructor (props: GameProps)
  {
    super (props);
    this.state = {
      settings: {
        handLength: 13,
        allowPairs: "allow",
        timeBeforeDraw: 1000,
        timeBeforeSort: 500,
        timeOfGame: 60000,
      },
      theme: {
        tileStyle: "PostModern",
        tileSuit: "dots",
      },
      timeRest: null,
      displayTime: null,
      windowInnerWidth: window.innerWidth,
    };
  }
  handleWindowResize = () => {
    console.log(`windowInnerWidth: ${window.innerWidth}`);
    this.setState({windowInnerWidth: window.innerWidth});
  }
  handleTimeRestChanged = () => {
    if (this.props.game.kind !== 'playing')
      return;
    let timeRest = this.props.game.started.valueOf() + this.state.settings.timeOfGame - new Date().valueOf();
    if (timeRest < 0)
      timeRest = 0;
    this.setState({timeRest});
  };
  handleHandLengthChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({settings: {...this.state.settings, handLength: parseInt(e.target.value)}});
  };
  handleTileStyleChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({theme: {...this.state.theme, tileStyle: e.target.value as TileStyle}});
  };
  handleTileSuitChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({theme: {...this.state.theme, tileSuit: e.target.value as TileSuit}});
  };
  handleAllowPairsChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({settings: {...this.state.settings, allowPairs: e.target.value as AllowPairs}});
  }
  handleTimeBeforeDrawChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({settings: {...this.state.settings, timeBeforeDraw: parseInt(e.target.value)}});
  };
  handleTimeBeforeSortChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({settings: {...this.state.settings, timeBeforeSort: parseInt(e.target.value)}});
  };
  handleTimeOfGameChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({settings: {...this.state.settings, timeOfGame: parseInt(e.target.value)}});
  };
/*  handleOpenModal = () =>
  {
    this.setState({openModal: true});
  }
  handleCloseModal = () =>
  {
    this.setState({openModal: false});
  }*/
  declareHu = () =>
  {
    return this.props.actions.declareHu({
      validator: huValidator(this.state.settings.allowPairs),
      next: newDeal(this.props.initializer, (() => new Date()), this.state.settings.handLength),
      timeBeforeDraw: this.state.settings.timeBeforeDraw,
      timeBeforeSort: this.state.settings.timeBeforeSort,
    });
  };
  directDiscardAndDraw = () =>
  {
    if (this.props.game.kind !== 'playing') throw new TypeError();
    return this.discardAndDraw(this.props.game.deal.hand.length - 1);
  };
  discardAndDraw = (position: number) =>
  {
    return this.props.actions.discardAndDraw({
      position: position,
      timeBeforeDraw: this.state.settings.timeBeforeDraw,
      timeBeforeSort: this.state.settings.timeBeforeSort});
  };
  resetGame = () =>
  {
    return this.props.actions.resetGame({
      first: newDeal(this.props.initializer, (() => new Date()), this.state.settings.handLength),
      timeBeforeDraw: this.state.settings.timeBeforeDraw,
      timeBeforeSort: this.state.settings.timeBeforeSort,
      timeOfGame: this.state.settings.timeOfGame,
    });
  };
  nullGame = () =>
  {
    if (window.location.hash !== '')
      window.location.hash = '';
    return this.props.actions.nullGame({});
  }
  handleKeydown = (e: KeyboardEvent) =>
  {
    if (e.keyCode === 32) // space: hu
    {
      e.preventDefault();
      return this.declareHu();
    }
    if (e.keyCode < 48) return;
    if (e.keyCode === 48) // 0: drawn
    {
      return this.directDiscardAndDraw();
    }
    if (e.keyCode === 83) // s: start
    {
      return this.resetGame();
    }
    if (58 <= e.keyCode) return;
    if (this.props.game.kind !== 'playing') throw new TypeError();
    console.log(`keyCode: ${e.keyCode}`);
    let rank = e.keyCode - 49;
    console.log(`rank: ${rank}`);
    let position = this.props.game.deal.hand.findIndex((tile, index) => {
      console.log(`${index}: ${tile}`);
      return (gamecommon.rank(tile) === rank);
    });
    console.log(`position: ${position}`);
    if (0 <= position)
      return this.discardAndDraw(position);
  };
  componentDidMount()
  {
    document.addEventListener("keydown", this.handleKeydown);
    this.setState({displayTime: setInterval(this.handleTimeRestChanged, 10)});
    window.addEventListener('resize', this.handleWindowResize);
  }
  componentWillUnmount()
  {
    document.removeEventListener("keydown", this.handleKeydown);
    clearInterval(this.state.displayTime!);
    window.removeEventListener('resize', this.handleWindowResize);
  }
  render()
  {
    console.log(this.props);
    console.log(this.state);
    return <>
        <Hand theme={this.state.theme} hand={
            this.props.game.kind === 'playing'
            ? this.props.game.deal.hand
            : []}
          tileClass={tileClass(this.state.theme)}
          maxTiles={this.state.settings.handLength+1}
          discard={this.discardAndDraw}
          width={this.state.windowInnerWidth} />
        <Controls
          score={
            this.props.game.kind === 'null'
            ? null
            : this.props.game.score}
          time={this.state.timeRest}
          hu={this.declareHu}
          reset={this.resetGame}
          handLength={{handler: this.handleHandLengthChanged}}
          tileStyle={{handler: this.handleTileStyleChanged}}
          tileSuit={{handler: this.handleTileSuitChanged}}
          allowPairs={{handler: this.handleAllowPairsChanged}}
          timeBeforeDraw={{handler: this.handleTimeBeforeDrawChanged, value: this.state.settings.timeBeforeDraw}}
          timeBeforeSort={{handler: this.handleTimeBeforeSortChanged, value: this.state.settings.timeBeforeSort}}
          timeOfGame={{handler: this.handleTimeOfGameChanged, value: this.state.settings.timeOfGame}}
        />
        <Status messages={this.props.messages} />
        <ResultDialog
          close={this.nullGame}
          isOpen={this.props.game.kind === 'finished'}
          score={~~((this.props.game.kind === 'null'
            ? 0
            : this.props.game.score) * 1000)}
          settings={toString(this.state.settings)}
        ></ResultDialog>
    </>;
  }
}

type HandProps =
{
  hand: gamecommon.Hand,
  maxTiles: number,
  theme: Theme,
  tileClass: React.ComponentClass<TileProps>,
  discard: (position: number) => void,
  width: number,
};
class Hand extends React.Component<HandProps>
{
  renderTile(i: number, tile: gamecommon.Tile)
  {
    return <this.props.tileClass key={tile} rank={gamecommon.rank(tile)} onClick={()=>this.props.discard(i)}/>;
  }
  render()
  {
    console.log(this.state);
    return <HandOuter scale={this.props.width / (64 * this.props.maxTiles)} height={tileHeight(this.props.theme)}>
      <HandInner width={64*this.props.maxTiles} scale={this.props.width / (64 * this.props.maxTiles)}>
        {this.props.hand.map((tile, i)=>this.renderTile(i, tile))}
        </HandInner></HandOuter>;
  }
}

class HandOuter extends React.Component<{scale: number, height: number}>
{
  render()
  {
    return <div className="hand-container" style={{
      height: `${this.props.scale * this.props.height}px`
    }}>{this.props.children}</div>;
  }
}
class HandInner extends React.Component<{width: number, scale: number}>
{
  render()
  {
    return <div className="hand" style={{
      width: `${this.props.width}px`,
      transformOrigin: 'top left',
      transform: `scale(${this.props.scale})`,
    }}>{this.props.children}</div>;
  }
}

type StatusProps =
{
  messages: Array<[number, string]>
};
class Status extends React.Component<StatusProps>
{
  render()
  {
    return <ul className="status">
      {this.props.messages.map((v) => <li key={v[0]}>{v[1]}</li>)}
    </ul>;
  }
}

type Handler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type HasHandler =
{
  handler: Handler
};
type HasHandlerAndValue =
{
  handler: Handler,
  value: any,
}
type ControlsProps =
{
  reset: () => void,
  hu: () => void,
  score: number | null,
  time: number | null,
  handLength: HasHandler,
  tileStyle: HasHandler,
  tileSuit: HasHandler,
  allowPairs: HasHandler,
  timeBeforeDraw: HasHandlerAndValue,
  timeBeforeSort: HasHandlerAndValue,
  timeOfGame: HasHandlerAndValue,
};

class Controls extends React.Component<ControlsProps>
{
  renderHuButton()
  {
    return <HuButton onClick={this.props.hu} />;
  }
  renderStatus()
  {
    return <div className="status-labels">
      <div className="status-label">{(this.props.score == null) ? `` : `score: ${~~(this.props.score * 1000)}`}</div>
      <div className="status-label">{(this.props.time == null) ? `` : `time: ${(this.props.time/1000).toFixed(2)}`}</div>
    </div>;
  }
  renderStartButton()
  {
    return <StartButton onClick={this.props.reset} />;
  }
  renderHandLength()
  {
    return <fieldset className="hand-length">
        <span className="radio-label">#tiles</span>
        <Radios choices={[1, 4, 7, 10, 13, 16].map((v) =>
          ({display: formatDigits(v, 2), value: v}))}
          name="hand-length"
          defaultValue={13}
          onChange={this.props.handLength.handler} />
        </fieldset>;
  }
  renderTileStyle()
  {
    return <fieldset className="tile-style">
        <span className="radio-label">tile style</span>
        <Radios choices={[
          {display: "PostModern", value: "PostModern"},
          {display: "GL-MT", value: "GLMahjongTile"}]}
          name="tile-style"
          defaultValue="PostModern"
          onChange={this.props.tileStyle.handler} />
        </fieldset>;
  }
  renderTileSuit()
  {
    return <fieldset className="tile-suit">
        <span className="radio-label">suit</span>
        <Radios choices={[
          {display: "bams/索/条", value: "bamboos"},
          {display: "chars/萬/万", value: "characters"},
          {display: "dots/筒/饼", value: "dots"}]}
          name="tile-suit"
          defaultValue="dots"
          onChange={this.props.tileSuit.handler} />
        </fieldset>;
  }
  renderAllowPairs()
  {
    return <fieldset className="allow-pairs">
        <span className="radio-label">pairs</span>
        <Radios choices={[
          {display: "disallow", value: "disallow"},
          {display: "allow", value: "allow"},
          {display: "tile hog", value: "allow-hog"}]}
          name="allow-pairs"
          defaultValue="allow"
          onChange={this.props.allowPairs.handler} />
        </fieldset>;
  }
  renderTimeBeforeDraw()
  {
    return <fieldset><Range
        id="time-before-draw"
        label="time before draw"
        handler={this.props.timeBeforeDraw.handler}
        value={{
          min: 100,
          max: 9900,
          step: 100,
          default: 1000,
          display: (this.props.timeBeforeDraw.value/1000).toFixed(1)+"s",
        }} /></fieldset>;
  }
  renderTimeBeforeSort()
  {
    return <fieldset><Range
        id="time-before-sort"
        label="time before sort"
        handler={this.props.timeBeforeSort.handler}
        value={{
          min: 0,
          max: 9900,
          step: 100,
          default: 500,
          display: (this.props.timeBeforeSort.value/1000).toFixed(1)+"s",
        }} /></fieldset>
  }
  renderTimeOfGame()
  {
    return <fieldset><Range
        id="time-of-game"
        label="time of game"
        handler={this.props.timeOfGame.handler}
        value={{
          min: 30000,
          max: 600000,
          step: 1000,
          default: 60000,
          display: <>{formatDigits(this.props.timeOfGame.value/1000, 3)}s</>,
        }}
    /></fieldset>;
  }
  render()
  {
    return <form className="controls">
        {this.renderHuButton()}
        {this.renderStatus()}
        {this.renderStartButton()}
        {this.renderHandLength()}
        {this.renderTileStyle()}
        {this.renderTileSuit()}
        {this.renderAllowPairs()}
        {this.renderTimeBeforeDraw()}
        {this.renderTimeBeforeSort()}
        {this.renderTimeOfGame()}
    </form>;
  }
}
type RadiosProps =
{
  choices: Array<any>,
  name: string,
  onChange: Handler,
  defaultValue: any,
};
class Radios extends React.Component<RadiosProps>
{
  render()
  {
    return <>{this.props.choices.map((v, i) => <Radio
        key={i}
        name={this.props.name}
        value={v.value}
        display={v.display}
        onChange={this.props.onChange}
        defaultValue={this.props.defaultValue}
    />)}</>;
  }
}
type RadioProps =
{
  name: string,
  value: string,
  onChange: Handler,
  defaultValue: string,
  display: string,
};
class Radio extends React.Component<RadioProps>
{
  render()
  {
    return <><input type="radio" name={this.props.name}
        id={`${this.props.name}-${this.props.value}`}
        value={this.props.value}
        onChange={this.props.onChange}
        defaultChecked={this.props.value===this.props.defaultValue} />
      <label htmlFor={`${this.props.name}-${this.props.value}`}>
        {this.props.display}
      </label></>;
  }
}
type RangeProps =
{
  id: string,
  label: string,
  value: {
    min: number,
    max: number,
    step: number,
    default: number,
    display:  string | JSX.Element,
  },
  handler: Handler,
};
class Range extends React.Component<RangeProps>
{
  render()
  {
    const value = this.props.value;
    const id = this.props.id;
    return <>
      <label htmlFor={id}>{this.props.label}</label>
      <input type="range" id={id} name={id}
        min={value.min} max={value.max} step={value.step} defaultValue={value.default}
        onChange={this.props.handler} />
      <output htmlFor={id}>{value.display}</output>
    </>;
  }
}
class StartButton extends React.Component<{onClick: ()=>void}>
{
  render()
  {
    return <div className="start-button" onClick={this.props.onClick}><span className="start-text">start</span></div>;
  }
}
class HuButton extends React.Component<{onClick: ()=>void}>
{
  render()
  {
    return <div className="hu-button" onClick={this.props.onClick}><span className="hu-text">Hu</span></div>;
  }
}
type ResultDialogProps = {
  close: () => void,
  isOpen: boolean,
  score: number,
  settings: string,
};
class ResultDialog extends React.Component<ResultDialogProps>
{
  renderText(): string
  {
    return encodeURIComponent(
      `Score: ${this.props.score} (settings: ${this.props.settings}` +
      (window.location.hash === '' ? '' : `, seed: ${window.location.hash.substr(1)}`) + ')'
    );
  }
  render()
  {
    return <Modal
      isOpen={this.props.isOpen}
      shouldCloseOnOverlayClick={true}
      className='result-content'
      overlayClassName='result-overlay'
      ><div className='result-score'>Your score: {this.props.score}</div>
      <div className='result-controls'>
        <div className='result-close' onClick={this.props.close}>Close</div>
        <a className='result-tweet' href={`https://twitter.com/intent/tweet?text=${this.renderText()}&url=https%3A%2F%2Fmajiang.github.io%2Fmj%2Fqys%2F&hashtags=qysmj&related=__DaLong`}><div>Tweet</div></a>
      </div>
    </Modal>;
  }
}

function formatDigits(n: number, d: number)
{
  const s = n.toString();
  const l = s.length;
  return <><span className="transparent">{"0".repeat(d-l)}</span>{n}</>;
}
