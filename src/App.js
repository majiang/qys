import React from 'react';
import logo from './logo.svg';
import './App.css';

function pile()
{
  return [
      6, 5, 0, 7, 0, 8, 4, 7, 6,
      4, 1, 1, 5, 4, 3, 8, 6, 1,
      2, 1, 2, 8, 7, 3, 2, 2, 6,
      3, 5, 8, 3, 4, 0, 5, 7, 0];
}

class Game extends React.Component
{
  constructor (props)
  {
    super (props);
    this.state = {
      hand: props.pile.slice(0, props.handLength),
      handLength: props.handLength,
      p: props.handLength,
      pile: props.pile,
    };
    this.draw();
  }
  discard(i, r)
  {
    console.log("discard "+r+" at position "+i);
    var hand = this.state.hand.slice();
    var removed = hand.splice(i, 1);
    this.setState({
      hand: hand,
      handLength: this.state.handLength,
      p: this.state.p,
      pile: this.state.pile,
    });
    setTimeout(()=>this.draw(), 1000);
  }
  draw()
  {
    console.log("draw: p="+this.state.p);
    var hand = this.state.hand.slice();
    hand.push(this.state.pile[this.state.p]);
    this.setState({
      hand: hand,
      handLength: this.state.handLength,
      p: this.state.p+1,
      pile: this.state.pile,
    });
  }
  render()
  {
    return <Hand ranks={this.state.hand} discard={(i, rank)=>this.discard(i, rank)} />
  }
}

class Hand extends React.Component
{
  constructor (props)
  {
    super (props);
    this.state = {
      ranks: props.ranks,
      discard: props.discard
    };
  }
  renderTile(i, rank)
  {
    return (<Tile index={i} rank={rank} onClick={()=>this.state.discard(i, rank)}/>);
  }
  render()
  {
    return (<div className="hand">
      {this.state.ranks.map((rank, i)=>this.renderTile(i, rank))}
    </div>);
    // even if we redefine renderTile(rank, i), (rank, i)=>this.renderTile(rank, i) is necessary.
    // this.renderTile doesn't work. seems to forget this.
  }
}

class Tile extends React.Component
{
  render()
  {
    return (<div className="tile" onClick={this.props.onClick}>{this.props.index}:{this.props.rank}</div>);
  }
}

function App() {
  return (
    <div className="App">
      <Game pile={pile()} handLength={4}/>
    </div>
  );
}

export default App;
