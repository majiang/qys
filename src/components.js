import React from 'react';

export class Game extends React.Component
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
    this.setState({handLength: parseInt(e.target.value)});
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
        <Hand tileClass={this.tileClass()} tiles={this.props.hand} discard={
          (position)=>this.props.actions.discardAndDraw(this.props.p, this.props.pile, position, this.state.timeBeforeDraw, this.state.timeBeforeSort)} />
        <Controls reset={()=>this.props.actions.resetAndDraw(this.props.initializer(), this.state.handLength, this.state.timeBeforeDraw, this.state.timeBeforeSort)}
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

class Tile extends React.Component
{
  render()
  {
    return <div className="tile" onClick={this.props.onClick}>
      <img src={this.imageUrl()}
      style={this.generateStyle(this.props.rank)}
      alt={this.props.rank+1}/></div>
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

class Controls extends React.Component
{
  render()
  {
    return <form className="controls">
      <StartButton onClick={this.props.reset} />
      <fieldset className="hand-length">
        <span className="radio-label">#tiles</span>
        {[1, 4, 7, 10, 13, 16].map((v, i) =>
        <Radio name="hand-length" key={i}
          display={formatDigits(v, 2)}
          value={v} defaultValue={13}
          onChange={this.props.handLength.handler} />)}
      </fieldset>
      <fieldset className="tile-style">
        <span className="radio-label">tile style</span>
        {["PostModern"].map((v, i) =>
        <Radio name="tile-style" key={i}
          display={v}
          value={v} defaultValue="PostModern"
          onChange={this.props.tileStyle.handler} />)}
      </fieldset>
      <fieldset className="tile-suit">
        <span className="radio-label">suit</span>
        {[
          {display: "bams/索/条", value: "bamboos"},
          {display: "chars/萬/万", value: "characters"},
          {display: "dots/筒/饼", value: "dots"}].map((v, i) =>
        <Radio name="tile-suit" key={i}
          display={v.display}
          value={v.value} defaultValue="dots"
          onChange={this.props.tileSuit.handler} />)}
      </fieldset>
      <fieldset className="allow-pairs">
        <span className="radio-label">pairs</span>
        {[
          {display: "disallow", value: "disallow"},
          {display: "allow", value: "allow"},
          {display: "tile hog", value: "allow-hog"},
        ].map((v, i) =>
        <Radio name="allow-pairs" key={i}
          display={v.display}
          value={v.value} defaultValue="allow"
          onChange={this.props.allowPairs.handler} />)}
      </fieldset>
      <fieldset><Range
        id="time-before-draw"
        label="time before draw"
        handler={this.props.timeBeforeDraw.handler}
        value={{
          min: 100,
          max: 9900,
          step: 100,
          default: 1000,
          display: (this.props.timeBeforeDraw.value/1000).toFixed(1)+"s",
        }} /></fieldset>
      <fieldset><Range
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
    </form>;
  }
}
class Radio extends React.Component
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
class Range extends React.Component
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
class StartButton extends React.Component
{
  render()
  {
    return <div className="start-button" onClick={this.props.onClick}>start</div>;
  }
}

function formatDigits(n, d)
{
  const s = n.toString();
  const l = s.length;
  return <><span className="transparent">{"0".repeat(d-l)}</span>{n}</>;
}
