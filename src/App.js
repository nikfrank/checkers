import React, { Component } from 'react';
import './App.css';

import Game from './Game';
import { calculateAllTurnOptions, calculatePiecesAfterMove } from './util';

class App extends Component {
  state = {
    winner: null,
  }

  onWinner = winner=>
    this.setState({ winner })
  
  render() {
    return (
      <div className="App">
        {this.state.winner ? (
           <div className='winner'>
             { this.state.winner } WINS!
           </div>
        ) : (
           <Game onWinner={this.onWinner} mode='cp' />
        )}
      </div>
    );
  }
}

export default App;
