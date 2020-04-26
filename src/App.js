import React from 'react';
import logo from './logo.svg';
import './App.css';

class Hand extends React.Component
{
  renderTile(i)
  {
    return <Tile index={i} rank="r" />;
  }
  render()
  {
    return (<div class="hand">
      {[0, 1, 2, 3].map((i) => this.renderTile(i))}
    </div>);
  }
}

class Tile extends React.Component
{
  render()
  {
  return (<div class="tile">{this.props.index}:{this.props.rank}</div>);
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
