import React from 'react';
import { connect, Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Game } from './components';
import { gameActions, gameStore } from './gamelogics';
import { shufflePile } from './gamecommon';
import './App.css';

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
