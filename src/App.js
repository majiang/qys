import React from 'react';
import logo from './logo.svg';
import './App.css';

class Hand extends React.Component
{
  constructor (props)
  {
    super (props);
    this.state = {
      ranks: [1, 1, 1, 2]
    };
  }
  discard(i)
  {
    console.log("discarded: "+i+": "+this.state.ranks[i]);
  }
  renderTile(rank, i)
  {
    return (<Tile index={i} rank={rank} onClick={()=>
      this.discard(i)
    }/>);
  }
  render()
  {
    return (<div className="hand">
      {this.state.ranks.map((rank, i)=>this.renderTile(rank, i))}
    </div>);
    // (rank, i)=>this.renderTile(rank, i) is necessary.
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
      <Hand />
    </div>
  );
}

export default App;
