import React from 'react';
import { connect, Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Game } from './components';
import { gameActions, gameStore } from './gamelogics';
import './App.css';

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

const ConnectedGame = connect(
    (storeState) => (storeState),
    (dispatch) => ({actions: bindActionCreators(gameActions, dispatch)}),
)(Game);

function App() {
  return (
    <Provider store={gameStore}>
      <ConnectedGame initializer={shufflePile} />
    </Provider>
  );
}

export default App;
