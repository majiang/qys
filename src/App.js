import React from 'react';
import { connect, Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Game } from './components';
import { gameActions, gameStore } from './gamelogics';
import { pileShuffler, MT19937 } from './gamecommon';
import './App.css';

const ConnectedGame = connect(
    (storeState) => (storeState),
    (dispatch) => ({actions: bindActionCreators(gameActions, dispatch)}),
)(Game);

function App() {
  let shufflePile = pileShuffler(window.location.hash === '' ? Math : MT19937(window.location.hash));
  return (
    <Provider store={gameStore}>
      <ConnectedGame initializer={shufflePile} />
    </Provider>
  );
}

export default App;
