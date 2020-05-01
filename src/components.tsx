import React from 'react';
import * as gamelogics from './gamelogics';

type GameProps =
{
  initializer: ()=>Array<number>,
  hand: gamelogics.Hand,
  p: number,
  pile: gamelogics.Pile,
  actions: any,
};
type GameState =
{
  handLength: number,
  tileStyle: string,
  tileSuit: string,
  allowPairs: string,
  timeBeforeDraw: number,
  timeBeforeSort: number,
};

export class Game extends React.Component<GameProps, GameState>
{
  constructor (props: GameProps)
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
  handleHandLengthChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({handLength: parseInt(e.target.value)});
  };
  handleTileStyleChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({tileStyle: e.target.value});
  };
  handleTileSuitChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({tileSuit: e.target.value});
  };
  handleAllowPairsChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({allowPairs: e.target.value});
  }
  handleTimeBeforeDrawChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({timeBeforeDraw: parseInt(e.target.value)});
  };
  handleTimeBeforeSortChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    this.setState({timeBeforeSort: parseInt(e.target.value)});
  };
  tileClass(): React.ComponentClass<TileProps>
  {
    console.log(this.state.tileStyle);
    console.log(this.state.tileSuit);
    if (this.state.tileStyle === 'PostModern')
    {
      switch (this.state.tileSuit)
      {
        case 'bamboos': return PostModernBamboos;
        case 'characters': return PostModernCharacters;
        case 'dots': return PostModernDots;
        default: throw new RangeError('suit not supported')
      }
    }
    else throw new RangeError('PostModern is the only currently supported tileStyle');
  }
  render()
  {
    return <>
        <Hand tileClass={this.tileClass()} tiles={this.props.hand}
          discard={(position)=>this.props.actions.discardAndDraw({
            p: this.props.p,
            pile: this.props.pile,
            position: position,
            timeBeforeDraw: this.state.timeBeforeDraw,
            timeBeforeSort: this.state.timeBeforeSort})} />
        <Controls
          reset={()=>this.props.actions.resetAndDraw({
            pile: this.props.initializer(),
            p: this.state.handLength,
            timeBeforeDraw: this.state.timeBeforeDraw,
            timeBeforeSort: this.state.timeBeforeSort})}
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

type HandProps =
{
  tiles: gamelogics.Hand,
  tileClass: React.ComponentClass<TileProps>,
  discard: (position: number) => void,
};
class Hand extends React.Component<HandProps>
{
  renderTile(i: number, tile: gamelogics.Tile)
  {
    return (<this.props.tileClass key={tile} rank={~~(tile/4)} onClick={()=>this.props.discard(i)}/>);
  }
  render()
  {
    if (this.props.tiles) return (<div className="hand">
      {this.props.tiles.map((tile, i)=>this.renderTile(i, tile))}
    </div>);
    else return <></>;
  }
}

type TileProps =
{
  rank: number,
  onClick: () => void,
};

class Tile extends React.Component<TileProps>
{
  render()
  {
    return <div className="tile" onClick={this.props.onClick}>
      <img src={this.imageUrl()}
      style={this.generateStyle(this.props.rank)}
      alt={(this.props.rank+1).toString()}/></div>
  }
  imageUrl(): string
  {
    throw new TypeError("imageUrl() is not implemented");
  }
  generateStyle(r: number)
  {
    return {
        clip: `rect(${this.top(r)}, ${this.right(r)}, ${this.bottom(r)}, ${this.left(r)})`,
        top: -this.top(r),
        left: -this.left(r),
    };
  }
  top(r: number): number{throw new TypeError("top() is not implemented");}
  right(r: number): number{throw new TypeError("right() is not implemented");}
  bottom(r: number): number{throw new TypeError("bottom() is not implemented");}
  left(r: number): number{throw new TypeError("left() is not implemented");}
}

class PostModernTile extends Tile
{
  top(r: number){return 0;}
  bottom(r: number){return 88;}
  imageUrl()
  {
    return "postmodern.svg";
  }
}

class PostModernBamboos extends PostModernTile
{
  left(r: number){return (24+r)*64;}
  right(r: number){return (25+r)*64;}
}

class PostModernCharacters extends PostModernTile
{
  left(r: number){return (15+r)*64;}
  right(r: number){return (16+r)*64;}
}

class PostModernDots extends PostModernTile
{
  left(r: number){return (0+r)*64;}
  right(r: number){return (1+r)*64;}
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
  handLength: HasHandler,
  tileStyle: HasHandler,
  tileSuit: HasHandler,
  allowPairs: HasHandler,
  timeBeforeDraw: HasHandlerAndValue,
  timeBeforeSort: HasHandlerAndValue,
};

class Controls extends React.Component<ControlsProps>
{
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
          {display: "PostModern", value: "PostModern"}]}
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
  render()
  {
    return <form className="controls">
        {this.renderStartButton()}
        {this.renderHandLength()}
        {this.renderTileStyle()}
        {this.renderTileSuit()}
        {this.renderAllowPairs()}
        {this.renderTimeBeforeDraw()}
        {this.renderTimeBeforeSort()}
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
    display: string,
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
    return <div className="start-button" onClick={this.props.onClick}>start</div>;
  }
}

function formatDigits(n: number, d: number)
{
  const s = n.toString();
  const l = s.length;
  return <><span className="transparent">{"0".repeat(d-l)}</span>{n}</>;
}
